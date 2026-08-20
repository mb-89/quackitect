---
id: method-retro
statement: The retro. Look back and drain the inbox, then walk the backlog and emit durable improvements.
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
   refused, so only a retro can set the mark (project/deliverable/engine/calllog.ts).

   WITH NO SUCH DRAIN IN THE LIVE LOG, the window opens at the log file's
   FIRST record. Never at another drain (fixed 2026-08-18 on the owner's
   instruction). A `done` or `obsolete` drain is a check any walk makes, so
   falling back to the newest drain of any kind put the mark wherever the
   last walk happened to tidy up.

   WHAT THAT COST, MEASURED at i16's onboard-retro the morning it was fixed:
   68 records returned where 2804 stood, hiding every call of the session
   the retro existed to mine. It failed SILENTLY, so the retro read as
   finished over an almost empty window.

   THE SHAPE THAT CAUSED IT is worth knowing, because it will recur: the
   live log held one `carried` drain and it had been REFUSED under SE-C-110
   for draining outside a retro. A refused record is skipped, so no judged
   mark existed at all.

   Take the timestamp and use it. Checking it by hand is no longer work
   this step owes.
2. Field feedback. Ask the owner what came back from the
   field since the last look. Capture every answer as a note.

   THIS IS A SANCTIONED STOP, AND THE ONLY ONE THE RETRO HAS (owner ruling
   2026-08-14). Ask the question, then STOP and wait for the answer.

   WHY IT NEEDED SAYING. The step was walked past in several retros running.
   The owner: "in the last few retros, you never asked me for field feedback.
   So you don't stop. You just continue with your stuff."

   It is easy to walk past because there is always more retro to do. That is
   exactly why it is named: no amount of draining, mining or sweeping is a
   substitute for the one report that comes from OUTSIDE the machine.

   WHAT DOES NOT WAIT. The drain, the log mining, the debt sweep and the
   memory drain need no answer. Do them, and stop on the question.
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
   - backlog — future scope, and it MINTS A WORK TOKEN onto trunk.
     - `where` is required: the "ready when …" re-entry condition.
     - `statement` is required: what the token IS, for a reader who never
       saw the note.

     THE STATEMENT IS AUTHORED, NEVER PASTED. A raw note is a dump and may
     carry anything private.

     - A statement carrying the note's own words refuses SE-C-140.
     - Cannot state it cleanly yet? Say so, and the pool carries it as an
       open question.
     - What is refused is silence and paste, never honesty.

     THE RAW NOTE STAYS LOCAL, unmoved and marked drained. The token is a
     new node.

     - The two are different objects with different lifetimes.
     - The token is the truth from the mint onward.
   Nothing stays pending after a retro.
4. Walk the backlog (migration). Every standing WORK TOKEN in the pool
   (project/spec/trace/work-token/, on trunk, readable from any clone):
   keep it (condition still unmet), pull it
   (re-drain as carried, into this round's scope), or drop it (re-drain
   as obsolete, reason recorded). Re-draining IS the migration mechanism.
5. Sweep the register for DEBTS (owner ruling 2026-08-12). List every
   raid entry of kind `debt`. Each one is repaid now, rescheduled with
   its trigger re-affirmed, or consciously re-accepted - and the look is
   recorded on the entry, dated. A debt nobody re-reads is a lie in the
   ledger.
6. Drain the assistant's persistent memory (owner rule 2026-08-06,
   supersedes the 2026-07-27 rule). The agent may write memory freely
   between retros; the retro is where it drains. Read every memory entry:
   whatever holds project rules, project state, or working guidance moves
   INTO the repo (guidance, machines, prompts) and leaves the memory.
   Memory keeps only personal data and harness mechanics the repo cannot
   hold. The agent runs this sweep itself.

   THE LANE REACHES THE MEMORY FILES ALREADY, corrected 2026-08-18.

   An earlier measurement said it could not. The memory lives outside the
   project root, and a bare path to it refuses under SE-C-102.

   That is true of a bare path and not of the lane. `.se/roots.json` already
   declares `sessions` as the harness's projects folder, and the memory sits
   under it. So `@sessions/<project-slug>/memory/` reads.

   MEASURED at i16's onboard-retro. That path answered `exists: false` for
   MEMORY.md rather than refusing — a real answer about a real folder.

   SO CHECK THE DECLARED ROOTS BEFORE CONCLUDING ANYTHING. Three ways through
   are honest and a fourth is not.

   - READ THE FOLDER THROUGH THE DECLARED ROOT. This is the first move, not
     the fallback. Read `.se/roots.json`, find the root that covers the
     harness's memory path, and glob or read under it.
   - DRAIN WHAT THE HARNESS SURFACED. Memories handed to the agent in context
     are readable and drainable too.
   - DECLARE A ROOT for a folder no existing one covers. `.se/roots.json`
     makes a folder available as `@name`, read-only by default. Ask the
     owner before declaring one; the refusal's own remedy says so.
   - WHAT IS NOT ALLOWED is ticking this step because nothing was surfaced.
     Say what you could reach and what you could not.

   NAME THE FOLDER AND COUNT THE FILES (added 2026-08-19, after this step was
   ticked against the wrong one). "Nothing to drain" and "I looked in the wrong
   place" produce the same clean-looking result, and only the count tells them
   apart.

   WHAT HAPPENED. The i16 retro reported the memory folder empty. It read the
   slug for the CURRENT project path, which holds nothing. Eight memory files
   sat under the older slug, and the drain was recorded as satisfied.

   SO GLOB WIDER THAN ONE SLUG. `@sessions/**/memory/*.md` finds every project's
   memory folder, and a project renamed or moved leaves its memories behind
   under the old name. Write the paths you found into the evidence.
7. Hunt wasted effort. Rework, reversals, avoidable refactors,
   reinventing instead of reusing. Each one is a lead.
8. Mine the record, using the timestamp step 1 stored — never the whole
   log, and never "last_retro" again by this point.

   Rank five things:
   - refusal clauses by frequency
   - top tools
   - failure rates
   - slow calls
   - the AGENT VOIDS: gaps between consecutive calls that no tool
     accounts for, ranked beside the slow calls (a void is the agent's
     own turn cost, and the log is the only place it shows)

   A command that keeps failing or a refusal that keeps firing is a lead.
   The fix may be a tool, a refusal, or better guidance.

   READ THE DEMAND LOG FIRST. `se_help {demands: true}` hands back every
   se_help query that matched nothing, GROUPED BY SHAPE and ranked by
   count, most demanded first, with up to three of the actual queries
   beside each shape. An agent asked the lane for a capability in plain
   words and the lane had none: that is a missing verb naming itself,
   already counted, in the wording to build against. This is i8's half of
   this step, and it costs one call.

   IT DOES NOT REPLACE THE se_run WALK, and reading it as a replacement
   loses the larger half. The demand log only sees what an agent thought
   to ASK for. A shell command reached for without ever asking leaves no
   miss behind, and most of them are that. So: demands first, because it
   is ranked and free, then the walk below for everything nobody asked
   about.

   THEN WALK THE se_run COMMANDS, AND KNOW WHAT THAT STEP IS FOR (owner
   ruling 2026-08-07). It is not a survey. THE POINT IS TO DRIVE THE se_run
   COUNT DOWN. Every shell command is a candidate sign of a MISSING lane
   verb, and the retro is where that verb gets named.

   COUNT IT. `se_log_query {group_by: "tool"}` gives the whole
   distribution in one call.

   DO NOT COMPARE IT TO AN OLD RETRO'S NUMBER (owner ruling 2026-08-16:
   "stop comparing se_run against an old retro... this is not useful. We're
   beyond that"). A ratio against a stale baseline says nothing about
   whether THIS window's shell calls were avoidable, which is the only
   question this step asks.

   ASK INSTEAD: what did the shell do this window that a lane verb could
   have done? Name the verb.

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
9. WALK THE MILESTONES, one iteration at a time (owner ruling 2026-08-15).
   Every iteration that closed in this window gets its milestone steps
   walked in order, and the walk lands as a TABLE the owner reads.

   THE OWNER'S WORDS: "walk over all milestone steps of all iterations
   that we did and give me tabulated information about all the milestone
   steps. What went well from M1 to M2, from M2 to M3, and so on. Where
   do you see improvements? Where can you mechanize?"

   ONE ROW PER STEP, in walk order, with four columns.

   | step | what went well | what cost | mechanizable |

   - WHAT WENT WELL is what the step actually produced, not that it was
     completed. A signed form is not an achievement.
   - WHAT COST is the round trips, the refusals, the rework, the
     re-reading. The log has the numbers and this column takes them.

     PER-STEP COST IS COMPUTABLE SINCE i38, and it was not before. The call
     log now carries `state` as a field of its own, so
     `se_log_query {group_by: "state"}` answers directly. It also carries
     `answered_by` — the model that served the call — and `part`, which
     hand made it, so the same window splits three ways.

     A GROUPING THAT REACHED NOTHING SAYS SO. The answer carries
     `group_by_reached_nothing` when no record in the window holds the key,
     which is a different answer from one bucket everybody shares. Before i38
     the two looked identical, and this card's own claim was read off a
     grouping that could not have returned anything else.

     TWO OF THE THREE ARE CLAIMS AND THE RECORD SAYS WHICH. `claimed` lists
     `answered_by` and `part`: the state is what the server observed, and
     the other two are what the caller said. A cost table built on them is
     reading a self-report.

     RECORDS FROM BEFORE i38 CARRY NONE OF IT, so a window spanning the change
     answers for part of itself. SAY PLAINLY where a number is a whole-window
     figure rather than that step's own, and never divide a total by the step
     count and present the result as measurement.
   - MECHANIZABLE names the check, the refusal or the prefill that would
     have removed the cost. Empty is a legal answer and a common one.

   THE FILTER THAT MAKES IT WORTH READING: a row's improvement is
   dropped if it is ALREADY PLANNED somewhere. Check the register, the
   backlog and version-planning before writing it. A list that repeats
   what is already scheduled teaches the reader to skim it.

   WHY A TABLE AND NOT PROSE. The steps are comparable to each other and
   that is the whole value. Which step cost the most is a question prose
   cannot answer at a glance.

   WHY IT IS A STEP AND NOT A REQUEST. The owner asked for this list and
   then had to ask again, because nothing in the method held it.
10. Tally the previous retro's improvements, and promote the wins. Dismiss
   the duds WITH the reason recorded, so a dud is never re-proposed.
11. Check the contract. Walk the contract rule by rule against the
   period's recorded trail — the call log, the decision graph, the
   notes. A violation is a lead: propose how the rule gets teeth (a
   refusal, a lint, guidance) so it cannot recur. The check reads what
   the lane recorded — private thinking is not in the store.
12. Aim every improvement at a durable home: guidance, a machine, a
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
method (`project/deliverable/machines/methods/meth-state-of-the-art.md`).

## The mechanical half

- se_note_drain marks a note drained with its disposition; drained notes
  leave the inbox count and the pending feed. Draining is legal only in
  the retro's drain state — entering it is free from idle, so "drain
  whenever" is one pull away, inside the machine's discipline.
- a drained note's LOCAL half stays on file (.se/notes.jsonl, disposition
  backlog) so the two ends of a crossing can be found from each other. It
  is not the pool. THE POOL IS project/spec/trace/work-token/, on trunk,
  and the migration step re-drains a token when its "ready when" comes
  true.
- A SECOND DRAIN OF ONE NOTE TO THE POOL IS REFUSED. The token already
  stands, and minting another splits one finding into two standing items
  whose conditions then disagree. To pull a parked item into scope,
  re-drain it as `carried`.
- Expedition reports are ruled AT CLOSE (applied | dismissed), not here —
  the retro is out of the expedition loop (owner ruling 2026-07-27).
- se_log_query is the query lane. Never an ad-hoc script.
  since: "last_retro" scopes it to the current retro period.
