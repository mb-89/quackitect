---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: raid-iss-a-verification-finding-that-is-not-a-test-failure-has-no-route
type: "[[raid]]"
kind: issue
statement: verification's forward door needs every claim green and its fallback fires only on a red exit script, so a defect found by INSPECTION or DEMONSTRATION leaves the walk with no legal move.
owner: the owner
trigger: already live - hit at i17's verification, 2026-08-18, with three blocking findings and a green battery
status: open
impact: "The state that exists to catch defects cannot record the ones its own non-test specs are for. The agent's remaining moves are all bad: sign over a known-broken claim, park a live defect as a debt, or step out of the walk. The third is what happened, and it is the least dishonest of the three rather than a good one."
breaks_how_badly: crippling
how_likely: expected
probe: "OPEN. The mechanism is read from engine/session.ts outcomeFor: a fallback edge fires only where the completion outcome is not `filled`, and the outcome is decided by the exit script. verification's exit script is the battery. Nothing else can turn it red."
probed: 2026-08-18
source_refs:
  - i17-the-options-pool-triage-a-raw-note-into-
  - raid-iss-boot-grants-no-tools-while-promising-repair
weighs_with: none
weighs_against: none
place: i52-the-route-can-go-back-a-walk-can-reach-a
---

## The shape of it

MEASURED AT i17's VERIFICATION, 2026-08-18. A tester subagent returned eleven
findings. Three were blocking and NONE of them was a test failure:

- the pool's folder and node type collided with a declared item kind holding 95
  nodes, which no test could see because the fixture never copies the corpus
- `se_file_write` was a second door into the pool, which is an INSPECTION
  finding by construction — tsp-one-door-into-the-pool's method is inspection
  precisely because only reading proves a second path does not exist
- the privacy check fell to punctuation, found by an adversarial probe rather
  than by a case in the suite

THE BATTERY WAS GREEN THROUGHOUT. 1450 tests, 0 failures.

## The three doors and why all three were shut

- FORWARD, to fix-findings' sibling: refused, because `claims` is unchecked
  while any box stands open. That is correct and it is the owner's own ruling
  of 2026-08-11.
- FALLBACK, to fix-findings: never fired. `outcomeFor` returns `failed` only
  where a fallback or error edge was taken, and `completeState` fires those
  only on a non-filled outcome, which the exit script decides. The script is
  the battery.
- IN PLACE: verification grants `se_file_read`, `se_file_search` and
  `se_file_glob`. Nothing writes.

## Why this is the same defect as the boot one

`raid-iss-boot-grants-no-tools-while-promising-repair` is the same shape one
milestone earlier: a state whose job includes finding a problem, and which
grants no way to act on having found one.

BOTH SELECT FOR THE DISHONEST MOVE. At boot it is reaching for a native tool.
Here it is ticking a box, or filing a live defect as a debt so the form will
sign. The agent that does the right thing is the one that gets stuck.

## Repayment

An inspection or demonstration claim that FAILS must complete the state with a
failed outcome, exactly as a red script does, so the drawn fallback fires. The
form already knows the difference between a checked box and an open one; the
completion does not read it.

Until that lands, the honest move is `escape` with the reason, which is what
i17 did and what this entry records.
