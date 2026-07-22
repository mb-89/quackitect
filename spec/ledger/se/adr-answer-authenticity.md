---
id: se.adr-answer-authenticity
kind: decision
statement: Answer authenticity equals possession of the paired channel credential; the residual forgery risk is accepted.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_decided_in: i0016_structural_models
v1_type: adr
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
---

## Rationale (not load-bearing)
Ruled accepted-risk (red-team round 2, owner). The industry baseline is identical (HA context.id, LangGraph thread_id, gotoHuman meta: possession of an unguessable correlation id). Mitigations: high-entropy minted topics; asks carry check ids, never secrets; late and duplicate answers are idempotently ignored; gate asks render distinct. Upgrade paths, in order: self-hosted ntfy with access tokens and ACLs; Slack socket-mode (workspace-authenticated callbacks). Records raid-answer-forgery as WRITTEN, per the ruling.
