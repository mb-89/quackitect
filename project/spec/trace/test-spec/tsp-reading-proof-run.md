---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: tsp-reading-proof-run
type: "[[test-spec]]"
statement: A fresh agent is handed the method one document at a time and cannot reach the work until it proves it read them - observed on a real session's reading loop.
method: "demonstration"
verifies:
  - "none — demonstrates: sty-the-agent-proves-it-read carries the edge; the mechanics are test-verified by tsp-reading-loop"
demonstrates:
  - "sty-the-agent-proves-it-read"
files:
  - "none — the procedure below is the definition; the observed session is the evidence"
---

## Scope

The reading loop as lived: documents served whole inside the pull, tail
probes answered, a wrong answer refused and re-served, a right one
credited. The mechanics are tested in the battery
([[tsp-reading-loop]]); THIS spec is the end-to-end observation on a
real walk.

## Approach

System level, over a genuine session - a compaction or a reload leaves
the reading re-owed, and the loop that follows is the demonstration.
The call log is the record.

## Procedure

- A fresh or compacted agent pulls toward a state owing reads. Observe:
  the pull answers read, the document rides whole, probes name words
  near the end.
- The agent answers a probe wrongly or too narrowly. Observe: nothing is
  credited; the same document returns.
- The agent answers correctly. Observe: the next document is served;
  the loop continues until no read remains.
- The reading completes. Observe: the state opens and the work is
  served - never before.
