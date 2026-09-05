---
kind: [[rationale]]
title: every call carries an identity
explains:
  - src/engine/hook.go
  - src/engine/evidence.go
---

## decided

Every call carries an identity, and the record says which. The harness supplies the name, and the agent never writes it. An identity the harness starts is registered. An unknown identity is recorded rather than refused.

## why

Every per-agent rule stood on telling two hands apart, and v3 had no way to do it. One dispatcher served every agent, so nothing could be attributed to anybody.

The name was taken from the harness rather than from the caller. An agent that writes its own identity field can claim another one. So the guarantee had to come from where the field comes from, and not from a check on this side.

Registering an identity the harness starts let the record say what kind of agent it was and when it first appeared. Without it, a name in the log meant nothing to a later reader.

An unknown identity was recorded rather than refused, because a harness that names its agents differently would otherwise make the tool unusable. The threat model here was a confused agent and not a hostile one.

## costs

The guarantee is only as strong as the harness. A harness that names nothing yields an unknown identity, which is still served, so the record can hold names that tell a reader little. Refusing an unknown identity would trade that for a tool that works on one harness and refuses everything on the next. That was judged the worse price.

## revisit when

- a harness lets an agent set its own identity field
- the threat model becomes a hostile agent rather than a confused one
- the register cannot tell two agents of one kind apart
- an unknown identity is found to cost more than a refusal would
