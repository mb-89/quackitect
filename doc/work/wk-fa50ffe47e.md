---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: git failure reads empty
# where the token stands. The process owns these values.
status: open
---

## detail

Found reviewing wk-fa2dd32c33, which stopped a close from writing an archive it did not read. The guard it added has one door still open.

src/engine/archive.go:323 answers an empty archive for every failure of the branch read: "if err != nil || strings.TrimSpace(said) == "" { return nil, nil }". src/engine/archive.go:317-320 does the same where filepath.Rel fails. Only the parse that follows refuses, and the comment at 326 says why it must: "A COPY THAT WILL NOT READ IS A REFUSAL RATHER THAN AN EMPTY ARCHIVE, because answering empty here is the whole defect this function exists for." The token's own approach says the same sentence. The read above it does not obey either.

So where the list is on the branch and git will not answer for some other reason, the close writes the tags-only list over hundreds of rows, which is the 377-to-1 loss this token was written to stop, reached by a second road.

Git already tells the cases apart, and gitHere at archive.go:97 already carries its stderr into the error. Measured on 2026-09-06: a path not on the branch says "fatal: path 'doc/work/notthere.jsonl' does not exist in 'HEAD'", while a work root that is no repository says "fatal: not a git repository". One is an empty archive and the other is a refusal, and the code reads them as one.

Nothing catches the class: no test drives archiveListOnBranch over a git that fails for any reason but a missing path.

## proposed action

The branch read answers empty only where git says the path is not in HEAD, and refuses every other failure.

## done when

- archiveListOnBranch answers empty only where git says the path is not on the branch. Decided by: se test --on this id --propose TestAGitFailureIsNotAnEmptyArchive, a new test that puts the list on the branch, makes the git read fail for another reason, and reads an error back rather than zero rows
- the close over that tree leaves the list on disk alone. Decided by the same test, which reads doc/work/archive.jsonl after the close and finds the rows it had
- a tree that never had a list still closes and records what it closed. Decided by: se test --propose TestAFirstCloseStillWritesTheArchive, which must stay green

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [ ] | the ask is small enough to review whole, or it is split first | — |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | one test was written first and seen red for the reason expected |  |  |
| [ ] | the same test was seen green after the change, and named |  |  |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

