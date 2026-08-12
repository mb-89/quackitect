---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: uc-trace-a-decision-to-its-origin
type: "[[use-case]]"
statement: Follow any piece of the spec back to the promise it serves and the hand that approved it.
actor: stk-engineer-driving-agents
trigger: somebody asks why a rule, a constraint or a feature exists
precondition: the artifact in question is a node in the trace
guarantee: the chain from the artifact to the proposition and to the approving hand is on screen, with no step reconstructed from memory
refines:
  - sty-answer-why-a-year-later
priority: should
---

## Main scenario

1. The person opens the trace and filters to the part of it they care about.
2. The layout redraws around the filter, leaving only what serves it.
3. They select a node and read its statement and its type.
4. They open the node's file, which names what it refines.
5. They follow that link upward, level by level, to the proposition.
6. They open the gate that blessed the level, and read the rounds as they were filled.

## Extensions

- 1a. The corpus is split across the trunk and an open record. The source is selectable, and the open record's own view never resolves against the trunk.
- 2a. A level holds nothing under the current filter. It is not drawn at all, rather than drawn empty.
- 3a. The node has no parent. It shows as an orphan, which is a defect the coverage check should already have refused.
- 4a. The link points at a file that does not exist. That is a defect in the node, and it fails the gate that reviews it.
- 6a. The chain reaches a story whose evidence side is filled. That reference is the run that actually proved it.
