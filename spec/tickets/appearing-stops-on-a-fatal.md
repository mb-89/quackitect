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
group: tests-and-ci-hold
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

TestTheIndexWatchStopsWhileFoldersAppear in `src/index/watch_test.go` and TestAStopReturnsWhileFoldersAppear in `src/modules/files/watch_contract_test.go` stop the Appearing goroutine after `watchertest.Returns`, which calls t.Fatal on a hang. A hang then leaves the goroutine recreating folders under the removed TempDir. Each test registers the stop with t.Cleanup as soon as Appearing returns.

The gain is a hang that fails one test alone, with no stray folders and no busy goroutine beside the other tests.

Without it a real hang adds a TempDir cleanup error, stray folders in TMP and a spinning goroutine to the failure.

- both tests register Appearing's stop through t.Cleanup before Returns runs
- `go -C src/index test ./...` and `go -C src/modules test -tags contract ./files/...` are green

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
