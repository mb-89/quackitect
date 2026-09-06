---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: rank misses long checks
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/reviewer-kandinsky
claimed_at: "2026-09-06T10:29:07Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - ca74bb277263dfff12cdd8a25063308a74e3c5b8
---

## detail

A finding on wk-9d3e05a4bc, blocking work goes first.

aCheckAnswer in src/engine/blocking.go requires two or more spaces between a check's name and its answer:

	^(\S.*?)\s{2,}(ok|FAIL)\s+\d+s

battery.sh writes those lines with printf '%-16s %s'. A name of sixteen characters or more gets no padding at all, so one space separates it from its answer, and the pattern does not match.

Over the newest run in this tree, .se/tests/battery-20260906-085342.out, twenty-eight of fifty-three checks are invisible to the rank. Five of the nine red ones are missed: adapter-decides-no-column, checks-live-in-the-method, tests-name-no-token, a-refusal-names-a-legal-move and open-tokens-carry-their-sections. Only the short lane names get through, go build and se lint among them.

The token's own motivating case is one of the missed. It says the token about the branch head not building waits behind everything older. That check is the-branch-head-builds, twenty-two characters.

The fixture hides it. blockingfirst_test.go writes its own battery output and names the check se lint, which is seven characters and pads. Swapping that one name for the-branch-head-builds, and its padding for the single space printf writes, turns the first two subtests red at the tip while the change is untouched.

The fix is the separator: one or more spaces, not two. The check that catches the class is a case reading a battery output this tree actually left behind, rather than a string written beside the assertion.

## done when

- aCheckAnswer matches a check whose name is sixteen characters or longer: go test ./src/engine -run TestBlockingWorkGoesFirst with the-branch-head-builds in the fixture, padded as printf writes it, is green
- TheRedChecks over .se/tests/battery-20260906-085342.out answers all nine red checks and not four
- a case in blockingfirst_test.go reads a real battery output file from the tree, so a change to what battery.sh prints reddens here

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [ ] | the ask is small enough to review whole, or it is split first | — |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | one test was written first and seen red for the reason expected |  |  |
| [ ] | the same test was seen green after the change, and named |  |  |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

