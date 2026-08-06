---
id: sty-vendor-overlays-without-forking
type: "[[story]]"
statement: When my organisation's method differs from the engine's, I want to overlay my own guidance rather than fork, so I keep every upstream improvement.
actor: stk-vehicle-owner
refines:
  - vp-vendoring
---

## Deck

Forking to change one method costs every upstream improvement from the day you fork. The alternative is living with somebody else's rules.
|||

---

A vehicle repository vendors the engine. The engine sits inside it, untouched; the organisation's own guidance sits beside it, never within.
|||

---

The builder writes their own method card in the vehicle's overlay and names the states it binds, exactly as the engine's own cards do.
|||

---

The walk resolves guidance through ONE chain: the vehicle first, the engine behind it. The step reads their card instead of the shipped one.
|||

---

The engine updates cleanly, because nothing they wrote sits inside it — and their method is theirs, because nothing the engine ships overwrites it.
|||
