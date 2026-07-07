---
template: item-rationale
artifact: node
applies_rigor: [lean, systematic]
applies_type: [default]
---
<!-- design: method-note-tags  implements: req-note-tags :: Rationale and decision nodes accept a tags list (whitelisted key), and base queries filter on it via file.hasTag - the hook behind the tensions, force, and strategy views. -->
# rationale â€” one cross-cutting why, keyed to its clause

Lives in `spec/trace/` (interim home). The rationales chapter renders these in
REFERENT order, norm-annex style (IEC Annex A mirrors clause order). The sorting
rule: decides something â†’ a decision record; explains one node â†’ that node's body;
cross-cutting why â†’ here. Mid-chapter philosophy gets written as a rationale and
linked â€” it never disrupts the flow. Id prefix `why-`.

## Fields
- `type` (rationale): fixed.
- `refers` (list of referents): node ids or heading anchors (`man-ch1-motivation#where-we-want-to-be`).
  Heading slugs are STABLE anchors â€” the lint flags a dangling one after a rename.
- `tags` (list of slugs, optional): query hooks â€” a chapter view filters rationales
  by tag (`stakeholder-conflict`, `partitioning-force`) via `file.hasTag`.
- `statement` (one sentence): the thesis of the why.

## Body
The deep why. Links down to nodes and decisions â€” never restates them.

```
---
id: why-{{slug}}
type: rationale
refers: [{{node-id-or-anchor}}]
tags: [{{optional-tag}}]
statement: {{the-thesis}}
class: review
killer: false
---
{{the-deep-why}}
```
<!-- enddesign -->
