---
id: req-details-full-entry
type: requirement
depends_on: []
statement: When a reader follows a reference, the surface shall show the full referenced entry in the details pane where one exists, else as a small toast.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via chat (2026-07-18)
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## One mechanism, two outputs (owner ruling, 2026-07-18)

- The reference-following mechanism is ONE: resolve the referenced entry, produce its full content.
- The OUTPUT adapts to the surface. A surface with a details pane (the book, the report) fills the pane. A surface without one (the hand-off) pops the same content as a small toast.
- This fixes the hand-off's dead dotted links: today they point at a pane that does not exist there.
- The content is identical either way; only the container differs.
- ATTENTION PING (owner, 2026-07-18; visibility re-ruled 2026-07-19): whenever a click changes the details pane, three border ECHOES announce it. The pane itself never moves or scales. Each echo is a copy of the border that expands a UNIFORM distance outward on every edge while fading to nothing, ease-out. The travel is 3vmax, identical horizontally and vertically; proportional scaling stays wrong. NO inversion (owner, 2026-07-19): the ripple may ride onto the neighboring text area, and an edge that leaves the screen is accepted. The c1 defect was the SWALLOWED ripple: the sidebar's overflow clip ate every direction but up, and the border's faint color hid the rest - so the clip carries a margin and the echo wears a visible color.
- Technique: STATIC absolutely-positioned ring siblings over the pane (dom-static law), re-armed by a class, animating inset and opacity. The echo wears a clearly VISIBLE dark neutral (#555) and rides above the pane content (z-index). The sidebar uses overflow clip with a clip margin so the ripple escapes its box.

```css
#sidebar { overflow: clip; overflow-clip-margin: 4vmax; }
.ping { position: absolute; inset: -2px; border: 2px solid #555; border-radius: inherit; pointer-events: none; z-index: 3; animation: ping .32s ease-out forwards; }
@keyframes ping { 0% { inset: -2px; opacity: .95 } 100% { inset: calc(-2px - 3vmax); opacity: 0 } }
```

## Rationale (not load-bearing)
The owner found the dotted links dead on the hand-off page. Duplicating a details machinery per surface would drift; one resolver with two output containers cannot.
