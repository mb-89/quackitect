---
id: uc-new-project
type: usecase
refines: [need-engage]
statement: A user says "start a new project"; the agent asks the framing questions (start an iteration? which folder? vendor the engine or drive-from-inside stubs?), scaffolds the workspace, lands in it, and immediately opens the first iteration's M1 vision interview — no manual CLI setup.
class: review
killer: false
---
## Rationale (not load-bearing)
i0006. Conversational bootstrap into the loop. Uses the existing start-init / start-stubs scaffolding (need-workspace-drive machinery); the new capability is auto-entering engage at framing.
