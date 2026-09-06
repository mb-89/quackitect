---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: src/engine tests are tables
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: tests
# tokens that have to close before this can start
depends_on:
  - "[[wk-1c77b9a6fb]]"
  - "[[wk-72855641bd]]"
  - "[[wk-a725ef7f38]]"
# the token this is a part of. It cannot close while this is open
parent: [[wk-0557d1c4ea]]
---

## detail

writing-go rule 14 asks a test to be a table under t.Run. src/engine holds 233 test files and 206 of them call t.Run nowhere.

Counted at HEAD by `find src/engine -name '*_test.go' -exec grep -L 't\.Run(' {} + | wc -l`, which answers 206. The whole file count comes from `find src/engine -name '*_test.go' | wc -l`, which answers 233. The parent detail says 130, and the tree has grown since it was written.

What is gained is that a new case becomes a row rather than a new function carrying a copy of the setup. This is the package where that copying costs most, because it holds nine tenths of the suite.

What breaks if nobody does it is that the largest package drifts further from rule 14 with every case added. The standing check that would hold the rule stays impossible to turn on.

The package is the compilation unit, and every other hand builds against it. A half landed rewrite here stops all of them, which is wk-1bb23ea110. So a file is converted, built and tested before the next one starts.

206 files do not review whole, so the holder splits this token by file batch at its own step 1 before converting anything. It waits on the three smaller packages, so the shape arrives settled.

## proposed action

Split this token into batches of files at step 1. Then convert each _test.go file under src/engine to a table under t.Run, building and testing the package after each file.

## approach

The batching rule is written before any file moves, so a reader can disagree with the batches rather than with two hundred conversions.

A batch is one subject and ten files at most. Each is a trivial sub-token of this one, naming its files outright. The list comes from the same find the criteria name, so the batches partition it and a reader can check that they do.

Inside a file the shape is one table under one t.Run. The setup each old function copied becomes a row's fields. The assertion stays where it is, and a row is named for its case rather than numbered.

A file is converted, built and tested before the next one starts. That is the invariant, because a half landed rewrite here stops every other hand, which is wk-1bb23ea110.

It waits on the three smaller packages, so the shape arrives settled and this one copies it.

## done when

- no _test.go file under src/engine lacks t.Run. Decided by `find src/engine -name '*_test.go' -exec grep -L 't\.Run(' {} + | wc -l`, which answers 206 at HEAD and must answer 0
- src/engine compiles its tests at the end of every batch, decided by: `go vet -C src/engine ./...` exits zero, which it does at HEAD
- se test answers ok with nothing unreached. Decided by `./RUNME.sh test --on <this id> --propose <its src/engine test ids> | jq -e '.ok and ((.unreached // []) | length == 0)'`
- this token names a batch sub-token for every file it converts. The reviewer reads them against `find src/engine -name '*_test.go'`

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
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

