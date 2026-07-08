---
id: req-details-pane
type: requirement
depends_on: []
statement: The book shall carry an always-visible details pane at the sidebar bottom that expands upward over the sidebar to show context help for a clicked term, link, filter, search, or graph node, and collapses back to a bar.
class: review
killer: false
phase: [operation]
discipline: [software, design]
quality: [usability]
---
## Rationale (not load-bearing)
field c3 c4 c6 c24 + owner 2026-07-08: the dead id/type/state card becomes the one context-sensitive help surface. It hosts the views and the baseline hash. It always shows (no scroll to reach it), overlays the sidebar in z, expands upward, collapses down.
