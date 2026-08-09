---
id: method-retro
statement: "The retro. Look back and drain the inbox, then walk the backlog and emit durable improvements."
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
   filter {since: "last_retro"} and take the timestamp of its OLDEST
   record. That is where the window opens, just after the previous
   retro's drain. Write it down; every later query uses THAT timestamp.

   The result pages NEWEST first, so the oldest record sits at the last
   offset. The first call's `total` says which offset that is.

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
3. Drain the notes inbox, walking EVERY pending note once. Disposition each
   with se_note_drain, routing it to exactly ONE home.

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
5. Drain the assistant's persistent memory (owner rule 2026-08-06,
   supersedes the 2026-07-27 rule). The agent may write memory freely
   between retros; the retro is where it drains. Read every memory entry:
   whatever holds project rules, project state, or working guidance moves
   INTO the repo (guidance, machines, prompts) and leaves the memory.
   Memory keeps only personal data and harness mechanics the repo cannot
   hold. The agent runs this sweep itself.
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

   THEN WALK THE se_run COMMANDS, AND KNOW WHAT THAT STEP IS FOR (owner
   ruling 2026-08-07). It is not a survey. THE POINT IS TO DRIVE THE se_run
   COUNT DOWN. Every shell command is a candidate sign of a MISSING lane
   verb, and the retro is where that verb gets named.

   COUNT IT AND COMPARE IT. `se_log_query {group_by: "tool"}` gives the
   whole distribution in one call. Write the se_run number down and put it
   beside the last retro's. A number that is not falling means this step
   ran and changed nothing.

   THE MEASUREMENT THAT SET THIS RULE: on 2026-08-07 se_run stood at 3249
   calls out of 28612 — the SECOND most-used tool in the system, ahead of
   se_file_search. A lane whose escape hatch is its second-busiest door is
   missing verbs, and nobody had counted.

   GROUP THE COMMANDS BY SHAPE, not by date. Four runs of one script is one
   missing verb, not four incidents. Name the verb, and if it is cheap
   enough, build it in the retro.

   The raw log is KEPT (owner ruling: forever-until-1GB; a garbage collector
   may harvest it later).

   THEN AUDIT THE TOOLS THEMSELVES (owner ruling 2026-08-07). The same
   grouping answers a second question the retro owes: which lane verbs are
   DEAD, and which are worth improving.

   - OBSOLETE. A verb whose count is near zero because something replaced
    it. Retire it — a superseded tool is not a rare tool, it is a wrong
    turn left lying around. Say what replaced it.
   - RARE BUT RIGHT. A verb with a low count because the job is rare.
    se_shoot is used when somebody needs to LOOK at the mirror, and that is
    seldom. Keep it, and do not confuse the two cases: the test is whether
    something else now does the job, never the count alone.
   - WORTH IMPROVING. A verb that IS used but keeps being followed by a
    correction, a second call to finish the job, or a refusal. The clause
    ranking above and the failure rates point straight at these.

   PRUNING FOR COUNT IS THE WRONG MOVE. Tool schemas load on demand here, so
   a long tail costs almost no context. What a dead verb costs is
   maintenance and one more wrong turn available. Retire what is dead; the
   leverage is in the missing verbs, not the surplus ones.

   THEN MINE THE TEST TIMINGS (owner ruling 2026-07-31). Every run
   records every test's duration to .se/test-timings.jsonl — file, name,
   ms, pass — and the LAST run stands summarized in .se/test-last-run.json,
   files ranked by summed cost. Read the summary first; the append log is
   for comparing across runs.

   A TEST FAR ABOVE ITS SIBLINGS OWES AN EXPLANATION. Sometimes there is a
   good one: it drives a real server, or it walks a whole machine end to
   end. Sometimes there is not, and then it is a lead like any other.

   The usual culprits, in the order they are worth trying:
   - A fresh template copied per case, where the cases never mutate it.
   - A real dependency where a stub would prove the same thing.
   - Sequential cases inside ONE file, which is the only unit that reaches
     a second core (software.md). A file dominating the wall clock gets
     SPLIT before anything clever is attempted inside it.
   COMPARE ACROSS RUNS, not within one. The record appends, so a test that
   has been getting slower for a fortnight is visible here and nowhere else.
8. Tally the previous retro's improvements, and promote the wins. Dismiss
   the duds WITH the reason recorded, so a dud is never re-proposed.
9. Check the contract. Walk the contract rule by rule against the
   period's recorded trail — the call log, the decision graph, the
   notes. A violation is a lead: propose how the rule gets teeth (a
   refusal, a lint, guidance) so it cannot recur. The check reads what
   the lane recorded — private thinking is not in the store.
10. Aim every improvement at a durable home: guidance, a machine, a
   condition note, a form template, an engine refusal. Emit only the few
   highest-leverage notes. Each one specific and checkable — a concrete
   change, never "improve X".

## The standing questions

Two questions run EVERY retro, whatever the period held.

### Did anything local earn promotion?

The work happens in an INSTANCE. The next project starts from a TEMPLATE. A
good change made in an instance and never promoted dies with that instance.

So walk what changed in the period, and ask of each change: does this belong
upstream?

- The iteration's own state machine, against the rigor matrix it compiled
  from. This is the common case. A state whose guidance, legal tools or
  evidence fields improved during the walk improved them for one walk only.
- The evidence forms, against their form templates.
- The item templates, against the nodes actually written from them.
- Anything else built from a template. The rule is the template, not the
  kind of artifact.

Promote it, or record why it stays local. Silence is the default answer, and
the default loses the improvement.

THE PROMOTION LIST GROWS. Vendored and imported code gets the same question
later: does a change that proved good here belong further up the dependency
chain? Not built yet, and it joins this list when it is.

### Has the process gone stale?

Has the way of working fallen behind current practice? Name what you
compared it against. That is the process dimension of the state-of-the-art
method (`machines/methods/meth-state-of-the-art.md`).

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
