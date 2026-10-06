---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: git-hooks-run-in-go/gate
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
point: gate
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: javascript-leaves
parent: git-hooks-run-in-go
record:
  - step: do
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: aa50918f547ce3473e0bf7d59251d787f6f9fa5d
    hash_after: aa50918f547ce3473e0bf7d59251d787f6f9fa5d
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes; green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "    1.9  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: d229dd5aeb1df467
        size: 383
    def: 1ccaf5115d7b59f8
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the approach adds a fourth Go marker scan as command.MarkedIn and command.RefusedMarker, beside markedIn and mergeRefusal in src/branches/land.go, stagedFault in src/pull/pull_landed.go and mergeRefusal in src/quack/commit.go. The hooks module imports branches under item 7 anyway, so export the branches pair and call it, and drop src/modules/hooks/command/markers.go from the size.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/hook_reads_test.go src/modules/hooks/githooks_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Commit ca8489011 exports `MarkedIn` and `MergeRefusal` from `src/branches/land.go`, and the pre-commit road in the hooks module calls that pair. The fourth scan never landed, so `src/modules/hooks/command/markers.go` stands nowhere. One case in `hook_reads_test.go` holds the pair to the file and line of a marker, and one in `githooks_test.go` holds the pre-commit refusal to them.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the hooks call the exported pair, and no fourth scan stands.
the cleanup the change reveals: the scans in `src/pull/pull_landed.go` and `src/quack/commit.go` stand in the note `marker-scans-share-branches`.
every fact stands in one place: the marker scan the hooks run lives in `land.go` alone.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
