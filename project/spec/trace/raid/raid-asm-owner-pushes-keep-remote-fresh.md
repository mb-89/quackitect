---
minted_in: i2-parallel-iterations-across-machines-seed
id: raid-asm-owner-pushes-keep-remote-fresh
type: "[[raid]]"
kind: assumption
statement: The owner's pushes of landed work keep the remote fresh enough that a peer's dependency gating sees what has really shipped.
owner: the owner
trigger: a peer refuses a claim over a dependency that shipped locally but was never pushed
status: open
probed: "not yet - scheduled at M7"
probe: "scheduled - ship locally unpushed, then have a second clone claim a dependent stub and read the refusal. Runs at M7."
impact: Dependency gating reads shipped state from the remote; work pushes stay the owner's act, so an unpushed shipped iteration blocks every peer's dependent claims while looking like a gating bug.
breaks_how_badly: corrosive
how_likely: expected
---

## Probe

Ship an iteration locally, leave it unpushed, and ask a second clone to
claim a dependent stub: the refusal must name the unpushed dependency
plainly. Run once during the i2 build; the remedy text is part of the
claim verb's work.
