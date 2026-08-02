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

1. MARK THE BOUNDARY, before anything else. Run se_log_query with
   filter {since: "last_retro"} and keep the newest timestamp it
   returns. Write it down; every later query uses THAT timestamp.

   Why first: "last_retro" means the newest drain call, and step 3
   drains. Once you have drained, the phrase points at your own retro
   and the window is empty. The boundary must be taken while it still
   names the PREVIOUS retro.

   THE DESK'S OWN DRAINS NO LONGER POISON IT. Since e22 the front desk
   drains too, and a desk drain from an hour ago used to hand the retro
   a window far too short.

   The engine settles this now: "last_retro" means the newest CARRIED or
   BACKLOG drain, and those are judgment dispositions the desk is
   refused, so only a retro can set the mark (engine/calllog.ts). Any
   drain is still the fallback for logs written before the fix.

   Take the timestamp and use it. Checking it by hand is no longer work
   this step owes.
2. Field feedback. Ask the owner what came back from the
   field since the last look. Capture every answer as a note.
3. Drain the notes inbox. Walk EVERY pending note once. Disposition each
   with se_note_drain — route it to exactly ONE home.

   CHECK BEFORE YOU JUDGE, and check CHEAPLY. Most of what pends is often
   ALREADY BUILT — on 2026-07-31 the twelve smallest notes were sampled
   and most had shipped, some days earlier.

   A note describing a gap is a claim about the code, and the code
   answers in seconds: call the tool, grep the fix, read the state.
   Record the check beside the disposition, so the next retro re-runs it
   instead of re-reading the note.

   THE INBOX IS NOT A BACKLOG. Left undrained it becomes history, and the
   desk and the retro both weigh it as if it were work.

   The homes:
   - done — shipped or handled; say where.
   - obsolete — overtaken, wrong, or durably rejected; say why, so it is
     never re-litigated.
   - carried — adopt NOW into a durable home (a guidance edit, a machine
     change, the next expedition's goal); name the home. Rare.
   - backlog — future scope. where is REQUIRED: "ready when …" names the
     re-entry condition.
   Nothing stays pending after a retro.
4. Walk the backlog (migration). Every parked note (disposition backlog
   in .se/notes.jsonl): keep it (condition still unmet), pull it
   (re-drain as carried, into this round's scope), or drop it (re-drain
   as obsolete, reason recorded). Re-draining IS the migration mechanism.
5. Sweep the assistant's persistent memory (owner rule 2026-07-27). Read
   every memory entry: whatever holds project rules, project state, or
   working guidance moves INTO the repo (guidance, machines, prompts) and
   leaves the memory. Memory keeps only personal data and harness
   mechanics the repo cannot hold.
6. Hunt wasted effort. Rework, reversals, avoidable refactors,
   reinventing instead of reusing. Each one is a lead.
7. Mine the record, using the timestamp step 1 stored — never the whole
   log, and never "last_retro" again by this point.

   Rank four things:
   - refusal clauses by frequency
   - top tools
   - failure rates
   - slow calls

   A command that keeps failing or a refusal that keeps firing is a lead.
   The fix may be a tool, a refusal, or better guidance.

   Walk the period's se_run commands too (v1 law): every shell command is
   a candidate sign of a MISSING piece — a determinizer tool, a guidance
   page, a prompt. Repeated or process-relevant commands especially. The
   raw log is KEPT (owner ruling: forever-until-1GB; a garbage collector
   may harvest it later).

   THEN MINE THE TEST TIMINGS (owner ruling 2026-07-31). Every run
   records every test's duration to .se/test-timings.jsonl — file, name,
   ms, pass. Rank them, and rank the files by their summed cost.
   A TEST FAR ABOVE ITS SIBLINGS OWES AN EXPLANATION. Sometimes there is a
   good one: it drives a real server, or it walks a whole machine end to
   end. Sometimes there is not, and then it is a lead like any other. The
   usual culprits, in the order they are worth trying:
   - A fresh template copied per case, where the cases never mutate it.
   - A real dependency where a stub would prove the same thing.
   - Sequential cases inside ONE file, which is the only unit that reaches
     a second core (software.md). A file dominating the wall clock gets
     SPLIT before anything clever is attempted inside it.
   COMPARE ACROSS RUNS, not within one. The record appends, so a test that
   has been getting slower for a fortnight is visible here and nowhere else.
8. Tally the previous retro's improvements. Promote the wins. Dismiss the
   duds WITH the reason recorded, so a dud is never re-proposed.
9. Check the contract. Walk the contract rule by rule against the
   period's recorded trail — the call log, the decision graph, the
   notes. A violation is a lead: propose how the rule gets teeth (a
   refusal, a lint, guidance) so it cannot recur. The check reads what
   the lane recorded — private thinking is not in the store.
10. Aim every improvement at a durable home: guidance, a machine, a
   condition note, a form template, an engine refusal. Emit only the few
   highest-leverage notes. Each one specific and checkable — a concrete
   change, never "improve X".

Standing question, every retro: has the process itself gone stale against
the state of the art? That is the process dimension of the
state-of-the-art method (product/deliverable/machines/methods/meth-state-of-the-art.md).

## The mechanical half

- se_note_drain marks a note drained with its disposition; drained notes
  leave the inbox count and the pending feed. Draining is legal only in
  the retro's drain state — entering it is free from idle, so "drain
  whenever" is one pull away, inside the machine's discipline.
- backlog notes stay on file (.se/notes.jsonl, disposition backlog) —
  the migration step re-drains them when their "ready when" comes true.
- Expedition reports are ruled AT CLOSE (applied | dismissed), not here —
  the retro is out of the expedition loop (owner ruling 2026-07-27).
- se_log_query is the query lane. Never an ad-hoc script.
  since: "last_retro" scopes it to the current retro period.
