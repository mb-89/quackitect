---
id: wk-bbf50fd85b
seq: 1000051
type: work
title: the projection reduces
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: cowork
---

## detail

The standing layer is a concatenation and it should be a reduction. AGENTS.md is 20073 bytes and every agent carries it on every turn.

WHERE THE BYTES ARE. Measured, not estimated.

  voice.md       7599 bytes, 5800 of them in four sections headed
                 'The rules this comes from'. Citations: Hunt and Thomas,
                 Larman, Page-Jones, Parnas, Holland, Procida, ISO 42010,
                 Strunk and White.
  behaviour.md  12351 bytes, 12040 of them in seven sections headed with a
                 class, each carrying the evidence and the token it was
                 found on. They run from 852 to 3393 bytes.

So roughly eighteen of the twenty kilobytes is the case for the rules. The rules themselves are two or three. The agent needs the rules. A person needs the case, when deciding whether a rule is right. Two documents have been written as one.

WHAT v3 DID, since it is worth knowing before copying it. v3 assembled its prompt layer from four sources and the result was 62176 bytes, so v3 was three times worse than this. The idea was in v3 and the result was not: promptlayer.ts strips authoring comments because they mean nothing to an agent reading the projection, and its source list warns that a file in the prompt layer must not also ride the wire, because putting one in both made boot longer. Take the two rules. Do not take the outcome.

WHAT TO DO.

Project the rule, drop the case. voice.md needs no editing at all: its four rationale sections are already separated by their own heading, so dropping sections headed 'The rules this comes from' takes it from 7599 to about 1800 bytes with nothing lost. behaviour.md needs one bounded pass over seven sections, each split into the rule and the case beneath it, so the projector can drop the second half.

Estimated standing layer afterwards: about three and a half kilobytes, from twenty.

The convention has to be readable by the projector and by a person editing the source. Whatever marks the case, mark it once and the same way in both files.

THEN THE SECOND RULE. What stands must not also ride the wire. Per-task material goes on the token, and the machinery is already there and already used: se work carries --guidance and --guidance-ref. The classes in behaviour.md are per-task by nature. Counting from the side that produces them applies when somebody is writing a check, not on every turn.

NOT A RATCHET. The owner ruled against a budget check for now. Do the reduction and see what it buys before deciding whether anything has to enforce a number.

Raised from outside the working session, from a measurement of the tree.

