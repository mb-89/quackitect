---
template: item-rule
artifact: node
applies_rigor: [systematic]
applies_type: [default]
---
# rule — one binding design rule

Lives in `spec/rules/`. A design rule is internally CHOSEN governance - distinct
from a `kind: constraint` requirement, which is externally imposed. Each rule
links the decision that established it. The ch4 design-rules view renders the
set. Id prefix `rule-`.

## Fields
- `type` (rule): fixed.
- `statement` (one imperative sentence): the rule detailed design must honor.
- `scope` (short phrase): where it binds (a subsystem, a layer, everywhere).
- `refers` (adr- id): the decision that established the rule.

## Body
Why the rule exists and what violating it costs. Examples welcome.

```
---
id: rule-{{slug}}
type: rule
scope: {{where-it-binds}}
refers: [adr-{{establishing-decision}}]
statement: {{the-imperative}}
---
{{why-and-cost}}
```
