"""Pure C1 checks shared by deployment and offline tests. No provider access."""
import hashlib
import json
import re
import zipfile
from io import BytesIO

BRANCH = 'showcase-c1'
REGION = 'ap-southeast-1'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def configuration(env, revision):
    account = env.get('C1_EXPECTED_ACCOUNT', '')
    app = env.get('C1_APP_ID', '')
    role = env.get('C1_AWS_ROLE_ARN', '')
    run = env.get('GITHUB_RUN_ID', '')
    require(re.fullmatch(r'[0-9]{12}', account), 'Expected account missing or malformed')
    require(re.fullmatch(r'd[a-z0-9]{1,19}', app), 'Expected app missing or malformed')
    require(env.get('C1_BRANCH') == BRANCH, 'Isolated branch required')
    require(re.fullmatch(r'[0-9a-f]{40}', revision), 'Exact wrapper revision required')
    require(re.fullmatch(r'[0-9]+', run), 'Exact workflow run required')
    prefix = f'arn:aws:iam::{account}:role/'
    require(role.startswith(prefix), 'Expected role account mismatch')
    name = role[len(prefix):]
    require(re.fullmatch(r'[A-Za-z0-9_+=,.@-]{1,64}', name), 'Exact pathless role required')
    return {'account': account, 'app': app, 'revision': revision,
            'identityArn': f'arn:aws:sts::{account}:assumed-role/{name}/agentcore2-c1-{run}',
            'appArn': f'arn:aws:amplify:{REGION}:{account}:apps/{app}'}


def artifact(data, digest, reference, revision):
    require(len(data) <= 2_000_000, 'Bundle too large')
    with zipfile.ZipFile(BytesIO(data)) as archive:
        entries = archive.infolist()
        require(sorted(e.filename for e in entries) == ['index.html', 'revision.json'],
                'Bundle must contain exactly two approved files')
        require(all(e.file_size <= 2_000_000 and not e.is_dir() for e in entries),
                'Invalid archive entry')
        require(hashlib.sha256(archive.read('index.html')).hexdigest() == digest,
                'Canonical HTML digest mismatch')
        marker = json.loads(archive.read('revision.json'))
        require(marker == {'mode': 'MOCK SHOWCASE', 'sourceReference': reference,
                           'htmlSha256': digest, 'wrapperRevision': revision},
                'Exact source/wrapper marker mismatch')
        return marker


def identity(config, observed):
    require(observed.get('Account') == config['account'] and
            observed.get('Arn') == config['identityArn'], 'Exact assumed-role identity mismatch')


def target(config, app, branch, jobs):
    require(app.get('appId') == config['app'] and app.get('appArn') == config['appArn'],
            'Exact app identity mismatch')
    require('repository' in app and not app['repository'] and
            app.get('tags', {}).get('project') == 'agentcore2' and
            app.get('tags', {}).get('issue') == '3', 'Manual app ownership not proven')
    require(branch.get('branchName') == BRANCH and
            branch.get('branchArn') == config['appArn'] + '/branches/' + BRANCH and
            branch.get('enableAutoBuild') is False, 'Isolated manual branch not proven')
    require(isinstance(jobs, list) and all(j.get('status') in
            {'SUCCEED', 'FAILED', 'CANCELLED'} for j in jobs),
            'Active or unknown prior job; reconcile before deployment')


def main():
    import argparse
    import importlib.util
    from pathlib import Path
    parser = argparse.ArgumentParser(description='Offline artifact preflight; never contacts AWS')
    parser.add_argument('--bundle', type=Path, required=True)
    parser.add_argument('--expected-revision', required=True)
    args = parser.parse_args()
    try:
        require(re.fullmatch(r'[0-9a-f]{40}', args.expected_revision), 'Exact revision required')
        spec = importlib.util.spec_from_file_location('c1_source', Path(__file__).with_name('showcase-c1.py'))
        source = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(source)
        artifact(args.bundle.read_bytes(), source.DIGEST, source.REFERENCE, args.expected_revision)
    except Exception:
        raise SystemExit('OFFLINE_PREFLIGHT_BLOCKED: artifact/revision invalid; deployment NOT_RUN')
    print('OFFLINE_ARTIFACT_PASS: identity/target live checks NOT_RUN; deployment NOT_RUN')


if __name__ == '__main__':
    main()
