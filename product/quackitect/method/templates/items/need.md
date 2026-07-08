---
template: item-need
artifact: node
applies_rigor: [lean, systematic]
applies_type: [default]
---
# need — one stakeholder need, source-traced and acceptance-bound

Lives in the iteration or `spec/trace/`. A goal without a traceable stakeholder
is a wish (the RE rule) - every need names its source. Id prefix `need-`.

## Fields
- `type` (need): fixed.
- `statement` (one sentence): the need, in the stakeholder's terms.
- `source` (stk- id): the stakeholder this need comes from.
- `acceptance` (one checkable sentence, or a crit- id): what accepts the need
  as met - the validation chapter checks exactly this.
- `functions` (list, optional): the need's functional structure - one verb plus
  one noun per entry, solution-neutral (Pahl/Beitz). The ch3 use-cases-and-
  functions board renders it beside the need's use cases (i14, field c25).

## Body
Context and elicitation notes. Use cases refine the need via `refines`.

```
---
id: need-{{slug}}
type: need
source: stk-{{stakeholder}}
acceptance: {{checkable-acceptance}}
statement: {{the-need}}
---
{{context}}
```
