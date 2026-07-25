---
id: se.adr-applies-to-becomes-a-selector
kind: decision
statement: "applies_to BECOMES MACHINE-READABLE - state ids, state kinds or tags - so the packet builder can select the rules that bind a state. ADDRESSES R14, R15 and criteria C7 selection correctness, C8 migration debt. Today it is human prose ('every guard, check and refusal in the engine and in any design') on ten nodes, and ZERO machine-state nodes carry it at all (probed at i12), so the obvious join is not implementable against existing data. Ten nodes are migrated and the field is authored as a selector thereafter. REJECTED: each state declaring the rules it carries (that is the hand-wiring whose absence caused the problem - a law minted tomorrow would still need every state edited); semantic matching over applies_to prose (needs no migration, but is unproven and unfalsifiable at the point of use, and it fails the deciding criterion - whether the right rules were picked must be CHECKABLE, since a fuzzy match returning plausible-but-wrong rules costs attention while looking like coverage). The semantic option is NOT dead: an M5 spike measures it before it is finally discarded."
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
---


