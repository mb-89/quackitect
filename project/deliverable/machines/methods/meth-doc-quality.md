---
kind: method
statement: "Document scrutiny: docs are for communication, never for backup - judge the emitted set per stakeholder, against the seven quality attributes, with the why included."
---

## Situation
Guidance for M9 finalize-docs: the moment to scrutinize the emitted documentation as a DOCUMENT. The war story to avoid: complete docs nobody understood - they diverged from reality and the system was re-engineered.

## Procedure
- Judge against the seven documentation qualities: HELPFUL (effort with it < effort without), CORRECT (the uncompromised one - never allow a known error to stand), UP-TO-DATE (correctness decays), EASY TO FIND (a defined structure, arc42-like), EASY TO UNDERSTAND (language and notation per stakeholder), EASY TO CHANGE (the easier, the likelier it stays current), ADEQUATE (pragmatic for THIS system and THESE stakeholders).
- Walk the STAKEHOLDERS, not the chapters: for each reader class (developer, tester, operator, maintainer, the next architect, the assessor) - do they find what THEY need? A view nobody's concern demands is noise; a concern no view serves is a gap.
- Check the pair WHAT and WHY: every significant decision present WITH its rationale and its rejected options. A doc that only says what is a backup, not a communication.
- Check the summaries exist and are honest: scope, overview, key decisions, key requirements - the reader stops when they have enough (progressive disclosure).
- Ask the minimality question per view: is this view as small as its stakeholders allow? More views mean more inconsistency risk.
- Scrutinize the prose itself: missing or bad prose, undefined terms (the glossary catches them), stale references, figures without a what-to-see line.

## Sources
SyA Architectural Views & Documentation (Vollmar/Kramer 2022, owner-mapped digest @ai/sya_kb); ISO/IEC/IEEE 42010; arc42.
