---
id: raid-corpus-stays-small
type: "[[raid]]"
kind: assumption
statement: The engine reads whole files and scans whole folders on every look, which assumes the corpus stays small enough for that to be free.
owner: the driving agent
trigger: when a pull takes longer than a second, or when the trace passes a thousand nodes
status: open
probe: "holds. 248 trace nodes against a 1000-node trigger, and pulls answer well inside a second. The one time it bit was not size at all. The corpus was being loaded about fifteen times per call, and hoisting that to one load fixed it."
probed: 2026-08-07
impact: Green is recomputed from disk on every render. If that stops being cheap, the honest fix is a cache — and a cache is the thing this design just spent a day removing.
breaks_how_badly: corrosive
how_likely: plausible
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
