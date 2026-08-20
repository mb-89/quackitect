---
minted_in: i1
id: sty-take-the-tour
type: "[[story]]"
statement: A newcomer at the front desk says "tour" and is walked through the live system rather than shown a document about it.
actor: stk-newcomer
refines:
  - vp-rigor-without-toil
priority: could
---

## Deck

The newcomer has reached the front desk and has no idea what any of the words mean. The greeting offered a tour, so they type the word.
|||
The tour's entry per guidance/tour.md and tsp-tour-run's first procedure step: say "tour" at the desk.

---

Nothing opens a document. The tour is walked over the machinery that is actually running, which means a feature that shipped yesterday is on the tour today without anyone editing it in.
|||
req-tour-reads-what-stands: the stops derive from the live machinery, never a stored script.

---

First stop is the drawing itself. Nodes are states, the lit one is where the walk stands, and the slider above says how far an agent may go alone.
|||
The stop list in guidance/tour.md; the slider is the autonomy dial of guidance/authoring/machines.md.

---

The tour highlights a node and opens its form beside the drawing. This is the unit of work: a step with a method attached and evidence owed.
|||
req-tour-highlights-the-named-part, in tsp-tour-run's procedure.

---

Next stop is a gate. The tour shows one that is closed and names what it is waiting for, in words, rather than describing gates in general.
|||
req-tour-shows-live-instances: a live instance of the named kind, never a general description.

---

Then the record. The notes inbox with its count, the decision graph with its last checklist, and the trace showing what serves what.
|||
The record stops in guidance/tour.md; the surfaces are the panel's own (inbox count, decision graph, trace view).

---

It ends where it started. The newcomer is back at the desk, and the generated list under the greeting now reads as a list of things they could actually ask for.
|||
req-tour-ends-at-the-desk - the stop was added when a fresh-eyes check found it missing (trunk commit 1b239b66).

---

Nobody wrote a manual and nobody has to keep one current. The tour showed the system, and the system is the only thing that can be out of date with itself.
|||
The forced-absence half is tested, not demonstrated: tsp-tour-resilience, green in the 2026-08-11 battery.
