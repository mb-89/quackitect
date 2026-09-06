---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: event guard reads two
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-borromini
claimed_at: "2026-09-06T09:24:25Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 406e85261765f111d879a1f124ab3bc2d6eb4a7d
---

## detail

A finding on wk-e0d86a6492, which made the harness event a named type.

TestHookEventsAreOneType in src/engine/hookeventsonetype_test.go parses two files by name. The list is written out in the test body as hook.go and guards.go. Its done-when claims the property over src/engine, and the guard only holds it over those two.

So a bare event literal added in any other file of the package is not caught, and that is the exact class this token exists to make loud. Measured at the branch tip: outside the constant block no file of src/engine says an event name today, so nothing is red now and nothing warns when the next one arrives.

## proposed action

Walk the package instead of naming two files. Parse every non-test .go file under src/engine, keep the switch and constant reading as it is, and report the file each bare literal sits in. Watch it red by planting one in a third file.

## done when

- TestHookEventsAreOneType reads every non-test go file of src/engine rather than two named ones, decided by reading the test body
- a bare event name planted in a third file of src/engine fails the test naming that file, decided by planting one and running go test -C src/engine -run TestHookEventsAreOneType

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | The guard holds over the package its ask names | the detail |
| [x] | what breaks if it is never done, and not only that it stays undone | A bare event name in any third file goes unseen | the detail |
| [x] | the ask is small enough to review whole, or it is split first | — |  |
| [x] | every done-when line is decidable, and names the command where one decides it | Both are, and the second names the plant | the done when |
| [x] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | — |  |
| [x] | one test was written first and seen red for the reason expected | A bare PreCompact planted in icons.go, named by the widened guard | the run below |
| [x] | the same test was seen green after the change, and named | TestHookEventsAreOneType, with the plant taken out | commit de9b12aa |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | It is in the change | commit d0c0e1d6 |

BOTH DIRECTIONS WERE MEASURED. With the plant in, the guard naming two files answered ok and the guard walking the package named icons.go. That is the hole this token is about.

THE BRANCH HEAD DID NOT BUILD WHEN THIS STARTED. sessiontakesmainback_test.go landed beside the session log move still naming OpenLog and Yes. It names the package now, in a commit of its own.

