---
id: req-overhaul-takes-only-unowned-drift
type: "[[requirement]]"
statement: "If a finding belongs to an open record or changes behaviour, then the overhaul shall exclude it and name where it belongs."
kind: functional
verify_method: test
breaks_if_removed: "The overhaul becomes a second lane for real work, escaping every gate that work owes."
refines:
  - uc-let-the-system-catch-up
source_refs:
  - uc-let-the-system-catch-up ext 1a
  - uc-let-the-system-catch-up ext 3a
  - uc-let-the-system-catch-up step 4
  - ".se/req-mine-sebots.md: capture, decisions, change"
priority: should
---

## Detail

What the overhaul refuses, and where each goes instead:

- If a fix changes behaviour instead of restoring consistency, then the overhaul shall refuse the fix and name a record as its vehicle.
- Where a finding needs a person's decision, the overhaul shall record it as a note and leave the finding's artifact unchanged.
