---
form: the-drawer-tells-deciding-from-failed
amended: 2026-08-24T18:15:58.017Z by agent — A second reviewer corrected the word. Saying "untested" tells a later reader there is no guard there, and there is one — the case in clear-jump.test.ts. What is missing is the red, not the check, and the two standings call for different work.
by: agent
signed_off: 2026-08-24T17:57:01.073Z
authors: agent
files: null
---

# Evidence form / the-drawer-tells-deciding-from-failed

## current_situation

The route drawer asked whether a hop passes and received a boolean. A step whose leaving judgment was still being reached therefore read as failed.

The route was then abandoned and redrawn on the request path, while somebody waited. The debt had been open since i51 and its trigger had fired.

## built

THE DRAWER HAS ITS OWN QUESTION NOW, which is the one change the debt's own repayment section named.

### What was wrong

The route drawer reached its hop checks through a boolean. A step whose leaving judgment was still being reached therefore read as FAILED, so the route was abandoned and redrawn on the next pull — and the redraw is paid on the request path while somebody waits.

ITS OWN COUNT: a route-failing pull ran past thirty seconds 36 per cent of the time, against 2 per cent for every other pull. The slowest ran 131 seconds, and the surface shares the loop, so the panel was frozen behind it.

### What changed

`leavingStanding()` on the session asks `stepStanding` about the state being left and returns all three words.

The sweep uses it. When a hop will not go through, the answer now carries `deciding: true` where the state being left has a judgment in flight, and says plainly that nothing is owed and nothing is wrong — sweep again rather than redraw.

`conditionMet` IS UNTOUCHED, exactly as the debt prescribed. It has many callers and only the drawer wanted the third word.

The refusal answer moved into `sweepRefused`, because the added decision crossed the complexity ceiling and the fix for that is naming a phase rather than suppressing the rule.

### Observed RUNNING, which is not the same as verified

A sweep from `start` toward `end` used to answer: `boot/end refused — answer it and sweep again`.

It now answers: `stopped because the state being left is STILL DECIDING — nothing is owed and nothing is wrong; its judgment has not landed yet, so sweep again rather than redrawing`.

That is the misreading gone, on the live machine.

IT IS EVIDENCE THE PATH RAN, NOT THAT IT IS RIGHT, and a cold reviewer corrected this form on exactly that point. The honest standing is BUILT AND UNREDDENED: a guard exists, and it was written after the code it guards, so nothing has shown it can fail.

### The check

[deliverable/tests/clear-jump.test.ts](deliverable/tests/clear-jump.test.ts) asserts the drawer's question answers one of the three words, and that the sweep claims `deciding` only when the state being left actually is.

NO RED WAS OBSERVED FOR IT. The build landed before the check could be written, which [observe-red's evidence](spec/iterations/i60-the-walk-gets-fast-and-it-is-measurable-/evidence/observe-red.md) records as a break in the test-first order rather than tidying away.

### What is NOT claimed

THAT THIS REMOVES THE SLOW TAIL. The direction of cause was never established — those pulls are slow AND fail to draw a route, and no count separates the two. What this removes is the MISREADING: a caller can no longer be told a hop failed when the truth is that nobody has answered yet.

## follow_up

THE CAUSE IS STILL NOT ESTABLISHED, and this chunk does not claim it.

Route-failing pulls are slow AND fail to draw a route. No count separates which causes which, and a second explanation — a shared loop under load — explains the same numbers.

WHAT WOULD SETTLE IT is running the pair with a judgment live and without, which is step 5 of the failed-route spec and is [not built yet](spec/trace/raid/raid-iss-the-loaded-half-of-the-failed-route-row-is-not-implemented.md). It needs an affordance the engine does not have: a way to make a call run long on purpose.

THAT SAME AFFORDANCE SERVES THE SURFACE ROW TOO, so it is one piece of work rather than two.

## anything_else

