---
id: raid-corpus-stays-small
type: "[[raid]]"
kind: issue
statement: The engine reads whole files and scans whole folders on every look, and the corpus is no longer small enough for that to be free.
owner: the driving agent
trigger: fired 2026-08-13 — the first half of its own trigger, a pull past one second
status: open
breaks_how_badly: corrosive
how_likely: expected
probe: "FALSE as an assumption. Its own trigger fired: 6 of 29 pulls past one second in the 2026-08-13 window, and /widget/machine at 3285 ms with 3275 ms inside the machine phase. Whether the cause is size or shape is NOT settled by this probe."
probed: 2026-08-13
impact: Green is recomputed from disk on every render. If that stops being cheap, the honest fix is a cache — and a cache is the thing this design just spent a day removing.
source_refs:
  - engine/session.ts recordDone
  - engine/paths.ts methodFilesIn
  - req-call-answers-in-one-second
---

The whole computed-green design rests on reading being cheap. recordDone opens
every evidence file on every paint. The method backfill reads every method file
on every reload. Neither is bounded by anything but the corpus.

Today that is fine: 146 requirements, 15 evidence files, one open worktree.

A CANDIDATE LEANS ON IT TOO (gate-candidates, 2026-08-09). cand-derived-house
assumes the corpus stays small enough to rebuild on every look. Measured that
day: 322 nodes, 465 ms cold, 119 ms warm. Unmeasured above that.

NOT ESTABLISHED: nobody has measured where it stops being fine. The number
above is what exists, not what was tested.

NOT CONTROLLED: the corpus grows with the work, and growing it is the point.

WHY IT MATTERS MORE THAN ORDINARY PERFORMANCE. There is already a requirement
that a call answers in one second. When reading stops being free, the cheapest
repair is to cache the derived answer — which reintroduces exactly the stored
derived value that the suspect mark was, and that cost nine signatures.

## Probe

Mint a synthetic corpus an order of magnitude larger — ten open worktrees, a
few thousand trace nodes — and time one pull and one render against it.

The measure is the pull, not the file read, because the pull is what a person
waits on.

If it holds at ten times, this is closed for the foreseeable life of the
product. If it does not, the answer is a content-keyed cache outside the spec,
the shape v1 settled in adr-verdict-cache — never a mark written back into the
artifacts.

## PROBED 2026-08-13 — FALSE, SO IT IS NOW AN ISSUE

The entry named its own trigger: "when a pull takes longer than a second".
That has happened, repeatedly and measurably.

- 6 of 29 `se_pull` calls exceeded one second in the window opening
  2026-08-12T15:52:54Z.
- `/widget/machine` answered in 3285 ms, with 3275 ms of that inside the
  machine phase alone.
- 134 calls of 1065 broke the one-second rule.

So it has already happened and it is present tense. Per meth-assumption-
probing, the kind changes and the id stays.

### WHAT THE PROBE DOES NOT SETTLE

Whether the cause is SIZE or SHAPE. The entry's own history warns about
exactly this confusion: the one previous bite was fifteen corpus loads per
call, not a large corpus.

The register grew from 146 requirements to 177 in the same period, so size
moved too. Neither number alone explains 3275 ms.

NAMING THE CAUSE IS NOT THIS STATE'S WORK. i12 carries it, and its charter
names the machine page and the pull's pagination directly.

### WHAT RESTS ON THIS

`req-call-answers-in-one-second` now rests on something known false, and
`cand-derived-house` assumed the same smallness at gate-candidates on
2026-08-09. Both are named here so the trace carries the consequence rather
than the finding alone.
