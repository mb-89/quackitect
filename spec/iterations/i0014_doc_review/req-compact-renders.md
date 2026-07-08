---
id: req-compact-renders
type: requirement
depends_on: []
statement: The book shall render each derived view within one screen in its default state, keep full detail one interaction away, and render failing or missing items prominently while passing masses collapse into counts.
class: review
killer: false
phase: [operation]
discipline: [software, design]
quality: [usability]
---
## Rationale (not load-bearing)
field c33 c34 c36; owner: discuss late in the walk, easy stuff first.
Bounds agreed at the bs20 design discussion (2026-07-08): candidates leave the design chapter (current architecture only; history reachable via the project timeline, see req-candidates-timeline); the design figure becomes a layered drill-down onion (req-figure-drilldown); the verification chapter opens by exception (req-vv-exceptions); general principle: no green ocean — reds render prominently and easily reachable, greens collapse into counts.
