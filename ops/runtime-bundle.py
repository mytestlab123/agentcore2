"""Coherent versioned runtime bundle. No private state, token or dependencies."""
import argparse
import hashlib
import json
import subprocess
import tarfile
from io import BytesIO
from pathlib import Path

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--output',required=True)
args=p.parse_args()
source=Path('harness')
files=[*sorted(source.glob('*.py')),source/'harness.json']
digests={name:hashlib.sha256((source/name).read_bytes()).hexdigest() for name in ('bridge.py','client.py','models.py','harness.json')}
manifest=json.dumps({'sourceSha':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'files':digests}).encode()
with tarfile.open(args.output,'w') as archive:
 for file in files:archive.add(file,arcname=str(file),recursive=False)
 entry=tarfile.TarInfo('harness/source-digests.json');entry.size=len(manifest);entry.mode=0o600
 archive.addfile(entry,BytesIO(manifest))
print('PASS: complete runtime source bundle packaged')
