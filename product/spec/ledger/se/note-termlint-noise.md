---
id: se.note-termlint-noise
kind: note
statement: "Term-lint noise ruling: uppercase English words and internal labels from the 139-candidate worklist are lint noise, not glossary debt."
provenance:
  iteration: i4-questions-and-hygiene
  ai_involvement: agent-drafted
---

## Ruling

The B3 term lint flags every uppercase token without a glossary entry. Three classes in the 139:

- Genuine terms - now minted as gloss-* nodes (about 40).
- Internal labels - M1-M9, P3-P5, B2/B3, A2/A3, D2, L5, T-refs: covered by the collective entries gloss-milestones, gloss-pillars, gloss-bootstrap-steps; per-label entries would be noise.
- Uppercase English words (IS, ONE, WITH, DONE, FOR, WHAT, WHICH, ...) and citation fragments (TVCG, IGTA, MDL): lint false positives.

Lead for the term lint: a stopword list for plain English words and a label pattern for M\d/P\d/B\d - the worklist should never show them again.
