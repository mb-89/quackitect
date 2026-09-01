"""COUNT THE VERDICTS OFF THE NOTES RATHER THAN OFF A PARAGRAPH.

A summary retyped from a body drifts from it, and the count in wk-61af3a054e's
map paragraph said eleven aborted and ten backlogged when the notes said ten and
eleven. This asks the notes.

  python .se/scratchpad/count-verdicts.py doc/work/wk-61af3a054e.md
"""
import collections, io, os, re, sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
s = io.open(os.path.join(root, sys.argv[1]), encoding="utf-8").read()
snap = [l.strip()[2:] for l in s.splitlines() if l.strip().startswith("- wk-")]
if not snap:
    raise SystemExit("no list of ids, so there is nothing to count")


def note(i):
    for d in ("doc/work", ".se/work"):
        p = os.path.join(root, d, i + ".md")
        if os.path.exists(p):
            return io.open(p, encoding="utf-8").read()
    return ""


count, missing = collections.Counter(), []
for i in snap:
    n = note(i)
    if not n:
        missing.append(i)
        continue
    st = re.search(r"^status: (\S+)", n, re.M)
    dp = re.search(r"^disposition: (\S+)", n, re.M)
    st, dp = (st.group(1) if st else "?"), (dp.group(1) if dp else "")
    count["aborted" if st == "aborted" else
          ("settled as a duplicate" if dp == "became" else st)] += 1
for i in missing:
    count["no note at all"] += 1
print("counted over the %d on the snapshot, by what each note says today:" % len(snap))
for k, v in sorted(count.items(), key=lambda x: -x[1]):
    print("  %-24s %d" % (k, v))
print("  %-24s %d" % ("total", sum(count.values())))
