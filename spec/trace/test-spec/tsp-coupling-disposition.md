---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: tsp-coupling-disposition
type: "[[test-spec]]"
statement: Every candidate the BM25 sibling proposes carries a recorded disposition before the change is considered reviewed, verified by inspection over the disposition writer's construction.
method: inspection
verifies:
  - req-bm25-candidates-need-disposition
files:
  - none — the Checklist below is the whole definition
---

## Scope

The disposition half only (fn-run-a-governed-walk.record-a-coupling-disposition):
that the writer forces a row for every candidate the ranking half hands
it, with nothing dropped. The ranking half is tsp-coupling-rank, verified
by test.

WHY INSPECTION AND NOT TEST. The guarantee is structural — no filter,
no threshold, no early return sits between the ranked list and the
write — rather than an input/output behaviour a corpus fixture could
exercise. req-bm25-candidates-need-disposition's own verify_method
already says inspection; this spec honours that rather than relitigating
it.

## Checklist

- recordCouplingDisposition (engine/disposition.ts) iterates the FULL
  candidate list it is handed, with no filter, slice or early return
  between the input and the write loop — pass: a source read confirms
  one row is produced per input candidate, count for count.
- every produced row is stamped `pending` at creation — pass: a source
  read confirms no branch sets `status` to `accepted` or `rejected`
  inside this function; only a person's later act may do that
  (raid-dec-i15-disposition-prepopulates-pending-rows).
- the function signature takes the ranked list as its whole input, with
  no side channel that could drop a candidate BEFORE THE WRITE LOOP —
  pass: recordCouplingDisposition's only value-bearing parameter is the
  candidate list, and no constant is read inside it. It also takes a root
  path, which is unused and drops nothing.

THE WORDING WAS TOO WIDE AND i33'S VERIFICATION CAUGHT IT. The old line
said "no such parameter or module-level constant exists", and
engine/disposition.ts does carry `const THRESHOLD = 0.01`. That constant
filters in the RANKING half, which this spec's own Scope excludes, so the
line failed on its own words while passing on its intent. It now names
the write loop, which is what the guarantee is about.

RUN 2026-08-17, at i33's verification, by a tester with fresh eyes.

engine/disposition.ts IS NO LONGER A STUB, and this note said it was for
long enough that the inspection read as impossible rather than as owed.
recordCouplingDisposition at disposition.ts:86 returns one row per
candidate stamped `pending`, with no branch setting any other status.

BOTH REMAINING LINES PASS on a source read. The third was reworded in the
same pass, because it failed on its own wording while passing on its
intent.
