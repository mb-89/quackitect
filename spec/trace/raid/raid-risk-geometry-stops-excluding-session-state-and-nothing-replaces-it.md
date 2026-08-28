---
minted_in: i9
type: "[[raid]]"
id: raid-risk-geometry-stops-excluding-session-state-and-nothing-replaces-it
kind: risk
statement: Session state is kept out of everything the product ships by sitting outside the packaged folder. The collapse moves it inside, so the exclusion has to become a written rule at the same moment, or it silently stops happening.
owner: the driving agent
trigger: the first packaging or vendoring run after the machine-state folder moves
status: open
impact: A packaged or vendored copy carries the raw call log and the raw note file. Both are documented as able to hold anything, and the note file is under a standing rule that it never enters version control. The product would be shipping them to whoever received the copy.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - "the standing rule that raw notes never enter version control, stated in sty-a-finding-outlives-the-box-that-found-it: a raw dump may carry anything"
  - "the lane card: every call is logged raw to the call log, arguments included"
  - "i9 scope: count the callers before the first edit, over every path that assumes a level above the project, the packager among them"
---

## What the risk is

TODAY THE EXCLUSION IS GEOMETRY. The packager takes the project folder. The
machine-state folder sits one level above it. Nothing had to be written down for
session state to stay out of a shipped copy, because it was never in reach.

AFTER THE COLLAPSE THE GEOMETRY IS GONE. The machine-state folder sits inside
the folder that gets packaged. A packager that changes nothing now includes it,
and it includes it by default rather than by mistake.

THE DEFAULT FLIPS FROM SAFE TO UNSAFE. That is what makes this worth an entry
rather than a line in a checklist. Before the move, forgetting costs nothing.
After it, forgetting ships the call log.

## What it would leak

- The raw call log, which holds every lane call with its arguments.
- The raw note file, which the corpus states may carry anything and which a
  standing rule keeps out of version control entirely.
- Whatever else the folder accumulates, none of which was ever written with a
  reader outside this machine in mind.

## Why the scope item does not fully cover it

THE SCOPE SAYS COUNT THE CALLERS, and it names the packager. That finds every
place that assumes a level above the project, which is a different question from
this one.

A COUNT ASKS "DOES THIS PATH STILL RESOLVE". This risk asks "does this path now
resolve to something it must refuse". A caller can survive the move perfectly,
keep working, and be exactly the problem.

## What would retire it

ONE EXPLICIT EXCLUSION, written where the packaging happens, plus one test that
packages a tree and asserts the machine-state folder is absent from the result.
The test is what makes it stay retired.

THE VENDORING PATH NEEDS THE SAME CHECK SEPARATELY, because a vendored copy and
a packaged copy are produced by different code and only one of them may be
fixed.
