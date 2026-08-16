---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: req-a-held-iteration-names-its-holder
type: "[[requirement]]"
statement: When an iteration is claimed by another machine, the container shall present it with its holder named, and an attempt to enter it shall refuse naming that holder.
kind: functional
characteristic: functional-suitability
verify_method: test
breaks_if_removed: In-flight work appears on no surface anywhere, so a person cannot tell an iteration nobody has taken from one another machine is already shipping.
breaks_how_badly: abrasive
refines:
  - uc-start-an-unattended-machine
source_refs:
  - uc-start-an-unattended-machine ext 5a
  - uc-claim-an-iteration
  - sty-work-on-two-machines
  - raid-debt-claim-pool-surfaces
priority: must
weighs_with: none — showing who holds an iteration and when a folder exists are different measures; the pair was flagged because both are new and both touch the record lifecycle
---

## Detail

PRESENTED, NEVER HIDDEN. The owner considered hiding a held iteration and ruled
against it on 2026-08-15, once it was clear that hiding would put in-flight work
on no surface at all.

WHAT THE PRESENTATION CARRIES:

| field | where it comes from |
| --- | --- |
| the holder's machine id | the claim ledger |
| how long it has been held | the claim's own timestamp |
| that it cannot be entered here | the container's own state |

THE REFUSAL NAMES THE HOLDER. A refusal that says only "claimed" sends the
reader to look somewhere that does not exist, because no other surface shows
holders today.

## Why this is the first surface the ledger ever reaches

`claimListing`, `claimsLedger` and `forceRelease` stand in engine/claims.ts and
are referenced nowhere outside tests. That is the standing
[[raid-debt-claim-pool-surfaces]], and this row repays part of it.

WHAT IT DOES NOT REPAY: the holder listing as a view of its own, and the force
release as a person's act. Both stay open on that debt.
