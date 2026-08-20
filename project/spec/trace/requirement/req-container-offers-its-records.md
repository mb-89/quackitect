---
minted_in: i12
id: req-container-offers-its-records
type: "[[requirement]]"
statement: While more than one record stands open in a container, the pull at that container's start shall offer them as a choice rather than entering one.
kind: functional
verify_method: test
breaks_if_removed: A bare pull binds the walker to whichever record happens to be first, and reaching any other one costs an escape to the front desk.
breaks_how_badly: corrosive
refines:
  - uc-open-an-iteration
source_refs:
  - uc-get-work-routed
  - i12
priority: should
weighs_against:
  - req-survey-counts-only-open-records > — not being offered the records blocks the work; a survey counting closed ones misstates a number the reader can check
---

## Detail

The contract says the walker never chooses unasked, and never chooses
just because options were offered. The other half of that bargain is that
the machine must ASK where a choice really exists.

With several records open, entering one is a choice. Walking it as the
happy path takes the walker's decision and does not say so.

## What it cost, measured

Observed on 2026-08-15, with the owner having routed i12.

- A bare pull at `iterations/start` walked into `i4`, the first already
  started record.
- `se_aim` at i12 from inside i4 drew a fifteen-hop route: the whole of
  i4, then the whole of i23, then the whole of i24, then out to idle and
  back in.
- Aiming at `iterations/start` itself drew the same fifteen hops. There
  is no drawn edge back to the container's own start.
- The only way out was an escape, which lands at the front desk and needs
  a person's word to route again.

FIVE CALLS, AND IN AN UNATTENDED RUN IT IS A DEAD STOP. The escape waits
for a person who is not there.

## Behaviour

    (bare pull at a container's start)
      -> one record open:    enter it, as today
      -> several open:       answer `choose`, listing them
      -> none open:          run start to end, as today

The model earns its place here because the current fault is a MISSING
BRANCH rather than a wrong response, and a missing branch is invisible in
prose.
