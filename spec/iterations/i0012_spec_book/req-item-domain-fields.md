---
id: req-item-domain-fields
type: requirement
statement: Each item kind shall declare its domain fields and the views shall render them - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The need item template shall declare source and acceptance fields, and the needs view shall render both columns. *(was req-need-item)*
2. The quality requirement shall accept the six scenario fields - source of stimulus, stimulus, artifact, environment, response, and response measure - and the qualities view shall render them grouped by quality facet. *(was req-quality-scenarios)*
3. The stakeholder note shall accept preset and guide fields, and the stakeholder views shall render concern, preset, and guide columns. *(was req-stakeholder-links)*
4. The test item shall declare method and level fields rendered in the verification matrix, and the requirement item shall name its verification field verify_method. *(was req-verify-method)*
5. The rationale and decision nodes shall accept a tags list, and a base query shall filter on it. *(was req-note-tags)*
