---
id: se.adr-io-lane-default
kind: decision
statement: "Engine-mediated file-IO is the DEFAULT for agent edits. quack apply, which does byte-exact replace, create, and write, dry-run-first, all-or-nothing, audited in the call log, is the lane an agent reaches for FIRST. Editor tooling remains the lane for a single interactive edit. A byte-safe scripted edit stays the recorded exception. Datum: universal mediation, with editor tooling retired. Universal loses on edit latency and harness ergonomics. The walk lives in editor tools for one-line changes, and forcing a manifest per edit taxes every step for corruption the single-edit lane has never caused. Reverse-sensitivity: if a single-edit corruption incident lands, the named corrupter class spreading beyond shell round-trips, universal mediation returns as the ruling's recorded fallback."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_decided_in: i0021_field_ux
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
v1_kind: architecture
v1_provenance_class: schema-default (review)
v1_provenance_killer: schema-default (false)
v1_provenance_kind: "agent-proposal: first of architecture|project|waiver|quality|risk - veto or confirm"
p3_note: = se.set.apply
---

## Rationale (not load-bearing)
Not applicable - the decision body above carries the options and the reasoning; this slot adds nothing.
