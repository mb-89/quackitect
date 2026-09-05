---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: no lane no move
# where the token stands. The process owns these values.
status: open
claimed_by: 547b9365/worker-ash
claimed_at: "2026-09-05T15:15:33Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 97cac68841e678e6a0166277a3f36196ab2de400
---

## detail

A SESSION WITH NO TOOL LANE CAN PULL WORK AND THEN DO NONE OF IT. Measured here: the quackitect MCP server answered CONNECTION_CLOSED at start, so this session has no se_ tools. ./RUNME.sh pull --actor worker-bravo --role worker went through and handed over wk-0086ed9e9b. Nothing after it can. The write gate refuses Bash whatever the agent holds, and theRefusal in src/engine/gate.go names the way out as an echo of the command piped into se run. That command is refused by the same gate: runsTheEngine in src/engine/hook.go wants the engine as the first word and no unquoted pipe, and a pipe fails both. Refused here verbatim, an echo of the word ls piped into ./RUNME.sh run --on wk-0086ed9e9b --by worker-bravo. se run and se apply read their payload only from standard input, and neither has a flag that carries it. Standard input can only be filled by a pipe or a redirection, and both are what take a command out of the exception, so there is no third way. What is left open is reading. pull, find, test, work, stop and claim take flags and go through. Every verb that runs a command or writes a file does not. The check refusals-name-a-door.mjs misses this, because it fires only on sentences matching se underscore a tool name, and these two say se run and se apply with a space.

## proposed action

A refusal names a command the gate admits, and the gate is the judge of that rather than a reader. Give se run and se apply a flag carrying the payload as a path, so the whole call is one word with the engine first. The scratchpad carve-out already fits: insideTheScratchpad in src/engine/gate.go lets the harness's own Write put a file under .se/scratchpad with nothing in hand. se run gains --from PATH, read whole as the command. se apply gains the same, read whole as the manifest. Standard input stays what it is for the lane. Then theRefusal says that, through theShellDoor the way every other refusal does. And a check holds them together: a-refusal-names-a-legal-move.mjs takes every command a refusal in src/engine offers, in the shape it prints, and drives it through the gate's own reading. A suggested command the gate refuses is the failure.

## done when

- a command written under .se/scratchpad runs through the engine from a no-lane shell, decided by: ./RUNME.sh run --on ID --by NAME --from .se/scratchpad/cmd.txt answers exit 0 for a cmd.txt holding the word ls
- a manifest written under .se/scratchpad applies through the engine from a no-lane shell, decided by: ./RUNME.sh apply --on ID --by NAME --dry --from .se/scratchpad/manifest.json answers ok
- --from names a path inside the scratchpad only, decided by: the same call naming a path that climbs out of it is refused and says why
- every command a refusal in src/engine offers is one the gate admits, decided by: the new check a-refusal-names-a-legal-move.mjs, run from the root, exits 0
- that check was seen red first against gate.go as it stands, and the command it named red is the piped se run line in theRefusal
- the existing check refusals-name-a-door.mjs still exits 0
- the battery reports no new failure against the run before the change

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the approach is on the token before any work, as an interface or a shape a reader can disagree with |  |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the change is small enough to review whole, or it is split first | — |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

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

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

