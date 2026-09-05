---
kind: [[rationale]]
title: a hook is taken only when level 0 owns the decision
explains:
  - src/engine/hook.go
  - .claude/settings.json
---

## decided

An event is taken only where this layer can act on something it owns. One that duplicates a decision another door already makes is refused. One that needs work vocabulary is refused, because that vocabulary belongs to the layer above.

## why

Most of the events on offer were refused, and nearly all of them for one of two reasons.

Some duplicated a door that already decides. A permission request was refused because the pre-tool door owns that decision. A file-change event was refused because the dedup guard hashes at check time and already knows. A post-compact event was refused because read-set invalidation was covered.

Some needed vocabulary this layer must not hold. Task events duplicated the obligation system the layer above owns. An idle-teammate event needed agent roles, which are also above. Content contracts were refused for the same reason.

The rest were refused on their own terms. A batch event could not name what breaks. Path scoping went because roots were made locations rather than a fence, so a newly reachable folder decides nothing. Blocking compaction and blocking a prompt were refused as powers this layer should not have.

What is left is the set of events that report something this layer both owns and can act on.

## costs

A refused event is refused in a decision nobody has to read, so it can be proposed again and nothing goes red. And an event that looks like a duplicate is refused with the rest. A genuinely useful one can be lost to the pattern rather than to its own argument.

## revisit when

- an event is proposed that this layer owns and cannot reach today
- the harness adds an event with no equivalent behind a door that already exists
- a refused event is proposed a second time, which says the reason was not findable
