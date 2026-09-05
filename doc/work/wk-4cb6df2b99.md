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
status: done
# who did the work step, so the verdict is never theirs
author: worker-ash
claimed_by: 547b9365/reviewer-quince
claimed_at: "2026-09-05T15:54:46Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 97cac68841e678e6a0166277a3f36196ab2de400
  - 9ae84e5a06fa096b09a62cac3479de6680d6f22c
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 37f4ab5a839ad4a8d42181da8e9fd9b4211ae4f6
---

## detail

A REFUSAL PRINTS A COMMAND THE SAME GATE REFUSES.

theRefusal in src/engine/gate.go offers two ways out. The first is the payload echoed into a pipe, with se run or se apply on the other side. The gate refuses that. runsTheEngine in src/engine/hook.go wants the engine as the first word and no unquoted separator, and a pipe fails both. Measured here: an echo of the word ls piped into ./RUNME.sh run --on wk-0086ed9e9b --by worker-bravo was refused verbatim. It is also the copyable line, printed above the prose, so it is the one an agent takes.

THE SECOND WAY OUT IS GOOD, AND IT ARRIVED AFTER THIS TOKEN WAS WRITTEN. theShellDoor names ./RUNME.sh run --command and ./RUNME.sh apply --edits. Both flags now exist, and the gate admits both. So a session with no lane is not walled in, which is what the first draft said. What is left is a refusal that spends a turn on a line that cannot run.

NOTHING READS THE COMMANDS A REFUSAL PRINTS. refusals-name-a-door.mjs fires only on a sentence naming a lane tool with an underscore. These say se run and se apply with a space, so it never looks at them. util/checks/battery.sh already lists a check called a-refusal-names-a-legal-move. No such file has ever existed, so every battery answers two failures for it. wk-5fadd939e1 is about that listing.

## proposed action

A refusal names a command the gate admits, and the gate is the judge of that.

Write util/checks/a-refusal-names-a-legal-move.mjs. It provokes each refusal from the engine that lives, the way drive-panel provokes the panel. It pulls every command line out of what came back, and hands each one to the same door as a Bash event. A command the gate denies is the failure. A check with a rule of its own would agree with the gate by luck.

Then reword the lines it names red. The copyable one becomes the flag form the gate admits.

THE --from FLAG THIS TOKEN FIRST ASKED FOR IS NOT NEEDED, and its three criteria are dropped rather than moved. se run --command and se apply --edits already carry a payload with the engine first, and theRefusal names them.

## done when

- every command a refusal offers is one the gate admits, decided by: node util/checks/a-refusal-names-a-legal-move.mjs at the root exits 0
- the check asks the gate itself, decided by: it sends each command to a live engine as a Bash event and reads the answer
- the check reads both refusals, decided by: its output names two or more commands read
- that check was seen red first, and the command it named red is the piped line theRefusal prints
- the existing check refusals-name-a-door.mjs still exits 0
- the battery reports no new failure against the run before the change

## evidence: green

After the rewording the battery of 15:27:44Z answers a-refusal-names-a-legal-move ok, 4 command(s) read, 0 failed. Four is both refusals read whole: the copyable line and the door line from each. se test --on this token answered ok on TestEveryDoorARefusalNamesGetsPastTheGuard, and it and TestTheEngineTakesItsPayloadWithNoPipe and TestTwoManifestsAreRefused answered ok together. go vet over src/engine is clean.

## evidence: red

The new check ran in the battery of 15:24:01Z and answered FAIL twice, naming exactly the two lines this token is about: the refusal for a command offers echo 'go test ...' piped into se run, and the refusal for a write offers the manifest echoed into se apply. The shell-door commands in the same two refusals passed in that run, so only the piped pair was red.

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | Written before any work. The check provokes each refusal, pulls the commands out of it, and asks the gate. A reader can disagree by wanting it to read gate.go's literals instead. | proposed action |
| [x] | every done-when line is decidable, and names the command where one decides it | One command decides the first three, node on the new check at the root. The last is the red run of it. | done when |
| [x] | the change is small enough to review whole, or it is split first | One check and the wording it turns red. Dropping --from is what made it one piece. | done when |
| [x] | the basics it stands on exist, or are minted first | theRefusal, theShellDoor and the hook door exist, liveEngine already starts an engine for a check, and battery.sh names this check. | gate.go, battery.sh |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Read. Red first, in the battery, which is where this check runs. Nothing beside the ask. | work-token |
| [x] | the change follows the approach on the token, or the token says why it departed | It does. The check provokes both refusals, pulls every command out of what came back, and hands each one back to the real gate. | the check |
| [x] | se test --on this token answered ok, and what it ran is named | ok. TestEveryDoorARefusalNamesGetsPastTheGuard, and beside it TestTheEngineTakesItsPayloadWithNoPipe and TestTwoManifestsAreRefused. | se test |
| [x] | the note says what changed and why, for a reader who was not here | The copyable line in both refusals is the flag form now. The pipe they printed was refused by the gate that printed it. | gate.go |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | None. battery.sh already named this check, so the file arriving closes that. | battery.sh |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

## evidence: the battery

It went from six failures to three over this token. a-refusal-names-a-legal-move is green now, and checks-live-in-the-method with it, since the file it named exists. tests-name-no-token went green in the same window by another hand. The three left are not this change: the three Git-shell and quoted-script fixtures in go test engine, se lint on a hold under worker-relay-trial, and render-check on the editor's group pin. wk-7783c03017 records the shell fixtures red in batteries before today.

## evidence: the change

util/checks/a-refusal-names-a-legal-move.mjs is new. It provokes the two refusals from the real binary through the hook door, in a work root of its own so the tree it checks is not written to, pulls every command out of what came back, and sends each one back as a Bash event. The gate's own decision is the verdict. src/engine/gate.go: the copyable line in each refusal is now the flag form, se run --command and se apply --edits, and the comment above theRefusal says why and names the check that holds it.

