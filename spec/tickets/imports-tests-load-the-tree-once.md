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
group: code-is-pure-tests-behave
step: do
record:
  - step: do
    hand: box 37997ca97a74 · claude-code-remote
    hash_before: 912e3c7e6b20e58a74614959ecfab23654be902d
    hash_after: 912e3c7e6b20e58a74614959ecfab23654be902d
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes
      - name: check
        exit: 0
        said: "  102.1  in all"
    inputs:
      - name: ask
        hash: 9e0484f32b10cee3
        size: 505
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The `src/imports` tests load and type-check the tree once a run, and every tree case reads that one load. Each guard this group adds rides the same load at no cost.

<!-- breaks, as text: what breaks if it is never done -->
Each tree case loads the module again, and each new guard adds a load of its own.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `src/imports` loads the tree in one place, its `main_test.go` or a `sync.Once` builder, and `grep -l packages.Load src/imports/*_test.go` answers that one file
- `go test ./src/imports` passes, and the Discussion holds the package's time before and after

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/imports

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Nothing changes here. On this branch one case alone, TestTheTreeHoldsTheImportRules in src/imports/tree_test.go, loads the tree, so the package loads it once a run, and go test -count=1 ./src/imports takes about five and a half seconds before and after. The tests-meet-the-doors-once branch adds a second tree case and memoizes the load as treeLoad through sync.OnceValues, and carries it to main. The guards this group adds parse the test files on a walk of their own, and take no second load.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the ask holds on this branch, and the says line names the sibling branch carrying the memoized load
- the cleanup stands on the sibling branch, so this change carries none
- the change adds no fact

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
