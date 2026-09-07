---
kind: [[rationale]]
title: a write names its token
explains:
  - src/engine/gate.go
---

## decided

A write names the token it belongs to, and the naming is the opening.
A read is never gated.
Every harness tool that can write is refused whatever the agent holds, and a shell command counts as one.

## why

The owner's clause was that anything which writes, or can write, says which token it is about.
Naming a token put it in work and put back whatever else that agent held.
So one agent held one token, and no more tokens stood open than there were agents working.
The person watching the panel saw the work without the agent remembering to announce it.

The harness's Write and Edit carry a path and some content and no field for a token.
The engine could only ask for the name in a separate call.
One verb armed one write and the write spent it.
Naming the work was a thing to remember, and a thing to remember is a thing to forget.
se apply takes the name on the write, so the two cannot come apart.

A shell was refused for the harder reason.
The engine cannot read a command and know whether it writes.
A redirection, sed -i, mv, rm and a script somebody wrote all reach the filesystem.
A list of safe programs goes stale the day anybody runs a new one.

Holding a token was the other answer and it leaked.
Every shell call went through for as long as the token was held, so one name bought a session of writes.
Nothing said which of those writes belonged to what.

Reads stayed open because an agent that cannot read cannot find out which token it needs.
A guard that refuses too much is one somebody turns off.

## costs

Every write costs a verb the agent has to know, and the harness's own editing tools are dead here.
An agent with nothing in hand cannot write at all, the scratchpad aside.
A shell command that only reads is refused beside the ones that write, because the engine does not read commands.
The refusal has to teach the door on every call, so it is long.

## revisit when

- the harness carries a token field on its write tools, so a write names its work without the engine's verb
- a write can be attributed after the fact as surely as the name on the call does it now
- refusing a read becomes cheaper than letting an agent find the token it needs
