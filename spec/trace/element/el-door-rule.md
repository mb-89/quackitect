---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: el-door-rule
type: "[[element]]"
statement: One module that states a conversation's rule once and answers three questions about it - does this text reach the capability, which modules hold the door, and which modules are recorded as departures.
kind: new
realization: make
group: the-door-regime
implements:
  - fn-govern-a-conversation-under-a-stated-rule
  - fn-govern-a-conversation-under-a-stated-rule.state-a-rule-once
  - fn-govern-a-conversation-under-a-stated-rule.enumerate-what-a-rule-governs
satisfies:
  - req-a-preflight-check-asks-the-reader-where-it-looked
source_refs:
  - "[[cand-the-narrow-guard]]"
  - "[[raid-dec-one-rule-module-is-read-by-a-write-time-guard-and-a-sweep]]"
  - deliverable/engine/widgets.ts — the same shape, standing today for one rule
---

## What it does

It holds the rule for one conversation and nothing else. It performs no reach
of its own and it refuses nothing; it answers questions.

Three answers, and each caller takes only what its own reach allows.

- **Does this text reach the capability.** A predicate over ONE string. It reads
  no file and knows nothing about the tree.
- **Which modules hold the door.** The registry, read from where the door
  modules declare themselves.
- **Which modules are recorded as departures.** The list, read from one file.

## Why it holds no state

It is stateless between calls on purpose. Two callers with different reach
consult it, and a cached answer would let them disagree about a tree that moved
under one of them.

## What crosses its boundary

- To [[el-door-write-guard]] — the predicate and both lists, for one file.
- To [[el-door-sweep]] — the same three answers, for the whole tree.
- From [[el-departure-list]] — the recorded departures with their reasons.

## The realization concept

[deliverable/engine/widgets.ts](deliverable/engine/widgets.ts) is the worked
example and it is 186 lines with six exports. What generalises is the predicate
and the two readers; the shape carries over unchanged.

WHAT IS NEW is that the predicate takes a CONVERSATION rather than being fixed
to one. The neighbours walk found four conversations, so the rule is
parameterised by which one it governs rather than copied four times.

## What it deliberately does not do

IT NEVER SAYS HOW A REACH IS PERFORMED.
[[raid-dec-the-door-rule-governs-who-may-reach-and-never-what-the-reach-does]]
bounds this, and the bound is inherited from a decision the owner already took.
