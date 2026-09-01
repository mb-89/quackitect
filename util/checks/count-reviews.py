"""COUNT THE REVIEW EVENTS OFF THE LOG, IN ONE PASS, AT ONE MOMENT.

wk-1b7c1a2da1 stated its baseline twice and the two copies disagreed: 122
rejections against 145, 49 tokens against 61, and a worst-rounds sentence that
the notes contradicted. Every number was typed and none carried a command.

SO THE READING IS DERIVED HERE AND PASTED THERE. Run it, paste what it said, and
say when. It prints the moment with the numbers, because the record is still
being written to and a reading with no moment is a reading nobody can reproduce.

  python util/checks/count-reviews.py <root>

WHAT IT COUNTS, and each definition is here rather than in the sentence that
quotes the answer.

A REJECTION is a log line of kind review whose data.verdict is rejected or spec
rejected. AN ACCEPTANCE is one whose verdict is accepted or spec agreed. A TOKEN
THAT HAS BEEN THROUGH REVIEW is one named by data.id on any such line.

DUPLICATES ARE DROPPED ON (session, seq, src, t), because a log may be read twice
and the same event must not count twice.

THE RATE is rejections over tokens that reached a review, as a percentage. It
goes above a hundred when one token is rejected more than once, which is the
property the owner asked for by name.
"""
import collections
import glob
import io
import json
import os
import sys
import time

root = sys.argv[1] if len(sys.argv) > 1 else "."

REJECTED = {"rejected", "spec rejected"}
ACCEPTED = {"accepted", "spec agreed"}

seen = set()
rejections = 0
acceptances = 0
rounds = collections.Counter()
tokens = set()

for path in sorted(glob.glob(os.path.join(root, ".se", "log", "*.jsonl"))):
    for line in io.open(path, encoding="utf-8", errors="replace"):
        line = line.strip()
        if not line:
            continue
        try:
            one = json.loads(line)
        except ValueError:
            continue
        if one.get("kind") != "review":
            continue
        key = (one.get("session"), one.get("seq"), one.get("src"), one.get("t"))
        if key in seen:
            continue
        seen.add(key)
        data = one.get("data") or {}
        verdict = data.get("verdict")
        tid = data.get("id")
        if tid:
            tokens.add(tid)
        if verdict in REJECTED:
            rejections += 1
            if tid:
                rounds[tid] += 1
        elif verdict in ACCEPTED:
            acceptances += 1

rate = (100.0 * rejections / len(tokens)) if tokens else 0.0
worst = rounds.most_common(3)

print("taken at %s UTC, over %s" % (time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                                    os.path.join(root, ".se", "log", "*.jsonl")))
print("  tokens that reached a review   %d" % len(tokens))
print("  rejections                     %d" % rejections)
print("  acceptances                    %d" % acceptances)
print("  rejected at least once         %d" % len(rounds))
print("  through clean                  %d" % (len(tokens) - len(rounds)))
print("  rate                           %.0f per cent" % rate)
for tid, n in worst:
    print("  most rejected                  %s, %d" % (tid, n))
