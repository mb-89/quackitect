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

## ONE COMMAND DOES ALL OF IT NOW

    node project/deliverable/engine/bin/se-arrive.ts --autonomy tactical

THAT IS THE WHOLE ARRIVAL. It fetches the refs, checks the runtime against the
pin, installs, places the cage, starts the lane headless, and writes
`.se/se-call.mjs` so you can call the lane with no `se_` tools of your own. It
is idempotent: run it twice and the second run reuses the lane already up.

THE ROOT `.claude/settings.json` FIRES IT AT SESSION START, so on most cloud
hosts it has already run before you read this. `SE_NO_ARRIVE=1` opts out;
`SE_AUTONOMY` sets the dial the lane comes up on.

AND THEN CALL THE LANE:

    node .se/se-call.mjs se_pull

THE FIVE ACTS BELOW ARE WHAT IT DOES, kept because a failed step has to be
fixable by hand and because the reasons matter.

YOUR JOB IS TO MAKE THE CAGED WALK POSSIBLE, then hand the walk over. Five
acts, in order.

1. FETCH THE REFS. A cloud clone carries ONE branch, and often a shallow
   one, so every `ref:` search is dead on arrival until you fix that.

       git fetch --all --prune
       git branch main origin/main
       git branch v2 origin/v2

   BOTH LINES, AND THE SECOND IS THE ONE PEOPLE SKIP. The fetch brings
   `origin/main`, and `git show main:...` still fails on it — a remote-tracking
   ref is not a revision named `main`. MEASURED 2026-08-17 on a fresh cloud
   clone: after the fetch alone, an `se_file_search` at `ref: main` still came
   back `unknown revision`; after `git branch main origin/main` it returned
   real matches. `main` reaches v1 and `v2` reaches v2.

   WHAT SKIPPING IT COSTS, measured on the i15 run: four refused calls, one
   wrongly-minted assumption, and a false claim that spread through six
   evidence forms before anybody caught it.

2. INSTALL. `npm install --no-audit --no-fund` in `project/deliverable`.
   `node_modules/` is gitignored, so a fresh clone has none and the server
   cannot start without it.
3. CHECK THE RUNTIME. `node --version` against `engines.node` in
   `project/deliverable/package.json`. Below the pin, stop and say so.
4. PLACE THE CAGE AND THE CONFIG, both from `project/deliverable/cage/`.
   - `mcp.json` goes to `project/.mcp.json`
   - `claude-settings.json` goes to `project/.claude/settings.json`
5. SPAWN A CAGED SUBAGENT and give it the walk. `project/deliverable/cage/kickoff.txt`
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

### You do not know which build you are on

ASK THE ENTRYPOINT AND IT ANSWERS:

    node project/deliverable/engine/bin/se-mcp.ts --version

IT PRINTS THE VERSION AND EXITS 0, and it does that before it resolves a root,
so it answers on a checkout too broken to start. Pass a root that does not
exist and it still answers. On an unattended machine this is the first fact
worth having, because every later report is about SOME build and a report that
does not say which one is hearsay.

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
  remedy; follow it. The push below is the one exception, and it is an
  exception the owner made in as many words.

## You must push before you finish (owner ruling 2026-08-19)

THIS CARD USED TO SAY "DO NOT PUSH. Pushing is the person's act, here as
everywhere." THAT WAS WRONG HERE, and the owner struck it: "A cloud iteration
needs to push back. This is part of it."

THE REASON IS THE ONE THIS WHOLE CARD IS ABOUT. On a laptop an unpushed commit
waits on a disk somebody owns, and the person pushes when they are ready.

HERE THERE IS NO SUCH DISK. The box is reclaimed and the clone goes with it, so
a commit that was never pushed did not happen. Work you do not push, you have
not delivered — you have thrown away.

SO PUSHING IS PART OF THE RUN, not something that follows it.

UNLESS THIS SESSION WAS TOLD NOT TO, and then it wins. This is the DEFAULT for
an unattended box, never a duty outranking the person who started the run. The
detail is in the last bullet below.

- PUSH WHAT YOU COMMITTED, to the branch you were given. If you were given
  none, push the branch you are on.
- PUSH BEFORE YOU REPORT, and push again after any later commit. A report
  describing commits nobody can fetch is worse than no report.
- THE LANE STILL REFUSES IT. SE-C-003 refuses every push without exception, so
  the push runs through the host's own git rather than through `se_git`, and
  it is the one act of the run that is not in the call log. Say so when you
  report.
- WHAT DOES NOT CHANGE: no force, no history rewrite, and no push to a branch
  you were not given. SE-C-002 stands untouched.
- A SESSION TOLD NOT TO PUSH DOES NOT PUSH. This ruling is about the DEFAULT
  on an unattended box, not a duty that outranks the person who started the
  run. Where the session's own instructions forbid a push, they win: say in
  the report that the work is committed and unpushed, and that the box takes
  it when it is reclaimed. Never push to prove a card right.

THE GUIDANCE AND THE ENGINE NOW DISAGREE, deliberately and temporarily. The
engine is the half that is wrong, and closing the gap is an iteration's work:
[[raid-iss-a-cloud-run-must-push-and-the-lane-refuses-it]].

## What to leave behind

THE LOG IS THE ONLY WITNESS. Nobody watched you work, so what you record is
the whole account.

- NARRATE WITH `update` on the calls that change something.
- CAPTURE EVERY STRAY with `se_note`. A question you could not ask is a note.
- RECORD EVERY ANSWER with `se_answer`, even when the question came from
  yourself.

WRITE IT DOWN AS YOU GO, BECAUSE THERE IS NO HANDOVER TO WRITE AT THE END
(owner ruling 2026-08-07). This card used to send the next session's context
to `.se/HANDOVER.md`. That file is gone, and boot now describes the last
session from the call log instead.

THAT MAKES THE THREE LINES ABOVE THE WHOLE ACCOUNT. An update nobody rode, a
stray nobody captured and an answer nobody recorded are lost when the box is
reclaimed. Anything that must outlive the run goes into guidance, a note or
the record, at the moment you think of it.
