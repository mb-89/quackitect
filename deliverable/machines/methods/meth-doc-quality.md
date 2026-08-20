---
kind: method
statement: Documents are for communication. Scrutinise them for what a reader can actually use.
---

## Situation

Guidance for M9 finalize-docs. It is the moment to scrutinise the emitted
documentation as a DOCUMENT.

The war story to avoid is complete docs nobody understood. They diverged from
reality, and the system was re-engineered.

## Procedure

- Judge against the seven documentation qualities.
  - HELPFUL. Effort with it is less than effort without it.
  - CORRECT. Never allow a known error to stand.
  - UP-TO-DATE. Correctness decays.
  - EASY TO FIND. A defined structure, arc42-like.
  - EASY TO UNDERSTAND. Language and notation per stakeholder.
  - EASY TO CHANGE. The easier it is, the likelier it stays current.
  - ADEQUATE. Pragmatic for THIS system and THESE stakeholders.
- Walk the STAKEHOLDERS, not the chapters. For each reader class, ask whether
  they find what THEY need.
  - The developer.
  - The tester.
  - The operator.
  - The maintainer.
  - The next architect.
  - The assessor.
- A view no concern demands is noise. A concern no view serves is a gap.
- Check the pair WHAT and WHY. Every significant decision is present with its
  rationale and its rejected options.
  - A doc that only says what is a backup, not a communication.
- Check the summaries exist and are honest.
  - Scope.
  - Overview.
  - Key decisions.
  - Key requirements.
  - The reader stops when they have enough (progressive disclosure).
- Ask the minimality question per view. Is this view as small as its
  stakeholders allow?
  - More views mean more inconsistency risk.
- Scrutinise the prose itself.
  - Missing or bad prose.
  - Undefined terms, which the glossary catches.
  - Stale references.
  - Figures without a what-to-see line.

## Sources

- SyA Architectural Views and Documentation (Vollmar and Kramer 2022), from
  the owner-mapped digest at @ai/sya_kb.
- ISO/IEC/IEEE 42010.
- arc42.
