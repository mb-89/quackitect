---
minted_in: i1
id: req-boot-stands-agentless
type: "[[requirement]]"
statement: Where no agent is available, the boot shall complete with every panel control live.
kind: functional
verify_method: demonstration
breaks_if_removed: The product hard-depends on an agent and a person without a model cannot use their own machine.
breaks_how_badly: crippling
refines:
  - uc-install-quackitect
source_refs:
  - uc-install-quackitect ext 5a
  - ".se/req-mine-sebots.md: the person's dial and the manual path (the vault outlives the tool)"
priority: must
---

## Detail

The walk stands until a hand takes it.
