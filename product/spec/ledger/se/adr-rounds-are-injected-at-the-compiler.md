---
id: se.adr-rounds-are-injected-at-the-compiler
kind: decision
statement: "EVERY GATE'S REVIEW ROUNDS ARE APPENDED WHERE EVIDENCE FORMS ARE BUILT, at one place in the compiler, as REQUIRED fields. ADDRESSES R30, need N10, goal G5.\n\nWHY HERE AND NOWHERE ELSE: the four rounds - verify, validate, red-team, verdict - have been required by the review method since it was written, and the method note even said the compiler would inject them. Nothing did. No evidence form ever asked, and consequently NOT ONE round had been filled in any gate of any iteration in this project's history, while every one of those gates went green. A rule that no form collects is not a weak rule; it is an absent one that reads as present forever.\n\nREJECTED - authoring the rounds into each gate by hand: one edit per gate forever, and a gate authored later simply misses them. That is precisely how the rounds came to be required-but-never-collected.\nREJECTED - a lint that complains after a gate passes: it detects the omission instead of preventing it, and an unattended run has already moved on.\nREJECTED for this iteration - a separate review sub-machine per gate: it changes the machine's shape, which this iteration's excluded list forbids. It is the natural successor if entry criteria are ever added.\n\nEVIDENCE THAT IT BINDS RATHER THAN DECORATES: the injection broke eight fixture-gate tests on landing, because the machine began refusing gate submissions without rounds. And within the same rewalk, three gates reviewed themselves to findings their unaided authors had missed - unstoried needs, source references pointing at superseded lettering, and a candidate eliminated on an unprobed claim."
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
---


