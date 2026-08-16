---
id: cloud-runner
statement: "What to do when you are the agent on a cloud machine: how you got started, what to check, and what to do when a step fails."
applies_to:
  - boot
  - front_desk
---

# cloud-runner — you are on a machine nobody is watching

READ THIS IF NOBODY IS SITTING BESIDE YOU. On a laptop a person notices when
something stalls. Here nothing does, so the rules below replace them.

## First: which of the two arrivals is yours

THERE ARE TWO WAYS TO BE HERE and they need different first acts.

ARRIVAL A — A CLOUD SESSION HANDED YOU A BRANCH. Nobody ran a command.
You are a chat session with a checkout, and this is the common case.

HOW TO TELL: you have no `se_` tools. Try `se_pull` and it does not exist.

ARRIVAL B — SOMETHING RAN THE ENTRYPOINT. Seven steps printed above you and
the lane is already up. `se_pull` exists.

IF YOU ARE ARRIVAL B, skip to the next section. If you are Arrival A, read on.

## Arrival A: you are not caged yet, and that is expected

THE LANE IS NOT IN GIT. `project/.mcp.json` and `project/.claude/settings.json`
are placed by the editor and never committed — `.gitignore` says so. A fresh
clone has neither, so you start with your native tools and no `se` server.

DO NOT WALK THE MACHINE LIKE THIS. An uncaged agent editing the repository
directly is the one thing the contract forbids, and nothing here will stop
you, because the thing that would stop you is what is missing.

YOUR JOB IS TO MAKE THE CAGED WALK POSSIBLE, then hand the walk over. Four
acts, in order.

1. INSTALL. `npm install --no-audit --no-fund` in `project/deliverable`.
   `node_modules/` is gitignored, so a fresh clone has none and the server
   cannot start without it.
2. CHECK THE RUNTIME. `node --version` against `engines.node` in
   `project/deliverable/package.json`. Below the pin, stop and say so.
3. PLACE THE CAGE AND THE CONFIG, both from `project/deliverable/cage/`.
   - `mcp.json` goes to `project/.mcp.json`
   - `claude-settings.json` goes to `project/.claude/settings.json`
4. SPAWN A CAGED SUBAGENT and give it the walk. `project/deliverable/cage/kickoff.txt`
   is its opening instruction. It runs with `project/` as its folder, which is
   what the placed config expects.

THE SUBAGENT WALKS AND YOU DO NOT. It has the lane, so it has the cage, the
log and the state machine. You relay what it reports.

THIS PATTERN HAS WORKED BEFORE (owner, 2026-08-15). It is the answer to being
uncaged, and it is not a workaround.

WHY NOT JUST CAGE YOURSELF: a settings file placed after your session started
does not bind you. A subagent spawned afterwards reads it on the way in.

## Arrival B: how the entrypoint got you here

THE HOST CLONED THE REPOSITORY, then ran one command:

    node project/deliverable/engine/bin/se-start.ts --repo <url> --iteration <id>

THE CLONE COMES FIRST because this file lives inside the repository. Nothing
can run it before a clone exists.

IT RAN SIX STEPS. Each one prints `<step>: <what happened>` and exits
non-zero naming itself if it fails.

| step | what it did |
| --- | --- |
| verify | checked node against `engines.node`, and this checkout's origin against `--repo` |
| install | installed the project and nothing else |
| start | spawned the lane and RETURNED |
| wait | polled the mirror until it answered |
| fetch | fetched refs, so this clone has trunk and every record on it |
| launch | placed the cage, then started you with the briefing |

THERE WAS A SEVENTH, `adopt`, AND i34 DELETED IT. It claimed the iteration for
this machine, so two machines could not walk one record. The whole claim
system is retired: a record is a folder on trunk, a clone that has trunk has
every record, and one agent works one clone.

YOU DO NOT RE-RUN ANY OF THIS. It already happened. If you are reading this,
the lane is up and the iteration is yours.

THE AGENT COMMAND DEFAULTS TO `claude`. A host running something else passes
`--agent <cmd>`.

## Your first act is the same as everywhere

CALL `se_pull` WITH NO PAYLOAD. Everything else follows from what it answers.

THE CONTRACT BINDS HERE EXACTLY AS IT DOES ANYWHERE. You work through the `se`
lane, you do what the machine tells you, and every call is logged. Nothing
about being in the cloud loosens that.

## What is different here, and only this

NOBODY WILL NOTICE A STALL. On a laptop a person sees a stuck walk.

Here the only evidence is the call log. Narrate as you go.

NOBODY WILL ANSWER A QUESTION TONIGHT. Where you would normally stop and ask,
capture a note with `se_note` and keep walking.

The retro reads every note. A question you could not ask is a note.

THE DIAL IS STILL THEIRS. A step weighing more than the dial still stops you.

Say which step waits, plainly, and stop. The log carries it.

## When something fails, look here first

### The lane is not answering

THE `start` STEP SPAWNS THE LANE AND RETURNS. Measured on both platforms: the
entrypoint comes back in about 74 ms while the lane keeps running.

THE DETACH IS NOT WHAT MAKES IT RETURN, and an earlier version of this card
said it was. On POSIX the detach puts the lane in its own process group, so a
closing session does not take it down. Windows has no process group to ask
for, and detaching there opens a console nobody is present to see.

WHETHER A POSIX HOST REAPS THE LANE ANYWAY is still owed. It needs a host the
developing machine cannot make.

THIS IS THE BRANCH THAT HAS NEVER RUN. Every machine that has run this engine
was Windows, so the POSIX path is written and unexercised
([[exp-the-posix-branches-have-never-run]]). If the lane is not answering,
that is where to look, and it is a finding rather than a surprise.

### The engine will not start at all

CHECK THE RUNTIME FIRST. The engine spawns every script as `node <file>.ts`
with NO flag, so it needs a node where unflagged TypeScript execution is the
default.

THE PIN IS IN `package.json` under `engines.node`, and the verify step reads
it rather than carrying a copy. A syntax error deep in a spawned script almost
always means the runtime is below the pin.

### Another machine may be walking the same record

NOTHING STOPS IT, AND NOTHING IS MEANT TO. There is no claim, no lock and no
holder to name. i34 retired the whole mechanism on the owner's ruling: "it's
just two agents on two different clones."

WHAT STANDS INSTEAD IS AN ASSUMPTION WITH A TRIGGER,
[[raid-asm-only-one-agent-works-a-clone-at-a-time]]. Its trigger is the first
time two agents are asked to work the same checkout.

SO THE DIVISION IS THE PERSON'S. If you were handed a record, it is yours
because somebody said so, not because you took it.

IF YOU SUSPECT A SECOND MACHINE IS ON YOUR RECORD, leave a note saying which
record and why you think so. Do not try to arbitrate it.

## What you must not do

- DO NOT REINVENT THE ENTRYPOINT. It exists, it is tested, and a second one
  would drift from the first.
- DO NOT EDIT `engines.node` TO MAKE VERIFY PASS. That turns a loud failure
  into a silent one.
- DO NOT WORK AROUND A REFUSAL WITH ANOTHER LANE. Every refusal carries a
  remedy; follow it.
- DO NOT PUSH. Pushing is the person's act, here as everywhere.

## What to leave behind

THE LOG IS THE ONLY WITNESS. Nobody watched you work, so what you record is
the whole account.

- NARRATE WITH `update` on the calls that change something.
- CAPTURE EVERY STRAY with `se_note`. A question you could not ask is a note.
- RECORD EVERY ANSWER with `se_answer`, even when the question came from
  yourself.

WRITE THE HANDOVER BEFORE YOU RUN OUT. `.se/HANDOVER.md` is what the next
session reads, and on an unattended machine it is the only thing that carries
context across.
