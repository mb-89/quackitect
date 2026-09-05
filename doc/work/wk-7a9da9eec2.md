---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the folder decides
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: main
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - b190e6e957eaf301ad384b513c7143b63fd3d1f6
  - 6b55088badaf5f40d4f4b4459165cdf5de55ba60
  - 1a54c8f2a3a6b0094505f6107d0b53d1606f50ef
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - b74748d29a6dc55c783fda564bb4c18bc3e5fc90
  - c06a667b466d8e300d0a01d2bc66c6778b2a5c3e
  - c90c4ca5b86097ca312688d4f8b6f8c203168288
# how it ended. Only an ended token carries one.
disposition: done
# why it was dropped
reason: "Pass. The change holds all eight criteria and leaves the tree better: the process no longer carries a second answer about where a token lives, and a hand move sticks. One finding, wk-dd39742c14, on the move branch SaveToken kept after it stopped moving anything."
---

## detail

A token is traced when it is in doc/work and private when it is in .se/work. store.go already says the folder is the answer, not a field.

A second answer exists beside it. Each process file carries traced:, and dirFor reads it on every save. So the process, not the folder, decides where a token lands each time it is written.

Two costs, both measured today. Moving 108 trivial tokens needed a flag flip as well, or the next mint would put them back. And a token moved by hand does not stay moved: the next save reads the process and drags it back.

The owner ruled the flag out. A note is private, and the minter cannot say otherwise. Every other token says tracked or not tracked at the mint, and nothing is unsaid.

There is no default to fall back on. A standard token is not always tracked. That will follow from whether it sits in a tracked state machine, and that concept does not exist yet.

The minter chooses on who can pick the work up. Tracked is what makes a token claimable, so work another agent on another machine could take is tracked. Small work tied to what is in your hands right now stays local.

After the mint the folder is the only answer, and a move sticks.

## proposed action

Delete traced: from the three process files, and the Traced field from Process.

se_work takes a tracked argument. A note refuses it. Every other process refuses a mint without it, the way a five-word title is refused today.

dirFor answers the folder a token is already in. It is asked only for a token that has none, and then the mint's own answer decides.

Write the choice into doc/guidance/work-token.md, in the minter's words: tracked is claimable, local is for what you do next yourself.

TestASaveMovesRatherThanCopies inverts. It says a save follows the process. It has to say a save leaves a token where it is.

## done when

- no process file carries a traced field: se_find regex ^traced: over path src/processes/*.yaml answers count 0
- no Go file names a Traced field: se_find regex \.Traced over path src/engine/*.go answers count 0
- a standard mint with no tracked argument is refused: a test reads the refusal
- a note is private though the minter asked for tracked: a test mints one and finds it in .se/work
- a token minted tracked is born in doc/work: a test mints a standard and a trivial one there
- a token minted untracked is born in .se/work: the same test mints both and finds them there
- a hand-moved token stays where it was moved: a test moves one, saves it, and reads the folder
- doc/guidance/work-token.md says tracked is claimable: se_find regex claimable over that path answers one hit

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | it names the argument, what dirFor asks, and what comes out | written before the first edit |
| [x] | every done-when line is decidable, and names the command where one decides it | two are se_find, six are tests | the answers are below |
| [x] | the change is small enough to review whole, or it is split first | the panel half is wk-61a08182b8, and this is the engine | — |
| [x] | the basics it stands on exist, or are minted first | SaveToken already moved rather than copied, and noteAt already said where a token is | — |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | the detail carries the problem, the approach the shape, and each criterion a command | — |
| [x] | the change follows the approach on the token, or the token says why it departed | every line of the approach is in the change, and nothing else is | see the note |
| [x] | se test --on this token answered ok, and what it ran is named | 81 tests off the delta, then the three that were red, then five checks | named below |
| [x] | the note says what changed and why, for a reader who was not here | the note section says it | below |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | wk-1e7551f377 for a red the check already had | — |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | [[reviewing]] was read and applied | read first, and candidates written whole then cut to one | reviewing.md |
| [x] | every hunk of git diff began..ended was read, and any not read is named | those hashes hold no code, so 62fe7638..4f4c83c0 was read for this token's files. Not read: the archive and WorkMoved hunks beside them, which are other tokens | — |
| [x] | every criterion's command was run again, and what it said is named | 1, 2 and 8 answer as written. 3, 5, 6 and 7 are green. 4 refuses the note instead, which is what the approach asked | se test |
| [x] | every hunk improves the product, or a finding names the one that does not | pass, but SaveToken's move branch is now unreachable, under a comment still saying the process decides | wk-dd39742c14 |
| [x] | every finding is a trivial token naming this one, and their ids are here | wk-dd39742c14, tracked and open, naming this one | — |

## evidence: what is not done here

The engine serving this session is the committed binary. So the new rule is in the source and not yet in the running copy.

That is not only a gap, it drifts. The old dirFor reads a traced field the process files no longer carry, so it answers .se/work for everything, and every save of a token moves it out of doc/work.

It happened to this token and to wk-61a08182b8 while they were being written. Both had to be moved back by hand.

So the swap is the fix rather than a tidy-up. With the new engine the folder answers and a save leaves a token where it is.

The panel half is wk-61a08182b8, and it is closed.

## evidence: what the checks said

The flag. se_find for a traced field over src/processes answers 0. se_find for .Traced over src/engine answers 0.

The mint. TestTheMintSaysWhereATokenIsBorn drives five cases: standard and trivial each way, and a note. TestAMintThatDoesNotSayWhereIsRefused drives both refusals and checks neither left a file.

The move. TestAHandMovedTokenStaysMoved moves a token, saves it, and finds it where it was moved and nowhere else.

The name. TestThePrivateProcessExists reads the real src/processes, so a rename there fails loudly.

The suite. 81 tests were chosen off the delta and 78 were green at once. Three were red for the new rule and are green now: TestAStepTickedTooEarlyIsRefused, TestAVerbRunsInsideTheEngineAndTheClientPrintsIt, TestAVerbThroughRunmeReachesDispatchOnAProject.

The checks. drive-panel, private-files-have-writers and projections-carry-chapters are green.

mcp-tools ran green and proves nothing here. It drives the lane binary in .bin, which the swap never rebuilds. The lane half is untested, and wk-47df995f44 carries the gap that hides it.

engine-args is red on one line, se lint still answers. That check drives the committed binary, which predates this work, so the line is red without it. It is wk-1e7551f377.

The guidance. doc/guidance/work-token.md rule 10 says everything but a note says tracked or local, and section 10 says why. The projections were rewritten with se --project.

## approach

The mint takes the answer. Nothing else holds it, and no file repeats it.

se_work grows one argument, tracked, taking true or false.

A note refuses it, naming why: a note is private and that is what a note is.

Every other process refuses a mint that omits it. The refusal names the two answers, the way the title refusal names the word count.

dirFor stops asking the process. It answers the folder the token is already in, found by noteAt.

A token with no file is new. There the mint's own answer decides, and dirFor is not asked.

SaveToken keeps the move it already does. So a token moved by hand is written where it now is, and left there.

Process loses Traced. The three process files lose traced:.

## note

No process file carries traced: and Process has no Traced field. A process holds no opinion about where its tokens live.

se_work takes tracked. A note refuses it, and every other process refuses a mint without it. Both refusals name the two answers.

dirFor asks noteAt first, so only a new token reaches the mint's own answer. That is what makes a move stick.

The CLI flag is a string, because unsaid is a third answer. The MCP tool takes a boolean and reads it by type.

It cost 30 test call sites, each saying which, and three shell invocations.

