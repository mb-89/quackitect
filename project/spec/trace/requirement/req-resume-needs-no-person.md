---
id: req-resume-needs-no-person
type: "[[requirement]]"
statement: "When a person returns to the product after an absence, the panel shall show them where everything stands with zero questions to another person."
kind: quality
verify_method: demonstration
breaks_if_removed: "Coming back costs a conversation with whoever was here last, and unattended work stops being safe to leave."
refines:
  - uc-resume-after-an-absence
source_refs:
  - uc-resume-after-an-absence step 2
  - uc-resume-after-an-absence step 6
  - ".se/req-mine-sebots.md: The person's dial and the manual path"
  - uc-resume-after-an-absence step 3
  - uc-resume-after-an-absence step 4
  - uc-resume-after-an-absence step 5
priority: should
---

## Detail

What the returning person is shown, without asking:

- The panel shall show the lit node with crumbs naming the containing record and the current step.
- The panel shall render each worked state's evidence form with its recorded content and each unworked state's form empty.
- The decision graph shall show the last standing checklist with its open nodes and every deferred item.
- The surface shall show the pending-note count and the age of the oldest pending note.
