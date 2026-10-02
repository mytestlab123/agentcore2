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
import zipfile
from pathlib import Path
from importlib.util import module_from_spec, spec_from_file_location

spec = spec_from_file_location('c1_source', Path(__file__).with_name('showcase-c1.py'))
source = module_from_spec(spec)
spec.loader.exec_module(source)


def aws(service, action, **params):
    cmd = ['aws', service, action, '--region', 'ap-southeast-1', '--output', 'json']
    for key, value in params.items():
        cmd.extend(['--' + key.replace('_', '-'), str(value)])
    response = subprocess.run(cmd, capture_output=True, text=True)
    if response.returncode:
        # Provider stderr can contain private identifiers; do not forward it.
        raise RuntimeError(f'{service}:{action} failed; reconcile private provider logs before retry')
    return json.loads(response.stdout)


def deploy(bundle, journal):
    app = os.environ['C1_APP_ID']
    branch = os.environ['C1_BRANCH']
    if branch != 'showcase-c1' or not os.environ.get('C1_EXPECTED_ACCOUNT'):
        raise ValueError('Isolated branch/identity configuration missing')
    if journal.exists():
        raise ValueError('Prior journal exists; reconcile its job before any retry')
    with zipfile.ZipFile(bundle) as archive:
        if sorted(archive.namelist()) != ['index.html', 'revision.json']:
            raise ValueError('Bundle contains unexpected files')
        if hashlib.sha256(archive.read('index.html')).hexdigest() != source.DIGEST:
            raise ValueError('Canonical HTML digest mismatch')
        marker = json.loads(archive.read('revision.json'))
        if marker['htmlSha256'] != source.DIGEST or marker['sourceReference'] != source.REFERENCE:
            raise ValueError('Source marker mismatch')
    identity = aws('sts', 'get-caller-identity')
    if identity['Account'] != os.environ['C1_EXPECTED_ACCOUNT'] or ':assumed-role/' not in identity['Arn']:
        raise ValueError('OIDC assumed-role identity mismatch')
    owned = aws('amplify', 'get-app', app_id=app)['app']
    tags = owned.get('tags', {})
    if owned.get('repository') or tags.get('project') != 'agentcore2' or tags.get('issue') != '3':
        raise ValueError('Expected Issue 3 manual app ownership not proven')
    isolated = aws('amplify', 'get-branch', app_id=app, branch_name=branch)['branch']
    if isolated.get('enableAutoBuild'):
        raise ValueError('Isolated manual branch unexpectedly has autobuild enabled')
    jobs = aws('amplify', 'list-jobs', app_id=app, branch_name=branch, max_results=10)['jobSummaries']
    if any(j['status'] in ['CREATED','PENDING','PROVISIONING','RUNNING','CANCELLING'] for j in jobs):
        raise ValueError('Existing active C1 job; reconcile before another deployment')
    record = {'mode':'MOCK SHOWCASE', 'sourceReference':source.REFERENCE,
              'htmlSha256':source.DIGEST, 'wrapperRevision':marker['wrapperRevision'],
              'githubRunId':os.environ.get('GITHUB_RUN_ID'), 'phase':'CREATE_INTENT'}
    def save():
        temporary = journal.with_suffix('.tmp')
        temporary.write_text(json.dumps(record, indent=2) + '\n')
        temporary.chmod(0o600)
        temporary.replace(journal)
    save()
    created = aws('amplify', 'create-deployment', app_id=app, branch_name=branch)
    record.update(jobId=created['jobId'], phase='UPLOAD_INTENT'); save()
    # The signed provider upload URL is held in memory only.
    with urllib.request.urlopen(urllib.request.Request(created['zipUploadUrl'],
             data=bundle.read_bytes(), method='PUT'), timeout=60) as response:
        if response.status not in (200, 201):
            raise ValueError('Bundle upload rejected; reconcile job')
    record['phase'] = 'START_INTENT'; save()
    aws('amplify', 'start-deployment', app_id=app, branch_name=branch, job_id=record['jobId'])
    record['phase'] = 'STARTED'; save()
    for _ in range(40):
        job = aws('amplify', 'get-job', app_id=app, branch_name=branch, job_id=record['jobId'])['job']['summary']
        record['state'] = job['status']; save()
        if job['status'] in ('FAILED', 'CANCELLED'):
            raise ValueError('Provider job terminal failure; see provider logs')
        if job['status'] == 'SUCCEED':
            url = 'https://' + branch + '.' + owned['defaultDomain']
            record['url'] = url
            with urllib.request.urlopen(url + '/revision.json', timeout=30) as r:
                if json.load(r) != marker:
                    raise ValueError('Served revision mismatch')
            with urllib.request.urlopen(url + '/', timeout=30) as r:
                if hashlib.sha256(r.read()).hexdigest() != source.DIGEST:
                    raise ValueError('Served HTML differs from canonical source')
            record['phase'] = 'HTTP_DIGEST_VERIFIED'; save()
            print('C1 HTTP/source provenance PASS; browser proof still required')
            return
        time.sleep(15)
    raise ValueError('Observation window elapsed; retain job ID and reconcile, do not redispatch')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bundle', type=Path, required=True)
    parser.add_argument('--journal', type=Path, required=True)
    args = parser.parse_args()
    try:
        deploy(args.bundle, args.journal)
    except Exception:
        raise SystemExit('C1_DEPLOYMENT_BLOCKED: retain receipt; inspect provider job/logs privately before retry')
