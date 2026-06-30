---
id: req-design-language
type: requirement
refines: [uc-usability]
statement: A design-language resource defines the brand as ONE bundle — voice, logo set (hero + mark), colour palette, typography — and every output resolves brand assets through the overlay chain. The engine default is GENERIC (a neutral voice + [LOGO GOES HERE] placeholders); a vehicle overrides in its overlay; deleting the vehicle's files falls back to the engine default. The report renders the resolved logo to the left of the project name.
depends_on: []
class: review
killer: true
---
## Rationale (not load-bearing)
Per the brand discussion: the design language rides the i4 overlay chain (no ship-time transform). quackitect's duck lives in quackitect's .quack/overlay, so quack ship packages a brand-neutral engine. Voice is part of the design language.
