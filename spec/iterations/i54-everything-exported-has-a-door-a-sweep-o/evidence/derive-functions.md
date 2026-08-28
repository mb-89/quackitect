---
form: derive-functions
judgment: passed at 2026-08-26T15:30:28.500Z with deliverable/engine/bin/flow-closure.ts@5a1c579000d0
by: agent
signed_off: 2026-08-26T11:44:15.426Z
authors: agent
files: null
---

# Evidence form / derive-functions

## current_situation

Six requirements stand from write-requirements. They demand a rule regime over the things the system exports: one expression per rule, an enumerated governed set drawn from the source, departures that carry a reason, a not-exempt default, and no master off switch.

Nothing is designed yet. This state turns those demands into what the system DOES about them, with no technology named.

The carving finding from M1 shapes the tree. Cockburn's hexagonal architecture paper says a port identifies a purposeful conversation, and the falsifier run over 64 disk sites found 30 of them sharing one claim-writer shape rather than one disk shape. Both say the same thing: carve by purpose. The root function therefore governs A CONVERSATION, not a technology.

## functions

- spec/trace/function/fn-govern-a-conversation-under-a-stated-rule.md
- spec/trace/function/fn-govern-a-conversation-under-a-stated-rule.state-a-rule-once.md
- spec/trace/function/fn-govern-a-conversation-under-a-stated-rule.enumerate-what-a-rule-governs.md
- spec/trace/function/fn-govern-a-conversation-under-a-stated-rule.record-a-departure-with-its-reason.md
- spec/trace/function/fn-govern-a-conversation-under-a-stated-rule.refuse-a-departure-that-states-no-reason.md
- spec/trace/function/fn-govern-a-conversation-under-a-stated-rule.judge-each-governed-thing.md

## flows

- spec/trace/flow/flow-a-rule-as-authored.md
- spec/trace/flow/flow-the-stated-rule.md
- spec/trace/flow/flow-the-governed-set.md
- spec/trace/flow/flow-a-departure-as-offered.md
- spec/trace/flow/flow-the-recorded-departure.md
- spec/trace/flow/flow-the-refusal-of-a-departure.md
- spec/trace/flow/flow-the-verdict-on-a-governed-thing.md

## neutrality

Two functions failed the question on the first pass, and both were rewritten.

The first was the root. It read "put one door in front of every disk call". That names a solution twice over — a door, and the disk. Only one design could do it. It now reads "govern one conversation the system holds with a neighbour under one stated rule", which a registry, a compile-time check, a lint pass or a runtime facade could each honestly do.

The second was the enumerating function. It read "parse the module's export list". Parsing is one design among several — a build step could emit the list, and a language server could answer it. It now reads "enumerate every thing one rule governs from the source that defines them", which keeps the demand that the list come from the source without naming how it is obtained.

The other four passed unchanged. Stating, recording, refusing and judging each admit at least two honest designs, and none of them names a file, a format or a language.

## follow_up

Three pieces of work fall out of this state.

The first is the primary and secondary split over the seven neighbours drawn at map-stakeholders. Cockburn puts primary ports on the left of the hexagon and secondary on the right, and the split decides which side of the door each neighbour sits on. It is owed before any door is carved, and it is the first thing M4 needs.

The second is the containment predicate, which needs no door at all. The same predicate is written five times outside paths.ts, and two of the copies guard recursive deletes and disagree with each other. It is the cheapest correct change in the record and it comes first in the build order.

The third is the judgment pass over the 52 network sites, which gate-inputs made a condition on the next gate.

## anything_else

The tree is three requirements wide and one level deep on purpose. The function template says depth is not a virtue, and that a tree deeper than three levels is usually a partition that arrived early. M4 partitions on the flows, and there are seven of them across six functions, which is enough of a matrix to cluster.

One asymmetry is deliberate and worth naming. Recording a departure and refusing an unreasoned one are two functions, not one, even though they answer one requirement. They are split because the refusal is a boundary flow that leaves the system, and the record is an internal flow the judging consumes. Folding them would hide a crossing.
