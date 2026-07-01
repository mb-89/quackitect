---
id: req-inside-entry-surface
type: requirement
refines: [uc-drive-from-inside]
statement: A bare workspace ships a committed `AGENTS.md` stub that tells an AI opening the workspace to drive it via `.\quack` and to load method prompts path-free through `quack resolve` / `quack guides`. The stub is self-contained — no external instruction and no hard link to a quackitect checkout is required.
class: review
killer: false
---
## Rationale (not load-bearing)
The entry surface for the AI. Mirrors the human launcher: a small committed file that explains how to reach the linked engine, nothing more.
