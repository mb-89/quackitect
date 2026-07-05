---
id: req-spec-template-set
type: requirement
refines: [uc-spec-template]
depends_on: []
statement: The method layer shall carry a spec template set - a README and nine chapter manifests whose authored units each open with a heading and carry a fill comment, a gating tag, a provenance mark, and a slot placeholder.
class: review
killer: false
---
## Rationale (not load-bearing)
The nine chapters (orientation, motivation, fundamentals, design input, design output, verification and validation, project, rationales, guidance) and their unit lists were settled in the 2026-07-05 walk. Fill comments are PERMANENT authoring guidance (Contents/Motivation/Form/Sources), stripped at emit; the gating tag ([mandatory|judgment|type: ...]) is machine-readable; heading slugs are the stable anchors rationales key to. Sources: arc42 with-help variant, sebot 00_HOW_TO_USE, the nine book digests at college/buecher/digest/.
