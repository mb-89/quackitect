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
group: checks-and-index-read-right
step: do
record:
  - step: do
    hand: box 22efbd3bb307 · claude-code-remote
    hash_before: 423acffb9114d62a44d208e12e131213f9d7f425
    hash_after: 423acffb9114d62a44d208e12e131213f9d7f425
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/waits passes
      - name: check
        exit: 0
        said: "   78.0  in all"
    inputs:
      - name: ask
        hash: ba612c142f7d5c45
        size: 388
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a wait on a file nobody wrote yet says the file stands nowhere, and never calls it quiet.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `stateOf` in `src/modules/waits/waits.go` reads a missing path as a steady state, so a wait on a log the job has not created yet answers quiet while the job runs.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/modules/waits/ -run TestAMissingPathNeverReadsQuiet` passes
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/waits

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A wait reads a path standing nowhere as unquiet: `quietOf` in `src/modules/waits/waits.go` holds its clock while any watched path is missing, and the cap line names the missing paths. A path written mid-wait counts its quiet from the write. `TestAMissingPathNeverReadsQuiet` and `TestALatePathCountsQuietFromItsWrite` failed red on the old code and pass now. The cases build their temp root in the package's `main_test.go`, so the fixture baseline drops the module's rows.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the wait names the missing path at its cap
- the path join moves into one helper, `at`, which both readers call, and the temp root moves to the fixture home
- the cap line stands once, in `waits`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
