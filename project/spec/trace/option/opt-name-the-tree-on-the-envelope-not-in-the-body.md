---
minted_in: i27
id: opt-name-the-tree-on-the-envelope-not-in-the-body
type: "[[option]]"
statement: carry the resolved tree on every answer's envelope rather than inside the payload, so a misroute becomes visible without adding to what already overflows
cluster: cluster-the-walk
question: how a resolution is made visible
found_by: contradiction
source: "TRIZ separation IN LEVEL, on the contradiction that making a misroute visible costs bytes on every answer while the answer already exceeds its bound"
---

## Mechanism

Two things sit at different levels and were treated as one budget.

The ENVELOPE is a handful of fields every lane answer already carries - the
path, the hash, the state. Adding the resolved tree costs tens of bytes.

The BODY is the form, the guidance and the templates. That is what reached
300,545 characters on 2026-08-14 and what req-the-answer-never-exceeds-its-
bound is about.

THE SEPARATION IS IN LEVEL. Observability is added at the part; the size
problem lives at the whole. Refusing the observability because the payload
is too big is paying for the body's defect out of the envelope's budget.

WHY IT IS WORTH SAYING AT ALL. The objection is real and it was going to be
made: this record cannot add a field to every answer while its own
requirement says answers are too big. The answer is that these are not the
same field and not the same order of magnitude.

WHAT IT COSTS. One field, set at the single resolution seam. It is the
cheapest thing on this chart, and on its own it prevents nothing - it only
makes a misroute findable, which raid-risk-a-write-lands-in-the-wrong-tree-
silently already names as the mitigation it wants.
