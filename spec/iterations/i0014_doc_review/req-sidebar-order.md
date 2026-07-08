---
id: req-sidebar-order
type: requirement
depends_on: []
statement: The book sidebar shall order its blocks: search, then the filter expression, then collapsible views, then the toc; the toc shall show each chapter's number.
class: review
killer: false
phase: [operation]
discipline: [software, design]
quality: [usability]
---
## Rationale (not load-bearing)
field c3; toc chapter numbers added at the bs20 design discussion (2026-07-08), rippling from the trace-chapter renumbering (req-system-overview)

Session refinement 2026-07-08 (c5 c6 c7): search is one line with prev/next arrows and an xxx/yyy counter (no hit list); the filter is one line with default placeholder that opens its help in the details pane; the views move into the details pane; glossary and presentation leave the sidebar (presentation via its button, glossary in ch3).
