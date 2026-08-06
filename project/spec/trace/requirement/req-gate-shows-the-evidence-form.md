---
id: req-gate-shows-the-evidence-form
type: "[[requirement]]"
statement: "When a gate is offered for adjudication, the engine shall present the gate's evidence form itself, never a summary of it."
kind: functional
verify_method: demonstration
breaks_if_removed: "The person adjudicates a paraphrase, and an assertion-shaped round passes for evidence."
refines:
  - uc-adjudicate-a-gate
  - uc-land-work-on-trunk
source_refs:
  - uc-adjudicate-a-gate step 2
  - ".se/req-mine-v1.md: gates, blesses, and the person's hand"
  - ".se/req-mine-v2.md: gates, offers and grants"
  - uc-adjudicate-a-gate step 3
  - uc-land-work-on-trunk step 5
priority: should
---

## Detail

What the offered form carries:

- The engine shall carry each adjudication round as a distinct field on the gate's evidence form.
- Where the land-gate form cites an artifact, the form shall carry a link that opens the cited artifact.
