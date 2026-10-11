#!/usr/bin/env python3
"""Fold every run's published transcript again with the current transcript.py (after a counter
changes), and write the session numbers back into meta.json. The cost and result fields come
from the transcript itself, so refolding never changes them.

  python3 refold.py results/<batch> [results/<batch> ...]
"""
import gzip
import json
import os
import shutil
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import transcript  # noqa: E402
from benchlib import write_json  # noqa: E402

for batch in sys.argv[1:]:
    root = os.path.join(batch, "runs")
    for rid in sorted(os.listdir(root)):
        d = os.path.join(root, rid)
        mp, tp = os.path.join(d, "meta.json"), os.path.join(d, "transcript.jsonl.gz")
        if not (os.path.exists(mp) and os.path.exists(tp)):
            continue
        tmp = tempfile.mktemp(suffix=".jsonl")
        with gzip.open(tp, "rb") as f, open(tmp, "wb") as g:
            shutil.copyfileobj(f, g)
        s = transcript.fold(tmp)
        os.remove(tmp)
        m = json.load(open(mp))
        m["session"] = {k: v for k, v in s.items() if k not in ("bash_cmds",)}
        write_json(mp, m)
    print(f"refolded {batch}")
