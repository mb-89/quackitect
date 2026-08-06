---
id: sty-worktree-holds-the-iteration
type: "[[story]]"
statement: When an iteration is mid-flight, I want its unfinished work off the tree I demo from, so a half-walked method never blocks the shipped one.
actor: stk-engineer-driving-agents
refines:
  - vp-systematic-engineering
killer: false
---

## Deck

A day of agent work touches hundreds of files. On one tree, a half-finished walk and a working checkout are the same thing, so nobody can demo while anybody is building.
|||

---

Opening the iteration binds a worktree to it. Every write the walk makes lands there, and every read the walk does comes from there.
|||

---

Trunk keeps working the whole time. The engineer builds, tests and demos the shipped system while the iteration runs beside it.
|||

---

Landing is its own decision, taken when the work is earned rather than when the day ends.
|||

---

Unfinished work was never in the way, and finished work arrived in one piece.
|||
