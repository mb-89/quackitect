---
template: item-criterion
artifact: node
applies_rigor: [lean, systematic]
applies_type: [default]
---
# criterion — one measurable success criterion

Lives in the iteration or `spec/trace/`. The ch1 delta unit renders the set;
the ch5 validation view traces each criterion to its demonstrated outcome -
the V-model's outer arc as data. A criterion nothing will ever check is not a
criterion. Id prefix `crit-`.

## Fields
- `type` (criterion): fixed.
- `statement` (one sentence): the success claim, checkable.
- `metric` (short name): what gets measured or observed.
- `target` (value with unit, or a binary condition): the pass line.

## Body
How the check runs and where its evidence lands.

```
---
id: crit-{{slug}}
type: criterion
metric: {{what-is-measured}}
target: {{pass-line}}
statement: {{the-success-claim}}
---
{{how-checked}}
```
