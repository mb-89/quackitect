---
id: req-quack-build
type: requirement
refines: [uc-self-workspace]
statement: A `quack build` determinizer compiles the Go engine AND re-baselines .quack/engine/golden-root.txt in one step, so the build->root->golden sequence is owned by the tool, not hand-run. Eliminates the stale-golden footgun (transient false milestone FAILs).
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
From the retro: the sequence was hand-run ~8x this session; forgetting re-baseline caused false 'not green' reports. Strongest determinizer candidate.
