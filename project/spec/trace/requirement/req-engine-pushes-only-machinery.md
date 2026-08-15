---
minted_in: i2
id: req-engine-pushes-only-machinery
type: "[[requirement]]"
statement: The engine shall push only seed stubs and claim files; every other push remains the person's own act, and agent-requested pushes stay refused.
kind: constraint
verify_method: test
breaks_if_removed: The surgical relaxation of the never-push rule widens silently, and work leaves the machine without the owner's hand.
breaks_how_badly: fatal
refines:
  - uc-claim-an-iteration
source_refs:
  - uc-claim-an-iteration step 3
priority: must
---

## Detail

The owner's ruling of 2026-08-11 relaxes SE-C-003 by exactly two
artifacts - the seed stub and the claim file - as machinery acts. The
refusal clause keeps refusing everything else, and its guidance section
names the two exceptions.
