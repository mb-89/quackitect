---
minted_in: i1
id: uc-learn-the-machinery
type: "[[use-case]]"
statement: Learn what the system is and what it can do, from the system itself.
actor: stk-newcomer
trigger: a newcomer needs to understand the machinery before they can ask for anything
precondition: the front desk is reachable
guarantee: the person can name the parts they will use and knows what to ask the desk for
refines:
  - sty-take-the-tour
priority: should
---

## Main scenario

1. The person asks the desk for a tour.
2. The desk reads the live machinery rather than a written script.
3. It walks the stops in order, highlighting each part on the surface as it names it.
4. At each stop it shows a real instance — this state, this gate, this record — never a general description.
5. The tour ends back at the desk, and the offered list now reads as things the person could ask for.

## Extensions

- 2a. A part of the machinery shipped since the last tour was written. It appears anyway, because the tour reads what stands rather than a list.
- 3a. The surface cannot highlight the part being named. The stop still runs, and the missing highlight is a defect against the tour, not against the part.
- 4a. Nothing of a given kind exists yet — no open record, no pending note. The stop says so plainly instead of inventing an example.
