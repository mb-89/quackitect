---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: filter gets its module
# where the token stands. The process owns these values.
status: open
---

## detail

First half of wk-6a0b7f2d38, one filter reader. That token rules there is one implementation, in a module both the engine and the viewer import, and that the syntax of the log is the one that survives. This half moves the surviving reader and leaves the engine alone, so the tree builds at every point. src/viewer/filter.go is 384 lines and parses the log syntax against a Record. It becomes module quackitect/filter at src/filter, outside any internal folder, and it reads a row of named values rather than a Record. The viewer keeps a thin Filter that builds that row and is its only caller. src/engine is untouched, so its 91 call sites on expr go on compiling. Measured on 2026-09-05: expr is named 91 times across nine engine files, and view.go is built on Expr and Row throughout.

## approach

The reader becomes a module of its own. It is quackitect/filter at src/filter, outside any internal folder, because internal is the marker saying no other module may import it.

Its surface is the log syntax it already parses. It reads a row of named values rather than a Record, so nothing in it knows what an engine record looks like.

The viewer is its caller, and in this half its only one. src/viewer/go.mod requires quackitect/filter and replaces it with ../filter. What is left in the viewer is a thin Filter that builds the row and hands it over. It keeps no parser of its own.

The engine is untouched here. Its 91 call sites on expr go on compiling against the reader it already has. So the tree builds at every point of this half, and the second half is what moves them.

## done when

- src/filter is a module named quackitect/filter and holds the log syntax reader: read go.mod and the path, which names no internal folder
- src/viewer/go.mod requires quackitect/filter and replaces it with ../filter, and src/viewer holds no parser of its own: read go.mod and search src/viewer for a second parser
- go build and go vet over src/viewer and src/engine are both green, and the viewer tests that name a filter pass

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

