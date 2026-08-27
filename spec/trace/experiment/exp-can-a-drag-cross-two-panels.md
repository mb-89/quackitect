---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: exp-can-a-drag-cross-two-panels
type: "[[experiment]]"
statement: Does the drag this design needs cross a boundary at all, or does it live inside one surface?
probes:
  - raid-risk-a-drag-that-crosses-two-panels-may-not-be-buildable-here
timebox: one day
form: tracer
faked: none — the extension's own registration code was read rather than a stand-in
fallback: none needed — the question resolved before a prototype was worth building
verdict: falls
measured: "2026-08-26 — the extension registers tools, controls and details as three separate view providers and seForm and snapshot as their own panels, so the bucket editor's own drag crosses none of them; and basesclient.ts lines 301 to 336 already carry a complete HTML5 drag cycle inside a webview, payload and hover feedback included"
folds_to: raid-dec-the-machine-and-the-work-editor-share-one-webview — forced by this result, and predicted by raid-dec-one-editor-is-widened-rather-than-a-second-written at its own line 62
promote: "the state machine and the work editor must share one webview. The owner requires the drag between them, and the platform does not deliver a drop from one webview to another"
chunk: merge the two surfaces into one webview — an architecture change rather than build work
source_refs:
  - rank-unknowns, the seeded pick
  - deliverable/vscode/src/extension.ts
---

## The question, split in two

THE REGISTER ENTRY ASKS whether a row can be dragged out of the editor panel and
dropped on the state machine panel. That is one gesture.

THE DESIGN NEEDS A DIFFERENT ONE. The bucket editor has two panes SIDE BY SIDE,
and a row moves between them. Two panes of one editor are one document.

SO THE SPIKE'S FIRST RESULT IS THAT IT WAS TWO QUESTIONS. The one the design
needs and the one the entry names are not the same gesture.

## What the code shows

`deliverable/vscode/src/extension.ts` registers three view providers at line
2069 onward — `tools`, `controls`, `details` — and creates `seForm` and
`snapshot` as their own panels at lines 872, 977 and 1018.

EACH IS ITS OWN DOCUMENT. A gesture beginning in one and ending in another is
two pages sharing nothing but the extension host.

TWO PANES OF ONE EDITOR ARE NOT. They render together, so a row moving between
them is ordinary drag and drop on one page.

## What no goal asks for

THE TWELVE KICKOFF GOALS DO NOT NAME A CROSS-SURFACE DRAG. Goal eleven says a
position shows a count per slot and CLICKING one opens the editor.

SO THE SPIKE HELD AS ABLE TO REVERSE THE DESIGN IS ABOUT A GESTURE NOTHING IN
THIS RECORD REQUIRES. The blocker was mis-sized rather than mis-answered, and
that is this experiment's finding.

## THE PRECEDENT EXISTS AND IT SHIPS — found 2026-08-26 when the owner pressed

THE FIRST PASS OF THIS SPIKE ANSWERED A SCOPING QUESTION AND CALLED IT DONE. It
established which drag the design needs, and it did not establish that the drag
works. The owner asked the plain question and it was the right one.

IT WORKS, AND THE CODE IS ALREADY IN THE PANEL.
`deliverable/engine/basesclient.ts` lines 301 to 336 carry a complete HTML5 drag
cycle inside a webview: column headers reorder by drag.

THE REGISTER ENTRY NAMED THREE THINGS THAT MUST HOLD. All three are in that
code.

- A DRAG BEGUN IN ONE PLACE RECEIVED BY ANOTHER. `dragstart` on a header,
  `drop` on a different header, both bound at the document.
- A PAYLOAD CARRYING ENOUGH TO IDENTIFY THE THING. Line 306:
  `ev.dataTransfer.setData("text/plain", dragCol)`.
- THE RECEIVER CHANGING WHAT IT SHOWS MID-DRAG. Line 313:
  `th.classList.add("drag-over")`, removed again on `dragleave`.

AND THE RESULT REACHES THE ENGINE. Line 335 posts the new order back out of the
webview, so a drag already turns into a recorded change today.

## THIRD PASS: THE DRAG CROSSES TWO SURFACES AND THE PLATFORM REFUSES IT

OWNER, 2026-08-26: the drag goes from the work item editor to the STATE MACHINE.
It was always that, and it is written in the trace —
[[sty-steer-a-running-iteration-by-moving-work]] lines 28 to 38 show a row
dragged out of the table and dropped on a state.

THE VENDOR DOES NOT SUPPORT IT. microsoft/vscode issue 111092 is a standing
feature request asking for drag events on `WebviewViewProvider` and `Webview`.
It is a request because they do not exist. The `vscode.DataTransfer` API serves
TREE VIEW drag and drop, not webview to webview.

SO A DRAG STARTED IN ONE WEBVIEW DELIVERS NO DROP IN ANOTHER. Each is its own
isolated frame.

## What that forces, and the owner reached it first

THE TWO SURFACES SHARE ONE WEBVIEW. The state machine and the work editor render
together, the editor collapsible beside the machine, and the gesture becomes the
ordinary drag that already works because it never crosses a frame.

IT IS NOT FORBIDDEN. Nothing in the design says the machine and an editor must
be separate views; they are separate today because nothing asked them not to be.

AND IT WAS PREDICTED. [[raid-dec-one-editor-is-widened-rather-than-a-second-written]]
rejected extracting a shared widget for this round and said in the same breath
that it "is also what the cross-surface drag will force anyway, since a gesture
spanning two surfaces cannot live inside either". That sentence was written
before this spike ran and it turned out to be the answer.

THE ALTERNATIVE, NAMED AND NOT CHOSEN: stop making it a drag. Pick in one
surface, place in the other, with the host carrying the selection. Two acts
rather than one motion, and it loses the thing the story is about — the states
lighting up while the row is in the air.

## What is left once the surfaces are one

TWO DELTAS, AND NEITHER IS THE RISKY PART.

- THE MOVING THING IS A ROW RATHER THAN A COLUMN HEADER. Same events, a
  different selector.
- THE DROP TARGET IS A SECOND PANE RATHER THAN A SIBLING IN ONE TABLE. Both
  panes render in one document, and the handlers are already bound at the
  document rather than per element.

SO THE ANSWER TO "DOES IT WORK" IS YES, with a working precedent in shipping
code, and what remains is ordinary work rather than an open question.

## What is honestly not established

WHETHER TWO WEBVIEWS CAN EXCHANGE A DRAG AT ALL. The vendor's API documentation
was not read, so nothing here asserts they cannot. What is established is that
they are separate documents.

THAT GAP IS CHEAP TO CARRY because nothing this record ships depends on the
answer. A later record wanting the cross-surface gesture starts by reading the
documentation rather than by building.

## Why the timebox was not spent

A DAY WAS SET because a negative answer would reopen a signed comparison. The
question resolved in minutes once the two gestures were told apart, and the
remaining hours would have bought a prototype of something no goal asks for.
