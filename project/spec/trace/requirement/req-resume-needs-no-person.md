---
id: req-resume-needs-no-person
type: "[[requirement]]"
statement: When a person returns to the product after an absence, the panel shall show them where everything stands with zero questions to another person.
kind: quality
characteristic: interaction-capability
verify_method: demonstration
breaks_if_removed: Coming back costs a conversation with whoever was here last, and unattended work stops being safe to leave.
breaks_how_badly: crippling
refines:
  - uc-quality-interaction-capability
source_refs:
  - uc-resume-after-an-absence
  - uc-resume-after-an-absence step 2
  - uc-resume-after-an-absence step 6
  - ".se/req-mine-sebots.md: The person's dial and the manual path"
  - uc-resume-after-an-absence step 3
  - uc-resume-after-an-absence step 4
  - uc-resume-after-an-absence step 5
priority: should
weighs_against:
  - req-walk-survives-host-swap >
---

## Scenario

| part | value |
| --- | --- |
| source | A person who last worked in this product some days ago. |
| stimulus | They open the project and look at the panel, having asked nobody anything. |
| artifact | The panel: the drawing, the evidence forms, the decision graph, the note count. |
| environment | Normal operation. The record is open, work stands part-done, and whoever last worked here is unavailable. |
| response | The panel shows where the walk stands, what each state has recorded, what is still open, and what is waiting. |
| response measure | The person names the current step, the containing record and the next owed action within 60 seconds, having asked no other person a question. |

The pass line is the response measure. Sixty seconds and zero questions is
what separates this from a panel that merely contains the answer somewhere.

## Detail

What the returning person is shown, without asking:

- The panel shall show the lit node with crumbs naming the containing record and the current step.
- The panel shall render each worked state's evidence form with its recorded content and each unworked state's form empty.
- The decision graph shall show the last standing checklist with its open nodes and every deferred item.
- The surface shall show the pending-note count and the age of the oldest pending note.
