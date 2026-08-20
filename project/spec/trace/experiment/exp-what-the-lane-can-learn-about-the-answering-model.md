---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: exp-what-the-lane-can-learn-about-the-answering-model
type: "[[experiment]]"
statement: What can the lane learn about which model answered a call, without asking the party being measured?
probes:
  - raid-ar-the-actor-is-recorded-where-the-call-is-served
timebox: forty-five minutes
form: tracer
promote: none — the mark stays, and what would lift it is named rather than built
folds_to: req-every-call-records-the-model-that-answered-it keeps its self-reported mark, and the mark is permanent rather than temporary on today's transport
faked: nothing was called — the transport type and the two spawn paths were read at their source rather than exercised against a live client
fallback: if the transport carries nothing, the mark is written on every record and the requirement's own Detail already says so
verdict: holds
measured: 2026-08-20 — read through the lane at engine/mcp.ts and engine/bin/se-start.ts
source_refs:
  - rank-unknowns, the seeded pick
  - req-every-call-records-the-model-that-answered-it
  - raid-ar-the-actor-is-recorded-where-the-call-is-served
  - raid-iss-a-call-cannot-be-attributed-to-the-state-it-was-made-in
---

## Why this was a spike and not a reading

THIS RECORD ASSERTED WHAT THE TRANSPORT CARRIES TWICE WITHOUT OPENING IT, and
both assertions were wrong in the same direction — toward the lane knowing less
than it does. One of them reached five artifacts and decided whether the winning
design was a candidate at all.

## What the transport actually carries

`engine/mcp.ts` DECLARES IT IN TWO TYPES. `TransportRequestMetadata` carries
`protocolVersion`, `capabilities`, `clientInfo: { name, version }` and
`sessionId`. `RequestContext` — what a tool handler receives — carries
`requestId`, `protocolVersion`, `capabilities`, `workspaceId`, `sessionId` and
`clientInfo`.

THERE IS NO MODEL FIELD IN EITHER. `clientInfo.name` is the HARNESS — the client
program — and its version is the client's version.

SO THE REQUIREMENT'S OWN DETAIL IS EXACTLY RIGHT: "the transport hands the engine
a client name and no model, so today the value can only come from the caller."
Verified rather than repeated.

## The one other place that knows anything, and why it does not help

`se-start.ts`'s `launch()` HOLDS THE AGENT COMMAND. It is a command name from
`--agent <cmd>`, and an operator may have typed a model flag into it.

THAT VALUE FAILS THE REQUIREMENT ON TWO COUNTS AND EITHER IS FATAL.

- IT IS WHAT WAS REQUESTED, NOT WHAT SERVED. The requirement demands the value be
  "taken from what served the call rather than from what was requested", and a
  flag on a command line is the request in its purest form.
- IT IS PER SESSION AND NOT PER CALL. It is fixed before the first pull and says
  nothing about a model that changed under a running agent.

## The verdict, and what it settles about the mark

THE MARK IS PERMANENT ON TODAY'S TRANSPORT, not a temporary caveat awaiting an
implementation. Nothing the lane can reach answers "what served this call".

WHAT WOULD LIFT IT is named in the requirement itself and is confirmed here: the
value arriving from whatever performed the spawn, which knows what it started and
is not the party being measured.

THAT PARTY EXISTS, corrected 2026-08-20. This section said it did not, citing
`exp-can-anything-act-on-a-published-driver`, and that spike has since been
settled the other way: the party is the walking agent, which delegates a step to
a subagent on a stronger hand and therefore knows what it started.

SO THE TWO SPIKES MEET AT ONE PARTY RATHER THAN AT ONE ABSENCE. The hand that
acts on a published driver is the same hand that could report what it started —
and it is inside our walk, not outside it.

WHAT THE MARK STILL RESTS ON, and it is narrower than "nobody knows". The value
still arrives from the party being measured, because the walker both spawns and
reports. Taking the mark off needs the value to come from something the walker
does not control, and that is outside this iteration's box. But the reason is
now a trust boundary rather than a missing party.

## What this does not settle

`raid-iss-a-call-cannot-be-attributed-to-the-state-it-was-made-in` IS NOT
TOUCHED. This spike asked what the lane knows about the MODEL. The state
coordinate is a separate field with a separate issue, still open and still
crippling, and `req-every-call-records-the-state-it-was-made-in`'s own Detail
says the two ship together or not at all.
