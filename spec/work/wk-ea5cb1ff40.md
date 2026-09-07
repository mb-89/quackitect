---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: rebuild the stale bundle
# where the token stands. The process owns these values.
status: open
---

## detail

What VS Code runs is src/extension/out/extension.js, and it is git-ignored, so it never travels. A fix committed on one machine reaches the next as source and nothing there rebuilds it. Measured on this box: the bundle was built on the 4th, its sources changed on the 6th, and two days of panel and editor work had never run. The owner had seen the same fault fixed on another machine and met it again here, which is what an artefact that does not travel and is not rebuilt looks like. The engine already does the right thing for itself: it rebuilds .bin/se when the binary is older than its source, and says so. The extension has no such rule, and the person is the one who notices, weeks later, by a control drawing wrong.

## proposed action

The engine rebuilds the extension bundle at start when any TypeScript beside it is newer, in the shape it already uses for itself.

It says which it did, the way the install says build se. A build that fails is said and not fatal, because a box with no node still has an engine and the check names the gap.

The check the-bundle-is-not-stale stays. It is what proves the rule holds, and it is the only thing that speaks on a box where the rebuild could not run.

## done when

- a tree whose source is newer than its bundle has the bundle rebuilt at start, decided by: a Go test in src/engine
- the start says it rebuilt, decided by: the same Go test reading what it printed
- a build that fails is said and the engine still starts, decided by: the same Go test
- the-bundle-is-not-stale is green after a start, decided by: se test --propose the-bundle-is-not-stale

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

