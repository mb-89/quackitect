---
template: item-budget
artifact: node
applies_rigor: [systematic]
applies_type: [manufactured_good, cyber_physical]
---
# budget — one system budget with its agreed summation rule

Lives in the iteration or `spec/trace/`. A budget decomposes a quantified
requirement over design elements. The summation rule is PART of the budget or
the budget is theater - suppliers game rss to hide overruns. The engine checks
the arithmetic deterministically; margin erosion is a finding before overrun
is. Id prefix `bud-`.

## Fields
- `type` (budget): fixed.
- `statement` (one sentence): what this budget bounds.
- `metric` (short name): the budgeted quantity (mass, power, latency).
- `unit` (SI or declared unit): the unit every allocation uses.
- `addresses` (req- id): the quantified requirement this budget satisfies.
- `rule` (sum | rss | max): the AGREED summation rule.
- `margin` (0..1): the fraction of the limit held back as margin - the lint
  flags erosion against it, not just overrun.
- `allocations` (map of element id to number): one allocation per design element,
  in the declared unit.

## Body
How the allocations were derived; the measurement or analysis plan per element.

```
---
id: bud-{{slug}}
type: budget
metric: {{quantity}}
unit: {{unit}}
addresses: [req-{{requirement}}]
rule: sum
margin: {{0..1}}
allocations:
  {{element}}: {{value}}
statement: {{what-it-bounds}}
---
{{derivation}}
```
