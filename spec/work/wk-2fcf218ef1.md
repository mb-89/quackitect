---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the lane is retired
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: level0
# tokens that have to close before this can start
depends_on:
  - "[[wk-5d193fcbc1]]"
---

## detail

Once the module registers the tools, `src/cage/mcp-lane.mjs` serves nothing.

It is 25 KB that exists for one reason: `.mcp.json` is read and the server spawned before `SessionStart` runs, with thirty seconds to answer `initialize`, and a cold clone spent those thirty seconds compiling. It answers the protocol from a committed snapshot while the build runs behind it. With the tools in the harness process there is no spawn to lose.

THE RISK IS ACCEPTED. The plugin API says in its own declarations that it may change between releases without notice, so a change there takes level zero out on every box at once. RULED: the lane comes out now rather than waiting for the surface to leave early access. What a box falls back to if the API moves is git, and the fallback is a revert rather than a file kept warm.

STDIO GOES WITH IT, AND SO DOES src/mcp. The only MCP client the engine has ever had is the harness, through the lane. The module replaces that, no foreign client has ever connected, and Copilot is out by ruling. A door with no consumer is not kept.

Goes with it: `.mcp.json`, `src/cage/mcp.json`, the tool lane projection entry, the cold stub and its snapshot, the checks that hold them, and `src/mcp` — 2472 lines of Go, eight test files, its own go.mod and one build target.

WHAT IS LOST, SAID ONCE. The harness-native tools have no fallback after this: a module that fails to load leaves a session without them, and the way back is a revert rather than a switch. It does NOT leave a box stranded. RUNME needs no lane, and `./RUNME.sh pull`, `run`, `apply` and `--answer` are the same calls a lane makes. So the loss is a degrade to shell verbs, not a stop.

## approach

NOTHING HERE IS REMOVED UNTIL THE MODULE PROBE IS GREEN ON THIS BOX. [[level-zero-is-a-module]] says why and in what order.

Remove the projection entry first, then the source, then the lane and its snapshot, then every check and comment that names them. The battery names what is left.

None of it touches the running session: the server was spawned at session start and keeps running, and a deleted source leaves a built binary alone until the next build. So this token is safe to finish in the session that works it.

Then src/mcp and its build target, last, because until the module is proven it is what a box falls back to.

## done when

- the module probe was green on this box before anything was removed: the script's own answer, quoted
- no file outside .se and _to_delete names the lane or src/mcp: a search from the root that answers nothing
- nothing builds an MCP binary: the build produces one program fewer, and the manifest says so
- a fresh clone holds the tools with no MCP server configured: the tool list of a first session on a clean box
- the projection writes no .mcp.json: `se --project` on a clean tree leaves it absent
- the tree is sound after the removal: `sh util/checks/battery.sh` is green, the cage-cites check included

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | 25 KB of repair for a race that no longer exists comes out, and one of the four grammars that reach the engine goes with it | src/cage/mcp-lane.mjs header |
| [x] | what breaks if it is never done, and not only that it stays undone | two doors to the same tools stay in the tree and drift, which two of the four grammars have already done once | [[one-core-many-satellites]], what is true today |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | the approach fixes the order and names what the battery holds | the approach section |
| [x] | every done-when line is decidable, and names the command where one decides it | each line names a search, a listing or a command | the done when section |
| [x] | the change is small enough to review whole, or it is split first | one removal across named files | the approach section |
| [x] | the basics it stands on exist, or are minted first | the module registers the tools first, which is why this depends on that token | the depends_on field |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | the change follows the approach on the token, or the token says why it departed |  |  |
| [ ] | se test --on this token answered ok, and what it ran is named |  |  |
| [ ] | the note says what changed and why, for a reader who was not here |  |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |
