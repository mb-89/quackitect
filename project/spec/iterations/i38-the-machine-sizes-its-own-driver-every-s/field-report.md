---
id: i38-field-report
statement: "What the i38 cloud run found, written to the branch because .se/ does not survive the container."
---

# i38 — field report

WHY THIS FILE EXISTS. Owner ruling, 2026-08-20, given at the start of this
run: "Everything you find, write it into a field report because notes will
not survive the container."

That is a field observation and not a preference. `.se/` is machine-local and
never committed, so `se_note` on a cloud box writes into a file the box eats
when it is reclaimed. The contract routes strays to `se_note` in four separate
rules and `cloud-runner.md` repeats it twice; on this host every one of those
instructions writes into a hole. This file is the durable home instead.

WHAT IS IN HERE. Findings, corrections and leads from the run, written as they
were found. Anything that belongs in guidance, a machine or the register is
named as such, so a later retro can move it rather than rediscover it.

## The run

- Box: fresh cloud clone, arrived 2026-08-20T09:09:32Z, engine 6.0.0.
- Branch: `claude/iteration-38-1zvb7s`.
- Dials, raised on the owner's word at the desk: autonomy `strategic`,
  stop-at `blockers only`.
- Route: boot to front desk, then `iterations` to i38. The word had already
  arrived with the session, so the desk did not wait for it.

## Findings

### F1 — the prompt layer arrives stale on a fresh clone

MEASURED. `boot/prepare_idle`'s exit script went red on the first attempt:
`project/AGENTS.md`, `project/CLAUDE.md` and
`project/.github/instructions/protocol.instructions.md` were each reported
STALE against `project/guidance/`. One run of `place-prompt-layer.ts` fixed
all three and the exit passed.

WHY IT MATTERS. The projection is deterministic from `project/guidance/`, so a
clone can only ever be stale or identical. A fresh box therefore hits this red
every time, and it is the first thing an unattended walk meets.

THE FIX IS ONE LINE IN THE ARRIVAL. `se-arrive.ts` already fetches, installs,
places the cage and starts the lane. Placing the prompt layer belongs in the
same list, and then the red never happens.

SECOND-ORDER: preflight's own remedy text names the SCRIPT
(`Run engine/bin/place-prompt-layer.ts`) where the lane carries `se_prompt_place`
for exactly that job. Following the remedy as written produced the only
`se_run` call of the whole window. A remedy that names a shell script where a
lane verb exists teaches the shell habit the retro then counts.

### F2 — se_note is a write-only hole on a cloud box

The owner named this before the machine did. Recorded here as the finding it
is: on a host whose disk is reclaimed, every instruction to capture a stray
with `se_note` writes into `.se/notes.jsonl`, which is machine-local and never
committed.

THE GUIDANCE ALREADY KNOWS THE SHAPE OF THIS PROBLEM. `cloud-runner.md` says in
as many words that a commit nobody pushed did not happen, and that work you do
not push you have thrown away. A note is the same object with the same disk
under it, and the card does not say so.

DURABLE HOME: `project/guidance/method/cloud-runner.md`, under "What to leave
behind", which currently says "CAPTURE EVERY STRAY with se_note" without
qualification.

### F3 — the retro's log-mining window cannot span sessions on a cloud clone

`se_log_query {since: "last_retro"}` opened at this session's first record,
because a fresh clone starts `.se/calls.jsonl` empty and there is no earlier
drain to mark a boundary. The onboard-retro therefore mined boot and itself,
and nothing else. The method's step 1 has a long passage about the boundary
being poisoned by the wrong drain; it has nothing about the boundary being the
whole file because the file is new.

The step cannot say this from inside — an empty window and a genuinely quiet
window produce the same clean-looking result, which is the same failure mode
the memory-drain step was already patched for on 2026-08-19.

DURABLE HOME: `project/guidance/method/retro.md`, step 1.

### F4 — se_log_query silently ignores an unknown key inside `filter`

MEASURED. `se_log_query {filter: {outcome: "rejected"}}` returned all 42
records rather than refusing. `outcome` is not one of the filter's keys
(`tool`, `ok`, `since`, `text`), and SE-C-101 refuses an unknown argument at
the top level of a call — `se_help {tool: "..."}` was refused correctly on the
same session. Inside `filter` the same mistake answers instead.

WHY IT MATTERS. A wrong filter reads exactly like a real answer. The lane's own
law is that anything which blocks owes a remedy; this does not block at all.

### F5 — group_by "clause" buckets every record under "(none)"

MEASURED. `se_log_query {group_by: "clause"}` returned `{"(none)": 38}` over a
window containing five rejections carrying SE-C-120, SE-C-121 and SE-C-101.
The clause sits inside each rejected record's `response`, and the grouping does
not reach it.

WHY IT MATTERS. Retro step 8 asks for "refusal clauses by frequency" as the
first of five rankings, and `se_log_query` is named as the tool for it — "never
an ad-hoc script". The prescribed call cannot produce the prescribed ranking;
the clauses have to be dug out of the records by hand.

### F6 — a stale count in prose has no way to go loudly wrong

Every measured figure the i38 seed carries was taken against the matrix as it
stood before i9 added `M5_27 graft-onto-the-winner` on 2026-08-19. The seed was
written the next day.

- 52 states claimed; 53 on disk.
- 86 evidence fields claimed; 89 declared, across 43 of the 53 rows.
- 23 drawn fields claimed; 25 of 89, and the two extra are that same row's.
- "M0 through M3 have ONE drawn field between them"; there are three.
- A warning that the row-count test hard-codes 52 and will turn red; the test
  already asserts 53 and carries a dated comment for every change.

AND ONE OUTSIDE THE RECORD ENTIRELY. `project/guidance/method/tour.md:70`
tells a newcomer the matrix has "50 rows of steps". It has 53. That is the
page a person meets first.

THE DURABLE POINT IS NOT THE ARITHMETIC. A count written into prose reads
exactly the same whether it is current or a fortnight old, and nothing
recomputes it. Every measured figure a record carries is an undated snapshot.
Registered as `raid-iss-the-i38-seed-counts-a-matrix-that-has-since-moved`;
the tour.md line belongs to guidance rather than to i38.

### F7 — the demand ledger reopens on `depends_on`, and that is a live cascade door

FOUND BY A REVIEWER WITH NO SHARED CONTEXT, then verified against the engine.

`engine/iterations.ts:294` stores a `shape` on every demand. `:329` defines
`shapeOf` as JSON over `[depends_on sorted, busbar, seeds, runs]`. `:350-364`
returns a step as MOVED when the two shapes differ, and the absent-shape escape
at `:357-359` shields only pins taken before the field existed — live pins
carry shape on every demand.

SO INSERTING A STATE CHANGES THE FOLLOWING ROW'S `depends_on`, moves its shape,
and reopens that step and its downstream cone in every standing iteration. Four
iterations stand open; i9 alone pins 53 demands.

WHY IT MATTERS BEYOND i38. The record hunted exactly this cascade and found the
HASH path, which it then closed correctly. The shape path was never looked at.
Anyone editing a matrix row's dependencies is one call away from reopening
signed work in records they have never opened, and nothing warns them.

Registered as
`raid-risk-naming-a-driver-per-milestone-moves-the-step-shapes-and-reopens-standing-claims`.

### F8 — a resolution held only in prose has no mechanism under it

The record rules that complexity is read live and never pinned into
`seeded.json`'s demands. Verified true today: `demandOf` serialises
evidence-field structure and `shapeOf` reads four named keys, and a new
frontmatter key enters neither.

NOTHING ASSERTS THAT IT STAYS TRUE. One test assertion would hold the line and
it does not exist. A later hand can pin the value without meaning to, and the
first thing to notice would be a cascade.

### F9 — two guidance pages disagree about fixed model mappings

`project/guidance/method/subagents.md:31` carries an owner grant of 2026-07-11:
"JUDGE IT PER SUBAGENT. There is no fixed mapping and none should be invented."
i38's ruling of 2026-08-20 builds exactly one fixed mapping.

RESOLVED AT THE GATE RATHER THAN OUTRANKED, because letting the newer ruling
simply win drops a half that is still true. The two govern different subjects:
`subagents.md` governs an AD-HOC TASK the walker invented, where no rating
exists and there is nothing to look up; i38's list governs a RATED STATE, where
the machine holds a value and a lookup is not an invention.

THE SEAM IS RATED-STATE VERSUS AD-HOC-TASK, and it is written down nowhere.
`subagents.md` is the durable home for it, and writing it there is outside
i38's scope.

## What this run did to the record

- The onboard-retro signed with an empty inbox and said so rather than being
  skipped silently.
- The kickoff gate proposes `major`, on a cone the seed did not name: the flat
  walk has no milestone seam, so naming a driver per milestone edits a
  dependency, and a dependency edit is a reopen.
- Five register entries were minted, three of them from the reviewer's findings.

### F10 — the call log cannot be grouped by the state a call was made in

MEASURED LIVE ON THIS BOX, 2026-08-20. `se_log_query {group_by: "visit"}`
returns `{"(none)": 190}`. `{group_by: "state"}` returns `{"(none)": 191}`.
Every record in one bucket, no exceptions. By contrast `{group_by: "actor"}`
separates cleanly into `ui` 8, `agent` 181, `human` 3 — so the grouping
mechanism works and the coordinate is simply absent.

THE RETRO METHOD ALREADY KNOWS. Step 9 carries it from 2026-08-17 in its own
words: per-step cost is not computable today, because the state a call was made
in rides inside a narration record's arguments where `group_by` does not reach.

WHY IT IS WORTH REPEATING HERE. It is currently written down as a limitation of
one retro column. It is bigger than that: it is the reason nothing in this
system can say what any state costs, which makes every "where does the process
drag" question unanswerable from the record. i38 turned it up from a different
direction entirely — an iteration about attributing a walk found that the
walk's other coordinate is missing too.

Registered as `raid-iss-a-call-cannot-be-attributed-to-the-state-it-was-made-in`.
i38 has taken the fix into scope because its own fourth goal cannot be
delivered without it.


## F11 — why the fabrications were not caught, and what would catch them

OWNER QUESTION, 2026-08-20, after the motivation gate failed: "the pressure
test is this idea where we have a PR-FAQ. Not sure that needs to catch
internals. The question is more: why was the fabrication not caught? Would the
assertion+evidence system help here?"

### The pressure test was not the state that failed

THE PR-FAQ TESTS THE VISION. Why now, why us, what breaks, what it costs, what
was given up. Whether `machines/scale.md` declares five rungs or six is not a
question a press release or a hostile customer would ever ask.

AN EARLIER NOTE IN THIS REPORT CRITICISED THE PRESSURE TEST FOR MISSING THE
FABRICATIONS. That was wrong and is withdrawn here.

THE STATE THAT FAILED IS THE GATE'S ROUND 0, whose own words are "open what the
evidence points at; a bless is not proof". On its first ruling it re-checked
three claims already checked at the kickoff and called that opening the
evidence. It did not open the register, did not test its own measurement, and
did not count the population behind its own headline figure.

### The seven, classified by what would have caught them

FIVE DIE TO EVIDENCE-BINDING — a claim that cannot be written without an
attached query the engine re-runs.

- "six autonomy rungs": recall written as measurement.
- "three method cards carry the word": the search HAD been run and its counts
  list came back TRUNCATED; the head was written as the whole.
- "whatever names a driver has somewhere to hand it to": no measurement existed
  at all, in the same declarative voice as the measured sentences beside it.
- "nothing in the standing register was re-derived": true, and not the claim
  the state asked for, which was that it was RE-READ.
- "referenced from both new nodes": a statement of intent, not of fact.

TWO SURVIVE IT, and they are the two that matter.

- "thirteen of fourteen pinned records": re-running the count gives exactly
  that. The arithmetic was right and the POPULATION was wrong — eleven of the
  fourteen are shipped, so the live exposure is two. Evidence supports the
  number; the number does not support the conclusion.
- "the mechanism works and the coordinate is simply absent": the command was
  real and reproduces. The INFERENCE was invalid. What killed it was a NEGATIVE
  CONTROL — `group_by: "banana"` returns the same single bucket.

### The finding

THE TWO KINDS ARE DISJOINT AND SO ARE THEIR GUARDS. Evidence-binding kills
FABRICATION cheaply and mechanically. It cannot touch WRONG INFERENCE from
sound evidence, which needs a negative control or an adversarial reader.

SO THE ARGUMENT FOR BUILDING IT IS NOT THAT IT REPLACES REVIEW. It is that the
adversarial pass currently spends most of its budget finding stale numbers.
Take fabrication off the table mechanically and the same reviewer spends its
whole budget on inference, which is the only thing it is actually good at.

ONE CAUTION THAT DECIDES THE DESIGN. Evidence that merely RESOLVES is not
enough. `scale.md:8` attached to "six rungs" resolves fine and is still false.
The evidence must be RE-EXECUTED and compared, not pointed at — otherwise the
fabrication moves down one level and hides better.

THE PIECES ALREADY EXIST HERE: `source_refs` on register nodes; the `refs`
field template that refuses a reference not resolving to a standing node of
that type; SE-C-138 refusing frontmatter the reader cannot load. What is
missing is that discipline for PROSE CLAIMS INSIDE EVIDENCE FORMS, which is
where all seven of these lived.

### And it is i38's own seam

A CLAIM WHOSE EVIDENCE A CHECKER CAN RE-RUN IS C2 — a named method over named
inputs, procedural failure a checker can see. A claim only a reader can judge
is C3. An assertion+evidence system is a mechanism for MOVING CLAIMS FROM C3 TO
C2, which is the same move this iteration argues about for states.

THAT IS A REASON TO TAKE THE SCAN'S FIRST RECOMMENDATION SERIOUSLY at M3 —
derive a rung from what will judge the output — because the same idea has just
been demonstrated on this milestone's own evidence, at this milestone's own
expense.


## F12 — a subset checked and written in the voice of a sweep, twice

TWICE IN TWO MILESTONES, with the lesson already written down between them.

AT M1, log-risks said the standing register was not re-derived. True, and not
what the state asked — it asks for a RE-READ. The sweep had not happened, and
it turned up an open crippling entry directly on the iteration's payoff.

AT M2, map-stakeholders' coverage field swept THREE value props and read as
though it had swept all of them. Ten stand. Nine name one role and the tenth
names another, which the sample had hidden.

BOTH TIMES THE CONCLUSION HAPPENED TO HOLD, so nothing downstream broke and
nothing signalled. That is what makes the shape dangerous rather than merely
sloppy: a subset stated as a sweep is indistinguishable in the text from a
sweep, and it is only caught by somebody re-running the whole set.

DISCIPLINE HAS NOW FAILED AT IT TWICE, by an agent that had just been burned by
it. That is the argument for a mechanical check rather than for trying harder,
and it is the same argument as F11.

## F13 — a reopen costs about five times a state transition

MEASURED AT i38's INPUTS GATE, 2026-08-20, over 400 call records. Twenty-six
calls exceeded the one-second bound on `if-agent-harness-to-entrypoint`. Six of
them sit between 15.2 and 18.4 seconds and every one is an `se_pull` that
carried a reopen cascade: re-signing a state recomputes the demand ledger for
the whole column and the claim guard walks the downstream cone.

THE REST OF THE SLOW CALLS sit between 1 and 4 seconds and are ordinary
transitions and form submits. No read, search, write or query came near the
bound.

WHY IT IS WORTH RECORDING. i33's standing measurement — 1834 slow calls in 8424
— has nothing in this class, so the 15-to-18-second band is new information
rather than the known shape. This iteration made nine reopens and would have
made none if its evidence had been right the first time, which prices the
fabrications in wall-clock as well as in trust.

## F14 — the walker's own narration is the worst-behaved thing in the log

OVER 400 RECORDS, 36 FAILED, AND 25 OF THOSE ARE NARRATION. SE-C-121 fourteen
times, SE-C-133 eleven.

THE 121s ARE NODE IDS GUESSED rather than read. Every result hands back the
open node map, and the walker addressed `done` at ids inferred from the order
it had planned items in. That is a self-inflicted refusal with the answer
already in hand.

THE 133s ARE THE STALL GUARD, fired while reopen cascades ran and nothing
closed. The work was real and the checklist was the wrong shape — the same
finding i15 recorded, arrived at independently.

NEITHER COST THE WORK ANYTHING and both made the log a worse witness, which on
a box nobody is watching is the only witness there is.

ONE THING THE ENGINE COULD DO ABOUT THE FIRST, offered as a lead rather than a
demand: the open node map rides every refusal already. A `done` naming an
unknown id could name the closest open id instead of only listing them.

## Leads for whoever opens an engine iteration

Collected here because none of them is i38's work and none would survive the
box as a note.

- `preflight` names `engine/bin/place-prompt-layer.ts` in its remedy where the
  lane carries `se_prompt_place`. Following the remedy as written produced the
  only shell call of the window.
- `se-arrive` should place the prompt layer. It already fetches, installs,
  places the cage and starts the lane, and the projection is deterministic — a
  fresh clone can only be stale or identical.
- `se_log_query {group_by: "clause"}` buckets every record under `(none)`. The
  retro's first prescribed ranking cannot be produced with the prescribed tool.
- `se_log_query` silently ignores an unknown key inside `filter`. A wrong
  filter answers instead of refusing, and the answer looks real.
- `project/guidance/method/tour.md:70` says the matrix has 50 rows. It has 53.
- `project/guidance/method/subagents.md` needs the seam between a rated state
  and an ad-hoc task written into it, or its 2026-07-11 grant and i38's fixed
  list will read as a contradiction to the next person who finds both.
- `project/guidance/method/retro.md` step 1 owes a sentence about a fresh-clone
  window, where "since the last retro" means "since this session started" and
  nothing says so.
- `project/guidance/method/cloud-runner.md` owes the note half of its own push
  ruling: on a box that gets reclaimed, `se_note` is the same kind of hole an
  unpushed commit is.


