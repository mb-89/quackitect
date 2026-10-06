---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: ci-runs-once-a-head
step: do
record:
  - step: do
    hand: box d040db23b249 · claude-code-remote
    hash_before: 5e91033fe0f51206d090412c97f8e90cf225099c
    hash_after: be4e8920f2da725c21f1fcb77e37e767aa2907c2
    answered:
      - name: tests
        exit: 0
        said: green, 3 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "    1.8  test/contract/vale.test.js a shouted lead is refused and an acronym inside a sentence passes"
    inputs:
      - name: ask
        hash: ce76f2163c7d86f1
        size: 910
    def: df12650931d480c9
reason: done
---

# Ask

`.github/workflows/check.yml` runs on every push to any branch and again on
the pull request, on Linux and Windows, and no run gives way to a newer one.

The gain is a queue that runs one check a head. A branch takes its check
through its pull request, and a newer push cancels the run it supersedes, so
the fleet's pushes stop starving trunk's own run.

Without it each push to a branch with an open pull request queues four jobs,
superseded runs keep running, and trunk's run waits behind them.

- `check.yml` runs on a push to `main` alone, and on a pull request against `main`
- a concurrency group per pull request cancels a superseded run there, and a run on `main` is never cancelled
- the job and matrix names stay as they stand, so the required checks `check (ubuntu-latest)` and `check (windows-latest)` still report
- the group's pull request shows one check run a head
- `./RUNME.sh check` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/check-workflow.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The check workflow runs on a push to main and on a pull request against main, and no longer on a push to any other branch, so a work branch takes its check through its pull request alone. A concurrency group per pull request cancels a superseded run there, and each run on main takes a group of its own, so none on main gives way, queued or running. The job and its matrix keep their names, so the required checks still report. The contract test pins the triggers, the groups and the job name, and spec/design_output/work.md carries the reason under the check runs once a head.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: push on main alone, a group per pull request that cancels, a group per run on main, the names kept
- the cleanup the change reveals: the rescue and beat filter goes, since a push on main alone already leaves both out
- every fact stands once: the reason lives in work.md, and the workflow and the test point at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
