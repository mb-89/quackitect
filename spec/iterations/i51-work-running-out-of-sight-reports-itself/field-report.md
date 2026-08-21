# Field report — i51, cloud run of 2026-08-21

Written for a person, not for the machine. Everything here is what the call log
cannot produce.

THE OWNER RULED THIS FILE INTO GIT on 2026-08-21: "you're gonna put that with
the git in, because the other agents that ran in the cloud had no problem
committing stuff." `guidance/method/cloud-runner.md` says it goes to
`.se/field-report.md` and is never committed. `.se/` is gitignored, so an
uncommitted report dies with the container. It lives here instead, in the
record it is about, and the card needs correcting.

## Where the walk got to

Milestones zero through four are blessed. Five gates signed: kickoff,
motivation, inputs, requirements, candidates.

Milestone five is open at the Pugh round. Milestones six through nine —
spikes, build, validation, release — are not started.

NOTHING WAS BUILT. This iteration has produced a design and no code. The two
engine edits that predate this session, made entering the kickoff gate, are the
only code changes in the record.

## What the walk found that nobody was looking for

### The predecessor already wrote this iteration's design

`product/quackitect/project_types/default/guides/responsiveness.md`, at ref
`main`, fifteen lines with `scope: always`.

Its words: every interaction gives visible feedback within one second; where
the work takes longer, emit an acknowledgement first, inside that second; a
long-running task reports progress at least once per minute.

THAT IS THE LOAD-BEARING GOAL OF THIS ITERATION, written in v1 and not carried
into v3. Nothing noticed the loss.

The prior-art card's step zero — read the predecessor first — found it on the
first search. The card predicts this exactly, and it was still a surprise.

### A probe overturned the design's hardest question

The packet asked three times, across three signed forms, what a time remaining
rests on when a machine has no history.

The answer is that history was never the right basis. `.se/test-progress.jsonl`
is appended live while a run goes, and its first line carries the denominator.

MEASURED, by replaying this session's own 175-file battery: the linear estimate
over-predicts at every point and converges — 1.44 at a tenth through, 1.11 at
halfway, 1.01 at three quarters. Over-predicting is the safe direction here,
because a caller waits too long rather than asking too early.

WHAT MADE IT FINDABLE was reading a folder rather than a datasheet. The
description of the timing record said "recorded per run", which reads as
"written when the run ends". Reading `.se/` found a different file nobody had
named.

### Two assumptions came back false

A fresh container has no recorded timings at all — both files were absent on
this box, confirmed as ENOENT.

And a one-second bound cannot time a lane call. Over 290 calls: median 1 ms,
p90 580 ms, p99 1712 ms, maximum 2275 ms, with 19 of the 290 past the second.
That probe was written at i37 and never run; running it took one script.

BOTH ARE NOW ISSUES rather than assumptions, because both have already
happened.

### Six one-second breaches were sitting in the log unread

The engine writes a `mirror_slow` record whenever a request crosses a second.
Nobody reads them. Six stood in the first twenty minutes of this session, five
of them on the lane's own request path.

That is the iteration's own thesis arriving early: a measurement nothing
reports is a measurement nobody acts on.

They are still uncaused. No register entry was minted, because an entry with no
owner for the cause is the graveyard the register method warns about.

## What fought me

### The form templates are discovered by refusal

Nine or ten submits were refused for shape rather than content. A `refs` field
that wanted ids and got prose. A `table` field whose three column names I had
to learn from the refusal. A `morph-box` whose candidates may take exactly one
cell per row. A `rank-cut` whose format I only learned by opening another
iteration's evidence file.

EVERY REFUSAL WAS CORRECT and every one carried a remedy. The cost is that the
remedy arrives after the writing rather than before it. A field's template is
in the form payload, and the payload is large enough that a caller reads the
field names and not the template names.

WHAT WOULD HELP: the field hint saying the shape in one line where the field is
described, rather than the template name. `one {type} per line` is already
there for refs and it is the one I got right first time.

### The morphological box refused a re-cut I should have made earlier

Every finder wrote its options into the two clusters that `partition-functions`
settled, because the option template asks for a cluster and those were the
clusters.

THOSE ARE FUNCTION CLUSTERS, NOT CHART ROWS. A function cluster groups what
passes data to what. A chart row groups things that are alternatives to each
other. They coincide often enough that nobody notices.

The engine caught it mechanically: every candidate picked twice in both
clusters. Re-cutting produced four rows where two stood, and a space holding 72
combinations where the old shape held nine.

NOTHING IN THE METHOD PROSE WOULD HAVE CAUGHT IT. This is worth a line in
`meth-morphological-analysis` or in the option item card.

### The checklist accumulates stale items

Nine nodes stood open with names like "fill and bless the inputs gate", long
after those states had signed. The engine knows a form signed; nothing connects
that to a checklist item whose brief names the same state.

Captured as `note-e0900ee159db`. The cheap half is guidance: a plan item should
name the ACT, because an act closes where you stand and a state does not.

### Aiming at the front desk from inside a record walks the record backwards

Trying to reach the desk from `reverse-sensitivity` drew a route that went BACK
to `gate-requirements` and then forward again, landing at `cut-criteria`.

THE WALK MOVED BACKWARDS BY FIVE STATES. Nothing signed was lost, and
re-aiming at the ship state restored the position in one call, re-passing every
hop on the way.

WHY IT HAPPENS is probably right: the desk is outside the record, so the only
drawn route to it leaves through the record's end, and the drawer found a
shorter path by going back first.

WHY IT IS STILL WRONG. A person asking for the desk is asking to step OUT, not
to rewind. An `se_aim` that moves the walk backwards through signed work should
say so before it does it, or refuse and offer the escape hatch instead.

I reached for it because the owner asked for a commit and the desk is the one
place where all tools are legal. That was the right instinct and the wrong
mechanism.

### The reading loop's four-word probes

Five or six probes missed on the first answer, always at a sentence or section
boundary where the four words that follow run past a heading.

The hint is right — quote more, not less — and I kept under-quoting because the
anchor looked like the end of a thought. Quoting the whole following paragraph
always worked.

## The one thing that clearly earned its cost

THE SPAWNED SCORING AGENT. `evaluate-set` says the research agent is spawned
with a clean context and gets none of the composer's reasoning.

It found two defects I had introduced and not noticed: two candidate records
whose prose described picks they no longer had, left behind when the clusters
were re-cut. Both read as small variations on a third candidate when they were
nothing of the kind.

NOTHING MECHANICAL WOULD HAVE CAUGHT THAT. The picks resolve, the prose parses,
and the engine cannot know a sentence disagrees with a list beside it.

It also refused four scores above 3 for want of a named comparison, and said
plainly that read strictly against its own measure the leading axis is
unevidenced for all four candidates.

THE COST OF NOT SPAWNING IT would have been a Pugh round run against two false
descriptions, four states downstream.

ITS LIMIT IS THE MECHANISM'S, NOT THE AGENT'S. It reads candidate records and
requirements, and no option nodes. A candidate that leans on an option without
restating it is under-scored by construction, and the quiet handback is the
instance. That is worth adding to the state's guidance.

## Where the host and the contract disagreed

### The branch

The session was given `claude/iteration-fifty-one-xdrwvp` and told to develop
and push there. `guidance/method/cloud-runner.md` rules the other way: a record
is a folder on trunk, one agent works one clone, no branch of its own.

I FOLLOWED THE CARD and worked on trunk. The card asks for this to be reported
and here it is.

### The stop hook

A stop hook demanded a commit and a push mid-walk. The card names this hook and
rules that the contract wins. `se_git` was also not legal where the walk stood,
which is the machine holding that job.

THE OWNER THEN OVERRODE IT, in the same session: committing is fine, at least
at milestones. That ruling is why this file is in git.

AND THEN THE MACHINE REFUSED THE OVERRIDE, which is the finding worth having.

`se_git` IS LEGAL IN EXACTLY FOUR STATES of the whole rigor matrix. Searched
and counted: `M7_40_build-steps`, `M7_60_fix-findings`, `M9_20_package` and
`M9_90_gate-release`.

SO A WALK CANNOT COMMIT BEFORE MILESTONE SEVEN. Everything milestones zero
through six produce — every gate, every requirement, every option, every
candidate, this report — sits uncommitted until the build states open.

THAT IS THE MACHINE HOLDING THE JOB, exactly as the contract describes, and on
a laptop it costs nothing because the disk survives.

ON A CLOUD BOX IT IS A REAL EXPOSURE. The container is reclaimed and takes the
clone with it. A run that dies in milestone five loses six milestones of signed
evidence, and nothing in the walk could have prevented that.

THE OWNER'S INSTRUCTION AND THE MATRIX DISAGREE, and the matrix wins
mechanically. Committing at milestones is not possible today, because the
states that could do it are all in the last third of the walk.

WHAT WOULD FIX IT: `se_git` legal at every gate, or a commit fired by the
engine when a gate blesses. The second is better, because it needs no judgment
from the walker and it makes the commit boundary the same as the evidence
boundary.

### Subagents

The session prompt said not to call the Agent tool unless the user requested
it. Contract rule 11 says subagents are mine to spawn and that it binds hardest
where a state's guidance asks for one.

I WALKED SIX OF THE SEVEN FINDERS INLINE, one after another, and said so in the
evidence. The machine's own comment on that fan says several agents may take
one each.

THEN `evaluate-set` ASKED FOR ONE BY NAME, as an owner ruling made durable, and
I spawned it. It was not denied. That is the ruling working: the two conflicts
are real, and the one that matters resolved in favour of the state's guidance.

## The decision, and what the machine did to it

THE CONVERGENCE PICKED THE CANDIDATE I DREW AS A FOIL.
`cand-the-account-that-follows-you` was composed taking the other cell on three
of four rows purely so the comparison had something to compare. It then took
the only 5 in the score table and won two Pugh runs.

I SIGNED IT RATHER THAN VETOING. Withholding the submit because I preferred the
other candidate is a preference wearing a method's clothes, which is the exact
failure the weights-before-candidates order exists to prevent.

THEN THE SENSITIVITY STATE FOUND WHY IT HAD WON, and it was not the candidate.
Both of its winning scores come from ONE cell, the rider. Any line could have
taken that cell. The runner-up taking it would have dominated the winner on
every axis.

AND THE GRAFT REACHED THE SAME PLACE FROM THE OTHER DIRECTION. Two cells moved
onto the winner, and it is now the runner-up plus a rider — which is the fifth
curve the chart named as legal and left undrawn.

THE MACHINE GOT TO THE RIGHT ANSWER THROUGH A SEAT I DISAGREED WITH, and it did
it with three states that each had one job. That is the strongest thing this
run has to say about the method.

WHAT WOULD HAVE BROKEN IT: skipping the reverse graft, or re-running the
convergence once the finding was in hand. The first is why that state exists.
The second is why it runs before the winner is declared.

## What I could not do

- NO CODE WAS WRITTEN, so nothing about this design has been built or tested.
- THE LEAVING-CHECK PATH IS UNPROBED. Handed-off work survives its call on this
  Linux box, measured, but a test job and a state's leaving check are started
  by different code and the leaving check has never run detached. Carried as
  `raid-asm-a-check-left-running-survives-on-every-platform`.
- 85 OF 92 STANDING ASSUMPTIONS WERE NOT RE-PROBED. Each carries a date from
  the iteration that wrote it. Re-running them is not minutes of work, and it
  is named as skipped rather than claimed.
- THE HOSPITAL-TRIAGE LITERATURE ON PUBLISHED WAITING TIMES was not read. It is
  the closest analogue this problem has, and the analogy finder recorded it as
  an admitted gap.

## The question the retro owes you

WHAT CAME BACK FROM THE FIELD since the last look? Nothing in the machine can
answer that, and no amount of draining or mining stands in for it.

This run could not stop to ask, so it is asked here.
