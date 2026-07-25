---
id: se.adr-locate-and-read-are-separate
kind: decision
statement: "RETIRED AT i12's REWALK. It said: search returns locations, the reader returns context. It read as principle - the function structure does separate LOCATE from DELIVER-IN-PORTIONS - and it existed because `git grep -z` cannot emit clean fields and context markers in one call. That is a TOOL LIMITATION WEARING THE CLOTHES OF A DESIGN DECISION, and it retired a requirement: R3 says a match carries 'a caller-specified number of surrounding lines', and this ADR moved that to a second call the caller had to make. Worse, the tests were then written against this design rather than against the register, so the suite went green with no context check in it at all.\n\nSUPERSEDED BY: se.law-requirements-are-never-weakened, and by the rebuilt engine/search.ts where a match ALWAYS carries its context in ONE call - natively from ripgrep for the working tree, and assembled by the facade for a ref, so the caller never pays for git's limitation.\n\nKEPT RATHER THAN DELETED because the reasoning is the useful part: the tell is that an ADR explaining why a requirement does not apply IS a rewrite of that requirement. The owner caught this by reading; no gate did, because the review rounds that would have caught it had never been collected."
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
---


