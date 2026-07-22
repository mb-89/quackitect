---
id: se.adr-elovshy
kind: anti_decision
statement: "Retired by the owner's cleanup order 2026-07-16: every glossary term renders as a termref whose toast carries the full definition. The definition travels WITH the word, so reading order stopped mattering. The jargon lane still catches unregistered terms. The README plain-language rule still guards the front door."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_decided_in: i0025_clean_state
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
v1_kind: architecture
v1_provenance_class: schema-default (review)
v1_provenance_killer: schema-default (false)
v1_provenance_kind: "agent-proposal: first of architecture|project|waiver|quality|risk - veto or confirm"
graveyard: "true"
---

## Rationale (not load-bearing)
The reading-order lint assumed a definition lives in one place, so using a term before that place was a flaw. Termrefs changed the premise: every glossary term renders with a toast carrying its full definition, so the definition travels WITH the word. The lane's findings stopped naming real problems. The jargon lint still catches unregistered terms; the README plain-language law still guards the front door. The owner ordered the retirement on 2026-07-16.

## Graveyard note (why-not, queryable)

Retirement/veto record migrated as an anti-decision.
