---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: level zero as module
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: level0
# tokens that have to close before this can start
depends_on:
  - "[[wk-5348ca673f]]"
  - "[[wk-1dbf235c91]]"
---

## detail

Level zero becomes a plugin whose hooks are a module, and the engine's tools are registered inside the harness process rather than served by a spawned server.

The shape and the measurements are [[level-zero-is-a-module]]. What that document settles and this token builds: a module under a plugin's hooks folder, `export const register`, `$.tool.register` at `session.start` for every tool the lane serves today, and a `tool.call` hook per registered name that hands the call to the engine.

Two facts decide the packaging. A folder loaded with `--plugin-dir` is a different identity from the same folder discovered in a skills directory, and enable state and usage attach to the identity rather than the folder. And `enabledPlugins` in the tracked cage enables the plugin with no click, on a desk box and on a cloud box alike.

It speaks ONE grammar, the one [[wk-1dbf235c91]] settles, and reaches the engine over that door. A module speaking the hook shape for decisions and the lane shape for verbs would carry the drift inside itself, which is why this waits on that token.

The lane keeps running. Nothing is removed here.

## approach

The plugin lives in the tree and is written by the installer. The tracked `.claude/settings.json` names it under `enabledPlugins`, so a clone is guarded on its first session with nothing typed.

The module registers one tool per verb the lane offers and serves each from a `tool.call` hook that calls the engine. A registered tool answers a string or an array, never an object.

The module holds no rules. Every decision it takes it takes by asking the engine, so the two doors do not drift while both exist.

One identity is chosen and written down, and the installer uses only that one.

A plugin loads once per process at session start, so this token cannot verify itself from the session that does the work. The script is the scaffolding that stands in for that, and it follows `se --swap`'s own rule: a build that does not answer is not installed.

It is cheap on purpose. `--init-only` takes no turn, so the probe costs a process start and nothing else, and it runs twice in the life of this bucket rather than on every battery.

## done when

- every verb the lane serves is registered by the module and answers the same as the lane does: a test that calls each through both and compares
- a session started from a clean clone holds the tools on its first turn, with nothing enabled by hand: the tools are listed in a fresh session on a box that has never seen this tree
- THE SESSION THAT INSTALLS IT CANNOT SEE IT, so a script proves it instead: `claude --init-only` starts the harness with no model call, and the script asserts the module's stamped line is under .se afterwards. It is SCAFFOLDING and is NOT in the battery: one consumer, the two deletion tokens, called there and nowhere else
- whether a plugin's session.start fires under `--init-only` is answered by running it: if it does not, the token says so and names what the fallback costs, which is one model call per run and a stop hook that will demand a claim the probe cannot make
- a tool answers a string or an array and never an object: the tool.call hook is read back in a test
- the identity the installer uses is named in the tree and used nowhere else: a search that answers one spelling
- the lane still answers everything it answered before: `sh util/checks/battery.sh` stays green

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | a tool cannot arrive late, so a class of failure that has cost six cloud sessions stops being a race and becomes impossible | [[level-zero-is-a-module]], the measured section |
| [x] | what breaks if it is never done, and not only that it stays undone | the cold-clone repair stays 25 KB of code that wins a race the harness sets, and four capabilities that need a module stay unreachable | src/cage/mcp-lane.mjs and its header |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | the approach names the module, the enable key, the result shape and the identity rule before any work | the approach section |
| [x] | every done-when line is decidable, and names the command where one decides it | each line names a test, a listing or a search | the done when section |
| [x] | the change is small enough to review whole, or it is split first | one plugin, one module, one settings key. Nothing is removed here | the detail's last line |
| [x] | the basics it stands on exist, or are minted first | the tools exist in the lane, the cage is projected, and the installer writes files | [[level-zero-is-a-module]] |

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
