---
kind: [[ticket]]
state: open
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

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
