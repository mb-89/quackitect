---
minted_in: i51-work-running-out-of-sight-reports-itself
id: raid-risk-a-hop-that-finishes-later-makes-green-ambiguous
type: "[[raid]]"
kind: risk
statement: "A state that may be left with its leaving verdict still owed breaks the one rule that makes green cheap to compute, and every gate below it inherits the ambiguity."
owner: the driving agent
trigger: the first walk that leaves a state with a pending verdict and then reads green anywhere downstream
status: open
impact: "Green is what a gate reads to decide passage. A third answer between green and not-green means every reader of green either learns the third answer or gets it wrong silently."
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - wt-a-step-whose-leaving-condition-runs-a-long-program-should-no
  - i51
---

## Why it stands

Today a hop completes when its exit script returns. One rule, one moment, one
answer.

The second goal changes that. A step may be left with a verdict still owed, so
the machine has to hold a pending result against a state.

## Where it bites

A state in that condition is neither passed nor failed.

- A gate below it asks whether its feeders are green.
- The route drawer asks which hops already pass.
- The panel paints a state by its status.

Each of those readers has two answers today and needs three tomorrow.

## Why the iteration accepted it

The kickoff sized this `major` for exactly this reason, and named it as the
architectural suspicion the column argument owes.

The goal system ruled conflict two for the non-freezing exit. A frozen verb is
a dead run on a box nobody watches, and that cost is paid on every run rather
than once.

## What would retire it

A named answer for the pending state, carried in every place green is read,
with a test that walks a state whose exit is still running and asserts what
each reader sees.

## No longer a design worry, 2026-08-21

IT IS AN OBSERVABLE STATE OF THE PRODUCT TODAY, measured in
[[exp-does-a-standing-hold-still]].

AT 86,079 ms INTO A RUN the live progress read 175 of 175 files and 1716 of 1716
cases, and the same call reported `running: true`. Every unit of work was done
and the verdict was not in.

THE GAP IS NOT SMALL. The run settled about fourteen seconds later.

AND THE DURABLE RECORD WAS WORSE. `.se/test-state.json` said `ok: true` with a
timestamp 88 minutes old, throughout a window in which a red was being computed.
A reader had no way to tell a live window from a settled answer.
