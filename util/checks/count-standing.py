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

WHAT IT COUNTS. Every file the projection map says the standing layer is made of,
and the projections themselves, which are what an agent actually carries. The
sources are asked for rather than listed, so a third one added to the map is
counted without anybody remembering this script.
"""
import json
import os
import sys

import tiktoken

root = sys.argv[1] if len(sys.argv) > 1 else "."
enc = tiktoken.get_encoding("cl100k_base")

with open(os.path.join(root, "util", "projections.json"), encoding="utf-8") as f:
    m = json.load(f)

sources, targets = [], []
for p in m["projections"]:
    if not p["target"].endswith(".md"):
        continue
    targets.append(p["target"])
    for s in p["sources"]:
        if s.startswith("doc/guidance/") and s not in sources:
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
print("  SERVED WITH A TOKEN AND NOT STANDING")
for s in ["doc/guidance/cases.md", "doc/guidance/reviewing.md", "doc/guidance/specifying.md"]:
    tok, by = count(s)
    if tok is None:
        continue
    print("    %-46s %6d tokens  %7d bytes" % (s, tok, by))
print()
print("  one turn carries %d tokens of standing layer" % worst)
