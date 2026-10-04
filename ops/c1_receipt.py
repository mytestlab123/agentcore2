"""Versioned, sanitized C1 receipts and offline recovery decisions. No network."""
import hashlib
import json
import os
from pathlib import Path
import re
import tempfile

PHASES = {'CREATE_INTENT', 'UPLOAD_INTENT', 'START_INTENT', 'STARTED', 'HTTP_DIGEST_VERIFIED'}
STATES = {'CREATED', 'PENDING', 'PROVISIONING', 'RUNNING', 'CANCELLING',
          'SUCCEED', 'FAILED', 'CANCELLED'}
BASE_FIELDS = {'schemaVersion', 'mode', 'sourceReference', 'htmlSha256', 'wrapperRevision',
               'githubRunId', 'phase', 'bundleSha256', 'targetSha256'}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def target_digest(config):
    # Bind account, region, app, branch and role, independent of a later run's session.
    value = {'appArn': config['appArn'], 'branch': 'showcase-c1',
             'role': config['identityArn'].rsplit('/', 1)[0]}
    return digest(json.dumps(value, sort_keys=True, separators=(',', ':')).encode())


def new(marker, bundle, config, run_id):
    return {'schemaVersion': 1, **marker, 'githubRunId': run_id,
            'bundleSha256': digest(bundle), 'targetSha256': target_digest(config),
            'phase': 'CREATE_INTENT'}


def validate(record, marker, bundle, expected_target):
    if not isinstance(record, dict) or not BASE_FIELDS <= record.keys() or \
            record.keys() - BASE_FIELDS - {'jobId', 'state'}:
        raise ValueError('Receipt schema invalid')
    if type(record['schemaVersion']) is not int or record['schemaVersion'] != 1:
        raise ValueError('Receipt version invalid')
    if any(record.get(k) != v for k, v in marker.items()):
        raise ValueError('Receipt source/revision mismatch')
    if not isinstance(expected_target, str) or not re.fullmatch('[0-9a-f]{64}', expected_target) or \
            record['targetSha256'] != expected_target or record['bundleSha256'] != digest(bundle):
        raise ValueError('Receipt artifact/target mismatch')
    if not isinstance(record['githubRunId'], str) or not re.fullmatch('[0-9]+', record['githubRunId']):
        raise ValueError('Receipt run invalid')
    phase = record['phase']
    if not isinstance(phase, str) or phase not in PHASES:
        raise ValueError('Receipt phase invalid')
    if phase == 'CREATE_INTENT':
        if 'jobId' in record or 'state' in record:
            raise ValueError('Create outcome requires private reconciliation')
    elif not isinstance(record.get('jobId'), str) or not re.fullmatch('[A-Za-z0-9_-]{1,64}', record['jobId']):
        raise ValueError('Receipt job invalid')
    if 'state' in record and (not isinstance(record['state'], str) or record['state'] not in STATES):
        raise ValueError('Receipt state invalid')
    if phase == 'HTTP_DIGEST_VERIFIED' and record.get('state') != 'SUCCEED':
        raise ValueError('Receipt completion inconsistent')
    return record


def load(path, marker, bundle, expected_target):
    if path.stat().st_size > 8192:
        raise ValueError('Receipt too large')
    def unique_pairs(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError('Duplicate receipt key')
            result[key] = value
        return result
    return validate(json.loads(path.read_text(), object_pairs_hook=unique_pairs),
                    marker, bundle, expected_target)


def save(path, record, *, create=False):
    data = json.dumps(record, sort_keys=True, indent=2) + '\n'
    if create:
        # Exclusive reservation: even an interrupted/partial file blocks redispatch.
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, 'w') as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        return
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', dir=path.parent, prefix='.c1-receipt-',
                                         delete=False) as handle:
            temporary = Path(handle.name)
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()


def summary(record):
    # Only enumerations and fixed prose reach stdout, never arbitrary receipt fields.
    if record['phase'] == 'CREATE_INTENT':
        action = 'RECONCILE_CREATE_PRIVATELY_NO_REDISPATCH'
    elif record.get('state') in {'FAILED', 'CANCELLED'}:
        action = 'TERMINAL_STOP_OWNER_REVIEW_NO_RETRY'
    elif record['phase'] == 'HTTP_DIGEST_VERIFIED':
        action = 'RECEIPT_REPORTS_HTTP_VERIFIED_BROWSER_PROOF_REQUIRED'
    elif record['phase'] in {'UPLOAD_INTENT', 'START_INTENT'}:
        action = 'RECONCILE_UNCERTAIN_WRITE_OBSERVATION_ONLY'
    else:
        action = 'RESUME_OBSERVATION_ONLY_NO_WRITES'
    return {'inspection': 'OFFLINE_ONLY', 'phase': record['phase'],
            'recordedState': record.get('state', 'UNKNOWN'), 'nextAction': action,
            'liveEvidence': 'NOT_VERIFIED_BY_INSPECTION', 'redispatchAllowed': False}
