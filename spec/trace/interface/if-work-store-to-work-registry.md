---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: if-work-store-to-work-registry
type: "[[interface]]"
statement: Work that settled is reported to the registry, so one call still answers for everything running out of sight.
source: el-work-store
destination: el-work-registry
carries:
  - flow-settled-work
form: one call on settling, carrying the outcome
bound: inherited — in-process
source_refs:
  - decompose-structure, the element matrix's owed cell
  - req-one-call-reports-every-piece-of-work-out-of-sight
---

THE REGISTRY ANSWERS FOR EVERY PIECE OF LONG WORK IN ONE CALL. A piece of work
settling is one of those answers.

WHAT IT CARRIES. The identity, the terminal status, and when it closed.

WHY THE REGISTRY RATHER THAN THE ACCOUNT. The account keeps what happened. The
registry answers what is still going. A settle is the moment one stops going,
so it belongs here.

FAILURE BEHAVIOUR: settling is idempotent and the first outcome stands. A
repeated report changes nothing and is not an error.
