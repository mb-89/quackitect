---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: battery names absent check
# where the token stands. The process owns these values.
status: open
claimed_by: 547b9365/worker-birch
claimed_at: "2026-09-05T15:44:44Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 2d5cbce39fc027d99566d1228a82658b93a86a2e
---

## detail

From the verdict on [[wk-0086ed9e9b]].

util/checks/battery.sh line 393 lists `a-refusal-names-a-legal-move` among the checks it runs. No such file has ever existed in this tree: `util/checks/*.mjs` holds 36 files and that is not one of them, and it is in neither f9a2af95 nor cf8e1d4e. The name was added by dd2fed69, the commit that landed wk-0086ed9e9b, in the same hunk that added `adapter-decides-no-column`.

Four lines below, at 396 to 399, the battery says what it does with a name it cannot find:

  else
    bad=$((bad + 1))
    say "$c" "FAIL it is not there, so it did not run"

under the heading A CHECK THAT IS NOT THERE IS A FAILURE, NOT A SKIP. So the battery is red by one, for a check nobody wrote.

The damage is that wk-0086ed9e9b's sixth criterion is "sh util/checks/battery.sh reports no new failure against the run before the change", and the change is the new failure. The token's own note says the battery was never run: "The battery is owed: a stale marker from the 10:37 run says one is still going, which wk-781c94fff2 carries." `se test` does not see it either, because the engine builds its check list from the files on disk, so a whole-battery run of 38 tests answers ok while battery.sh would go red.

The fix is to take the name out of the loop at line 393, unless the check is meant to exist, in which case it is a token of its own.

## done when

- util/checks/battery.sh names no check that is not on disk, decided by: every name in the loop at line 393 has a util/checks/<name>.mjs beside it
- a check catches the class next time: the names in battery.sh's loop are compared against util/checks/*.mjs, so a name with no file is red before the battery runs, not only inside it
- sh util/checks/battery.sh reaches its report line with no 'it is not there' failure

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
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

