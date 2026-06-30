---
id: req-workspace-split
type: requirement
refines: [uc-self-workspace, uc-drive-other-workspace]
statement: The engine operates on a selectable WORKSPACE separate from itself. A workspace holds the project's product, spec, and ALL its state (attest, evidence, snapshot, notes, gather, out, config). The engine resolves its own workspace by default, or a different one when pointed at a target base. Acceptance bar — a vehicle can create a DUMMY workspace and drive it through a full systematic iteration with no real content (a "machinery test", each milestone argued as exercising the machinery) and every gate passes.
depends_on: [req-vendor-layout]
class: review
killer: true
---
## Rationale (not load-bearing)
sebot `base`-style: tools operate against a target root, all project state under it; the engine is stateless w.r.t. the project. Lets quack and vehicles drive many projects from one engine. The machinery-test acceptance (create vehicle -> dummy workspace -> full max-rigor iteration -> all milestones green) is the end-to-end proof and the M7 killer demonstration.
