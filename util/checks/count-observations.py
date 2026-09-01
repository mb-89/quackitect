"""COUNT THE RECORDED OBSERVATIONS, AND HOW MANY OF THEM NAME AN ADDRESS.

A baseline nobody can re-derive is not a baseline. Two agents counted the same
thing and disagreed, 62 against 80, because each carried the rule in its head.
So the rule is written here and the answer comes from running it.

THE THREE DEFINITIONS THIS APPLIES:

  an observation   the value after the "**red said** " lead on a line of a
                   token note under doc/work or .se/work
  an address       a file name ending .go, .ts or .mjs followed by a colon and
                   one or more digits, anywhere in the value
  a literal        the value, with any address removed, appearing verbatim in
                   some .go, .ts or .mjs file under src outside node_modules

  python util/checks/count-observations.py [<root>]

It prints the three counts and exits zero. It decides nothing: the check that
decides is the one the token names.
"""
import io
import os
import re
import sys

root = sys.argv[1] if len(sys.argv) > 1 else "."
LEAD = "**red said** "
ADDRESS = re.compile(r"[\w./-]+\.(?:go|ts|mjs):\d+")


def notes():
    for store in ("doc/work", ".se/work"):
        here = os.path.join(root, store)
        if not os.path.isdir(here):
            continue
        for name in sorted(os.listdir(here)):
            if name.endswith(".md"):
                yield os.path.join(here, name)


def sources():
    for where, dirs, files in os.walk(os.path.join(root, "src")):
        dirs[:] = [d for d in dirs if d != "node_modules"]
        for name in files:
            if name.endswith((".go", ".ts", ".mjs")):
                yield os.path.join(where, name)


held = []
for path in sources():
    try:
        held.append(io.open(path, encoding="utf-8").read())
    except (OSError, UnicodeDecodeError):
        pass

seen, addressed, literal = 0, 0, 0
for path in notes():
    for line in io.open(path, encoding="utf-8").read().split("\n"):
        line = line.strip()
        if not line.startswith(LEAD):
            continue
        value = line[len(LEAD):].strip()
        seen += 1
        if not ADDRESS.search(value):
            continue
        addressed += 1
        # THE ADDRESS COMES OUT BEFORE THE LOOK, because the address is the
        # thing the source cannot carry.
        want = ADDRESS.sub("", value).strip().strip(":").strip()
        if want and any(want in text for text in held):
            literal += 1

print("observations                              %d" % seen)
print("  of those, naming an address             %d" % addressed)
print("  of those, whose message is a literal    %d" % literal)
