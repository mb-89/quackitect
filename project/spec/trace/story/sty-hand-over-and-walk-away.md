---
minted_in: i1
id: sty-hand-over-and-walk-away
type: "[[story]]"
statement: An engineer with a few ideas hands them to the agent, raises the slider and leaves the room, and finds the walk stopped exactly where their hand was needed.
actor: stk-engineer-driving-agents
refines:
  - vp-autonomy-range
priority: must
---

## Deck

It is the end of the day. The engineer has four ideas in their head and no time to build any of them.
|||
Lived on 2026-08-11: the owner handed over the walk order and left for two hours - reports/rpt-hand-over-and-walk-away.md.

---

They type all four into the desk in one message, unpolished, in the order they came out.
|||
The dictated orders in the log arrived exactly so - loose voice transcripts, taken as said (req-desk-takes-plain-words).

---

The desk does not start building. It sorts them: two are notes, one is a day's iteration, one is a single fix that belongs in the expedition already open. It says which is which and why.
|||
The sorting rule is contract rule 8 with req-small-fix-joins-open-record; the same day's strays landed as notes while the walk work stayed in i1.

---

The engineer agrees, and the desk carries the paperwork — two notes captured, one record seeded with the goal and vision prefilled from their own words.
|||
se_note for the strays (the day's captures stand in .se/notes.jsonl), se_seed_iteration for the record.

---

They set the dial to its top rung and say "go". Then they close the laptop.
|||
Emergency mode arms deliberately (req-drumroll-arms-deliberately); the owner's standing order of 2026-08-11: "you are at emergency mode, full autonomy."

---

The agent walks. It writes the checklist before its first edit, ticks items as they land, and the drawing on the panel moves without anyone watching it.
|||
The narration law: plan before the first edit, done as items land - the day's decision graph in the record's decisions.jsonl.

---

At the kickoff gate it stops. The gate weighs more than any slider setting, because the change size is the person's decision and no dial can grant it.
|||
req-autonomy-gates-every-hop: a step marked above every setting completes from a person's own hand alone.

---

Next morning the panel shows one lit node, a filled evidence form under it, and a proposed change size with its reasoning. Everything before the gate is done. The engineer reads and presses a thumb.
|||
The owner returned to gate-implementation filled and blessed, and steered from what the panel showed - the log holds their return messages.

---

Four sentences at the end of a day became a night of work and one decision waiting in the morning. The walk never guessed, and it never stopped early.
|||
reports/rpt-hand-over-and-walk-away.md - two handovers in one day, both resumed from the repository alone.
