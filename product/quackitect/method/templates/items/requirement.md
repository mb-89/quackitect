---
template: item-requirement
artifact: node
applies_rigor: [lean, systematic]
applies_type: [default]
---
# requirement — one checkable claim on the system

Lives in its birth iteration. EARS-shaped statement (quack lint checks). Needs are
the user level; requirements are the system level; deeper tiers hang off `refines`.
Facet tagging is expected work — downstream designers filter by these. Id prefix `req-`.

## Fields
- `type` (requirement): fixed.
- `kind` (functional | quality | constraint | interface): the requirement's nature.
  Qualities carry a six-part scenario in the body; constraints link their normative
  reference; functionals name verb+noun behavior.
- `refines` (list of uc-/req- ids): the parent it details.
- `phase` (list from the type layer's phase vocabulary): which life phases it binds.
- `discipline` (list from the discipline vocabulary): which domains realize it.
- `quality` (list from the quality vocabulary): which qualities it serves.
- `must_wish` (must | wish): Forderung or Wunsch (Pahl/Beitz).
- `weight` (0..1): importance for trade-offs and register sorting.
- `source` (a stk- note id): the stakeholder this requirement traces to.
- `responsible` (a role name): who owns it. A role, never a person.
- `verify` (test | analysis | inspection | demonstration): the verification method,
  assigned at WRITE time — it feeds the ch5 matrix.
- `ears` (exempt - reason, only when genuinely non-EARS): the recorded exemption.

## Body
The rationale (depth 2 renders it). Quality kinds add the six-part scenario:
source of stimulus / stimulus / artifact / environment / response / response measure.
Values carry tolerances IN the statement (explicit fields wait for the first
physical project). TBD is a legal value — the register counts them; none may
survive the detail gate.

```
---
id: req-{{slug}}
type: requirement
kind: functional
refines: [{{uc-id}}]
phase: [{{phase}}]
discipline: [{{discipline}}]
quality: [{{quality}}]
must_wish: must
weight: {{0..1}}
source: stk-{{slug}}
responsible: {{role}}
statement: {{EARS-shaped claim, values with tolerances}}
class: review
killer: false
---
## Rationale (not load-bearing)
{{why}}
```
