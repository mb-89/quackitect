---
minted_in: i1
id: dsp-narration
type: "[[design-spec]]"
statement: the decision graph riding every changing call, carried by typed ops with a toll that keeps the story gapless
realizes:
  - "el-walk-engine"
files:
  - "project/deliverable/engine/decisions.ts"
  - "project/deliverable/engine/toll.ts"
  - "project/deliverable/engine/bin/render-decisions.ts"
---

## Responsibility

Narration is data: plan, fork, update, done, obsolete, revert and defer
land as nodes and resolutions in the decision graph. The toll enforces
the floor — a changing call without an update, past the person's
notch, refuses. Malformed briefs are corrected into plans where the
correction is mechanical.

## Rationale

The graph replaces prose status: a reader sees what was opened, what
closed and what stalled, without trusting anybody's summary.

## The toll

WORK IS TOOL CALLS, so an agent physically cannot keep working un-narrated.
The server timestamps the last update. When the window lapses the next call
carries one grace warning on its result, and the call after an ignored warning
is refused with the exact resend inline.

PAYMENT IS ANY DECISION-GRAPH OP riding the `update` field of any call. A
volunteered update is never stopped, and always resets the window.

THE TOLL IS ARMED ONLY AFTER BOOT. The reading room pays nothing.

## Two clocks, because a call is not a minute

A minute of a fast harness is fifteen calls. A minute of a slow one is two.

So the cadence runs both clocks and whichever falls due first is what is owed.
The reader gets the same rhythm whatever host the agent is on.

## The cadence is the reader's control

HOW OFTEN IS THEIRS, not the engine's. They watch from a different surface on
every host, so the cadence sits on the same bar as the autonomy dial and the
shutdown level.

Two numbers: an update every n minutes at least, or every n calls at least,
whichever falls due first. Zero stops that clock, and both zero owes nothing.

TURNED OFF, NOTHING IS EVER OWED and a volunteered update still lands.

## The reading loop pays nothing

THE READING LOOP IS MECHANICAL. The pull answers `read`, hands over one
document, and the only legal next move is to read it and pull back with the
proof. No judgment happens on that hop, so there is nothing honest to narrate.

WHAT IT COST BEFORE: crediting the reading was about fifteen calls in a row
against a budget of twenty, so the toll fell due inside the loop and could only
be paid with filler. The test helpers had grown a workaround — a dummy update
attached to every read call, with a comment explaining why.

THE CLOCK STILL RUNS. Only the call counter is spared, because that is what a
burst of forced hops inflates. An agent genuinely silent for the whole window
still owes, whatever it was reading.

IT CANNOT BE GAMED. A read proof is only accepted while the engine is holding a
document it chose to serve, so the agent cannot manufacture these hops. A pull
carrying evidence beside the proof pays like any other work.

## Why there is no ETA field

HAND-TYPED CLOCK TIMES MEASURED UNCALIBRATABLE — a median ratio of 0.01 between
what was promised and what was spent. Durations come from the engine's own
timestamps instead, where nobody can guess.

## The nudge grew teeth

IT STAYED ADVICE FOR A GOOD REASON: refusing work over its commentary is a
mistake this mechanism already made once. Advice lost anyway. In one
fifteen-hour window the nudge fired five times and was ignored five times, once
at nineteen updates with nothing closed.

SO IT TAKES THE TOLL'S OWN SHAPE, which is already trusted: one warning, then
the next offending call refuses. The counter clears on any resolve, so a walk
with a moving checklist never sees it.

WHAT KEEPS IT FROM BEING THE OLD MISTAKE: a resolving op is never refused. The
remedy is always reachable in one call, and the open node map rides the
refusal, so the id needed to obey it is already in hand.

## An update names the item it is about

AN UPDATE THAT MOVES NOTHING ON THE CHECKLIST IS NARRATION WEARING PROGRESS'S
CLOTHES. The shape that produced this rule was a board of thirteen yellow items
collecting a pile of checked leaves underneath.

SO WHEN A CHECKLIST STANDS, an update says which item it is about. With none
open there is nothing to attach to and a bare update is exactly right. It is
only affordable because the open node map rides home on every call, so naming
one costs a glance.

IT IS SCOPED TO THIS VISIT. Another state's open checklist is not this state's
business, and a walk that had moved on would be refused over items it can no
longer reach.

## The decision graph

The decision graph — the agent's thought process as a per-state tree
(owner design, first captured 2026-07-25 in v2's i9 notes; built here).
Every task started is a NODE. Every node started gets RESOLVED: done,
obsolete, or reverted — abandoning is legal, abandoning silently is not.
Depth of forking IS the measure of drift; the retro reads the file.

Ops arrive as the `update` field riding any lane call. The live graph is
in-memory (session-scoped, like the walk); every op also appends to
.se/decisions.jsonl — replayable, and the retro's raw material.

## The chain is corrected

THE CHAIN IS CORRECTED, NOT REFUSED (owner ruling 2026-08-02: correct
the mechanical, announce it, refuse only the ambiguous). This was the
lane's most-hit refusal — 174 of one window's 505 failures — and the
refusal already computed the split it then threw away. Narration that
chains is APPLIED as the plan it wanted to be; a chained item becomes
the items it listed. A RESOLUTION's brief still refuses: which part
resolved the node is not the engine's to guess.

## Updates landed since anything last closed

Updates landed since anything last CLOSED. The checklist is a progress
 view, so a run of narration over a checklist that never moves is the
 thing worth saying out loud (owner 2026-07-29). Prose said this
 already and prose lost, which is the case for a mechanical nudge.
 High enough that ordinary narration passes untouched.

## A node from an earlier sessions visit

A NODE FROM AN EARLIER SESSION'S VISIT. The live graph replays
only this session's trail, but the RECORD keeps every visit — and
the leave gate counts the record. A resolution must reach what the
gate counts, or a record whose walk spanned sessions can never
close (found live 2026-08-02, closing e31).

## The node an update attaches to

THE NODE AN UPDATE ATTACHES TO. A node that is CLOSED or unknown is
 not an AMBIGUOUS one (software.md: correct what is mechanical,
 announce it, refuse only the ambiguous). Narrating on the item just
 resolved is the commonest slip there is — the largest single refusal
 class in the 2026-08-02 to 08-05 window, 43 of 128 failures.

 So it lands on the closed item's still-open ancestor, or bare when
 nothing above it is open, and the result says which happened. Only
 `update` is corrected. A RESOLUTION naming a closed node still
 refuses, because re-resolving is a real disagreement.
