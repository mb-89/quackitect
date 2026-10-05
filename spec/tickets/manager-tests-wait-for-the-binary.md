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
group: the-verbs-run-in-go
step: do
---

# Ask

gain: The manager tests in `src/quack/manager_test.go` hand their temp folders back only once the stopped index lets go of `quack.exe`, so the Windows check answers the same on every run.

breaks: `call stop` asks the index to exit and returns at once. On Windows the running binary stays locked, and `t.TempDir` cleanup fails with `Access is denied` on `quack.exe`. The `check (windows-latest)` job on the head of pull request 105 failed once that way in `TestAnIndexReachingNoWiringLoadsTheManagerAlone` and passed on its re-run. A red run stops auto-merge for every group behind it.

done_when:
- `go test ./src/quack/ -run 'TestAnIndexReachingNoWiringLoadsTheManagerAlone|TestATreeVerbStartsThisIndexWhereNoneStands|TestATreeWithNoWiringLoadsTheVehicleWiring' -count=3` passes
- `cd src && GOOS=windows go test -c -o /dev/null ./quack/` builds
- the `check (windows-latest)` job is green on the head of this group's pull request

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
