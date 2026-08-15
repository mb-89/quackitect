---
minted_in: i1
id: opt-reading-credit-survives-the-engine
type: "[[option]]"
statement: key the reading credit to the document's own hash so it survives a restart, and re-owe only what actually changed
cluster: cluster-the-walk
found_by: heuristic
source: "heuristic — make the common case cheap; make the rare case possible"
---

## Mechanism

THE RULE BIT ON A MEASURED COST. Every engine reload re-owes the whole
reading. On 2026-08-09 that happened five times in one session, and the last
one served 1,225 lines across seven documents that had all been credited
minutes before and had not changed.

THE COMMON CASE is a restart with the documents unchanged. It is currently
the expensive one.

THE RARE CASE is a document that genuinely moved, where re-reading is the
whole point of the mechanism.

WHAT THE OPTION IS. The credit is stored against the document's content hash
rather than against the engine's life. A restart re-owes nothing whose hash
matches. An edited document re-owes itself, which is exactly what
`req-compaction-reowes-the-reading` demands and what makes the reading proof
worth having.

WHAT IT DOES NOT TOUCH. A compaction still re-owes everything, because what
the reader holds is gone from its head whatever the file says. The two cases
are different and only one of them is being made cheap.

THE RISK. Credit that outlives the process is credit somebody could forge by
editing the store. It belongs where the call log lives, under the same
append-only discipline, or it becomes the weakest claim in the system.
