---
minted_in: i51
id: if-test-runner-to-work-registry
type: "[[interface]]"
statement: A scoped run registers itself the moment it starts, and says where its own progress is written.
source: el-test-runner
destination: el-work-registry
carries:
  - flow-work-under-way
  - flow-test-timings
form: call to register, then a file the registry reads back
bound: inherited — an in-process registration has no clock of its own and is paid for by the lane call that started the run
source_refs:
  - decompose-structure, the element matrix's owed cell
  - opt-one-operation-object-serves-every-kind-of-long-work
---

REGISTRATION HAPPENS AT HANDOFF, not at completion. The run is already
detached when it registers, so the entry exists before anybody can ask about
it.

WHAT THE CALL CARRIES: the run's identity, its question, and the path its
progress is appended to.

WHAT THE REGISTRY READS BACK: the progress file, on demand and never on a
timer. Today that is `.se/test-progress.jsonl`, whose first line carries the
total the estimate divides into.

FAILURE BEHAVIOUR: a progress file that is missing or unreadable makes the
entry duration-less, never absent. The entry still lists, and its basis says
no measurement was found.
