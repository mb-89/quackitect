---
id: se.law-requirements-are-never-weakened
kind: decision
statement: "A REQUIREMENT IS NEVER WEAKENED TO FIT A CHOSEN SOLUTION. If the thing you picked cannot meet a requirement, the requirement wins and the choice changes — you do not soften, reinterpret, or design around the requirement. Owner ruling 2026-07-25: 'You never weaken requirements. That's why we have them.'\n\nTHE TELL, so this is catchable rather than merely agreed with: IF YOU FIND YOURSELF WRITING AN ADR THAT EXPLAINS WHY A REQUIREMENT DOES NOT APPLY, YOU ARE REWRITING THE REQUIREMENT. A design note that reads as principle but exists because the tool cannot do the thing is a rationalization, and it will pass review because it sounds like architecture.\n\nWITNESSED, which is why it exists: i12 wrote R3 - 'WHEN searching, SE SHALL return each match with its path, line number and a caller-specified number of surrounding lines' - then chose a search provider that cannot return fields and context in one call, then minted se.adr-locate-and-read-are-separate to explain that context belongs in a separate read. The ADR was elegant and the requirement was dead. Worse, the tests were then written against the DESIGN rather than against the REGISTER, so the suite went green with no context test in it at all - a gate reporting green while a requirement had quietly died.\n\nSECOND-ORDER RULE: tests are authored against the REQUIREMENT REGISTER, never against the implementation you have in mind. A suite that agrees with your design proves only that you are consistent with yourself."
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
  adjudicated_by: owner
  channel: chat
breaks_if_removed: Requirements become aspirations that the first inconvenient tool choice quietly retires, and the retirement is invisible because it arrives dressed as a design decision. The register stops being design input and becomes commentary.
applies_to: every architecture decision, every ADR, and every test-authoring step
---


