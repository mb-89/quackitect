---
id: method-retro
statement: The retro. Look back and drain the inbox, then walk the backlog and emit durable improvements.
---

# retro — the method

A retro is a FUNCTION, not a state: fire it at its trigger points, or
freely at the front desk. It is blameless. Fix the system — guidance, machines,
conditions, forms, the engine. Never a person.

The retro EMITS; it adopts almost nothing. A lead becomes a note. The
note drains into exactly one home. Planning consumes what survived.
(v1's retro/triage separation, ported.)

## Fix what produced it, never only what it produced

THE OPENING RULE HAS A SECOND HALF. "Fix the system, never a person" says who
is not to blame. This says what to repair.

A BAD OUTPUT IS EVIDENCE ABOUT ITS GENERATOR. The wrong answer is the symptom.
What produced it is the thing to change, and it is one of these:

- the prompt
- the guidance card
- the form
- the refusal
- the tool

SO EVERY LEAD ANSWERS ONE QUESTION: what would have stopped this from being
produced at all? An improvement that repairs one artifact and leaves the
generator alone has bought one artifact.

REPAIRING THE ARTIFACT TOO IS FINE, and usually necessary. It is simply not
the finding.

MID-WALK IT IS ALREADY HAPPENING. An agent that notices something and writes a
note usually applies the finding to its own work in the same breath. The retro
is where that becomes durable instead of personal.

THE LINTER LAW IS THIS RULE WITH TEETH. A guidance sentence nobody heeds is
not a fix. Measure whether findings lead to edits, then promote the ignored
ones to refusals or delete them (guidance/method/engineering.md).

WHERE IT COMES FROM. Bun's Zig-to-Rust port ran the same rule live. Agents
read "get the crates to compile" as "stub out the failing functions", and the
repair was one edit to the loop's prompt rather than a sweep over the stubs.
The account is [[ref-bun-zig-to-rust-port]].

## When it fires

The trigger is a NOTE carrying "needs retro":

- An iteration finishes — the agent writes a "needs retro" note.
- The owner asks for one — the agent writes a "needs retro" note.
- While such a note pends, start_iteration's entry gate refuses; the
  retro's drain dispositions it and the gate opens.
- At the front desk, freely, with no trigger note at all. Allowed, never required.

## The steps

1. MARK THE BOUNDARY #work/mark-the-boundary

   Before anything else. Run se_log_query with
   filter {since: "last_retro"} and take the timestamp of its OLDEST
   record. That is where the window opens, just after the previous
   retro's drain. Write it down; every later query uses THAT timestamp.

   The result pages NEWEST first, so the oldest record sits at the last
   offset. The first call's `total` says which offset that is.

   Why first: "last_retro" means the newest drain call, and step 3
   drains. Once you have drained, the phrase points at your own retro
   and the window is empty. The boundary must be taken while it still
   names the PREVIOUS retro.

   THE DESK'S OWN DRAINS DO NOT POISON IT. The desk drains too, and a desk
   drain from an hour ago would otherwise hand the retro a window far too
   short.

   The engine settles this now: "last_retro" means the newest CARRIED or
   BACKLOG drain, and those are judgment dispositions the desk is
   refused, so only a retro can set the mark (deliverable/engine/calllog.ts).

   ON A FRESH CLONE THE WINDOW IS ONLY THIS SESSION, and it looks exactly like
   a genuinely quiet period. A cloud container starts `.se/calls.jsonl` EMPTY,
   so there is no earlier drain and no earlier record: `last_retro` opens at
   this session's first call. An onboard-retro then mines boot and itself.

   SAY SO RATHER THAN SIGNING AN EMPTY MINE AS A CLEAN ONE. The step cannot
   tell the two apart from inside, and only the record COUNT does.

   THE ARRIVAL'S OWN WORK IS NOT IN THE WINDOW AT ALL. `se-arrive.ts` writes
   nothing to the call log, so five acts are invisible to the record.

   - the fetch
   - the install
   - the cage placement
   - the projection
   - the lane start

   For a system whose premise is that every call is logged, the first minutes
   of every headless run are unlogged.

   WITH NO SUCH DRAIN IN THE LIVE LOG, the window opens at the log file's
   FIRST record. Never at another drain. A `done` or `obsolete` drain is a
   check any walk makes, so falling back to the newest drain of any kind puts
   the mark wherever the last walk happened to tidy up.

   WHAT THAT COSTS: 68 records returned where 2,804 stood, hiding every call
   of the session the retro existed to mine. It fails SILENTLY, so the retro
   reads as finished over an almost empty window.

   THE SHAPE THAT CAUSED IT is worth knowing, because it will recur: the
   live log held one `carried` drain and it had been REFUSED under SE-C-110
   for draining outside a retro. A refused record is skipped, so no judged
   mark existed at all.

   Take the timestamp and use it. Checking it by hand is not work this step
   owes.
2. FIELD FEEDBACK #work/field-feedback

   Ask the owner what came back from the
   field since the last look. Capture every answer as a note.

   THIS IS A SANCTIONED STOP, AND THE ONLY ONE THE RETRO HAS. Ask the
   question, then STOP and wait for the answer.

   WHY IT NEEDED SAYING. The step was walked past in several retros running.
   The owner: "in the last few retros, you never asked me for field feedback.
   So you don't stop. You just continue with your stuff."

   It is easy to walk past because there is always more retro to do. That is
   exactly why it is named: no amount of draining, mining or sweeping is a
   substitute for the one report that comes from OUTSIDE the machine.

   WHAT DOES NOT WAIT. The drain, the log mining, the debt sweep and the
   memory drain need no answer. Do them, and stop on the question.
3. DRAIN THE NOTES INBOX #work/drain-the-notes-inbox

   Walk EVERY pending note once. Disposition each
   with se_note_drain, routing it to exactly ONE home.

   CHECK BEFORE YOU JUDGE, and check CHEAPLY. Most of what pends is often
   ALREADY BUILT. Sampled once, the twelve smallest notes had mostly shipped,
   some of them days earlier.

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
     - Cannot state it cleanly yet? Say so, and the backlog carries it as an
       open question.
     - What is refused is silence and paste, never honesty.

     THE RAW NOTE STAYS LOCAL, unmoved and marked drained. The token is a
     new node.

     - The two are different objects with different lifetimes.
     - The token is the truth from the mint onward.
   Nothing stays pending after a retro.
4. WALK THE BACKLOG #work/walk-the-backlog

   The migration. Every standing WORK TOKEN in the backlog
   (spec/trace/work-token/, on trunk, readable from any clone):
   keep it (condition still unmet), pull it
   (re-drain as carried, into this round's scope), or drop it (re-drain
   as obsolete, reason recorded). Re-draining IS the migration mechanism.
5. SWEEP THE REGISTER FOR DEBTS #work/sweep-the-register-for-debts

   List every
   raid entry of kind `debt`. Each one is repaid now, rescheduled with
   its trigger re-affirmed, or consciously re-accepted - and the look is
   recorded on the entry, dated. A debt nobody re-reads is a lie in the
   ledger.
6. DRAIN THE ASSISTANT'S MEMORY #work/drain-the-assistant-s-memory

   The agent may write memory freely
   between retros; the retro is where it drains. Read every memory entry:
   whatever holds project rules, project state, or working guidance moves
   INTO the repo (guidance, machines, prompts) and leaves the memory.
   Memory keeps only personal data and harness mechanics the repo cannot
   hold. The agent runs this sweep itself.

   THE LANE REACHES THE MEMORY FILES ALREADY.

   The memory lives outside the project root, and a bare path to it refuses
   under SE-C-102. That is true of a bare path and not of the lane. `.se/roots.json` already
   declares `sessions` as the harness's projects folder, and the memory sits
   under it. So `@sessions/<project-slug>/memory/` reads.

   THAT PATH ANSWERS `exists: false` for a missing MEMORY.md rather than
   refusing — a real answer about a real folder.

   SO CHECK THE DECLARED ROOTS BEFORE CONCLUDING ANYTHING. Three ways through
   are honest and a fourth is not.

   - READ THE FOLDER THROUGH THE DECLARED ROOT. This is the first move, not
     the fallback. Read `.se/roots.json`, find the root that covers the
     harness's memory path, and glob or read under it.
   - THEN DELETE WHAT YOU DRAINED. A drain that only reads leaves the next
     retro the same pile to judge again, and the owner has said plainly that
     nobody else uses the memory.
     - The retro state carries `se_file_delete` for exactly this.
     - The memory root is declared WRITABLE, which is what makes the delete
       land. A read-only root cannot finish this step however well it reads.
     - Delete only after the content has a home, or has been shown to be
       carried already.
   - DRAIN WHAT THE HARNESS SURFACED. Memories handed to the agent in context
     are readable and drainable too.
   - DECLARE A ROOT for a folder no existing one covers. `.se/roots.json`
     makes a folder available as `@name`, read-only by default. DECLARE IT
     YOURSELF and carry on. Stopping here to ask reports the drain unreachable
     and moves on, which is the step saying nothing.
   - A FRESH CONTAINER HAS NOTHING TO DRAIN, and that is a real answer rather
     than an unreachable step. A cloud box is cloned fresh and reclaimed when
     it goes idle, so no memory from a previous session persisted into it.
     Say "nothing persisted here" and move on.

     SAY WHICH OF THE TWO IT WAS. "The folder was empty" and "no folder could
     ever have carried anything into this box" are different findings, and
     only the second one closes the step honestly on a disposable host.
   - THE HOST MAY REFUSE THE DECLARATION, and then declaring one yourself is
     not available. Observed 2026-08-26 on a Claude Code cloud container: a
     glob of `@sessions` refused SE-C-127, its remedy said to write
     `.se/roots.json` through the lane, and the harness's own permission layer
     blocked that write before the lane saw it.

     A HOST DENIAL IS NOT A LANE REFUSAL. It carries no clause and no remedy,
     so there is nothing to follow and re-sending reaches the same layer.
     `guidance/method/cloud-runner.md` carries how to tell them apart.

     DO NOT REACH AROUND IT WITH THE SHELL. Record which call was denied and
     by what, then answer the step with what you could reach.
   - WHAT IS NOT ALLOWED is ticking this step because nothing was surfaced.
     Say what you could reach and what you could not.

   NAME THE FOLDER AND COUNT THE FILES. "Nothing to drain" and "I looked in
   the wrong place" produce the same clean-looking result, and only the count
   tells them apart.

   THE WAY IT GOES WRONG. A retro reads the slug for the CURRENT project path,
   which holds nothing, reports the memory folder empty, and records the drain
   as satisfied. Eight memory files sit under the older slug.

   SO GLOB WIDER THAN ONE SLUG. `@sessions/**/memory/*.md` finds every project's
   memory folder, and a project renamed or moved leaves its memories behind
   under the old name. Write the paths you found into the evidence.
7. HUNT WASTED EFFORT #work/hunt-wasted-effort

   Rework, reversals, avoidable refactors,
   reinventing instead of reusing. Each one is a lead.
8. MINE THE RECORD #work/mine-the-record

   Use the timestamp step 1 stored — never the whole
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
   It is not a survey. THE POINT IS TO FIND THE MISSING
   VERB: a command that did a LANE JOB by hand is a verb naming itself, and
   the retro is where it gets named.

   SORT THE COMMANDS INTO TWO PILES BEFORE READING THEM, because they are not
   the same act and only one of them is a lead.

   - A LANE JOB DONE IN THE SHELL is the lead. Reading a file, listing a
     folder, searching the tree, parsing the call log. Each has a verb, and
     reaching past it says the verb is missing, wrong or unfindable.
   - A PROGRAM IS NOT A LEAD, and counting it down teaches the agent that
     thinking costs it something. Counting what a rule touches, routing four
     hundred blocks, applying one shape across a tree — these are programs,
     the lane card says so in as many words, and a session that wrote none is
     the finding rather than the good result.

   SO THE NUMBER TO WATCH IS THE FIRST PILE. A session with twenty scripts
   and no lane-job commands is healthier than one with neither.

   COUNT IT. `se_log_query {group_by: "tool"}` gives the whole
   distribution in one call.

   DO NOT COMPARE IT TO AN OLD RETRO'S NUMBER. A ratio against a stale
   baseline says nothing about whether THIS window's shell calls were
   avoidable, which is the only question this step asks.

   ASK INSTEAD: what did the shell do this window that a lane verb could
   have done? Name the verb.

   GROUP THE COMMANDS BY SHAPE, not by date. Four runs of one script is one
   missing verb, not four incidents. Name the verb, and if it is cheap
   enough, build it in the retro.

   The raw log is KEPT, forever until it reaches a gigabyte.

   THEN AUDIT THE TOOLS THEMSELVES. The same
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

   THEN MINE THE TEST TIMINGS. Every run
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
9. WALK THE MILESTONES #work/walk-the-milestones

   One iteration at a time. Every iteration that closed
   in this window gets its milestone steps walked in order, and the walk lands
   as a TABLE the owner reads.

   THE QUESTION IT ANSWERS: what went well from one milestone to the next,
   where the improvements are, and what can be mechanised.

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

10. TALLY THE PREVIOUS RETRO'S IMPROVEMENTS #work/tally-the-previous-retro-s-improvements

   Promote the wins. Dismiss
   the duds WITH the reason recorded, so a dud is never re-proposed.
11. CHECK THE CONTRACT #work/check-the-contract

   Walk the contract rule by rule against the
   period's recorded trail — the call log, the decision graph, the
   notes. A violation is a lead: propose how the rule gets teeth (a
   refusal, a lint, guidance) so it cannot recur. The check reads what
   the lane recorded — private thinking is not in the store.
12. AIM EVERY IMPROVEMENT AT A DURABLE HOME #work/aim-every-improvement-at-a-durable-home

   Guidance, a machine, a
   condition note, a form template, an engine refusal. Emit only the few
   highest-leverage notes. Each one specific and checkable — a concrete
   change, never "improve X".

13. EMPTY THE SCRATCHPAD #work/empty-the-scratchpad

   OWNER INSTRUCTION: every retro does this, and the scratchpad is not allowed
   to grow without bound.

   THE SCRATCHPAD IS NOT PERMANENT AND DOES NOT TRAVEL WITH VERSION CONTROL.
   Anything useful sitting there is one machine away from being lost, so
   "useful" is a reason to BAKE IT IN rather than a reason to keep it.

   Walk what is in `scratchpad/` and decide each file's fate. There are only
   three answers, and "leave it" is not one of them.

   - INCORPORATE IT. The thing has a durable home and belongs there.
   - PROMOTE IT. See the scripts, below.
   - DELETE IT. It answered its question and the answer is recorded.

   EMPTY MEANS EMPTY. A file kept because it might be handy next time is a
   file that will not be there next time.

   READ THE FIELD REPORTS FIRST. A field report is the one channel that reaches
   a person from an unattended run, and nothing else carries what is in it.
   Anything in one that maps onto the repository moves there NOW — a guidance
   edit, a register entry, a work token. What cannot be mapped is why the
   report exists, and the retro is the only reader it will ever get.

   THEN ASK OF EVERY SCRIPT WHERE IT BELONGS IN THE SYSTEM. A script written
   once is a program and costs nothing. A script REWRITTEN every session is a
   capability naming itself, and the retro is where it gets a home.

   - Group the scripts by what they ANSWER, not by their filenames.
   - A shape that recurs across sessions gets baked in.

   A NEW VERB IS THE LAST RESORT, NOT THE FIRST (owner ruling). There are
   already many, and each one is another thing to learn, maintain and get
   wrong. Reach for these in order:

   - A CHECK THE ENGINE RUNS ITSELF, on a write or at a leaving condition.
     Nobody has to remember it and nobody has to call it.
   - A SUBFUNCTION OF A VERB THAT EXISTS. An argument on a verb already in the
     hand beats a whole new one nobody will find.
   - A NEW VERB, only where neither fits, and say why neither fitted.

   THE COUNT GOES IN THE REPORT. How many files stood, how many were
   incorporated, promoted or deleted. A scratchpad nobody counts is one nobody
   empties.

14. REPORT TO THE OWNER, FOR DISCUSSION #work/report-to-the-owner

   OWNER INSTRUCTION. A retro that files its findings and says nothing has
   done half the job. Two things are owed, at two different moments.

   A SHORT OVERVIEW THE MOMENT THE DRAIN CLOSES. Where the retro stands, what
   is done, what is left. The owner should never have to ask.

   THEN THE EXTENSIVE REPORT, at the end, AND IT CARRIES THE THEMES RATHER
   THAN THE LIST. A hundred notes dispositioned one at a time is a list nobody
   can discuss. The themes running through them are the thing a person can
   actually rule on.

   WHAT THE REPORT HAS TO CARRY.

   - THE THEMES, named, with how many findings fell under each.
   - THE NUMBERS. How many were already built, how many were duplicates, how
     many were adopted, how many were routed.
   - WHAT WAS ADOPTED IN THE RETRO ITSELF, so the owner sees what changed
     under them rather than discovering it later.
   - THE OPEN DECISIONS, separated out. Anything waiting on the owner is
     listed as a question, not buried in a finding.
   - WHAT THE RETRO COULD NOT DO, and why. A blocked step named plainly beats
     a gap the reader has to notice.

   PRESENT IT. Do not merely write it somewhere.

15. DISTRIBUTE THE BACKLOG TO ITS OWNERS #work/distribute-the-backlog

   OWNER INSTRUCTION, and it is the LAST step on purpose.

   Everything is in the backlog by now. Walk it and ask of each item whether
   an owner can take it.

   - AN ITERATION owns it. Move it to that record's opening step.
   - THE OVERHAUL owns it — anything about catching the system up to a standard
     that has already moved.
   - A STATE owns it, and redistributes it when the walk arrives.
   - NOTHING owns it yet. It stays, and that is now the exception.

   THE ORDER IS THE POINT, and the owner settled it: dump everything into the
   backlog FIRST, discuss it, and distribute AFTERWARDS. Routing before the
   discussion routes on the retro's own guess. Routing after it routes on a
   decision.

   THAT IS WHY THIS SITS BELOW THE REPORT rather than beside the drain.

   A MOVE IS ONE FIELD, NOT A VERB. Every backlog item is a file carrying a
   `place`, and writing a position into that field moves the item there.
   Anybody who may edit a file may move one, so nothing has to be built first.

   AN ITEM SAYING NOTHING STANDS IN THE BACKLOG, which is the default a mint
   gives it. Stamp the place explicitly anyway: a move is then a CHANGE to a
   line rather than the absence of one, and the difference is visible to a
   reader and to version control.

   SAY BACKLOG. It is called the backlog on every surface a person reads, and
   "the pool" is the code's word for the same folder. Carrying the internal
   word into a report makes the reader translate.

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
method (`deliverable/machines/methods/meth-state-of-the-art.md`).

## The mechanical half

- se_note_drain marks a note drained with its disposition; drained notes
  leave the inbox count and the pending feed. Draining is legal only in
  the retro's drain state — entering it is free from the front desk, so "drain
  whenever" is one pull away, inside the machine's discipline.
- a drained note's LOCAL half stays on file (.se/notes.jsonl, disposition
  backlog) so the two ends of a crossing can be found from each other. It
  is not the backlog. THE BACKLOG IS spec/trace/work-token/, on trunk,
  and the migration step re-drains a token when its "ready when" comes
  true.
- A SECOND DRAIN OF ONE NOTE TO THE POOL IS REFUSED. The token already
  stands, and minting another splits one finding into two standing items
  whose conditions then disagree. To pull a parked item into scope,
  re-drain it as `carried`.
- Expedition reports are ruled AT CLOSE (applied | dismissed), not here —
  the retro is out of the expedition loop.
- se_log_query is the query lane — parsing the call log by hand is the
  lane job this step exists to catch. That is about the LOG, not about
  scripts: a program over the corpus or the tree is the right instrument and
  the lane card says so.
  since: "last_retro" scopes it to the current retro period.

## EVERY FAILED GATE REVIEW IS READ, ONE AT A TIME

Owner ruling 2026-08-26, after a record where no milestone passed its first
review and the fifth failure repeated the first.

THE STEP: list every gate in the interval whose review found anything, and read
each one on its own. Not the findings — the SHAPE of the mistake. Then say what
rule would have caught it.

THE RULE GOES SOMEWHERE DURABLE, never into the record that produced it. A
method card, a condition, a check. A lesson written into an iteration's own
evidence dies with that iteration.

### Why one at a time rather than in a batch

BECAUSE THE SHAPES REPEAT AND THE BATCH HIDES IT. Read separately, five
failures in one record turned out to be one shape wearing five costumes: a
cheap proxy passing for the real thing. A label for a statement. A summary for
the steps. A note for a fix. A signature for current evidence. A promise for an
act.

NONE OF THEM LOOKS LIKE A MISTAKE WHILE IT HAPPENS. Each reads as diligence.
That is the property that makes them repeat, and it is only visible across
several of them at once.

### What the gate now hands you

EVERY GATE THAT FAILS ITS REVIEW WRITES A NOTE, by the same ruling. So the
retro's input is not an archaeology exercise: the learnings are already in the
inbox, written by the hand that had the context.

WHERE THAT NOTE COMES FROM is `meth-gate-review.md`, section "A failed review
produces a note, every time".

DRAIN THEM LAST, after the ordinary notes. A learning read beside four other
learnings is worth more than the same learning read alone, and the pattern is
the thing the retro is for.

### The check that would have caught four of five

AN ENTRY WITH A TRIGGER IS A MESSAGE ADDRESSED TO A MOMENT, and nothing
delivers it. Four of that record's five failures were already named in open
register entries. One entry's trigger read "the next cut-criteria run". That run
happened and nobody read the entry.

SO THE RETRO ALSO ASKS: which open entries had their trigger fire in this
interval, and did anybody act? An entry whose trigger fired and was ignored is
a finding about the delivery mechanism rather than about the entry.
