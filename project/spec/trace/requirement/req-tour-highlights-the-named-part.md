---
minted_in: i1
id: req-tour-highlights-the-named-part
type: "[[requirement]]"
statement: While a tour stop names a part, the panel shall highlight that part.
kind: interface
verify_method: demonstration
breaks_if_removed: The spoken name and the visible thing never connect; the newcomer cannot map words to parts.
breaks_how_badly: corrosive
refines:
  - uc-learn-the-machinery
source_refs:
  - uc-learn-the-machinery step 3
priority: could
weighs_against:
  - req-pin-writes-seeded-scaffolds > — a newcomer who cannot map words to parts learns nothing; a placeholder gap is a known refusal
---

## Detail

## Detail

The two sides of the boundary:

- Naming side, owned by the engine: the tour names one part per stop.
- Highlight side, owned by the panel: the panel highlights the named part while the stop runs.
