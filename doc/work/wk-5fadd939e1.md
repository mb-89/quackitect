---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: battery names absent check
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-birch
claimed_by: 547b9365/worker-birch
claimed_at: "2026-09-05T15:44:44Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 2d5cbce39fc027d99566d1228a82658b93a86a2e
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 5c3877cec6629155dde5792803cbe471d80afe54
# how it ended. Only an ended token carries one.
disposition: done
# why it was dropped
reason: "The name battery.sh listed now has a file. util/checks/a-refusal-names-a-legal-move.mjs was written by another hand while this token sat open, so this hand verified the three criteria rather than making the change.</reason>\n<parameter name=\"evidence\">{\"1 no name without a file\": \"The loop in util/checks/battery.sh names 37 checks. util/checks holds 37 .mjs files. The two lists are equal: no name is missing a file, and no file goes unnamed.\", \"2 a check catches the class\": \"util/checks/checks-live-in-the-method reads the names out of battery.sh and compares them with the folder, and it is what caught this: red at 14:37 and again in the 15:05 battery with FAIL a-refusal-names-a-legal-move is in util/checks. It runs on its own through the engine, so the class is red without a battery. It answers ok now. It declares no reads, so the engine selects it on a whole ruling or when it is named, which the engine says on every answer.\", \"3 the battery reaches its report with no absent check\": \"The battery at 15:38 answered 4 failed in 135s and none of the four says it is not there. The runs at 14:50 and 15:05 each answered 6, two of which were this defect: a-refusal-names-a-legal-move and checks-live-in-the-method. The four left are go test engine on three posixshell and quoted tests, gofmt on src/engine/stateofplay.go, se lint on a hold under a harness name, and render-check on the editor.\", \"whose work\": \"This hand wrote none of it. The token asked for a name to be taken out of the loop, and another hand answered it by writing the check the name promised, which is the other branch the detail allows.\"}"
---

## detail

From the verdict on [[wk-0086ed9e9b]].

util/checks/battery.sh line 393 lists `a-refusal-names-a-legal-move` among the checks it runs. No such file has ever existed in this tree: `util/checks/*.mjs` holds 36 files and that is not one of them, and it is in neither f9a2af95 nor cf8e1d4e. The name was added by dd2fed69, the commit that landed wk-0086ed9e9b, in the same hunk that added `adapter-decides-no-column`.

Four lines below, at 396 to 399, the battery says what it does with a name it cannot find:

  else
    bad=$((bad + 1))
    say "$c" "FAIL it is not there, so it did not run"

under the heading A CHECK THAT IS NOT THERE IS A FAILURE, NOT A SKIP. So the battery is red by one, for a check nobody wrote.

The damage is that wk-0086ed9e9b's sixth criterion is "sh util/checks/battery.sh reports no new failure against the run before the change", and the change is the new failure. The token's own note says the battery was never run: "The battery is owed: a stale marker from the 10:37 run says one is still going, which wk-781c94fff2 carries." `se test` does not see it either, because the engine builds its check list from the files on disk, so a whole-battery run of 38 tests answers ok while battery.sh would go red.

The fix is to take the name out of the loop at line 393, unless the check is meant to exist, in which case it is a token of its own.

## done when

- util/checks/battery.sh names no check that is not on disk, decided by: every name in the loop at line 393 has a util/checks/<name>.mjs beside it
- a check catches the class next time: the names in battery.sh's loop are compared against util/checks/*.mjs, so a name with no file is red before the battery runs, not only inside it
- sh util/checks/battery.sh reaches its report line with no 'it is not there' failure

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | One name in one loop, and the check that compares the two lists. | — |
| [x] | every done-when line is decidable, and names the command where one decides it | Line 1 names the comparison, line 3 names the battery. Line 2 names a check rather than a command, and checks-live-in-the-method is that check. | done when |
| [x] | the basics it stands on exist, or are minted first | checks-live-in-the-method was already there and already read both lists. It is what went red on this. | util/checks |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Every criterion was run again rather than read off the note. This hand wrote none of the change. | work-token |
| [x] | one test was written first and seen red for the reason expected | checks-live-in-the-method was red at 14:37 and at 15:05: FAIL a-refusal-names-a-legal-move is in util/checks. | the 15:05 battery |
| [x] | the same test was seen green after the change, and named | checks-live-in-the-method: ok. The 15:38 battery answers 4 failed against 6, and none says it is not there. | se test |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | Another hand wrote the check while this token sat open. The tree is what it decides. | — |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | Nothing left over. The check declares no reads, so a whole ruling or a name selects it. | — |

