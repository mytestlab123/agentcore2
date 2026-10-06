"""Inspect only the synthetic failure fixture; never extract or print raw trace data."""
import hashlib
import json
from pathlib import Path
import re
import struct
import subprocess
import sys
import zipfile

SENTINEL = b'ISSUE12_SYNTHETIC_PRIVATE_SENTINEL_DO_NOT_PUBLISH'
MARKER = 'SHOWCASE_EXPECTED_FAILURE_CAPTURE_V1'


def require(ok):
    if not ok:
        raise ValueError('Synthetic failure evidence rejected')


def scan(data):
    require(SENTINEL not in data)
    require(not re.search(rb'(?:AKIA|ASIA)[A-Z0-9]{16}|-----BEGIN [A-Z ]*PRIVATE KEY', data))


def session_check(value):
    if isinstance(value, dict):
        for key, item in value.items():
            if key in {'cookies', 'localStorage', 'sessionStorage', 'storageState'}:
                require(not item)
            if key == 'headers' and isinstance(item, list):
                require(all(h.get('name', '').lower() not in
                            {'authorization', 'proxy-authorization', 'cookie', 'set-cookie'} for h in item))
            session_check(item)
    elif isinstance(value, list):
        for item in value:
            session_check(item)


def screenshot_dimensions(data):
    # Bound the known full-page desktop fixture before asking the existing decoder
    # to load pixels. A PNG signature or IHDR alone is not screenshot evidence.
    require(data.startswith(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR') and len(data) >= 33)
    width, height = struct.unpack('>II', data[16:24])
    require(width == 1440 and 1000 <= height <= 10000)
    decoded = subprocess.run(
        ['convert', '-regard-warnings', 'png:-', '-format', '%w %h', 'info:'],
        input=data, capture_output=True, timeout=30)
    require(decoded.returncode == 0)
    require(decoded.stdout.decode('ascii').strip() == f'{width} {height}')
    return {'width': width, 'height': height, 'decodedBy': 'ImageMagick'}


def verify(folder):
    expected = {'failure.json', 'failure.png', 'trace.zip'}
    require({p.name for p in folder.iterdir()} == expected)
    blobs = {}
    for name in sorted(expected):
        p = folder / name
        require(not p.is_symlink() and p.is_file() and 0 < p.stat().st_size <= 32 * 1024 * 1024)
        blobs[name] = p.read_bytes()
        scan(blobs[name])
    require(json.loads(blobs['failure.json']) == {'message': MARKER, 'errors': [], 'unexpected': []})
    screenshot = screenshot_dimensions(blobs['failure.png'])
    network, snapshots = [], 0
    with zipfile.ZipFile(folder / 'trace.zip') as archive:
        names = archive.namelist()
        require(len(names) == len(set(names)) and len(names) > 0)
        require(sum(i.file_size for i in archive.infolist()) <= 64 * 1024 * 1024)
        for info in archive.infolist():
            require(not info.filename.startswith('/') and '..' not in Path(info.filename).parts)
            data = archive.read(info)
            scan(data)
            if info.filename.endswith(('.trace', '.network')):
                for line in data.splitlines():
                    event = json.loads(line)
                    session_check(event)
                    if event.get('type') == 'frame-snapshot':
                        snapshots += 1
                    if event.get('type') == 'resource-snapshot':
                        request = event['snapshot']['request']
                        require(request['method'] == 'GET')
                        require(re.fullmatch(r'http://127\.0\.0\.1:\d+/', request['url']) is not None)
                        network.append(request['url'])
    require(len(network) == 1 and snapshots > 0)
    return {'status': 'PASS', 'scope': 'SYNTHETIC_FAILURE_CAPTURE_ONLY',
            'expectedSmokeExit': 1, 'localDocumentRequests': len(network),
            'screenshot': screenshot,
            'traceFrameSnapshots': snapshots, 'privateSentinelFound': False,
            'sessionStateFound': False,
            'files': {name: {'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
                      for name, data in blobs.items()}}


if __name__ == '__main__':
    try:
        print(json.dumps(verify(Path(sys.argv[1])), sort_keys=True))
    except Exception:
        raise SystemExit('FAIL: synthetic failure evidence rejected; do not publish raw artifacts')
