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
group: branches-and-pull-report-truly
step: do
record:
  - step: do
    hand: box 8339730da099 · claude-code-remote
    hash_before: ea82e6d6b3544c744132e7776bc34448e1390691
    hash_after: ea82e6d6b3544c744132e7776bc34448e1390691
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes
      - name: check
        exit: 0
        said: "   92.8  in all"
    inputs:
      - name: ask
        hash: 3fbcb1878939f333
        size: 408
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a pull that fails to fast-forward names git's own message, and names divergence only where both sides hold commits.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `fetched` in `src/pull/pull.go` drops the fetch and fast-forward errors and blames divergence every time. Its remedy fails on a dirty tree as well.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/pull/ -run TestAFailedFastForwardNamesGitsReason` passes
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/pull/pull_landed_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`fetched` in `src/pull/pull.go` dropped the errors of the fetch and the fast-forward, and blamed divergence every time. A failed fetch now raises `pull-fetch-refused` with git's words. A refused fast-forward raises `pull-origin-diverges` where this box holds commits origin lacks, and `pull-fast-forward-refused` with git's words otherwise. The divergence remedy opens on committing or stashing the edits, because a rebase refuses a dirty tree.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: git's own message stands named, and divergence reads only where both sides hold commits
- the change carries its cleanup: the divergence remedy covers a dirty tree
- the fact stands once: each refusal has its own node under `spec/failures`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
