"""Package already-built previews with an exact source revision, no credentials."""
import argparse
import json
import subprocess
import zipfile
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument("--output", required=True)
args = p.parse_args()
out = Path(args.output)
out.mkdir(parents=True, exist_ok=True)
sha = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()
for label in "abc":
    source = Path("apps") / ("preview-" + label) / "dist"
    if not (source / "index.html").exists():
        raise ValueError("Build previews first")
    with zipfile.ZipFile(out / (label + ".zip"), "w", zipfile.ZIP_DEFLATED) as z:
        for f in sorted(source.rglob("*")):
            if f.is_file():
                z.write(f, f.relative_to(source))
        z.writestr("revision.json", json.dumps({"sourceSha": sha, "preview": label, "initialMode": "MOCK", "models": ["apac.amazon.nova-micro-v1:0", "apac.amazon.nova-lite-v1:0", "global.amazon.nova-2-lite-v1:0"]}))
    print("Packaged Preview", label, "revision", sha)
