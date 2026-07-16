---
template: item-stakeholder
artifact: node
applies_rigor: [lean, systematic]
applies_type: [default]
---
<!-- design: method-stakeholder-links  implements: req-item-domain-fields.3 :: Stakeholder notes carry preset and guide links; no reverse join exists in the pinned subset. The matrix renders concern, preset, and guide columns. One note feeds the ch0 reader matrix and the ch3 concerns table. stakeholder: one project stakeholder of a derived class. -->
# stakeholder â€” one project stakeholder of a derived class

Lives in the iteration or `spec/trace/` (interim home, spec-folder discussion
pending). The derived class set fixes the ROW SET of the stakeholder table; these
notes fill the content â€” a class with zero notes renders as a visible TBD row.
More than one note per class is legal (two user groups). ROLES, never persons
(the privacy ruling). Id prefix `stk-`.

## Fields
- `type` (stakeholder): fixed.
- `role` (a derived class slug, e.g. user): the project-type class this stakeholder
  belongs to. Named role, not class - class is the node grammar's own key.
- `interest` (0..1): how much the outcome matters to them.
- `influence` (0..1): how much they can change the outcome.
- `weight` (0..1): the project's weighting of their concerns.
- `preset` (a man-preset- id, optional): the view preset serving this reader row â€”
  ch0's canned text sends the reader to it.
- `guide` (a guide- id, optional): this audience's how-to guide â€” the ch8 link.
- `statement` (one sentence): who this role is, in this project. The ch3 concern
  column renders exactly this.

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

## Mint skeleton
`quack mint` seeds these fields from this fence, verbatim. The engine owns every other key.

```skeleton
role: TODO
interest: 0.5
influence: 0.5
weight: 0.5
```
<!-- enddesign -->
