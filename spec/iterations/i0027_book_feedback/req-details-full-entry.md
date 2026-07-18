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
- ATTENTION PING (owner, 2026-07-18): whenever a click changes the details pane, three border ECHOES announce it. The pane itself never moves or scales. Each echo is a copy of the border that expands a UNIFORM distance outward on every edge while fading to nothing, ease-out. The travel is three percent of the larger viewport dimension (3vmax in CSS), identical horizontally and vertically. Proportional scaling is wrong: on a wide pane it moves the side borders far and the top and bottom barely. Three echoes fire staggered inside about half a second (starts roughly 0, 150, 300 milliseconds; each lives about 320 milliseconds).
- Technique: ephemeral absolutely-positioned ring elements over the pane, animating transform scale and opacity only - the flicker-free properties. The echo wears THE BORDER'S OWN color - no new color is introduced.

```css
.ping { position: absolute; inset: -2px; border: 2px solid var(--faint); /* the pane border color, always */ border-radius: inherit; pointer-events: none; animation: ping .32s ease-out forwards; }
@keyframes ping { 0% { inset: -2px; opacity: .9 } 100% { inset: calc(-2px - 3vmax); opacity: 0 } }
```

## Rationale (not load-bearing)
The owner found the dotted links dead on the hand-off page. Duplicating a details machinery per surface would drift; one resolver with two output containers cannot.
