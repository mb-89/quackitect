---
minted_in: i1
id: tsp-walk-window
type: "[[test-spec]]"
statement: The panel carries every update to the render, holds the reader's place, and keeps its colors and scripts honest, verified by test over the mirror's contract.
method: test
verifies:
  - req-reader-keeps-their-place
  - req-every-update-reaches-the-render
  - req-colors-are-configuration
  - req-narration-toll-is-collected
  - req-decision-graph-reads-as-branches
files:
  - tests/mirror-contract.test.ts
  - tests/panel.test.ts
  - tests/elements.test.ts
  - tests/cards.test.ts
  - tests/palette.test.ts
  - tests/gitgraph.test.ts
  - tests/narration.test.ts
  - tests/scripts.test.ts
  - tests/preflight.test.ts
  - tests/shoot.test.ts
---

## Scope

The window a person watches the walk through: the mirror's render
contract, the reader's-place laws, the palette constraint, the narration
toll, and the decision trail's readability.

## Approach

Component level against the served page — the SERVED markup and scripts
are asserted, never the source. Seam design per wire: the payload
carries the field, and the surface acts on it. The reader's-place rules
are a registry with a test refusing anything unregistered.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps: EVERY update changes the render; a
popped-out card opens on what it was showing, and then holds still;
every script block the mirror serves is valid JavaScript; no six-digit
hex is written into the renderer; the toll: armed after boot, one grace
warning, then the refusal.
