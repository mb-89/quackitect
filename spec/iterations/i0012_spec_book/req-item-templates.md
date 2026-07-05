---
id: req-item-templates
type: requirement
refines: [uc-spec-template]
depends_on: []
statement: The method layer shall carry an item template for each item kind - term, reference, fundamental, method, stakeholder, requirement, usecase, candidate, decision, test case, verification record, raid, and rationale - each declaring every field with its name, semantics, and value range.
class: review
killer: false
---
## Rationale (not load-bearing)
Thirteen kinds, one grammar. Scales are 0..1 floats everywhere (owner ruling). The field-declaration duty is the Attributierungsschema discipline (Eigner digest). Kind-specific guidance rides one template where kinds exist (requirement kinds functional|quality|constraint|interface; decision kinds architecture|project|waiver). Requirement target/tolerance fields deferred to the first physical project.
