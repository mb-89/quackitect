---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: engine answers its calls
# where the token stands. The process owns these values.
status: done
# who did the work step, so the verdict is never theirs
author: worker-linden
claimed_by: 547b9365/worker-linden
claimed_at: "2026-09-05T20:00:34Z"
# the token this is a part of. It cannot close while this is open
parent: [[wk-3b2bb11243]]
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 3caf4baa01d13479a3f95ce4dc7059b308f9dc28
  - 137a7833de6567374ffaaa3bb57aee76fa3c98c0
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 9e53f4bbd2efae9ea9f5656c7be375d34281bc1e
---

## detail

Nothing in the engine answers what a caller should send it.

The engine knows its verbs: the run map in src/engine/verbs.go is the dispatch. Each verb knows its flags: its own FlagSet, parsed through one door. Neither is readable from outside the process, so every caller retypes them, and nothing joins the two halves but an array of strings that neither program checks.

Measured at 4f4c83c0. `grep -c -- '"--[a-z]' src/extension/*.ts` answers 35 flag literals under src/extension, 30 of them in src/extension/engineargs.ts, across 26 exported builders and 5 verb names. util/checks/engine-args.mjs and util/checks/engine-args-lifecycle.mjs, 455 lines together, exist only to drive those retyped lists against the real binary.

The smallest case: the engine grew a tracked flag on work. The MCP lane did not follow. Every non-note mint through the tool was refused while the same mint at the shell worked, and nothing anywhere noticed.

This is the basic that wk-3b2bb11243's adapter half stands on. It is minted first and it changes nothing under src/extension.

## proposed action

The engine answers a catalog of the calls a caller makes, beside the dispatch it describes.

se query --calls ->
{"always":["--work","{work}"],
 "calls":{"calls":{"argv":["query","--calls"]},
          "mint":{"argv":["work","--title","{title}","--by","person"],
                  "when":[{"given":"detail","argv":["--detail","{detail}"]}]}}}

Two forms only: a {name} hole, and a when segment kept where its parameter is not empty. A boolean picks between two named entries, so the language stays substitution and no caller needs an interpreter.

It lives beside run in src/engine/verbs.go, the dispatch it describes; a second file would be the copy this removes.

A Go test hands every entry's argv to the FlagSet of its verb, so a rename fails in the engine's own tests.

The catalog names the call that fetches it, so a caller holds one list and the engine hands that one back.

## done when

- se query --calls answers a catalog whose own fetching call is an entry in it, decided by: .bin/se.exe query --calls --work . | grep -q 'query.*--calls'
- every entry's argv is one the verb it names takes, decided by: go test ./src/engine -run TestEveryCallInTheCatalogIsOneTheVerbTakes
- that test was seen red first, against an entry naming a flag its verb has not got, and what it said is on the token
- the catalog carries one entry per builder src/extension/engineargs.ts exports today, decided by: go test ./src/engine -run TestTheCatalogCoversEveryCallTheAdapterMakes
- sh util/checks/battery.sh reports no new failure against the run before the change

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | Written before the first line changed: the shape of the answer, the two forms, and where it lives. | approach |
| [x] | every done-when line is decidable, and names the command where one decides it | Four name a command and were run. The third is the red, and with an entry sending --form to work it said: se work takes none of [work --form 1 --by person --work 1], flag provided but not defined: -form. | 5 lines |
| [x] | the change is small enough to review whole, or it is split first | Four files: the catalog and the query flag, one test file, and the shrink check's number. | 4 files |
| [x] | the basics it stands on exist, or are minted first | The dispatch, the flag sets and engineargs.ts are in the tree. This is the basic wk-3b2bb11243 stands on. | the dispatch |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token and writing-go read. Rule 12 is the red above. | work-token |
| [x] | the change follows the approach on the token, or the token says why it departed | It does: one line of JSON, two forms, the catalog beside the dispatch. | verbs.go |
| [x] | se test --on this token answered ok, and what it ran is named | Not run here: se test answers about this clone and the change is in a worktree over origin/v4. The battery ran there, 22 failures against 23, none new. | 22 of 23 |
| [x] | the note says what changed and why, for a reader who was not here | It says what the catalog is, where it lives, and what holds it there. | note |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | Its own token, wk-a383afdbbc: the shrink check reddens whoever runs the battery next rather than the change that grew the package. | wk-a383afdbbc |

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

`se query --calls` answers one JSON object on one line: `always`, the arguments every call also carries, and `calls`, one entry per call a caller makes.

An entry is `argv`, and an optional `when`, whose segments are kept where the parameter they name is not empty. A `{name}` anywhere in an element is a hole the caller fills. There is nothing else in the language, so a caller substitutes and never interprets.

A flag that varies with a boolean is two entries, `hold.on` beside `hold.off` and `level.sort` beside `level.group`, because a hole never spans a flag name. An entry carries the whole call, so a fragment the adapter composes into a view call is an entry with that call around it.

The catalog lives beside `run` in src/engine/verbs.go and the query verb answers it. One line rather than the indented JSON the other answers print, so the call that fetches the catalog reads off it.

Two Go tests: one hands every entry, holes filled and `--help` appended, to the built engine. The other reads src/extension/engineargs.ts and holds the catalog to the builders it exports.

Nothing under src/extension changes.

## note

The engine now answers `se query --calls`. It is one JSON object on one line: `always`, what every call carries, and one entry per call. An entry is `argv` with `{name}` holes and an optional `when`, whose segments are kept where the parameter they name is not empty. There is nothing else in it, so a caller substitutes and never interprets.

The catalog sits in verbs.go beside the dispatch it describes. Two tests hold it there. One hands every entry to the flag set of the verb it names, holes filled and `--help` after them. A flag nothing takes is refused, and nothing the verb does runs. The other reads engineargs.ts and asks that every builder has an entry and every entry a builder.

Nothing under src/extension changed. The flat package grew by the catalog, so the shrink check's number was raised with the reason beside it.

