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
claimed_by: aeaf7bd9/worker-chagall
claimed_at: "2026-09-06T08:41:00Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 93f48eaf73b40a41203539bbb77b862b802e7745
  - 39271a89fa48f78c057ba8cf40076d85e465e7e6
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 4931cede7114810cfff9539d08b8bba03388f3c8
---

## detail

First half of wk-6a0b7f2d38, one filter reader. That token rules there is one implementation, in a module both the engine and the viewer import, and that the syntax of the log is the one that survives. This half moves the surviving reader and leaves the engine alone, so the tree builds at every point. src/viewer/filter.go is 384 lines and parses the log syntax against a Record. It becomes module quackitect/filter at src/filter, outside any internal folder, and it reads a row of named values rather than a Record. The viewer keeps a thin Filter that builds that row and is its only caller. src/engine is untouched, so its 91 call sites on expr go on compiling. Measured on 2026-09-05: expr is named 91 times across nine engine files, and view.go is built on Expr and Row throughout.

## done when

- src/filter is a module named quackitect/filter and holds the log syntax reader: read go.mod and the path, which names no internal folder
- src/viewer/go.mod requires quackitect/filter and replaces it with ../filter, and src/viewer holds no parser of its own: read go.mod and search src/viewer for a second parser
- go build and go vet over src/viewer and src/engine are both green, and the viewer tests that name a filter pass

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | One reader of the log syntax, in a module both callers may import. | the detail |
| [x] | what breaks if it is never done, and not only that it stays undone | Two readers drift, and a person must know which window they typed in. | the detail |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | It is. | the approach section |
| [x] | every done-when line is decidable, and names the command where one decides it | Two read go.mod and search. The third runs the tools. | go.mod and the tools |
| [x] | the change is small enough to review whole, or it is split first | — | one file moved |
| [x] | the basics it stands on exist, or are minted first | — | Record answers all three |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | — | read |
| [x] | the change follows the approach on the token, or the token says why it departed | It follows it. The row is read through an interface, because the viewer filters every record on every keystroke. | src/filter/filter.go |
| [x] | se test --on this token answered ok, and what it ran is named | It ran on a worktree of the branch tip, which this clone does not carry. Vet and build were green over three modules, and the viewer suite ok. | go vet, go build, go test |
| [x] | the note says what changed and why, for a reader who was not here | The approach says the shape, and the moved file says why the row is an interface. | the commit |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | None left. Every reader of the modules walks for a go.mod, so the new one is found. | TheGoModules |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

## approach

The reader becomes a module of its own. It is quackitect/filter at src/filter, outside any internal folder, because internal is the marker saying no other module may import it.

Its surface is the log syntax it already parses. It reads a row of named values rather than a Record, so nothing in it knows what an engine record looks like.

The viewer is its caller, and in this half its only one. src/viewer/go.mod requires quackitect/filter and replaces it with ../filter. What is left in the viewer is a thin Filter that builds the row and hands it over. It keeps no parser of its own.

The engine is untouched here. Its 91 call sites on expr go on compiling against the reader it already has. So the tree builds at every point of this half, and the second half is what moves them.

