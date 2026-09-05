---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: expressions leave main
# where the token stands. The process owns these values.
status: open
---

## detail

THE LAST GROUP OF wk-40abb881a7. The call graph there named eleven groups reaching nothing outside themselves. Nine are packages under src/engine/internal. expr.go is not: one file of 482 lines holding the expression language a view filters and groups by, with Value, Row, Expr, Parse, Eval, lex, token, eparser, levels, contains, absent and the vs, vn, vb and vl constructors.

Its names are the most generic in the tree. Parse, Value, Row, token and contains are words any file might want, and three build failures on the parent token came from exactly that kind of collision. Its callers are view.go, viewedit.go, filterbuild.go, field.go, bucket.go and query.go, and a se find over the names is noisy because the words appear in prose too, so the sites have to be counted by the compiler rather than by search.

## proposed action

Move expr.go whole to src/engine/internal/expr. Export Value, Row, Expr, Parse and the Eval, Truthy and Text methods, and keep lex, token, eparser, levels, contains and the constructors unexported unless a caller needs one, in which case export it under a name the caller reads well. Find the sites by removing the file and reading go build -gcflags=-e -C src/engine ./..., which lifts the error cap and names every one. Rewrite them, then go vet and se test --on this token.

## done when

- src/engine/internal/expr exists and src/engine/expr.go does not: ls src/engine/internal/expr and ls src/engine/expr.go
- no import cycle is introduced: go build -C src/engine ./... and go vet -C src/engine ./... exit 0
- a view still filters and groups: se test --on this token answers ok and names TestAViewFileReads and TestAFilterReadsBackAsWhatWasBuilt among what ran

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

## approach

The package is expr, and the file moves whole. Value, Row, Expr and Parse are already exported and keep their names, so a caller reads expr.Parse and expr.Row. The constructors and helpers stay unexported unless the compiler names a caller outside the file.

The sites are found by the compiler rather than by search, because the names are ordinary words. Remove expr.go, run go build -gcflags=-e -C src/engine ./..., and every undefined name is a line to rewrite. Where a caller used a constructor, it gets a function exported under a name that caller reads well. That is decided at the site rather than in advance.

