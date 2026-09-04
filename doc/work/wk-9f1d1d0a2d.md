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
status: open
# the token this is a part of. It cannot close while this is open
parent: [[wk-3b2bb11243]]
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

