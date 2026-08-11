---
id: sty-look-at-a-closed-record
type: "[[story]]"
statement: An engineer opens a finished record to see how something was decided, and reads it as it stood rather than as it would look today.
actor: stk-engineer-driving-agents
refines:
  - vp-the-ledger
priority: could
---

## Deck

Somebody asks how a decision was made three iterations ago. The record is closed. Nothing about it is on the current walk.
|||
A closed record stands in i1 already: the expedition exp-trunk-read-cost, closed with its findings ruled.

---

The engineer opens the archive. Every closed record stands in it, none of them live, none of them walkable.
|||
The archive suite tsp-archive is green in the battery; req-archive-releases-worktrees holds nothing live survives a close.

---

They pick the one they want. Its states are drawn as they finished — which passed, which were struck, where the walk actually went.
|||
The record's own machine and evidence stand under its folder as they finished; the mirror renders closed records read-only.

---

Opening a gate shows the form as it was filled and blessed. The rounds, the verdict, the hand that pressed it, the day.
|||
Standing example: evidence/gate-implementation.md - rounds, verdict, actor and sign-off time, hash-bound.

---

Nothing here can be edited and nothing pretends it could. The archive is read-only, and browsing it sits above every autonomy setting because only a person has a reason to be in it.
|||
req-archive-read-only and req-archive-opens-to-a-person-only - the engine refuses an agent at every autonomy setting.

---

The question was answered from the record itself, at the version that answered it, without disturbing anything running now.
|||
The past is also reachable at a committed ref: se_file_read, se_file_search and se_file_glob all take `ref`.
