---
id: req-record-opens-on-word
type: "[[requirement]]"
statement: The engine shall open an expedition or an iteration only on the person's recorded choice.
kind: functional
verify_method: test
breaks_if_removed: Records open on an agent's guess and the person loses the one control the method gives them.
breaks_how_badly: fatal
refines:
  - uc-get-work-routed
  - uc-open-an-iteration
source_refs:
  - uc-get-work-routed step 5
  - uc-get-work-routed ext 5a
  - contract rule 8 (never open a record unasked)
  - uc-open-an-iteration step 1
  - uc-get-work-routed ext 6a
  - contract rule 5 (confirm before you compose)
  - uc-get-work-routed ext 5a
  - ".se/req-mine-sebots.md: rumination (no mid-walk re-litigation)"
priority: must
---

## Detail

What the rule forbids the desk to do instead:

- If nothing the person said fits a vehicle, then the desk shall put the question back to the person, seeding zero records.
- When the person rejects the recommendation and names another vehicle, the desk shall carry out the named choice and shall re-present the rejected recommendation zero times.
