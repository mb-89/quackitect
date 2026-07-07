---
id: req-no-quack-state
type: requirement
statement: The engine shall write every regenerable artifact — evidence, gather, overlay, spike scratch, report output, golden baselines — to the workspace's user data directory, keeping the repository free of cache state.
depends_on: []
class: review
killer: true
phase: [engineering]
discipline: [software]
quality: [functionality]
---
## Rationale (not load-bearing)
The .quack folder disappears entirely; caches become siblings of logs/ and notes/ under the per-workspace user data home. One-time migration of existing state rides the build.
