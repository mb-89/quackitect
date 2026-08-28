---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-issue-the-lane-is-not-in-git-so-a-cloud-agent-starts-uncaged
type: "[[raid]]"
kind: issue
statement: The MCP config and the cage are placed by the editor and never committed, so an agent handed a branch on a cloud host has no lane, no cage and no voice.
owner: the owner
status: open
impact: An agent that does not know the pattern falls back to native tools and edits the repository directly. Nothing is logged, no state advances, and it looks busy the whole time. An agent that DOES know the pattern bootstraps itself in four acts and loses only the time.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - req-one-command-starts-an-unattended-machine
  - nbr-cloud-host
  - sty-work-on-two-machines
---

The owner's actual cloud shape is not the one i28 built for. A session starts
with an agent ALREADY RUNNING, it is handed an iteration branch, and chat is
the only interface. Nobody types a command, because there is nowhere to type
one.

## What is missing from a fresh checkout

`.gitignore` lines 25 to 31 state the cause in its own words: "placed by the
extension into the OPENED folder from _cage/ — never committed".

- `.mcp.json`
- `.claude/settings.json`
- `.claude/output-styles/`
- `.copilot/`
- `.github/instructions/protocol.instructions.md`

CHECKED ON A LIVE TREE rather than read off the file. All four candidate paths
answer false: `.mcp.json`, `.claude/settings.json`, `.mcp.json` and
`.claude/settings.json`.

## The pattern that works, and it downgrades this entry

OWNER, 2026-08-15: "Last time the agent in the cloud then spawned a subagent
that was caged. That works."

SO THE ARRIVING AGENT BOOTSTRAPS ITSELF. It installs, places the cage and the
MCP config out of `deliverable/cage/`, then spawns a caged subagent
and hands it the walk. The subagent has the lane, so it has the cage, the log
and the state machine.

THIS ENTRY WAS FIRST GRADED FATAL and that was wrong. A working pattern
existed and the owner had already used it. The grading is corrected to
corrosive rather than quietly edited, because a false judgment routes real
work.

WHAT ACTUALLY STANDS is narrower and still real: NOTHING POINTS AN ARRIVING
AGENT AT THE PATTERN. It is now written in
`guidance/method/cloud-runner.md` under "Arrival A", and an agent with
no lane can still read that card with its native tools. What no mechanism
does is TELL it to. Today a person says so in chat.

A SECOND, SMALLER THING: `.gitignore` names the templates as living in
`_cage/`. They live in `deliverable/cage/`. The comment is
stale and would send a reader to an empty path.

## Why it bites at all

NO `.mcp.json` MEANS NO `se` SERVER. The agent's first act is `se_pull`, and
the verb does not exist.

NO `.claude/settings.json` MEANS NO CAGE. Read, Write, Edit and Bash are all
unblocked, so the agent has a way to work and it is the wrong way.

THE TWO ABSENCES COMBINE INTO THE WORST CASE. Separately, a missing server
would stop the agent dead and a missing cage would be harmless. Together they
produce an agent that cannot reach the lane and is free to edit the
repository, which is the one outcome the contract exists to prevent.

IT FAILS SILENTLY. There is no refusal, because a refusal needs the lane that
is missing.

## Two more things break behind it

THE ENGINE DOES NOT BIND FROM A BRANCH. An iteration is bound to its own
worktree, created by `git worktree add` at `engine/iterations.ts:158`. The
bound record is set by an explicit act at `engine/session.ts:1278` and
`:1411`. A search of the engine for anything reading the checked-out branch
finds nothing. A cloud session is one checkout already on `it/...`, and the
engine has no way to notice.

THE INSTALLER IS WINDOWS-ONLY. `RUNME.ps1` is the real entrypoint — preflight,
cage install, selftests, then the caged agent — and it is PowerShell. There is
no Linux equivalent.

`node_modules/` is gitignored, so an install has to run before any server can
start.

## What i28 built, and why it does not answer this

`se-start.ts` assumes it spawns the agent as its LAST step. Here the agent is
already running before anything places a cage, so the launch step sits at the
wrong end of the sequence.

THE HALF THAT IS ACTUALLY NEEDED is the cage-and-config placement, which is
the editor's job today, performed without an editor. The other six steps are
either already done by the host or not applicable.

NOT REWORKED, ON THE OWNER'S INSTRUCTION (2026-08-15): "if that breaks,
anything tell me. but don't rework it. We'll see if the agent can figure it
out." This entry is the telling. The design is deliberately left open.
