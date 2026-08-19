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

## Which model

JUDGE IT PER SUBAGENT (owner grant 2026-07-11). There is no fixed mapping and
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
