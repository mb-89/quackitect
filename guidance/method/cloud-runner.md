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

## Arrival A: no `se_` tools, and that now means something is wrong

THE LANE IS IN GIT. `.mcp.json` and `.claude/settings.json` are both committed,
and `.mcp.json` names a stdio server the client spawns itself through
`se-mcp-boot.mjs`, which installs dependencies before it imports anything. So a
fresh clone SHOULD arrive with the lane attached and the cage on.

THIS SECTION USED TO SAY THE OPPOSITE, and it was true until 2026-08-20.
`.claude/settings.json` was tracked while `.mcp.json` was not, so a cloud clone
got the cage and no lane: every native tool denied, and nothing to replace
them. Committing both is what fixed that.

SO NO `se_pull` IS A BROKEN BOOT, NOT AN EXPECTED STATE. The arrival's own last
line names which check failed.

DO NOT WALK THE MACHINE LIKE THIS. An uncaged agent editing the repository
directly is the one thing the contract forbids, and nothing here will stop
you, because the thing that would stop you is what is missing.

THE COMMAND BELOW STILL REPAIRS IT, and it is what to run before anything else.

## ONE COMMAND DOES ALL OF IT NOW

    node deliverable/engine/bin/se-arrive.ts

THAT IS THE WHOLE ARRIVAL, and it takes no arguments. It fetches the refs,
checks the runtime against the pin, installs, places the cage, projects the
prompt layer, starts the lane headless, and writes `.se/se-call.mjs` so you can
call the lane with no `se_` tools of your own. It is idempotent: run it twice
and the second run reuses the lane already up.

NOTHING HAS TO BE SET FOR THE WALK TO FINISH. The lane rests one rung above a
gate, so an unattended run can bless its own and keep going. That rung is the
engine's own default and it is the same everywhere.

THE ROOT `.claude/settings.json` FIRES IT AT SESSION START, so on most cloud
hosts it has already run before you read this. `SE_NO_ARRIVE=1` opts out.
`SE_AUTONOMY` and `SE_STOP_AT` still override the two dials for anyone who
wants LESS than the default; neither is needed to get a run through.

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

2. INSTALL. `npm install --no-audit --no-fund` in `deliverable`.
   `node_modules/` is gitignored, so a fresh clone has none and the server
   cannot start without it.
3. CHECK THE RUNTIME. `node --version` against `engines.node` in
   `deliverable/package.json`. Below the pin, stop and say so.
4. PLACE THE CAGE AND THE CONFIG, both from `deliverable/cage/`.
   - `mcp.json` goes to `.mcp.json`
   - `claude-settings.json` goes to `.claude/settings.json`
5. SPAWN A CAGED SUBAGENT and give it the walk. `deliverable/cage/kickoff.txt`
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

    node deliverable/engine/bin/se-start.ts --repo <url> --iteration <id>

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

### You have the autonomy, and you use it

YOU BLESS YOUR OWN GATES. Send `bless` with the submit and read the answer. The
person is not coming to press it, and a gate left unblessed stops the whole run
for nobody's benefit.

YOU MAKE THE DECISIONS a step asks for. Sizing, scope, which option wins: these
are the walk's questions and they are yours here. Record the reasoning in the
form, which is where a reader will look for it.

YOU RUN UNTIL SOMETHING BLOCKS YOU. Not until something is uncertain, and not
until something is large. A block is mechanical: the machine refuses, or no
answer you could give would let the walk continue.

A REFUSAL NAMING TWO RUNGS IS A BOOT FAULT, never a sanctioned stop.

WHAT IT MEANS: the lane came up at a rung that cannot finish the job it was
given. Nobody on this box can move the dial. The agent may not, and there is no
person to press the slider.

THIS OVERRIDES RULE 3 HERE, and only here. On a laptop a step above the dial is
the person's and stopping is right, because they are sitting there. On an
unattended box the same stop is a dead run.

SAY SO AT THE TOP OF THE FIELD REPORT, naming both rungs and the gate that
refused. Then carry on with whatever does not need that gate. Where the gate is
the FIRST one, there is nothing left to carry on with — say that plainly rather
than filing it as a stop somebody chose.

IT SHOULD NOT HAPPEN ANY MORE. The lane rests one rung above a gate, so an
unattended run blesses its own and carries on. A two-rung refusal now means
something LOWERED the dial — an `SE_AUTONOMY` in the environment, or a hand on
the mirror — and the report should say which.

MEASURED ON THE i51 CLOUD RUN, BEFORE THAT CHANGE: the kickoff gate was filled
and signed, the bless was refused for want of authority, the agent read this
paragraph, and the run ended with one gate between it and the work.

### Fix what you find on the way

SEE SOMETHING BROKEN THAT YOU CAN FIX? Fix it. A cloud run that walks past a
one-line defect to protect its scope has cost more than it saved.

THE LIMIT IS THE CONTRACT'S, unchanged: a defect in the work under your hands
is the work, and a stray elsewhere is a note. What is new here is only that
nobody is available to bless the difference, so you judge it.

### Work on trunk

A RECORD IS A FOLDER ON TRUNK, and a clone that has trunk has every record.
You do not need a branch of your own to work in, and you should not make one.

ONE AGENT WORKS ONE CLONE. That is what replaced the claim system, and it is
why no branch is needed to keep two agents apart.

### Write a field report, and it does not go in git

THE FIELD REPORT IS YOUR REPORT FROM OUTSIDE THE MACHINE: what the walk felt
like, what fought you, what the guidance failed to tell you. It is the one
thing the call log cannot produce.

IT IS NOT A CORPUS DOCUMENT and it is not committed. Write it to
`.se/field-report.md`, and PRINT IT IN FULL as your closing message.

PRINT IT EVEN IF YOU ALSO WROTE IT. The machine you are on goes away, and
`.se/` goes with it. The message is the channel that reaches a person, so the
file is the convenience and the message is the delivery.

### Run a retro before you finish

NOTES ARE MACHINE-LOCAL. `.se/notes.jsonl` is not committed, so every note you
captured tonight dies with this machine unless a retro moves it into the repo.

SO THE RETRO IS NOT OPTIONAL HERE. It is what carries the run's findings home.
Drain what you can judge, and put what needs the owner into the field report by
name.

THE RETRO'S FIELD-FEEDBACK QUESTION IS A STOP ON A LAPTOP AND NOT HERE. Ask it
into the field report and keep going. Waiting for an answer nobody is present
to give is the stall this whole card exists to prevent.

## Five rulings a cloud runner needs and a laptop does not

### 1. Nothing survives but what is committed

THE CONTAINER IS CLONED FRESH and reclaimed when it goes idle. Nothing is
waiting for you:

- no previous session
- no leftover config
- no warm `node_modules`
- no `.se/` state

SO ANYTHING THE BOOT DEPENDS ON IS A COMMITTED FILE. A file a hook writes at
startup is not configuration. It is too late for anything the client reads
first, and the client reads its MCP server list first.

THIS WAS PAID FOR ONCE. `.claude/settings.json` was tracked and `.mcp.json` was
not, so a cloud clone got the cage and no lane: every native tool denied, and
nothing to replace them. Both are tracked now.

### 2. No `se_pull` tool means the lane never attached

CHECK IT ON YOUR FIRST TURN. Look for `se_pull` by name.

IF IT IS NOT THERE, three things follow.

- STOP. Do not improvise a way in.
- DO NOT READ THE PROJECT THROUGH THE HOST'S OWN TOOLS. Its GitHub verbs reach
  the repository, and using them is working outside the cage while believing
  you are following instructions. That is the failure rule 1 names.
- REPORT which check you ran and what it returned.

A MISSING LANE IS NOT A PUZZLE TO SOLVE FROM INSIDE. It is a broken boot, and
the boot's own verdict line says so.

### 3. The host's standing instructions conflict with the contract

Rule 1 already names the "prefer native tools" line. A cloud host injects more,
and each needs its ruling so you are not adjudicating alone at midnight.

- A STOP HOOK DEMANDING COMMIT AND PUSH. The contract says the machine commits,
  not you. THE CONTRACT WINS. Let the hook complain.
- AN ASSIGNED BRANCH AND PULL-REQUEST DISCIPLINE. The machine owns git and a
  record is a folder on trunk. Work on trunk, and say in the field report that
  the host wanted a branch.
- SUBAGENTS MAY BE DENIED. Rule 11 says they are yours to spawn, and it cannot
  make a host allow them. A permission classifier has denied the Agent tool on
  a real run. Where a state's guidance says to spawn one, do that work inline
  and SAY THAT YOU DID.

### 4. A subagent cannot attach a server its parent lacks

MCP SERVERS ATTACH PER SESSION, and a subagent inherits its parent's set. So an
uncaged agent cannot start the lane and hand it to a caged subagent inside one
session. That design does not work and never did.

THE WORKING SHAPE IS TWO SESSIONS. One prepares the repository; the next starts
with the lane attached and the cage on. On a cloud runner the preparation is
committed rather than performed at startup, which is ruling 1 again.

### 5. Push is yours here, and only here

THE LANE KEEPS PUSH WITH THE PERSON EVERYWHERE ELSE. On a cloud run there is no
person, so the run pushes what it produced.

CHECK WHAT THE GIT VERB ACTUALLY ALLOWS before relying on this. If it refuses,
that is a finding for the field report, not a reason to reach around it.

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

    node deliverable/engine/bin/se-mcp.ts --version

IT PRINTS THE VERSION AND EXITS 0, and it does that before it resolves a root,
so it answers on a checkout too broken to start. Pass a root that does not
exist and it still answers. On an unattended machine this is the first fact
worth having, because every later report is about SOME build and a report that
does not say which one is hearsay.

### The host refused it before the lane ever saw it

A REFUSAL WITH NO CLAUSE AND NO REMEDY IS NOT THE LANE'S. Every lane refusal is
typed, and carries four things:

- the clause
- what was expected
- what it got
- the exact call to make instead

A denial carrying none of those came from the HOST's own permission layer,
above the lane. The engine never heard the call at all.

HOW TO TELL, and it takes one call. Pull again. The lane's own refusals leave
the walk exactly where it was and say why; a host denial leaves the walk
untouched and the pull answers as though nothing was tried, because nothing
was.

THERE IS NO REMEDY TO FOLLOW, so do not hunt for one. Nothing in
`guidance/refusals.md` covers it, and re-sending the same call reaches
the same layer.

WHAT TO DO: say plainly which call was denied and by what, capture it with
`se_note`, and treat it as a stop of the third kind — something broke and no
remedy gets you past it. On an attended machine the person can widen the
permission. On an unattended one the note is the whole record.

MEASURED 2026-08-19: a walk at `tactical` reached a kickoff gate whose bless
was its to give, sent `form: {"bless": true}`, and the host denied it. The
agent read the denial as the engine's and reported the gate as the owner's.
It was not; nobody had refused it.

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
- CAPTURE EVERY STRAY with `se_note`, AND KNOW WHERE IT LANDS. `.se/notes.jsonl`
  is machine-local and never committed, so on this box a note is a scratchpad
  entry that dies when the container is reclaimed. It is still worth writing:
  the retro drains it, and a retro before the run ends carries it home.
- WHAT MUST OUTLIVE THE BOX GOES IN THE FIELD REPORT TOO, in the same breath.
  A question you could not ask is a note AND a line in the report.
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
