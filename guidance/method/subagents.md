---
id: subagents
statement: "How to spawn subagents well: which model each one gets, and what to do after an interrupt."
---

# subagents — spawning them, and keeping them alive

Contract rule 11 says subagents are yours to spawn without asking. This card
is what that rule does not cover: which model a spawned agent gets, and what
happens to one when the session is interrupted.

BOTH RULES LIVED IN THE ASSISTANT MEMORY until 2026-08-19. The repo is the
memory, so they moved here at that retro.

## Spawn one to save context or to raise quality, never to go faster

TWO REASONS ARE GOOD AND ONE IS NOT.

- SAVING CONTEXT is a reason. A subagent has its own window, so what it reads
  never enters yours and only its answer does.
- RAISING QUALITY is a reason. Fresh eyes that never saw your reasoning catch
  what you cannot, which is why verification asks for them by name.
- GOING FASTER IS NOT A REASON ON ITS OWN. A subagent on YOUR model doing work
  you would have done costs the whole job twice: its window and yours. Parallel
  wall-clock is not a saving when nobody is waiting on the clock.

SO THE TEST IS: would this work have entered my context anyway? If the answer
is yes and the model is the same, do it yourself.

THE SAVING IS CONTEXT, NEVER KEYSTROKES. The work worth handing over is the
work whose READING is long and whose ANSWER is short.

DELEGATE A QUESTION LIKE THESE:

- Which use case names the lane verbs, and what shape does an entry take?
- Where is this rendered, and who calls it?
- What do three existing nodes of this kind look like?

DO NOT DELEGATE A JUDGMENT. What a changed contract should now mean, whether
an assertion still proves its point, which of two readings the owner meant —
these are yours, and a weaker hand returns a confident wrong answer.

DO NOT DELEGATE A SWEEP THE LANE HAS A VERB FOR. `se_file_replace` renames
across a tree in one call with a preview. A subagent doing the same is slower
and less checkable.

MEASURED. A session fixed about forty test failures and spawned no
subagent until the owner asked why. Almost none of the fixes were mechanical,
so handing them over would have saved little — but the READING behind them was
most of the session's cost, and every page of it stayed in context.

## Pass the lane rule to every subagent

A subagent has your tools and none of your context. Give it the cage.

- Say that the `se` lane is the only door.
- Name the verbs it will need, and how to load their schemas.
- Say that paths are root-relative to the project root, which is the parent
  of the folder open in the editor.
- Say whether it may write. Most readers may not.

A SUBAGENT THAT DOES NOT KNOW ABOUT THE CAGE WILL REACH FOR ITS NATIVE TOOLS.
It will then report that it could not read anything, and you will have paid
for a turn that found nothing.

### THE CHILD IS NOT IN THE CAGE, measured 2026-08-20

The `se` MCP server is NOT in a subagent's tool set. The child cannot call a
lane verb at all, whatever you tell it.

What happened on i37's verification. The tester was handed the lane rule in
full: the verbs, the argument names, the root-relative path rule, the
read-only limit. It answered `No matching deferred tools found` for every
`se_` verb. Its native Bash and Read were not blocked, and it used them.

So the warning above prepares for the wrong failure. The real case is a child
that knows about a cage it is not in.

WHAT TO TELL A SUBAGENT INSTEAD, until the lane reaches children:

- Say the paths are root-relative to the project root, and that it reads with
  its NATIVE tools.
- Say it may not write, unless you meant it to.
- Say the lane exists and that it cannot drive it. A child that has been told
  to use `se_` verbs wastes its first calls discovering they are absent.

WHY IT MATTERS BEYOND CONVENIENCE. Fresh eyes see a DIFFERENT PROJECT than the
walk does. Four things are missing from theirs.

- no state gate
- no narration toll
- no typed refusals
- no call log

Every finding a subagent makes about LANE BEHAVIOUR is second-hand by
construction.

So weigh a subagent's lane findings accordingly, and re-check the ones that
matter by driving the verb yourself. On i37 the tester's findings were good
and two of them rested on reading `deliverable/engine/tools-file.ts` rather than on calling it.

## Two hands, and the log has to be able to count them apart

THE OWNER'S NAMING, 2026-08-20. A WALKER does the daily work — pulling, reading,
filling, submitting. A GUIDE is asked for the occasional step the walker will
not take alone: a question, a comparison, a decision.

THE STRONG HAND IS NOT THE ONE THAT PULLS. Paying a strong model to call
`se_pull` two hundred times is the arrangement this is meant to avoid, and an
arrangement where the strong model walks and the weak one advises is the same
waste with the labels swapped.

EITHER HAND MAY WORK THE LANE. Nothing bars a guide from pulling or filling.
Where a step is the guide's, the guide can do it, and the lane sees the guide.

SAY WHICH YOU ARE. Every lane tool takes `as`. Omit it and the record says
`walker`, which is right for the hand holding the session. A guide says
`as: "guide"`, because a default of `guide` would let the strong hand's work
hide in the weak hand's count.

AND WHEN YOU CARRY A GUIDE'S ANSWER BACK, say `as: "guide"` and
`relayed_by: "walker"`. Filing a delegate's judgment under your own name
erases exactly what the coordinate is for, and it is the cheaper path — which
is why `raid-risk-a-relayed-judgment-is-filed-under-the-hand-that-relayed-it`
stands at expected.

NOTHING CHECKS ANY OF THIS. One dispatcher serves every agent, so the lane
cannot tell two hands apart on its own, and the record marks both values as
claims.

## Which model

JUDGE IT PER SUBAGENT. There is no fixed mapping and
none should be invented.

- MECHANICAL WORK rides a lower tier. Counting, collecting, listing, reading
  a file set and reporting what is in it.
- JUDGMENT WORK inherits the session model. Verdicts, comparisons, red teams,
  anything whose answer routes later work.

THE TEST IS WHAT THE ANSWER DOES. An answer somebody acts on without checking
is judgment, whatever the task looks like.

## After an interrupt, check who is still alive

A PERSON'S INTERRUPT KILLS RUNNING BACKGROUND AGENTS. It is a harness side
effect rather than anything the method asks for, and nothing announces it.

So after any interrupt:

- Pulse-check every agent you believe is still running.
- Relaunch the ones that died.
- Give a relaunched agent a preamble saying what already happened, so it does
  not redo the work its predecessor finished.

A SILENTLY DEAD AGENT IS WORSE THAN A FAILED ONE. You wait for a report that
is never coming, and the work it was holding is lost without a message.

## Tell a drafting subagent what will be checked

A READER THAT HAS JUST READ SOMETHING WRITES IN ITS WORDS. That is not a flaw
in the reader; it is what reading does.

SO WHERE A SUBAGENT DRAFTS TEXT THAT A GUARD WILL CHECK, name the guard in the
brief. Say what will be compared, and against what.

MEASURED at i9's onboard-retro, 2026-08-19: eight drafted statements were
refused under SE-C-140 and rewritten by hand. Every one echoed the note it came
from, and the briefs had said to write fresh without saying what would be
measured.

## What a subagent's narration does to yours

A SUBAGENT'S LANE CALLS RIDE YOUR DECISION GRAPH. Its `update` ops land on the
checklist you opened, and its non-resolving updates count toward your stall
counter under SE-C-133.

MEASURED at i9's onboard-retro, 2026-08-19: five readers running at once
pushed the parent's counter from two to nine without the parent making a
single update of its own, and three nodes appeared on the parent's checklist
that the parent never planned.

SO TELL A READER NOT TO NARRATE. A subagent that only reads has nothing to
narrate anyway, and the toll is the parent's to pay.
