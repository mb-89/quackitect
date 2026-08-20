---
minted_in: i1
id: req-every-update-reaches-the-render
type: "[[requirement]]"
statement: When a narration update lands, the panel shall change its render to carry it, and every script block the panel serves shall parse whole.
kind: functional
verify_method: test
breaks_if_removed: The walk narrates into a wall — the person watches a panel that silently stopped telling the story.
breaks_how_badly: crippling
refines:
  - uc-watch-the-walk-live
source_refs:
  - reverse-engineered from tests/mirror-contract.test.ts, tests/feed.test.ts, tests/scripts.test.ts and tests/preflight.test.ts
priority: must
---

## Detail

- Every update op changes the render: a plan opens nodes, done checks them off, a fork branches, a bare update lands as a checked point.
- An update answers with the open nodes, so an id is never guessed.
- Every inline script the panel serves parses; a syntax error inside a webview script is caught even though the file parses.
- Every card contributes its key to the registry by itself, and the component library serves the controls.
