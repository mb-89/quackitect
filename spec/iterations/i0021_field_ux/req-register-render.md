---
id: req-register-render
type: requirement
statement: When a gate reaches its bless moment, the engine shall render one decision-brief hand-off page. Open decisions are dealt one at a time. No standing register exists anywhere. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When a gate reaches its hand-off, the engine shall render one phone-sized HTML page carrying only decisions - the BLUF, the open decisions, the decided-already audit, and the iteration's task tree.
2. The page shall deal open decisions one at a time, each card stating the authored options and the lettered ruling a bless selects, with every field behind one collapsed disclosure.
3. The hand-off page shall render agent-confident green and user-adjudicated green as two visually distinct marks.
4. The report shall carry no standing register section - provenance stays node data outside hand-off moments.

## Rationale (not load-bearing)
The owner's design rounds (2026-07-14, nine of them) fixed the shape: adjudication is a
MOMENT, not a dashboard (adr-handoff-html supersedes adr-register-in-report), and the page
is a decision brief - state, defaults and bookkeeping stay off it. The two greens keep
proposals from being laundered into decisions - involvement marks measure involvement,
never trust.
