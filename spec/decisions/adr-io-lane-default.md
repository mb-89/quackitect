---
id: adr-io-lane-default
type: adr
decided_in: i0021_field_ux
adjudicated_by: user
statement: Engine-mediated file-IO is the DEFAULT for agent edits: quack apply (byte-exact replace, create, write - dry-run-first, all-or-nothing, audited in the call log) is the lane an agent reaches for FIRST; editor tooling remains the lane for a single interactive edit; a byte-safe scripted edit stays the recorded exception. Datum: universal mediation (editor tooling retired). Universal loses on edit latency and harness ergonomics - the walk lives in editor tools for one-line changes, and forcing a manifest per edit taxes every step for corruption the single-edit lane has never caused. Reverse-sensitivity: if a single-edit corruption incident lands (the named corrupter class spreading beyond shell round-trips), universal mediation returns as the ruling's recorded fallback.
class: review
killer: false
kind: architecture
provenance:
  class: schema-default (review)
  killer: schema-default (false)
  kind: agent-proposal: first of architecture|project|waiver|quality|risk - veto or confirm
---
## Rationale (not load-bearing)
TODO
