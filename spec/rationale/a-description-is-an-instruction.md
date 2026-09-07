---
kind: [[rationale]]
title: a description is an instruction
explains:
  - src/mcp/lane.go
---

## decided

A tool description says what to do and stops.
Where a reader would ask why it is shaped that way, it names a rationale by link rather than answering in place.

## why

A description is in the prompt on every turn, used or not.
Explaining why costs the same tokens forever and changes nothing.
The arguments were written into the descriptions anyway.
So a paragraph about a mistake nobody was about to repeat was re-read by every agent, on every turn, for the life of the product.

Measured on the file this explains.
At 7f22e1a3 it declared 43 descriptions carrying 5249 bytes.
Cut to the instruction, 11 descriptions carry 883 bytes.
The number is a sum of the description literals in the file, taken over the working copy and over git show of that commit.

Deleting the arguments would have thrown away why the door is shaped as it is.
That is the thing a later reader most needs and least often has.
They became notes of this kind instead, and the code that carries the instruction names the one that argues for it.

## costs

A reader of a description no longer has the argument in front of them and follows a link to reach it.
A rationale can go stale while the instruction it explains stays right, and only the link is checked, not the agreement between them.

## revisit when

- a description has to carry a caveat that changes the call, rather than an argument about it
- the tool list stops riding in the prompt on every turn, so the arguments cost nothing measurable
