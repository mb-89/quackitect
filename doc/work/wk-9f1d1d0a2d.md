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
author: worker-borromini
# the token this is a part of. It cannot close while this is open
parent: [[wk-3b2bb11243]]
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 4f49f4a8cd7dfe24698b56436833d86ba5ed9cd6
  - 8b5ac1a7e008abc54f312a272b89ff567198a5ab
  - 27da6bd2f36431cc9c6c3f912744b69608e11e5e
  - 3ce8753bb032fb0d98f4956b9f85dea52a9ac3f3
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 210ce17b8d723648db7791892979d78f45369de6
  - 6da40905302a4e62a6b2372fe5e562f55ae2d0ba
  - 5fbc45243dd6a48ead3845fa7bb31738de721b16
  - 82f26ea7821ca7c2d95664604f58fd82f95065be
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
| [x] | what is gained by doing it, and not only what it does | A caller reads the calls instead of retyping them | the detail |
| [x] | what breaks if it is never done, and not only that it stays undone | Every flag the engine grows is a refusal in the lane | the detail |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | The catalog and its two forms are written out | the proposed action |
| [x] | every done-when line is decidable, and names the command where one decides it | Four of five are | below |
| [x] | the change is small enough to review whole, or it is split first | — |  |
| [x] | the basics it stands on exist, or are minted first | — |  |

THE FIFTH NAMES A RUN THAT CANNOT BE TAKEN NOW. It asks the battery against the run before the change, and the change landed before this token reached me.

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | — |  |
| [x] | the change follows the approach on the token, or the token says why it departed | It sits beside the dispatch | 13e2594f |
| [ ] | se test --on this token answered ok, and what it ran is named | NOT MET: this clone will not build package main, so both cases ran at the tip | below |
| [x] | the note says what changed and why, for a reader who was not here | The message says it whole | 13e2594f |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

IT LANDED AS 13e2594f BEFORE THIS TOKEN REACHED ME, and nobody submitted it. Every criterion ran again at the tip.

RED AND GREEN, BOTH SEEN. An entry naming a flag query has not got made the catalog case say se query takes none of that argv. Without it both pass, and the catalog answers thirty-five entries.

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

