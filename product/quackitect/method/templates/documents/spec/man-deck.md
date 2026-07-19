---
id: man-deck
type: manifest
mode: deck
statement: The talk - compiled from the spec, one slide per unit.
---
<!-- design: method-doc-skeletons  implements: req-template-home.6 :: The deck, preset, and agent-guide manifests ship as skeletons. The engine modes predate them; only the shapes were missing. Slots keep the drafting duty loud. -->
<!-- tailor: the deck skeleton. One unit per slide; Note: lines are the presenter's
  aside (hidden on screen, printed in the handout). Refs pull spec content at
  depth 1; figs and pooled views render live. Replace the slots, keep the shape.
  The deck mechanisms (i19), each optional per slide:
  - `Minutes: <n>` per slide draws the elapsed-minutes TIMELINE across the deck
    (numbers under every tick, the total as a caption; measure honestly).
  - `|||` marker lines split a slide into COLUMNS (first segment stays full-width).
  - a ```embed fence bakes a script INERT in a <template>; a start button runs it
    (```embed auto builds on the slide's first entry instead); register
    slot.__stop for stop-on-slide-leave; the 50KB budget refuses oversize embeds
    with a static stand-in.
  - a ```mermaid fence with subgraph layers renders the slide's OWN model through
    the SAME interactive onion every model gets (rank order innermost first).
  - `fig: <kind>` lines reuse the book's own figures, id-scoped to the slide.
  - glossary terms in slide prose become termrefs; in present mode a click shows
    the full definition as a TOAST (never a jump out of the slideshow).
-->
<!-- ai:3 -->
# {{title-slide}}
Note: {{opening-words}}
---
[{{key-node}}]({{key-node}}.md)
Note: {{why-this-node-carries-the-story}}
---
fig: project-timeline
Note: {{where-the-project-stands}}
---
<!-- ai:3 -->
# {{closing-slide}}
Note: {{the-ask-and-questions}}
<!-- enddesign -->
