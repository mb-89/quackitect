---
minted_in: i1
id: req-colors-are-configuration
type: "[[requirement]]"
statement: The engine shall take every drawn color from the one palette file, with zero color literals written in renderers.
kind: constraint
verify_method: test
breaks_if_removed: Changing a color means changing code, and the palette drifts against themes nobody controls.
breaks_how_badly: abrasive
refines:
  - uc-watch-the-walk-live
source_refs:
  - the color-is-configuration ruling in guidance/craft/ux.md
  - reverse-engineered from tests/palette.test.ts
priority: should
weighs_against:
  - req-autonomy-is-categorical >
  - req-nodes-scoped-to-iteration > — the same judgment as the line above it, written directly rather than through the equality, because an equals may not carry order across a chain — palette drift is felt at the next theme change, and a dial read as a continuum is felt the first time somebody expects half a rung; both are small, and the visible one comes first
---

## Detail

- The palette declares every role the code asks for; every feed color actually reaches the page.
- No two feed roles share a color, and none steals a color the voice already spent.
- No six-digit hex is written into a renderer.
