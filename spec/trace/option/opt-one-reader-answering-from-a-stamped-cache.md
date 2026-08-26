---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: opt-one-reader-answering-from-a-stamped-cache
type: "[[option]]"
statement: Route every corpus question through one reader whose answer is computed once per unchanged corpus and served from that, so callers agree without any of them paying to re-read.
cluster: the-query
question: how callers come to agree about the corpus
found_by: contradiction
source: TRIZ separation IN TIME, on improving 27 Reliability against degrading 25 Loss of time
---

## Mechanism

ONE READER GIVES ONE ANSWER, and a stamp keyed on the corpus decides when that
answer is still the answer. Callers ask the reader; the reader asks the disk
only when the corpus has moved.

THE CONTRADICTION IT DISSOLVES. Making every caller agree means routing them
through one place, and one place is a bottleneck every caller pays for. Both
demands were assumed to apply per CALL. Agreement is a property of the answer,
not of the call, so the cost belongs once per corpus rather than once per
asker.

IT IS NOT SPECULATIVE HERE. The engine already stamps the corpus and keys work
on it, and already warns in its own comments that per-node field reads bypass
that stamp because they take a path rather than a node. The mechanism exists;
what is missing is that the readers all use it.

WHAT IT COSTS HERE. A cache is a second thing that can be wrong, and a stale
answer is worse than a slow one. The stamp has to be cheap enough to check on
every ask, or the bottleneck simply moves.

WHAT IT BUYS BEYOND AGREEMENT. The failure case comes along for free. One
reader means one answer when a node is malformed too, which is the half that
actually broke: two functions of the same name, in two files, disagreeing
about what a bad node does.
