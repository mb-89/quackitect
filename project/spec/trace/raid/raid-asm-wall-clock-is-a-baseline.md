---
minted_in: i12-performance-hold-the-one-second-rule-on-
id: raid-asm-wall-clock-is-a-baseline
type: "[[raid]]"
kind: assumption
statement: The battery's wall clock repeats closely enough on this machine that a change of more than a few percent means the code moved.
owner: the driving agent
trigger: two battery runs of an identical tree differ by more than a tenth
status: open
probed: "2026-08-15"
probe: "unprobed, and the attempt is the finding. Two green batteries on one tree wrote no wall clock at all."
impact: Every before-and-after in this iteration is a wall-clock comparison. If the baseline wanders by more than the win, a real improvement and a quiet machine look identical, and the iteration cannot tell which one it bought.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - req-call-answers-in-one-second
  - i12-performance-hold-the-one-second-rule-on-
  - raid-asm-battery-timings-measure-work
---

## Why it is open

The whole iteration is judged by comparing wall clocks before and after.
Nobody has measured how much the wall clock moves on its own.

There is already one sign that it moves a lot. A performance test has
failed twice under battery load at 1107 ms and 1029 ms against a 1000 ms
budget, and passed thirty of thirty scoped on identical code.

That is the same machine, the same tree, and two different answers.

## Why it is separate from the contention assumption

The sibling entry asks whether a single case's duration measures its own
work. This one asks whether the TOTAL repeats.

They can fail independently. Per-case numbers could be pure contention
while the total stays steady, and the total could wander while each case
is measured cleanly.

Both have to hold before a before-and-after means anything.

## Probe

Run the battery. Change nothing. Run it again.

Compare the two `wall_ms` figures in `.se/test-last-run.json`, which is
rewritten per run, so the first must be read before the second starts.

The unchanged-tree gate refuses a second run by design, so this probe
uses the flake door deliberately and says so.

A spread under a tenth makes the baseline usable. A wider spread means
every claim in this iteration needs repeated runs rather than one.
