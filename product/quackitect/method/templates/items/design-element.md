---
template: item-design-element
artifact: node
applies_rigor: [systematic]
applies_type: [manufactured_good, cyber_physical]
---
# design element — one physical or logical block, described

Software blocks DERIVE from code design markers and never use this template.
Physical artifacts and logical blocks with no code home get a design note
wrapping the artifact - this shape. Lives in the iteration or `spec/trace/`.
The ch4 block tree and element descriptions render from these plus the code
markers. Id prefix `des-`.

## Fields
- `type` (design): fixed - the same type code markers produce.
- `statement` (one sentence): the block and its responsibility.
- `responsibility` (short phrase): what the block owns.
- `implements` (req- ids): the requirements this block realizes.
- `parent` (des- id, optional): the enclosing block - the tree edge.
- `realization` (make | reuse | buy): the sourcing decision; early supplier
  involvement rides `buy` in the body.

## Body
Behavior and states, the realization concept, and the artifact reference
(drawing number, CAD path, datasheet - as a reference note where external).

```
---
id: des-{{slug}}
type: design
responsibility: {{what-it-owns}}
implements: [req-{{requirement}}]
realization: make
statement: {{block-and-responsibility}}
---
{{behavior-and-realization}}
```
