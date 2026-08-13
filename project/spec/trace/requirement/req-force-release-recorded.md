---
minted_in: i2-parallel-iterations-across-machines-seed
id: req-force-release-recorded
type: "[[requirement]]"
statement: When a person judges a claim abandoned, the engine shall release it on an explicit force act that records who forced and why; the force is never offered as an everyday control.
kind: functional
verify_method: test
breaks_if_removed: A dead machine's claim wedges its iteration forever, or releases happen untraceably.
breaks_how_badly: corrosive
refines:
  - uc-claim-an-iteration
source_refs:
  - uc-claim-an-iteration extension 5a
priority: should
weighs_against:
  - req-autonomy-is-categorical >
---

## Detail

Against SILENCE, never malice (owner ruling 2026-08-11): no signing, no
permissions - just a deliberate, recorded act that is quiet in the
surface by design.
