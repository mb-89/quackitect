"""COUNT THE STANDING LAYER IN THE UNIT THE HOST CHARGES.

wk-23801b6603 asks what the standing layer costs PER TURN, in the unit the host
charges. A host charges tokens. This project had been reporting bytes, which is a
corroborating count and not the answer.

  uvx --from tiktoken python util/checks/count-standing.py <root>

THE TOKENISER IS NAMED IN THE OUTPUT, because a token count with no encoding
beside it is a number nobody can reproduce. cl100k_base is OpenAI's and it is not
the encoding this host uses; no public tokeniser for this host exists, so this is
the nearest reproducible instrument and the output says so. A number from a named
tokeniser is worth more than bytes and less than the host's own meter.

WHAT IT COUNTS. Every projection the map says is a markdown file, which is what
an agent actually carries, and the folder those projections are assembled from.
The map is asked rather than copied, so a source added to it is counted without
anybody remembering this script. The map names a folder now, sources_from, and
the projector reads the markdown files at the top of that folder, so this does
the same and reads no deeper.
"""
import json
import os
import sys

import tiktoken

root = sys.argv[1] if len(sys.argv) > 1 else "."
enc = tiktoken.get_encoding("cl100k_base")

with open(os.path.join(root, "util", "projections.json"), encoding="utf-8") as f:
    m = json.load(f)


def parked(name):
    return name.startswith("_")


sources, targets = [], []
for p in m["projections"]:
    if not p["target"].endswith(".md"):
        continue
    targets.append(p["target"])
    folder = p.get("sources_from")
    if folder:
        full = os.path.join(root, folder.replace("/", os.sep))
        for name in sorted(os.listdir(full)):
            if name.endswith(".md") and not parked(name):
                s = folder + "/" + name
                if s not in sources:
                    sources.append(s)
    for s in p.get("sources", []):
        if s not in sources:
            sources.append(s)

if not sources:
    print("no guidance file is projected into the standing layer, so this counts nothing")
    raise SystemExit(1)


def count(path):
    full = os.path.join(root, path.replace("/", os.sep))
    if not os.path.exists(full):
        return None, None
    text = open(full, encoding="utf-8").read()
    return len(enc.encode(text)), len(text.encode("utf-8"))


print("encoding cl100k_base, which is not this host's own and is the nearest reproducible one")
print()
print("  THE STANDING LAYER, carried on every turn by every agent")
worst = 0
for t in targets:
    tok, by = count(t)
    if tok is None:
        print("    %-46s missing" % t)
        continue
    worst = max(worst, tok)
    print("    %-46s %6d tokens  %7d bytes" % (t, tok, by))
print()
print("  ITS SOURCES, which are what anybody edits")
for s in sources:
    tok, by = count(s)
    print("    %-46s %6d tokens  %7d bytes" % (s, tok, by))
print()
print("  one turn carries %d tokens of standing layer" % worst)
