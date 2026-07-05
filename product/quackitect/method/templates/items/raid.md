---
template: item-raid
artifact: node
applies_rigor: [lean, systematic]
applies_type: [default]
---
# raid — one risk, assumption, issue, or dependency

Lives in `spec/trace/` (interim home). The project chapter renders the register;
the context unit of design input renders the ASSUMPTION rows — one source, two
views. An unrecorded assumption is how orbits get lost. Id prefix `raid-`.

## Fields
- `type` (raid): fixed.
- `kind` (risk | assumption | issue | dependency): which lane.
- `probability` (0..1): how likely it bites (risks and assumptions).
- `impact` (0..1): how hard it bites.
- `mitigation` (short phrase): what reduces it — avoid, then detect, then limit.
- `owner` (a role name): who watches it. A role, never a person.
- `status` (open | mitigated | accepted | closed): the lane's state.
- `statement` (one sentence): the risk/assumption/issue/dependency, plainly.

## Body
Description and the reaction plan. Deeper scoring (occurrence x detection x
severity, judged on singles AND product) is a method note for projects that need it.

```
---
id: raid-{{slug}}
type: raid
kind: risk
probability: {{0..1}}
impact: {{0..1}}
mitigation: {{what-reduces-it}}
owner: {{role}}
status: open
statement: {{the-thing, plainly}}
class: review
killer: false
---
{{description and reaction}}
```
