---
id: adr-answer-authenticity
decided_in: i0016_structural_models
type: adr
adjudicated_by: user
statement: Answer authenticity equals possession of the paired channel credential; the residual forgery risk is accepted.
class: review
killer: false
---
## Rationale (not load-bearing)
Ruled accepted-risk (red-team round 2, owner). The industry baseline is identical (HA context.id, LangGraph thread_id, gotoHuman meta: possession of an unguessable correlation id). Mitigations: high-entropy minted topics; asks carry check ids, never secrets; late and duplicate answers are idempotently ignored; gate asks render distinct. Upgrade paths, in order: self-hosted ntfy with access tokens and ACLs; Slack socket-mode (workspace-authenticated callbacks). Records raid-answer-forgery as WRITTEN, per the ruling.
