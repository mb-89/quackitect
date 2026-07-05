---
template: item-stakeholder
artifact: node
applies_rigor: [lean, systematic]
applies_type: [default]
---
# stakeholder — one project stakeholder of a derived class

Lives in the iteration or `spec/trace/` (interim home, spec-folder discussion
pending). The derived class set fixes the ROW SET of the stakeholder table; these
notes fill the content — a class with zero notes renders as a visible TBD row.
More than one note per class is legal (two user groups). ROLES, never persons
(the privacy ruling). Id prefix `stk-`.

## Fields
- `type` (stakeholder): fixed.
- `role` (a derived class slug, e.g. user): the project-type class this stakeholder
  belongs to. Named role, not class - class is the node grammar's own key.
- `interest` (0..1): how much the outcome matters to them.
- `influence` (0..1): how much they can change the outcome.
- `weight` (0..1): the project's weighting of their concerns.
- `statement` (one sentence): who this role is, in this project.

## Body
Their concerns, as prose or a short list. Every requirement they source cites this note.

```
---
id: stk-{{slug}}
type: stakeholder
role: {{class-slug}}
interest: {{0..1}}
influence: {{0..1}}
weight: {{0..1}}
statement: {{who-this-role-is}}
---
{{concerns}}
```
