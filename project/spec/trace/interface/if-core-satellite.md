---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: if-core-satellite
type: "[[interface]]"
statement: The core routes a call to the satellite that owns its record and answers for trunk itself, and every answer that crosses names the store it came from.
source: el-core
destination: el-satellite
carries:
  - flow-instruction
  - flow-stamped-claim
  - flow-compiled-machine
  - flow-open-record
  - flow-position
  - flow-worktree
  - flow-resolved-target
  - flow-dispatched-call
  - flow-evidence-form
  - flow-call-log
form: local channel
source_refs:
  - decompose-structure, the element matrix's owed cell
  - cand-core-satellite
  - opt-a-core-and-a-satellite-per-agent
---

Between processes, which is what makes it an interface rather than a call.
This is the crossing every other line on the chart avoided by having only one
process, and it is the price core-and-satellite pays for everything else.

## What crosses it

- A call the core received and a satellite owns, going down.
- The answer coming back, carrying the store it resolved against.
- A shared read from a satellite to trunk, going up. Every one of these is a
  channel hop where a single-process line has a function call.
- Supervision: start, replace, reap.
- The heavy-slot lease. A token out before a heavy child is spawned, and the
  token back afterwards.
- The beat, and the deadline's verdict when a call goes unanswered.

## The naming clause rides the crossing

Deliberately. An answer that crossed a
process boundary is exactly the one a reader cannot check by eye, so it says
which store it came from.

## What it costs and what is unmeasured

Every core-owned read becomes a hop.
Nobody has priced the hop, and nobody has measured a satellite start with the
engine module load included. Both belong to M6 before this element is built.

## What it leans on

That machine-wide state can be served over a local channel
at all. The mirror is a server today, which is why it is the natural core.
Nothing says the note inbox and the claim ledger can live behind it, and no
probe has run.
