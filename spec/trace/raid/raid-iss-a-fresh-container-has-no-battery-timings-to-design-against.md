---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-iss-a-fresh-container-has-no-battery-timings-to-design-against
type: "[[raid]]"
kind: issue
statement: The test-timing records do not survive a container, so a record that starts on a fresh clone cannot design a performance change against its own battery.
owner: the maintainer
trigger: any state that must reason about test cost before verification runs
status: open
impact: A performance item has to be designed from an older record's numbers, measured on another machine, or deferred until after the build. All three are worse than reading the last run.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - i5-engine-hygiene-one-version-source-every-
  - raid-risk-splitting-the-heaviest-test-file-buys-no-wall-clock
weighs_with: none
weighs_against: none
---

## What was observed

CHECKED ON THIS CONTAINER, 2026-08-19. Neither `.se/test-last-run.json` nor
`.se/test-timings.jsonl` exists. The `.se` folder holds only what this session
created — the settings, the call log, the vault index and the lane client.

THE RETRO METHOD READS BOTH FILES. Its mining step says to read the summary
first and use the append log to compare across runs. On a cloud clone there is
nothing to read and nothing to compare.

## Why it is an issue and not a risk

It is present tense. It already blocked one thing in this record: the split
item cannot be designed from a measurement, and the state that would need the
number runs before the state that produces one.

## The ordering that makes it bite

- `decompose-structure` designs the split. It needs a timing.
- `verification` fires the battery. It produces the timing.
- verification runs after decompose-structure.

So on a fresh clone the number arrives too late by construction, not by
accident.

## What repairing it would consist of

THREE CANDIDATES, cheapest first, and none of them is inside this record's
goal.

- The last run's SUMMARY becomes a committed artifact, so it travels with the
  clone. Small, and it makes the number a fact of the project rather than of
  the machine.
- A state before the build is allowed to fire a scoped timing run. This
  reopens the whole-battery guard question, which the kickoff left out.
- The design states cite an older record's measurement explicitly, with the
  machine it was taken on named. This is what i5 does today, and it is the
  weakest of the three.
