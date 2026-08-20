---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: req-the-arrival-never-costs-the-session
type: "[[requirement]]"
statement: Where the arrival fails at any step, the system shall report which step failed and leave the session running.
kind: constraint
verify_method: test
breaks_if_removed: "A hook that can end a session start is worse than the hand-work it replaces: a bad arrival would take down sessions that would otherwise have worked by hand."
breaks_how_badly: fatal
refines:
  - uc-arrive-on-an-unattended-machine
source_refs:
  - uc-arrive-on-an-unattended-machine extensions
  - uc-arrive-on-an-unattended-machine guarantee
priority: must
---

## Detail

THE FAILED BRANCH IS PART OF THE GUARANTEE, not an error path bolted to it. An
agent whose arrival failed still holds its native tools and still has the card,
so it can proceed by hand — but only if it is TOLD.

THE DANGEROUS STATE THIS FORBIDS is an agent holding native tools while believing
it is caged. That is why the report is required and not merely advised.
