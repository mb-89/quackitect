---
id: adr-elovshy
type: adr
decided_in: i0025_clean_state
adjudicated_by: user
statement: Retired by the owner's cleanup order 2026-07-16: every glossary term renders as a termref whose toast carries the full definition. The definition travels WITH the word, so reading order stopped mattering. The jargon lane still catches unregistered terms. The README plain-language rule still guards the front door.
class: review
killer: false
kind: architecture
provenance:
  class: schema-default (review)
  killer: schema-default (false)
  kind: agent-proposal: first of architecture|project|waiver|quality|risk - veto or confirm
---
## Rationale (not load-bearing)
The reading-order lint assumed a definition lives in one place, so using a term before that place was a flaw. Termrefs changed the premise: every glossary term renders with a toast carrying its full definition, so the definition travels WITH the word. The lane's findings stopped naming real problems. The jargon lint still catches unregistered terms; the README plain-language law still guards the front door. The owner ordered the retirement on 2026-07-16.
