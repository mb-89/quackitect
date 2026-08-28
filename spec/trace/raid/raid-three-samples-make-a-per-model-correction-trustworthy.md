---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: raid-three-samples-make-a-per-model-correction-trustworthy
type: "[[raid]]"
kind: assumption
statement: Three finished jobs are enough for the median ratio of predicted to actual time to correct a later estimate rather than mislead it.
owner: the owner
trigger: the first estimate that is corrected by the calibration factor and comes out further from the truth than the raw figure
status: open
probe: unprobed — no history exists yet, so there is nothing to measure the correction against
probed: not yet. The store was created on 2026-08-23 and holds too few rows to answer.
impact: A correction drawn from three samples can be worse than no correction. An estimate that is confidently wrong is read as a measurement, and the reader plans around it.
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - deliverable/engine/run.ts, CALIBRATION_MIN = 3
  - deliverable/engine/run.ts, the estimate store at .se/estimates.jsonl
  - "owner instruction 2026-08-23: bake the calibration into the engine and sort it by model"
---

NOT ESTABLISHED. Nobody has checked how many samples the median needs before
it stops swinging. Three was chosen because it is the smallest number with a
middle value, not because anything measured it.

NOT CONTROLLED. The spread depends on how varied the jobs are, and the jobs
are whatever the walk happens to run.

WHY IT MATTERS MORE THAN IT LOOKS. The raw figure is honest and wrong in a way
a reader can feel. A corrected figure carries the authority of having been
corrected, so a bad correction is trusted further than the thing it replaced.

## Probe

COMPARE BOTH FIGURES AGAINST THE TRUTH, once the store holds enough rows.

- For each finished job, compute the error of the raw estimate.
- Compute the error the calibrated estimate would have had.
- The correction earns its place only where its error is smaller on the
  majority of jobs.

THE PROBE NEEDS DATA AND NOTHING ELSE. It is not a spike. It waits on the
store filling up, which happens by itself as the walk runs.
