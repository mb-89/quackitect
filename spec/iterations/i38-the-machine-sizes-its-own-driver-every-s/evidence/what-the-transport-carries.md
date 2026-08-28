---
form: what-the-transport-carries
by: agent
signed_off: 2026-08-20T18:07:16.046Z
authors: agent
files: null
---

# Evidence form / what-the-transport-carries

## current_situation

`exp-what-the-lane-can-learn-about-the-answering-model` — HOLDS.

### Why this was a spike and not a reading

THIS RECORD ASSERTED WHAT THE TRANSPORT CARRIES TWICE WITHOUT OPENING IT, and both assertions were wrong in the same direction — toward the lane knowing less than it does. One of them reached five artifacts and decided whether the winning design was a candidate at all.

### What is there

`engine/mcp.ts` DECLARES IT IN TWO TYPES. `TransportRequestMetadata` carries `protocolVersion`, `capabilities`, `clientInfo: { name, version }` and `sessionId`. `RequestContext` — what a tool handler receives — carries `requestId`, `protocolVersion`, `capabilities`, `workspaceId`, `sessionId` and `clientInfo`.

THERE IS NO MODEL FIELD IN EITHER. `clientInfo.name` is the harness, and its version is the client's version.

SO `req-every-call-records-the-model-that-answered-it`'s OWN DETAIL IS EXACTLY RIGHT — "the transport hands the engine a client name and no model, so today the value can only come from the caller" — verified rather than repeated.

### The one other place that knows anything, and why it does not help

`se-start.ts`'s `launch()` HOLDS THE AGENT COMMAND, taken from `--agent <cmd>`, and an operator may have typed a model flag into it.

IT FAILS ON TWO COUNTS AND EITHER IS FATAL. It is what was REQUESTED where the requirement demands what SERVED. And it is per session, fixed before the first pull, where the demand is per call.

### The verdict

THE SELF-REPORTED MARK IS PERMANENT on today's transport rather than a caveat awaiting an implementation.

WHAT WOULD LIFT IT is named in the requirement itself and confirmed here: the value arriving from whatever performed the spawn, which knows what it started and is not the party being measured. THAT PARTY DOES NOT EXIST — the sibling spike found the same absence blocking the payoff.

### What this does not settle

`raid-iss-a-call-cannot-be-attributed-to-the-state-it-was-made-in` IS NOT TOUCHED. This spike asked about the MODEL. The state coordinate is a separate field with a separate open issue, and `req-every-call-records-the-state-it-was-made-in`'s own Detail says the two ship together or not at all.

## built

- [[exp-what-the-lane-can-learn-about-the-answering-model]]

## follow_up

THE MARK STAYS ON EVERY RECORD and it is not a temporary caveat. `req-every-call-records-the-model-that-answered-it` asks the value be marked self-reported "wherever the lane cannot obtain the value independently", and this spike establishes that the lane cannot, anywhere, on today’s transport.

WHAT WOULD LIFT IT IS A PARTY RATHER THAN A FIELD. The requirement names the condition itself: the value arriving from whatever performed the spawn. The sibling spike found that no such party exists, and that the same absence blocks the payoff.

SO THE TWO ARE ONE PIECE OF WORK. Anything built to act on a published driver is also the thing that could report what it started. Neither is this iteration’s to build and both should be named together wherever the next one picks them up.

AND ONE ISSUE IS DELIBERATELY UNTOUCHED. `raid-iss-a-call-cannot-be-attributed-to-the-state-it-was-made-in` is about the state coordinate, not the model. It stays open and crippling, and `req-every-call-records-the-state-it-was-made-in`’s own Detail says the two coordinates ship together or neither does.

## anything_else

