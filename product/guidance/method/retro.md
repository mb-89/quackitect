---
id: method-retro
statement: The retro — look back, drain the inbox, walk the backlog, emit durable improvements.
---

# retro — the method

A retro is a FUNCTION, not a state: fire it at its trigger points, or
freely at idle. It is blameless. Fix the system — guidance, machines,
conditions, forms, the engine. Never a person.

The retro EMITS; it adopts almost nothing. A lead becomes a note. The
note drains into exactly one home. Planning consumes what survived.
(v1's retro/triage separation, ported.)

## When it fires

The trigger is a NOTE carrying "needs retro":

- An iteration finishes — the agent writes a "needs retro" note.
- The owner asks for one — the agent writes a "needs retro" note.
- While such a note pends, start_iteration's entry gate refuses; the
  retro's drain dispositions it and the gate opens.
- At idle, freely, with no trigger note at all. Allowed, never required.

## The steps

1. Field feedback — open with it. Ask the owner what came back from the
   field since the last look. Capture every answer as a note.
2. Drain the notes inbox. Walk EVERY pending note once. Disposition each
   with se_note_drain — route it to exactly ONE home:
   - done — shipped or handled; say where.
   - obsolete — overtaken, wrong, or durably rejected; say why, so it is
     never re-litigated.
   - carried — adopt NOW into a durable home (a guidance edit, a machine
     change, the next expedition's goal); name the home. Rare.
   - backlog — future scope. where is REQUIRED: "ready when …" names the
     re-entry condition.
   Nothing stays pending after a retro.
3. Walk the backlog (migration). Every parked note (disposition backlog
   in .se/notes.jsonl): keep it (condition still unmet), pull it
   (re-drain as carried, into this round's scope), or drop it (re-drain
   as obsolete, reason recorded). Re-draining IS the migration mechanism.
4. Sweep the assistant's persistent memory (owner rule 2026-07-27). Read
   every memory entry: whatever holds project rules, project state, or
   working guidance moves INTO the repo (guidance, machines, prompts) and
   leaves the memory. Memory keeps only personal data and harness
   mechanics the repo cannot hold.
5. Hunt wasted effort. Rework, reversals, avoidable refactors,
   reinventing instead of reusing. Each one is a lead.
6. Mine the record SINCE THE LAST RETRO — never the whole log.
   se_log_query with filter {since: "last_retro"} scopes every query to
   what happened after the newest drain call. Rank refusal clauses by
   frequency; top tools; failure rates. A command that keeps failing or
   a refusal that keeps firing is a lead — the fix may be a tool, a
   refusal, or better guidance. The raw log is KEPT (owner ruling:
   forever-until-1GB; a garbage collector may harvest it later).
7. Tally the previous retro's improvements. Promote the wins. Dismiss the
   duds WITH the reason recorded, so a dud is never re-proposed.
8. Aim every improvement at a durable home: guidance, a machine, a
   condition note, a form template, an engine refusal. Emit only the few
   highest-leverage notes. Each one specific and checkable — a concrete
   change, never "improve X".

## The mechanical half

- se_note_drain marks a note drained with its disposition; drained notes
  leave the inbox count and the pending feed. Draining is legal only in
  the retro's drain state — entering it is free from idle, so "drain
  whenever" is one tick away, inside the machine's discipline.
- backlog notes stay on file (.se/notes.jsonl, disposition backlog) —
  the migration step re-drains them when their "ready when" comes true.
- Expedition reports are ruled AT CLOSE (applied | dismissed), not here —
  the retro is out of the expedition loop (owner ruling 2026-07-27).
- se_log_query is the query lane. Never an ad-hoc script.
  since: "last_retro" scopes it to the current retro period.
