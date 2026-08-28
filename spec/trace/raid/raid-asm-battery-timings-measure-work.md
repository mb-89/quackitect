---
unreachable_citations:
  - claims.test.ts
minted_in: i12
id: raid-asm-battery-timings-measure-work
type: "[[raid]]"
kind: assumption
statement: A battery case's recorded duration measures its own work, so the battery's ranking names the tests that really cost the most.
owner: the driving agent
trigger: a file measured alone differs from its battery figure by more than a factor of two
status: open
probed: 2026-08-15
probe: scheduled - the instrument is broken on both paths, per raid-iss-a-bound-record-records-no-test-timings. Repairing it is this iteration's first build item.
impact: Every performance fix in this iteration is aimed by the battery's ranking. If the durations are mostly queueing, the ranking points at the wrong file and the work lands where it changes nothing.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - req-call-answers-in-one-second
  - i12
---

## Why it is open

The battery runs about twenty test files at once. A case's recorded
duration is its own work plus whatever it waited for, and nothing in the
recorded data separates the two.

The scale of the gap is visible in the run of 2026-08-14T20:20:55.908Z.
Summed case time is 1534695 ms against a wall of 76985 ms, which is
roughly twenty to one.

One case in `claims.test.ts` is credited with 75218 ms of that 76985 ms
wall. Read as real work, that is one case holding 97.7 percent of the
whole battery. Read as contention, it is a case that waited a long time
while nineteen other files ran.

The record's own note put the same shape at 62 percent on an earlier
run, so the figure moves between runs without the code moving with it.

## Why it cannot be probed today

A scoped run records no timings. `engine/tools.ts` builds its argv with
`--test-reporter=tap` alone, where `engine/bin/selftest.ts` attaches the
spec reporter and `test-timings.mjs` together.

So the only durations that exist are the contended ones. Measuring a
file alone is exactly the probe this assumption needs, and it is the
measurement the tooling currently throws away.

## Probe

Attach the timings reporter to the scoped path. Run `claims.test.ts`
alone. Compare its slowest case against 75218 ms.

Two outcomes, both useful.

- Close to 75218 ms, and the battery's ranking is sound. The designed
  git-seam fake is then the right fix and the order stands.
- Far below it, and the ranking is an artefact of load. Everything this
  iteration would have fixed on that ranking is re-aimed first.
