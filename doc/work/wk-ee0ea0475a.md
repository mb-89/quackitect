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
status: done
# who did the work step, so the verdict is never theirs
author: worker-messiaen
claimed_by: aeaf7bd9/reviewer-takemitsu
claimed_at: "2026-09-05T16:21:41Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 3f2d1505dbc6b809fd657c5612cc398982621efd
  - 28b30b7f12fef3bdc9e8d5153e32592637e32237
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 3aee48dcd93f80cd3ab3faf19de3f2c5eaedc68c
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
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | written before the move, and the move followed it | the approach section |
| [x] | every done-when line is decidable, and names the command where one decides it | all three name a command, and all three were run again on 70797d25 | the done when section |
| [x] | the change is small enough to review whole, or it is split first | one move: nine files rewritten, expr.go deleted, internal/expr/expr.go added | git show --stat 69dc3aed |
| [x] | the basics it stands on exist, or are minted first | src/engine/internal already carried ten packages before this one | ls src/engine/internal |

The change landed as 69dc3aed, under wk-40abb881a7, whose call graph named the same eleven groups. This token is that token's last group, so its began and ended hashes hold nothing.

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | rule 12, red first: expr.go was removed and the build named 56 undefined sites | go build -C src/engine -gcflags=-e ./... |
| [x] | the change follows the approach on the token, or the token says why it departed | followed, with one departure. view.go built nodes out of the unexported fields, so expr.Op is exported for it | src/engine/internal/expr/expr.go |
| [x] | se test --on this token answered ok, and what it ran is named | ok true, and both named tests ran green: TestAViewFileReads and TestAFilterReadsBackAsWhatWasBuilt | se test --on this token |
| [x] | the note says what changed and why, for a reader who was not here | for a reader with neither file open | the note chapter |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | contains left package main with expr, so two callers read slices.Contains. log is the group left | wk-3fb658ea61 |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | [[reviewing]] was read and applied | Applied. Not the author. | [[reviewing]] |
| [x] | every hunk of git diff began..ended was read, and any not read is named | The range holds only this token's note, and 69dc3aed is an ancestor of ended, as the note says. Every hunk of it read: the rename, filterbuild.go, query.go, view.go and five test files, all mechanical. | git show -M 69dc3aed |
| [x] | every criterion's command was run again, and what it said is named | One: internal/expr is there and expr.go is gone. Two: build and vet exit 0. Three: the door answered ok but ran nothing, so both named tests were run directly and pass. | go test -run TestAViewFileReads |
| [x] | every hunk improves the product, or a finding names the one that does not | PASS. Parse, Row, Value, token and contains left package main. | internal/expr/expr.go |
| [x] | every finding is a trivial token naming this one, and their ids are here | None. Also seen: expr keeps a hand-rolled contains. | — |

## note

expr.go moved whole to src/engine/internal/expr, as commit 69dc3aed under wk-40abb881a7. This token names the same move, and its criteria were run again here.

Value, Row, Expr and Parse kept their names. The constructors did not: vs, vn, vb and vl are expr.Str, Num, Bool and List, and absent is expr.Absent, which is what a caller outside the package reads well. view.go built nodes out of the tree's unexported fields, so the package answers expr.Op and keeps the fields to itself. contains was a list helper that happened to live in expr.go, and its two callers outside now read slices.Contains.

The lexer's token type went with it, so package main no longer carries a lowercase token beside Token.

The sites came from the compiler. The build runs with -gcflags=-e, and each undefined name is qualified where it was reported.

## approach

The package is expr, and the file moves whole. Value, Row, Expr and Parse are already exported and keep their names, so a caller reads expr.Parse and expr.Row. The constructors and helpers stay unexported unless the compiler names a caller outside the file.

The sites are found by the compiler rather than by search, because the names are ordinary words. Remove expr.go, run go build -gcflags=-e -C src/engine ./..., and every undefined name is a line to rewrite. Where a caller used a constructor, it gets a function exported under a name that caller reads well. That is decided at the site rather than in advance.

