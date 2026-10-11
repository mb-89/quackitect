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
group: tests-and-ci-hold
step: do
record:
  - step: do
    hand: box af15433560d6 · claude-code-remote
    hash_before: 4b5f29fd26fcb2e3028bbdca39fc85202b96eb2d
    hash_after: 4b5f29fd26fcb2e3028bbdca39fc85202b96eb2d
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   66.7  in all"
    inputs:
      - name: ask
        hash: 2fd12d4a5c9df1c7
        size: 643
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

sharedFolder in `src/quack/main_test.go` adds a temp folder to buildDirs, and the only TestMain that empties buildDirs stands behind the contract tag. A plain `go test` of the package leaves a `quack-shared-*` folder in TMPDIR each run. The removal runs in every build.

The gain is a plain test run that leaves TMPDIR as it found it, and a comment that says true.

Without it every agent or developer running the package's tests directly piles up folders.

- `TMPDIR=<scratch> go -C src/quack test -count=1 .` leaves no `quack-shared-*` folder in the scratch folder
- the contract build still removes its own folders, under `./RUNME.sh check`

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

TestMain moves out of the contract-tagged box_processes_contract_test.go into main_test.go, so every build of the quack tests removes the folders sharedFolder and the shared build add to buildDirs. The contract file sets asSpawned in an init, and TestMain takes that road first, so a spawned test binary still runs the io and module verbs and leaves its pid. A plain go test of src/quack under a scratch TMPDIR left no quack-shared folder, where it left one before, and go vet passes under the contract tag. The comments saying TestMain removes the folders now read true in both builds.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the removal runs in every build, and the contract build keeps its spawned road
- the cleanup the change reveals stands in the change: none further
- every fact the change adds stands in one place: TestMain and asSpawned point at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
