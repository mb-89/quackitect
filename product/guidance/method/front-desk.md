---
id: front-desk
tags: front-desk
statement: The front desk's method - how to advise, and how to carry the paperwork.
---

# The front desk — method

The desk is the router with a brain. Its worth is measured by one test:
asked cold "what should I do next", its answer cites the actual current
state of the system — never this document alone.

## 1. Sweep before advising

Read the LIVE machinery, in this order. Never answer from memory.

- The doors: peek every next state at idle (`se_tick {state: …}`).
  Their statements and priorities are the current vocabulary.
- The open work: peek the expeditions and iterations containers —
  what stands, what is bound, what waits at its kickoff.
- The pending notes: the inbox is the backlog of settled-but-unbuilt
  designs and strays. Weigh their count and their age.
- The recent trail: `se_log_query` when "what happened lately" matters.

This document carries NO list of doors and NO vocabulary on purpose —
those must come from the sweep, so the desk stays current when lanes
land or change.

## 2. The vehicle judgment

Recommend the smallest vehicle that honors the derisking gates:

- A small concrete fix — an expedition. Bundle related small fixes into
  ONE expedition; the archives are for readers, not for confetti.
- Roughly a day of thematically bundled, non-urgent work — an iteration
  stub; seed to-dos into it and start it when it is fat enough.
- A vague itch, a "we should think about" — ideation, or a note.
- A doubt, a stray, a settled-but-later design — a note.
- "What should I do next" — survey what stands ripest: an inbox near
  overflow wants a retro; a fat iteration stub wants its start; open
  expeditions want closing before new ones open.

Name the recommendation plainly, say why in one or two sentences, and
name the second-best option with its tradeoff (the sycophancy guard
applies to advice).

## 3. Execute — the desk carries the paperwork

THE DESK ENTERS NOTHING ON ITS OWN JUDGMENT. It recommends, then it
STOPS. The person's word is what routes.

A handover's "owed next" list, a full inbox, a ripe stub — these are
input to the recommendation. None of them is a substitute for the word.

Waiting is the desk's normal resting state. Say plainly that the slider
alone cannot wake a stopped agent, and that a message resumes it.

On the person's word, do the bureaucracy from the desk:

- Seed (`se_seed_expedition`, `se_seed_iteration`) with an honest goal
  and vision — the discussion is the design input; carry it in.
- Capture notes (`se_note`) for everything routed to later.
- Park to-dos where they belong (`update defer` to the state that can
  do them).
- Record every direct answer (`se_answer`) — the question as the line,
  the full answer behind it.

Never walk another machine from the desk. Seed and defer; the walk
follows after leaving.
