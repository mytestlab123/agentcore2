"""Package the accepted MOCK HTML without changing any product bytes. No network."""
import argparse
import hashlib
import json
import re
import subprocess
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'showcases/chatgpt-sites-preview-b/index.html'
REFERENCE = '68aa168f764531697ef34c472f87468ad738e36a'
DIGEST = '1bc76ab8f57090a3132e2371ff49973b5e37c29ea191044556ac2b930c50acbd'


def build(output):
    # C1 compares the accepted v1.1 source, independently of later Issue 9 sync.
    data = subprocess.check_output(['git', 'show', REFERENCE + ':' + str(SOURCE.relative_to(ROOT))], cwd=ROOT)
    if hashlib.sha256(data).hexdigest() != DIGEST:
        raise ValueError('Canonical HTML differs from approved source; obtain a new source decision')
    text = data.decode()
    for pattern in (r'(?<!\d)\d{12}(?!\d)', r'arn:aws', r'(?:AKIA|ASIA)[A-Z0-9]{16}',
                    r'https?://(?:localhost|127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)',
                    r'\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\('):
        if re.search(pattern, text):
            raise ValueError('Canonical source failed static leak/network boundary scan')
    if 'MOCK SHOWCASE' not in text or 'No AWS connection in this Sites version.' not in text:
        raise ValueError('Required showcase wording absent')
    output.mkdir(parents=True, exist_ok=True)
    # Only the explicit directory is deployable; never archive the repository.
    public = output / 'public'
    public.mkdir(exist_ok=True)
    if set(p.name for p in public.iterdir()) - {'index.html', 'revision.json'}:
        raise ValueError('Unexpected deployable files; refusing a mixed output directory')
    (public / 'index.html').write_bytes(data)
    marker = {'mode': 'MOCK SHOWCASE', 'sourceReference': REFERENCE, 'htmlSha256': DIGEST,
              'wrapperRevision': subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()}
    (public / 'revision.json').write_text(json.dumps(marker, indent=2) + '\n')
    with zipfile.ZipFile(output / 'showcase.zip', 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for name in ['index.html', 'revision.json']:
            info = zipfile.ZipInfo(name, date_time=(2026, 10, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, (public / name).read_bytes())
    print(json.dumps({'status':'PASS', **marker, 'deployableFiles':['index.html','revision.json']}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    build(parser.parse_args().output)
