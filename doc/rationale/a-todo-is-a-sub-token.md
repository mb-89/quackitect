---
kind: [[rationale]]
title: a todo is a sub-token
explains:
  - src/engine/gate.go
---

## decided

The harness's todo list is refused, the read and the write both.
The plan is minted instead, as tokens that are part of the one in hand.
An agent holding nothing is sent for work first.

## why

A todo list was a work token nobody else could see.
It lived inside the agent and it went when the agent went.
The queue on the person's screen never learned what the work was broken into.
The engine already had the shape for it.
A token that is part of another is handed out before its parent, and keeps that parent open until it closes.

Reading the list is how an agent finds the list it is about to write.
Refusing only the write moved the plan out of the record just as surely, and left the agent a way round.
So both halves are refused.

An agent with nothing in hand has no parent to name.
An id that is not there is worse than no id at all.

## costs

A plan is now a set of tokens, which costs a call each and puts small steps in front of everyone watching the queue.
An agent that wanted a scratch list has to mint or go without.
The queue grows with work that used to stay inside one agent.

## revisit when

- the queue drowns in sub-tokens nobody but their author ever reads
- the harness list becomes visible to the person watching, so refusing it buys nothing
