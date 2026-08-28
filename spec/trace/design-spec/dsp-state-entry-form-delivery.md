---
minted_in: i61-everything-served-to-an-agent-gets-short
template: item-design-spec
artifact: node
type: "[[design-spec]]"
id: dsp-state-entry-form-delivery
statement: State-form resolution returns a signed zero-worker spawn source and delivers an incomplete entered-state form in the entering pull.
realizes:
  - el-walk-engine
files:
  - deliverable/engine/stateform.ts
  - deliverable/engine/session.ts
  - deliverable/tests/supply-gap.test.ts
  - deliverable/tests/pull.test.ts
---

# State-entry form delivery

## Responsibility

Resolve dynamic state-form sources from signed upstream evidence.

Return the next state's incomplete required form in the pull that reaches that state.

## Interface

The resolver receives the evidence directory and source name.

The pull response returns `fill` and the rendered required form when the entered state owes it.

## Behavior and constraints

A signed worker ceiling of zero resolves `$spawn_hands` to an empty list.

An empty dynamic source is a valid result.

The session checks the newly active state for an owed form before returning its response.

## Rationale

The signed kickoff is the authoritative worker limit. Delivering the form on entry avoids an unproductive round trip.
