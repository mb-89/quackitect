---
id: uc-engine-mediated-io
type: usecase
statement: An agent's file edits travel one engine-mediated lane - byte-safe, dry-runnable, audited - so no careless write can corrupt the workspace and every edit leaves a record.
class: domain
killer: false
---
## Rationale (not load-bearing)
The apply-generalization the owner reopened at i21 start (NOTE-20260710-213201): quack apply
shipped in i18 as the bulk lane; the generalization makes engine mediation the norm for agent
file-IO. The two historical UTF-8 corruptions are the motivating incidents - the byte-safe rule
today holds by discipline; mediation makes it structural.
