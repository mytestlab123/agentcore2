"""PROPOSAL ONLY: deploy canonical C1 bundle to an owner-provisioned isolated branch.

Requires reviewed GitHub OIDC workflow and narrow role; never creates resources.
One dispatch only: uncertain failures require provider job reconciliation, not retry.
"""
import argparse
import hashlib
import json
import os
import subprocess
import time
import urllib.request
import c1_preflight as preflight
import c1_receipt as receipt
from pathlib import Path
from importlib.util import module_from_spec, spec_from_file_location

spec = spec_from_file_location('c1_source', Path(__file__).with_name('showcase-c1.py'))
source = module_from_spec(spec)
spec.loader.exec_module(source)


def aws(service, action, **params):
    cmd = ['aws', service, action, '--region', 'ap-southeast-1', '--output', 'json']
    for key, value in params.items():
        cmd.extend(['--' + key.replace('_', '-'), str(value)])
    # CLI max attempts includes the initial request. Override ambient/profile
    # retries at the child boundary: an uncertain mutation must never be replayed.
    child_env = {**os.environ, 'AWS_MAX_ATTEMPTS': '1', 'AWS_RETRY_MODE': 'standard'}
    response = subprocess.run(cmd, capture_output=True, text=True, env=child_env)
    if response.returncode:
        # Provider stderr can contain private identifiers; do not forward it.
        raise RuntimeError(f'{service}:{action} failed; reconcile private provider logs before retry')
    return json.loads(response.stdout)


def deploy(bundle, journal, *, resume_observation=False, attempts=40):
    revision = subprocess.check_output(['git', 'rev-parse', 'HEAD'],
                                       cwd=source.ROOT, text=True).strip()
    config = preflight.configuration(os.environ, revision)
    app, branch = config['app'], preflight.BRANCH
    if not resume_observation and journal.exists():
        raise ValueError('Prior journal exists; inspect and reconcile before any retry')
    bundle_data = bundle.read_bytes()
    marker = preflight.artifact(bundle_data, source.DIGEST, source.REFERENCE, revision)
    if resume_observation:
        record = receipt.load(journal, marker, bundle_data, receipt.target_digest(config))
        if record['phase'] == 'CREATE_INTENT':
            raise ValueError('No recorded job ID; reconcile privately, never redispatch')
        if record['phase'] == 'HTTP_DIGEST_VERIFIED':
            print('Receipt reports HTTP verified; browser proof still required; no new observation made')
            return
        if record.get('state') in {'FAILED', 'CANCELLED'}:
            raise ValueError('Terminal receipt; owner review required')
    preflight.identity(config, aws('sts', 'get-caller-identity'))
    owned = aws('amplify', 'get-app', app_id=app)['app']
    isolated = aws('amplify', 'get-branch', app_id=app, branch_name=branch)['branch']
    if resume_observation:
        # This path observes an existing exact job. It never checks for a new-job slot.
        preflight.target(config, owned, isolated, [])
        observe(config, owned, marker, record, journal, attempts=attempts)
        return
    jobs = aws('amplify', 'list-jobs', app_id=app, branch_name=branch, max_results=10)['jobSummaries']
    preflight.target(config, owned, isolated, jobs)
    record = receipt.new(marker, bundle_data, config, os.environ['GITHUB_RUN_ID'])
    receipt.save(journal, record, create=True)
    created = aws('amplify', 'create-deployment', app_id=app, branch_name=branch)
    record.update(jobId=created['jobId'], phase='UPLOAD_INTENT')
    receipt.validate(record, marker, bundle_data, receipt.target_digest(config))
    receipt.save(journal, record)
    # The signed provider upload URL is held in memory only.
    with urllib.request.urlopen(urllib.request.Request(created['zipUploadUrl'],
             data=bundle_data, method='PUT'), timeout=60) as response:
        if response.status not in (200, 201):
            raise ValueError('Bundle upload rejected; reconcile job')
    record['phase'] = 'START_INTENT'; receipt.save(journal, record)
    aws('amplify', 'start-deployment', app_id=app, branch_name=branch, job_id=record['jobId'])
    record['phase'] = 'STARTED'; receipt.save(journal, record)
    observe(config, owned, marker, record, journal, attempts=attempts)


def observe(config, owned, marker, record, journal, *, attempts=40):
    app, branch = config['app'], preflight.BRANCH
    for _ in range(attempts):
        job = aws('amplify', 'get-job', app_id=app, branch_name=branch, job_id=record['jobId'])['job']['summary']
        if job.get('jobId') != record['jobId'] or job.get('status') not in receipt.STATES:
            raise ValueError('Unexpected job identity/state; reconcile privately')
        record['state'] = job['status']; receipt.save(journal, record)
        if job['status'] in ('FAILED', 'CANCELLED'):
            raise ValueError('Provider job terminal failure; see provider logs')
        if job['status'] == 'SUCCEED':
            url = 'https://' + branch + '.' + owned['defaultDomain']
            with urllib.request.urlopen(url + '/revision.json', timeout=30) as r:
                if json.load(r) != marker:
                    raise ValueError('Served revision mismatch')
            with urllib.request.urlopen(url + '/', timeout=30) as r:
                if hashlib.sha256(r.read()).hexdigest() != source.DIGEST:
                    raise ValueError('Served HTML differs from canonical source')
            record['phase'] = 'HTTP_DIGEST_VERIFIED'; receipt.save(journal, record)
            print('C1 HTTP/source provenance PASS; browser proof still required')
            return
        time.sleep(15)
    raise ValueError('Observation window elapsed; retain job ID and reconcile, do not redispatch')


def inspect(bundle, journal, expected_revision, expected_target):
    # Offline: no environment credentials, subprocess, provider, HTTP or receipt write.
    preflight.require(isinstance(expected_revision, str) and
                      len(expected_revision) == 40 and
                      all(c in '0123456789abcdef' for c in expected_revision),
                      'Exact expected wrapper revision required')
    data = bundle.read_bytes()
    marker = preflight.artifact(data, source.DIGEST, source.REFERENCE, expected_revision)
    record = receipt.load(journal, marker, data, expected_target)
    return receipt.summary(record)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bundle', type=Path, required=True)
    parser.add_argument('--journal', type=Path, required=True)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--inspect-receipt', action='store_true')
    mode.add_argument('--resume-observation', action='store_true')
    parser.add_argument('--expected-revision')
    parser.add_argument('--expected-target-sha256')
    args = parser.parse_args()
    try:
        if args.inspect_receipt:
            print(json.dumps(inspect(args.bundle, args.journal, args.expected_revision,
                                     args.expected_target_sha256), sort_keys=True))
        else:
            if args.expected_revision or args.expected_target_sha256:
                raise ValueError('Inspection arguments require inspection mode')
            deploy(args.bundle, args.journal, resume_observation=args.resume_observation)
    except (Exception, KeyboardInterrupt):
        raise SystemExit('C1_BLOCKED: preserve receipt; privately reconcile; no automatic redispatch')
