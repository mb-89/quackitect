---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: req-one-operation-reads-its-input-once
type: "[[requirement]]"
statement: When one operation needs the same corpus in more than one of its parts, the engine shall read and parse that corpus once and pass it down, for every operation that serves a call.
kind: quality
characteristic: performance-efficiency
verify_method: test
breaks_if_removed: The cost of an operation grows with how many times it asks for its input rather than with how much work it does, so making each ask faster never fixes it.
breaks_how_badly: corrosive
refines:
  - uc-drive-the-machine-at-the-pace-of-thought
source_refs:
  - uc-drive-the-machine-at-the-pace-of-thought ext 2a
  - "engine/session.ts recordDone: the GreenPass parameter and its comment"
  - "software.md: collect the input once, process, output (owner ruling 2026-08-09)"
priority: must
---

## Scenario

- Source: any driver at the lane, or any person at a surface.
- Stimulus: one operation that reads a corpus in more than one of its parts.
- Artifact: the serving engine.
- Environment: normal operation on the reference machine.
- Response: the corpus is read and parsed once, and the parsed value is passed
  to every part that needs it.
- Response measure: the number of parses per operation is one, whatever the
  number of parts.

## Why it is a requirement and not just good practice

IT IS THE DIFFERENCE BETWEEN TWO KINDS OF SLOW, and only one of them is fixed
by making things faster.

Entering one record asked for the same 328-node corpus SIXTY-SIX times, because
each hop asked what was green and each ask fetched its own inputs. Stamping the
corpus took one ask from 312.9 ms to 4.3 ms, which is a seventy-fold
improvement on the wrong number. The sixty-six remained.

SO THE ROW IS ABOUT SHAPE, NOT SPEED. A call can satisfy the one-second rule
today and break it the moment a machine grows a few states, because the cost is
multiplicative in something nobody is watching.

THE OWNER NAMED THIS AS A GENERAL PRINCIPLE and it sat in software.md as
guidance: input, processing, output. Guidance is not checkable. This row is
what a test can fail.
