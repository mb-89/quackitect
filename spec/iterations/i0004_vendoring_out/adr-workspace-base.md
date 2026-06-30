---
id: adr-workspace-base
type: adr
statement: Separate the engine from the workspace. The engine (binary + vendored resources) is stateless w.r.t. any project; a WORKSPACE holds product+spec+all state and is selected by a target base (default = the local workspace, override to drive another). Prior art — sebot tools take a `base` and write all state under it; git's binary operates on the repo at cwd or -C. The hidden .quack/ stays the engine/state home marker.
addresses: [req-workspace-split]
adjudicated_by: human
killer: true
---
## Rationale (not load-bearing)
The third separation axis (engine / vehicle / DATA). Reduces vendoring: driving a project needs only its workspace, not a second engine. Open fork: workspace as cwd vs an explicit --base flag vs a workspaces/ dir.
