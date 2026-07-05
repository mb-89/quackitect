---
template: item-rationale
artifact: node
applies_rigor: [lean, systematic]
applies_type: [default]
---
# rationale — one cross-cutting why, keyed to its clause

Lives in `spec/trace/` (interim home). The rationales chapter renders these in
REFERENT order, norm-annex style (IEC Annex A mirrors clause order). The sorting
rule: decides something → a decision record; explains one node → that node's body;
cross-cutting why → here. Mid-chapter philosophy gets written as a rationale and
linked — it never disrupts the flow. Id prefix `why-`.

## Fields
- `type` (rationale): fixed.
- `refers` (list of referents): node ids or heading anchors (`man-ch1-motivation#where-we-want-to-be`).
  Heading slugs are STABLE anchors — the lint flags a dangling one after a rename.
- `statement` (one sentence): the thesis of the why.

## Body
The deep why. Links down to nodes and decisions — never restates them.

```
---
id: why-{{slug}}
type: rationale
refers: [{{node-id-or-anchor}}]
statement: {{the-thesis}}
class: review
killer: false
---
{{the-deep-why}}
```
