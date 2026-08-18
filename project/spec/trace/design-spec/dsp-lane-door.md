---
minted_in: i1
id: dsp-lane-door
type: "[[design-spec]]"
statement: the typed tool lane, carried by one registry of verbs with schemas, clauses and remedies
realizes:
  - "el-walk-engine"
files:
  - "project/deliverable/engine/tools.ts"
  - "project/deliverable/engine/mcp.ts"
  - "project/deliverable/engine/errors.ts"
  - "project/deliverable/engine/discipline.ts"
  - "project/deliverable/engine/promptlayer.ts"
  - "project/deliverable/engine/params.ts"
  - "project/deliverable/engine/bound.ts"
  - "project/deliverable/engine/bin/se-mcp.ts"
  - "project/deliverable/engine/bin/se-manual.ts"
---

## Responsibility

Every agent act enters through one door. The door validates arguments
against schemas, refuses with a typed clause and an executable remedy,
and logs the call. The lane rules steer shell use back into lane verbs.

## Interface

The MCP server surface: one tool per verb, schemas generated from the
registry. The prompt layer places the standing sources into the host.

## Rationale

One registry feeds the tool list, the refusals and the warnings, so
feed-forward and feedback cannot drift apart.

## Always legal, whatever the state

THE PULL IS THE MACHINERY — one verb, legal in every state. The agent says
pull and the machine says what to do.

`se_note` IS LEGAL EVERYWHERE TOO. A stray is captured where it strikes,
never chased. `se_note_drain` joins it by the same logic: an inbox you may
only add to is not an inbox.

`se_aim` JOINS THEM BECAUSE AIMING IS NOT WORK. The engine is born aimed at
the front desk and the mirror has long had a setter, so the capability existed
and simply was not reachable from the lane. An agent that cannot aim can only
take the next offered door, which means it wanders one hop at a time and no
route is ever drawn. That is not a walk; it is guessing with extra steps.

`se_reopen` AND `se_amend` JOIN THEM BECAUSE A CLAIM IS FIXED FROM OUTSIDE
IT. The state that carries a broken claim is not the state you are standing in
when you find it.

## Nothing is restricted today

A RESTRICTED TOOL IS ONE THAT `all` DOES NOT GRANT — a state must name it.
The set is empty.

`se_note_drain` USED TO BE RESTRICTED, so that only the desk and the retro
could take anything out of the inbox. That was struck: an obsolete note is
deleted where it is found and does not wait for a ceremony.

THE HALF THAT MATTERED WAS NEVER THERE ANYWAY. `carried` and `backlog`
decide what work MEANS and when it returns, and the inbox still refuses those
outside the retro. `done` and `obsolete` are checks anyone can run.

## A bad update never destroys its call

THE UPDATE RIDES FIRST — applied before any other verdict, so the narration
stands even when the call itself is then refused. It is logged as its own
record and pays the toll, and it is stripped before any handler sees it.

BUT NARRATION IS COMMENTARY, and commentary that vetoes the act it comments on
has the causality backwards. A brief with one separator too many used to reject
the whole call and take the payload with it — a four-thousand-word answer, a
four-file atomic patch, a finished note, all discarded over the punctuation of
a label riding alongside. Measured at a retro: this mechanism caused 18 of 25
sampled refusals.

THE WORK LANDS. The complaint rides back on the result. And the toll goes
UNPAID, so the rule keeps its teeth — it just bites the narration now instead
of the work.

## Method cannot be changed from inside a record

WHILE A RECORD IS BOUND, a method write once resolved into that record's own
tree, and the fan-out pushed it from there to trunk. So editing guidance or the
engine while bound published the RECORD's copy over the shared one. It happened
twice in one afternoon, and the first time it ate two lane verbs out of trunk's
tool list.

IT IS GUARDED AT DISPATCH, before the handler runs, so the whole call refuses
and nothing is half-written. A guard at the write sites would refuse partway
through a multi-file patch.

THE REFUSAL THAT USED TO STAND HERE IS RETIRED, and replaced by a RESOLUTION
rather than merely dropped. Shared method now resolves to the machine root
whatever tree is bound, so a method write cannot land in a tree that does not
own it and there is nothing left to refuse.

WHAT THE REFUSAL COST WHILE IT STOOD: escape to the desk, edit, aim back, and a
forty-four-hop replay that timed out twice on the way in. Six times in one
session, and twice more the day it was removed.

## A scoped run answers the caller that asked

MEASURED THE DAY BEFORE THIS LANDED: 494 test calls produced 66 verdicts. About
428 asked only whether a job had finished, and a fifty-second battery cost ten
calls to watch.

THE JOB MACHINERY STAYS UNDER IT. The verdict is still persisted and still
logged, so a lookup by job id keeps working and nothing that reads one has to
change. The caller simply stops having to.

THE BATTERY STILL HANDS OFF, and that is not an oversight. It is the engine's
to fire at verification, where nobody is waiting on the answer, and blocking a
caller for fifty seconds buys nothing.
