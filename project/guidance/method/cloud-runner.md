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

## How you got here

ONE COMMAND STARTED YOU:

    node project/deliverable/engine/bin/se-start.ts --repo <url> --iteration <id>

IT RAN SEVEN STEPS. Each one prints `<step>: <what happened>` and exits
non-zero naming itself if it fails.

| step | what it did |
| --- | --- |
| verify | checked node against `engines.node` in package.json |
| install | installed the project and nothing else |
| fetch | cloned, or fetched refs into an existing clone |
| start | spawned the lane and RETURNED |
| wait | polled the mirror until it answered |
| adopt | confirmed the named iteration's branch exists |
| launch | confirmed the cage template is present |

YOU DO NOT RE-RUN ANY OF THIS. It already happened. If you are reading this,
the lane is up.

## Your first act is the same as everywhere

CALL `se_pull` WITH NO PAYLOAD. Everything else follows from what it answers.

THE CONTRACT BINDS HERE EXACTLY AS IT DOES ANYWHERE. You work through the `se`
lane, you do what the machine tells you, and every call is logged. Nothing
about being in the cloud loosens that.

## What is different here, and only this

- NOBODY WILL NOTICE A STALL. On a laptop a person sees a stuck walk. Here the
  only evidence is the call log.
- NOBODY WILL ANSWER A QUESTION TONIGHT. Where you would normally stop and
  ask, capture a note with `se_note` and keep walking. The retro reads it.
- THE DIAL IS STILL THEIRS. A step above it still stops you. Say which step
  waits, plainly, and stop — the log carries it.

## When something fails, look here first

### The lane is not answering

THE `start` STEP IS THE ONE WITH A MEASURED HISTORY. It spawns the lane and
must RETURN, and the platform decides whether it can.

- POSIX detaches. `detached: true`, `stdio: "ignore"`, then `unref()`.
- WINDOWS DOES NOT. Measured 2026-08-15: a child sleeping 45 s held its caller
  for 45,600 ms with every flag set.

THIS IS THE BRANCH THAT HAS NEVER RUN. Every machine that has run this engine
was Windows, so the POSIX path is written and unexercised
([[exp-the-posix-branches-have-never-run]]). If the entrypoint hangs after
`start`, that is where to look, and it is a finding rather than a surprise.

### The engine will not start at all

CHECK THE RUNTIME FIRST. The engine spawns every script as `node <file>.ts`
with NO flag, so it needs a node where unflagged TypeScript execution is the
default.

THE PIN IS IN `package.json` under `engines.node`, and the verify step reads
it rather than carrying a copy. A syntax error deep in a spawned script almost
always means the runtime is below the pin.

### The claim did not land

WORK STARTS ANYWAY. If the remote is unreachable, the iteration list comes
from local refs and the walk enters without a claim, recording that the claim
did not land.

DESYNC IS ACCEPTED, not prevented. Two machines can hold the same iteration
if one of them was offline when it started. That is a known cost, ruled on
rather than overlooked.

### A claim is held by another machine

IT STAYS HELD. A claim does not expire and no timer takes it away — a machine
keeps its iteration however long it sits idle (owner ruling 2026-08-15,
[[raid-dec-a-claim-ends-only-when-a-person-releases-it]]).

SO DO NOT WAIT FOR IT TO CLEAR. Take a different iteration, or leave a note
saying which one is blocked and by whom.

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
