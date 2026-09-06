---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: commit only its paths
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-birch
claimed_by: 547b9365/worker-birch
claimed_at: "2026-09-05T14:21:01Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - f8e4a8bef240f4109896b09a67579c6cbb53310e
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - e0f8eb133739405010d2923add72c5820fe72f53
# how it ended. Only an ended token carries one.
disposition: done
# why it was dropped
reason: "LandCommit in src/engine/landing.go builds the landing commit the way a snapshot is built: a temporary index of its own, read from HEAD, with only the named paths added to it. Nothing the shared index holds can reach the commit, and the shared index is left as it was found. TestALandingCommitCarriesOnlyTheTokensPaths went red on the naive shape, carrying another hand's staged deletion, and green on this one.</reason>\n<parameter name=\"evidence\">{\"the red\": \"Built over the repository's own index the way a shell commits, the test said: the landing commit carries kept.go and mine.go, and the change is mine.go alone. kept.go is another hand's deletion, staged in the index this box shares.\", \"the green\": \"se test proposing TestALandingCommitCarriesOnlyTheTokensPaths: ok, 0.15s. Proposing src/engine/* ran 21 tests reaching the delta and every one answered ok.\", \"the checks\": \"sh util/checks/battery.sh is refused by the tests-via-engine guard, so its checks ran through the engine by name: 30 of 36, 28 ok. The two red are checks-live-in-the-method, on a name battery.sh carries that util/checks does not hold, and tests-name-no-token, on src/engine/notesgohome_test.go naming wk-0000000001. Both sit in other hands' live files and neither names landing.go or landingpaths_test.go. The six not run start and stop engines over this tree, where three other agents hold tokens.\", \"the change\": \"src/engine/landing.go and src/engine/landingpaths_test.go, both new. No existing file was touched, so the proposed action's second half, a check refusing a hand commit that carries a path no token step touched, is not in this change and is no criterion of this token.\"}"
---

## detail

Found reviewing wk-c1d58b91d6 (stop claim knows names). Its landing commit f0c20fa3 carried two deletions that belonged to no change on it: src/engine/version.go and src/engine/yaml.go, 236 lines, deleted in the same commit as the stop.go fix. origin/v4 then did not compile — undefined Build, undefined ylist — so no test ran on that tree until cf8e1d4e put both files back fifteen minutes later. cf8e1d4e names the cause: "committed with an index a worker subagent had staged its file moves into".

Nothing bounds a landing commit to the paths its token wrote. src/engine/snapshot.go:52 already shows the shape that would have prevented it: a snapshot writes through a temporary index (GIT_INDEX_FILE, os.CreateTemp in r.Private()), so the shared index cannot leak into it, while a landing commit is typed by hand at a shell over the repository's own index, which every other agent on the box shares.

## proposed action

The engine makes the landing commit, through a temporary index the way snapshot.go does, staging only the paths the token wrote. Where a hand commit stays possible, a check compares the committed tree against the token's paths and refuses one carrying a path no token step touched.

## done when

- a commit made while an unrelated deletion is staged in the repository index carries only the token's paths, decided by: se test --propose 'TestALandingCommitCarriesOnlyTheTokensPaths' answers ok
- sh util/checks/battery.sh reports no new failure against the run before the change

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | One function and one test, in two new files. The proposed action's second half, a check refusing a hand commit, is no criterion of this token and is not in the change. | — |
| [x] | every done-when line is decidable, and names the command where one decides it | Line 1 names the test outright. Line 2 names `sh util/checks/battery.sh`, which the tests-via-engine guard refuses to a worker, so it was decided check by check through the engine, and the answer says which. | done when |
| [x] | the basics it stands on exist, or are minted first | gitIn in claim.go and the temporary index in snapshot.go both exist, and writeTheClaims already adds only the paths it names. Nothing had to be minted. | claim.go |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Red first, one command per criterion. | work-token |
| [x] | one test was written first and seen red for the reason expected | Red twice: undefined LandCommit, then over the repository's own index the commit carried kept.go beside mine.go, another hand's staged deletion riding along. | the second red |
| [x] | the same test was seen green after the change, and named | TestALandingCommitCarriesOnlyTheTokensPaths, green in 0.15s over an index of its own read from HEAD, with 21 src/engine tests beside it. The battery is refused by the tests-via-engine guard, so 30 of its 36 checks ran through the engine: 28 green, 2 red on other hands' files. | se test |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | landing.go and landingpaths_test.go, both new. | — |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | The 2 red name notesgohome_test.go and a check util/checks lacks. | — |

