---
kind: [[rationale]]
title: a scope cannot be left while its tokens are open
explains:
  - src/engine/token.go
  - src/engine/pull.go
  - src/engine/abort.go
---

## decided

A scope is a barrier. It cannot be left while any token in it is open, and closing them all opens what comes next. A token with sub-tokens is a scope by the same rule, so there is no second mechanism. Sub-tokens are assignable like any token.

## why

Work being walked away from silently is the failure this whole layer exists to prevent. A barrier is the smallest thing that stops it: nothing else has to watch, because leaving is what is refused.

A token with children was made a scope rather than a new kind of thing. The barrier one level down is the same barrier, so splitting work and delegating a piece of it became one act at the natural grain. Without that, delegation only worked at whole-task granularity, and an agent holding a large token had no way to break it up.

A depth cap was considered and not admitted. No agent had been seen over-producing sub-tokens, so the cap would have been a rule against nothing.

The agent is given every token in its scope rather than told to go looking. Prose rules do not change agent behaviour and refusals do. An instruction to read what is available would have been a rule that reads well and does nothing.

## costs

A barrier that cannot be left turns any stuck token into a stuck scope. One piece of work nobody can close holds everything above it. The escape is aborting, which is a decision rather than a mechanism. And sub-tokens are cheap to mint with nothing capping them, so a scope can be filled faster than it can be emptied.

## revisit when

- an agent is seen over-producing sub-tokens, which is what the depth cap waits for
- a stuck token holds a scope often enough that aborting becomes routine
- a scope is wanted that can be left and returned to
