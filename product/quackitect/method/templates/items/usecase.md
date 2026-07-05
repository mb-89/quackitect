---
template: item-usecase
artifact: node
applies_rigor: [lean, systematic]
applies_type: [default]
---
# usecase — one actor achieving one goal

Lives in its birth iteration. Id prefix `uc-`.

## Fields
- `type` (usecase): fixed.
- `refines` (list of need- ids): the need this use case serves.
- `actors` (list of role names): who acts. Roles, never persons.
- `trigger` (one phrase): what starts it.
- `statement` (one sentence): verb + object — the goal achieved.

## Body
The success scenario as numbered steps, then alternative flows. Preconditions and
postconditions where they carry weight.

```
---
id: uc-{{slug}}
type: usecase
refines: [{{need-id}}]
actors: [{{role}}]
trigger: {{what-starts-it}}
statement: {{verb-object goal}}
class: review
killer: false
---
## Success scenario
{{steps}}
## Alternatives
{{alternative-flows}}
```
