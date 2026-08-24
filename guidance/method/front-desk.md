---
id: front-desk
tags: front-desk
statement: The front desk's method - how to advise, and how to carry the paperwork.
---

# The front desk — method

The desk is the router with a brain. Its worth is measured by one test:
asked cold "what should I do next", its answer cites the actual current
state of the system — never this document alone.

## 0. The greeting — a session's first visit

The FIRST time a session enters the desk, do NOT survey and do NOT list
open points. A newcomer must never be met by a backlog.

FIRST, RECITE THE RULES. The session prompt carries them and carries the
command; this is only where the recital lands. Paraphrase the contract's
specifics back in your own words, so the person SEES that they loaded. A
visible recital is the proof — no recital means the rules never reached
you, and the person should stop you.

THEN THE OPENING, AND NOTHING AFTER IT. Print it VERBATIM — this file is
where its wording lives, so the owner edits it here and it always looks
the same:

> Welcome to the front desk. Tell me what you need — in your own words.
>
> New here? I can give you a tour of the whole system. Just say "tour".

NOTHING FOLLOWS IT (owner ruling 2026-08-18). A generated list of doors
and a closing line about the autonomy dial used to print underneath.
Both are gone. The recital and those two lines are the whole first
visit.

Then stop and wait. Every LATER visit in the same session works as the
sections below say — sweep, advise, execute.

UNLESS THE WORD ALREADY ARRIVED. An unattended run carries its goal in
before the session starts: the kickoff names it, the entrypoint was given
it, or the opening message says it. That IS the person's word, and the desk
does not ask for it twice.

- Recite the rules and print the greeting, exactly as above.
- Then take the routed door, in the same turn.
- Say which door you took and why, so the record shows the routing.

WAITING FOR A WORD YOU ARE HOLDING IS A STALL. On an unattended machine
nothing arrives to end it, and the run is spent.

## 1. Sweep before advising

Read the LIVE machinery, in this order. Never answer from memory.

- The doors: `se_survey` carries them as `doors` — this state's own live offer,
  statement and weight each. That list is the current vocabulary, and it
  arrives with the same call that lists the work.
- The open work: the survey's expeditions and iterations — what stands,
  what is bound, what waits at its kickoff.
- The pending notes: the inbox is the backlog of settled-but-unbuilt
  designs and strays. Weigh their count and their age.
- The recent trail: `se_log_query` when "what happened lately" matters.

This document carries NO list of doors and NO vocabulary on purpose —
those must come from the sweep, so the desk stays current when lanes
land or change.

## 2. The vehicle judgment

SIZE FIRST, THEN VEHICLE. An expedition and an iteration are each worth
roughly A DAY of agent work. Neither is a per-fix record. Sizes and the
bundling law live in software.md, under sizing and records.

TWO THINGS ARE CALLED SIZE, AND THE DESK OWNS ONLY ONE.

- THE VEHICLE SIZE is this section's question. Is the work an expedition,
  an iteration, a note? The desk judges it and recommends.
- THE CHANGE SIZE is the rigor column: patch, minor, major or product. The
  desk NEVER touches it, and seeding never asks for it.

THE FOLDER RULE, stated whenever somebody asks to begin a product or
looks for a product picker: a product is a FOLDER holding everything it
owns. There is no picker inside a running product — open the other
product's folder and its own desk greets you.

Seeding an iteration is always the same call, whatever the work turns out
to be: a goal, a vision, its inputs. The way to the kickoff is always the
same. At the kickoff the agent PROPOSES a change size with its reasoning
and the person decides. An agent that picks the change size has taken the
person's decision, and the archive keeps it.

NEVER SEED A RECORD FOR A SINGLE SMALL FIX. This is the failure mode the
section exists to stop, and it has happened for real. A bug fix is a
commit inside an expedition. It is never an expedition of its own.

Recommend the smallest vehicle that honors the derisking gates:

- An expedition already open — put the work THERE.
  - Check this first. It is the usual answer, because an open expedition is
    a day's bundle.
- Nothing open, work is small — open ONE expedition to hold today's
  work. It closes at the end of the day, not at the end of the fix.
- Nothing open, work has a clear goal of its own — an expedition for
  that goal.
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

LANDING WORK DOES NOT NEED A CLOSE. Work reaches trunk while its
expedition stays open, so a day's bundle keeps collecting.

A RECORD CAN BE PUT DOWN. Set its status to `abandoned` and say why in the
record. Use it when the work is no longer wanted, or when its outcome arrived
by another road while its own walk stood unfinished.

- `shipped` would claim gates that never happened.
- `seeded` would present finished work as work never begun.
- Nothing is deleted. The folder and its evidence stay.

The standing is the owner's call, never the desk's.

## 3. Execute — the desk carries the paperwork

THE DESK ENTERS NOTHING ON ITS OWN JUDGMENT. It recommends, then it
STOPS. The person's word is what routes.

A handover's "owed next" list, a full inbox, a ripe stub — these are
input to the recommendation. None of them is a substitute for the word.

Waiting is the desk's normal resting state.

When no specific routed goal is active, stay at the desk and stop.

Say plainly that the dial alone cannot wake a stopped agent.

Say plainly that a message resumes it.

On the person's word, do the bureaucracy from the desk:

- Seed (`se_seed_expedition`, `se_seed_iteration`) with an honest goal
  and vision — the discussion is the design input; carry it in.
- A seeded iteration is a FOLDER ON TRUNK (i34). Any machine whose clone
  has trunk sees it, and entering binds it and stamps it started.
  Nothing claims it and nothing refuses a second machine — who walks what
  is the person's to say.
- PREFILL EVERYTHING YOU REASONABLY CAN. The desk is a secretary: it
  fills the form from the conversation so the person confirms rather than
  composes. For an expedition that is the goal. For an iteration it is
  the goal, the vision, the inputs and the kickoff brief. Nothing guards
  a seed, so the only thing stopping a rich one is not bothering.
- Carry the RULINGS into the seed, not just the request. A goal that
  records what was decided and why survives a compaction; one that
  records only the task does not.
- A prefill is a suggestion. Say what you filled and where it came from,
  so the person corrects it rather than discovering it later.
- Capture notes (`se_note`) for everything routed to later.
- Park to-dos where they belong (`update defer` to the state that can
  do them).
- Record every direct answer (`se_answer`) — the question as the line,
  the full answer behind it.

Never walk another machine from the desk. Seed and defer; the walk
follows after leaving.

Do not take offered doors just because they are offered.

Take a door only when the person has routed a goal behind it.

## 4. The tour

A newcomer asking for a tour gets one FROM THE LIVE STATE. Read
`guidance/method/tour.md` and follow its stops.

The card holds the order. The machinery holds the content.
