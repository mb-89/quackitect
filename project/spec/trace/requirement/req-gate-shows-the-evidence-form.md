---
id: req-gate-shows-the-evidence-form
type: "[[requirement]]"
statement: "When a gate is offered for adjudication, the engine shall present the gate's evidence form itself, never a summary of it."
kind: functional
verify_method: demonstration
breaks_if_removed: "The person adjudicates a paraphrase, and an assertion-shaped round passes for evidence."
refines:
  - uc-adjudicate-a-gate
source_refs:
  - uc-adjudicate-a-gate step 2
  - ".se/req-mine-v1.md: gates, blesses, and the person's hand"
  - ".se/req-mine-v2.md: gates, offers and grants"
priority: should
---

## Detail

## Detail

- The presented form is the record itself, never a paraphrase of it.
- Every artifact the evidence cites opens from the form in one interaction.
- The served intent renders above the evidence, so intent drift must survive the person re-reading their own intent.
