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
