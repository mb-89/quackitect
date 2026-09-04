"""COUNT THE SENTENCES A FILE RUNS PAST THE VOICE LIMIT.

This is the check for the standing-rule measurement. It needs a check that can
see the effect of one named rule. The rule is voice.md 1: one sentence, one
idea, at most 25 words. This counts the sentences that break it.

  python util/checks/count-voice-breaks.py <file> [<file> ...]

THE LIMIT IS READ AND NOT RETYPED. util/voice-rules.json is where the engine
holds it, so a limit changed there changes this without anybody remembering the
script. VOICE_RULES names that file for a copy running outside the tree, which
is how the guard lets a check be run at all.

THE SPLIT IS THE ENGINE'S. sentencesOf and sentencesIn under src/engine drop
headings and table rows, join a paragraph onto one line, and cut after each
terminator. A second way of finding a sentence would disagree with the engine
about the same prose, and then two counts of one thing exist.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
RULES = os.environ.get("VOICE_RULES") or os.path.join(os.path.dirname(HERE), "voice-rules.json")

with open(RULES, encoding="utf-8") as f:
    LIMIT = json.load(f)["limits"]["sentence_words"]


def sentences_in(line):
    """sentencesIn: a table row is not a paragraph, and a terminator ends a sentence."""
    line = line.strip()
    if not line or line.startswith("|"):
        return []
    out, cur = [], ""
    for ch in line:
        cur += ch
        if ch in ".!?":
            out.append(cur)
            cur = ""
    if cur.strip():
        out.append(cur)
    return out


def sentences_of(text):
    """sentencesOf: paragraphs split on a blank line, headings dropped, whitespace joined."""
    out = []
    for para in text.split("\n\n"):
        if para.strip().startswith("#"):
            continue
        out.extend(sentences_in(" ".join(para.split())))
    return out


if len(sys.argv) < 2:
    print("name a file: python util/checks/count-voice-breaks.py <file> [<file> ...]")
    raise SystemExit(2)

print("limit %d words a sentence, read from util/voice-rules.json" % LIMIT)
total_over = 0
for path in sys.argv[1:]:
    with open(path, encoding="utf-8") as f:
        said = sentences_of(f.read())
    over = [s for s in said if len(s.split()) > LIMIT]
    total_over += len(over)
    print("%-24s %3d sentences  %3d over" % (os.path.basename(path), len(said), len(over)))
    for s in over:
        print("      %3d words: %s" % (len(s.split()), " ".join(s.split()[:8])))
print("%d sentences over the limit in %d file(s)" % (total_over, len(sys.argv) - 1))
