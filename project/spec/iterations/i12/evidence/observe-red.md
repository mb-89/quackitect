---
form: observe-red
by: agent
signed_off: 2026-08-15T11:59:27.646Z
authors: agent
files:
---

# Evidence form / observe-red

## current_situation

THE RED IS OBSERVED AND IT IS ON THE TEST SIDE. tests/timings.test.ts ran 2 of 2 failing, before any fix.

- "a scoped run records one timing row per case it ran" failed with `one row per case, got []`. The run finished green and wrote no timing record at all.
- "a run reports how many cases it timed, so a silent instrument failure shows" failed with `undefined !== 0`. The verdict carries no count of what it recorded.

Both are the demand failing rather than the test misfiring, which is what a first green needs.

TEN NON-TEST SPECS ARE NOW THE ONES THIS STATE MUST SPEAK FOR, because no run can show their red. It was eight when this form was first signed. Two arrived when i27's design layer was landed on trunk part-way through this record, and neither is this record's work.

None of the ten gained a requirement from this delta.

## red_observed

- [x] tsp-autonomy-tiers
- [x] tsp-bound-surface
- [x] tsp-derivation-analysis
- [x] tsp-desk-and-gates
- [x] tsp-first-run
- [x] tsp-panel-walkthrough
- [x] tsp-prose-inspection
- [x] tsp-read-back-inspection
- [x] tsp-record-inspection
- [x] tsp-tour-run

## follow_up

- The build makes the two red cases green. Nothing else is owed before it starts.
- ONE THING THE RED RUN SHOWED THAT IS NOT YET EXPLAINED, and it is watched rather than dismissed. The second case's verdict reported tests total 0 on a fixture that plants two cases. If it survives the fix, it is a second defect in the same seam and it gets its own entry.
- req-surface-answers-in-one-second has no case and cannot have one from inside the lane. Its red is unobservable here, which is exactly why it is a scheduled spike rather than a checkbox.

## anything_else

ON WHY ALL TEN ARE CHECKED, ONE BY ONE.

The checkbox takes the spec name and nothing else, so the reasons live here. Each was looked at rather than swept.

- tsp-autonomy-tiers: no requirement added this record, so no new red is owed and none was manufactured.
- tsp-bound-surface: i27's, arrived with the landing. It covers req-a-surface-resolves-to-what-it-shows, an i27 requirement.
- tsp-derivation-analysis: unchanged. Its analysis covers trace derivation, which this delta does not touch.
- tsp-desk-and-gates: unchanged. The survey defect landed on tsp-record-lifecycle instead, because its verify_method is test and the method has to match.
- tsp-first-run: unchanged. Nothing here touches setup or the newcomer's path.
- tsp-panel-walkthrough: unchanged, and this is the one worth reading twice.
- tsp-prose-inspection: unchanged. The lint sweep over the register is recorded at the requirements gate rather than here.
- tsp-read-back-inspection: i27's, arrived with the landing. It covers req-a-resolution-is-proven-by-read-back, an i27 requirement.
- tsp-record-inspection: unchanged. No new inspection-method requirement was written.
- tsp-tour-run: unchanged. Nothing here touches the tour.

ON THE TWO THAT ARRIVED MID-RECORD, because checking somebody else's spec deserves saying why.

Both were minted, red-observed and shipped in i27. Neither covers a requirement this delta wrote, and this record changed neither spec nor either requirement it names. Their red was observed by the record that owns them, and re-observing it here would be manufacturing evidence for work that is already done.

WHAT THIS RECORD DID TOUCH NEARBY, so the claim is not quietly wider than the truth. req-a-surface-resolves-to-what-it-shows gained a FUNCTION allocation at derive-functions, to show-where-it-stands, because i27 left it with design and no owner in the function structure. That is an edge added above the requirement, not a change to the demand or to the spec that verifies it.

WHY tsp-panel-walkthrough IS THE INTERESTING ONE. It is the demonstration spec for the panel, and this record's whole subject is a panel that takes four seconds to answer.

It is unchanged because the demand landed on a test-method spec, and a spec's method must equal the verify_method of every requirement it names.

A demonstration would still be the honest way to show a slow surface to a person. That is exactly what raid-asm-slow-surface-is-not-self-contention schedules as a spike, and it is why that entry is scheduled rather than unprobed.
