---
id: req-drive-from-inside
type: requirement
refines: [uc-drive-from-inside]
statement: From inside a bare workspace, `.\quack status` (and `next`, `bless`) drives it via the linked engine and prints its board, with no engine path in version control. Acceptance bar — the existing roundtrip/machinery test is EXTENDED to create a bare workspace and drive it from inside via the stubs, and it passes.
depends_on: [req-inside-launcher, req-inside-entry-surface, req-engine-loc-untracked]
class: review
killer: true
---
## Rationale (not load-bearing)
The end-to-end proof and the M7 killer demonstration. Reuses the machinery test (per the user's explicit ask that the roundtrip exercise this feature).
