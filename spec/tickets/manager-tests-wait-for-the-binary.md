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
group: the-verbs-run-in-go
step: do
record:
  - step: do
    hand: box b87e97900f8f · claude-code-remote
    hash_before: 722e70ee06303e2019ace1dfc469c76fb529081e
    hash_after: 722e70ee06303e2019ace1dfc469c76fb529081e
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "    2.2  test/contract/vale-paths.test.js a rationale reads the same by its absolute path as by its relative one"
    inputs:
      - name: ask
        hash: 5042970a307df005
        size: 932
    def: df12650931d480c9
reason: done
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

./RUNME.sh branch test src/quack/manager_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The three manager tests that start an index now clean up through `stopped` in `src/quack/manager_test.go`. It asks the index to stop, then removes the binary and the root until both go, for at most thirty seconds. Windows locks a running `quack.exe`, and `t.TempDir` cleanup tries its removal once, so the stop that returned before the index exited left a red run behind.

The failure stands in the log of job 111919262343 of run 37356245280, on the head of pull request 105. The three tests passed three runs in a row here, and `cd src && GOOS=windows go test -c -o /dev/null ./quack/` builds. The Windows job on this group's pull request decides the last done line. No assertion changes, and no test is skipped.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the cleanup waits for the binary and the root, and the assertions stand as they were
- the cleanup: no other test in src/quack runs the bare stop, so the helper covers every caller
- one place: `stopped` owns the wait, and the three tests call it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
