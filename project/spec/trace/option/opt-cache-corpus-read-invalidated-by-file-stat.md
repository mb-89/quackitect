---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-cache-corpus-read-invalidated-by-file-stat
type: "[[option]]"
statement: cache the loaded corpus for the query, and invalidate the cache only when a cheap file-stat check shows a write actually happened
cluster: cluster-the-query
question: how does answer-a-structured-query evaluate a query against the corpus
found_by: contradiction
source: TRIZ separation IN TIME, dissolving “the query answers fast” vs “the query answer is reliably current” — the same mechanism already runs in this engine's own corpus loader, project/deliverable/engine/trace.ts loadTrace() and corpusVersion(), lines 562-588 (passEpoch()/corpusStamp())
---

## Mechanism

STEP 1, THE CONTRADICTION IN ONE LINE. Making the query answer fast makes
the answer unreliable, because a full markdown-file walk on every call is
the only way to guarantee freshness, and a full walk is what makes it slow.

STEP 2, STANDARD PARAMETERS. Improving is 9, Speed. Degrading is 27,
Reliability — its software equivalent is whether the answer reflects the
corpus as it actually stands right now.

STEP 3, THE SEPARATIONS. IN TIME: speed and freshness never actually
compete at the same moment. Between two writes nothing changes, so a cached
read from that window IS a fresh read. The contradiction only looks real
because "fast" and "fresh" were assumed to apply continuously rather than
per-write.

This engine already resolves it this way: `loadTrace` keeps a corpus map
keyed by root, and only rebuilds when `corpusStamp(files)` (derived from
file stats) disagrees with what is cached, or a lane write has bumped
`passEpoch()`. The separation dissolved the contradiction; no TRIZ
principle lookup was needed.

Cost: a stat sweep on every call, cheaper than a parse but not free, and a
correctness argument that rests on "every corpus-changing write goes
through the lane" holding without exception.
