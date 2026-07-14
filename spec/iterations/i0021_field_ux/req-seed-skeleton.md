---
id: req-seed-skeleton
type: requirement
statement: When a planned version is started, the engine shall seed the rigor checklist's gates and subtasks into the iteration's tasks folder with iteration-unique ids - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When a planned version is started, the engine shall emit every milestone gate and subtask of the configured rigor into spec/iterations/(version)/tasks/.
2. The engine shall namespace every seeded id by the iteration tag.
3. The engine shall seed each statement with the rigor template's wording as a pre-fill for the composer to tailor - seeding proposes, the composer vetoes.

## Rationale (not load-bearing)
The i20-m4-seed defer lands here (deferred: seeding is this iteration's theme). Today the agent
hand-copies the rigor checklist into ~40 task files at every start - mechanical, error-prone,
and exactly the authoring-into-blanks this iteration abolishes. The wiring rules
(milestone-monotonic, gate depends_on subtasks) are deterministic and belong in the engine.
