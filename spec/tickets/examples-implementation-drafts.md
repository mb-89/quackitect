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
group: examples-are-the-tests
depends_on: [examples-design-note]
step: do
record:
  - step: do
    hand: box 2dca9acd8cb4 · claude-code-remote
    hash_before: a021735c6c7bb47aaec9910e4bccb3cfe3443b1e
    hash_after: 98681743864e3193077baaac6143d6334def0fb1
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "    2.5  test/contract/index.test.js a stopped index leaves no se-index process past the case"
    inputs:
      - name: ask
        hash: 007db9604b3b7ec8
        size: 395
    def: df12650931d480c9
reason: done
---

# Ask

The implementation group stands minted as drafts, each child naming the chapter of the design note it builds, so a later box takes the work without reading this run.

The design waits with no ticket to carry it, and the next hand rebuilds the split from the note.

- a draft group ticket and its draft children stand under `spec/tickets`, each child naming the group
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The implementation group examples-run-as-tests stands as a draft with eight draft children, each naming the design note chapter it builds and the children it waits on. Nobody works them in this group.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the drafts follow the ask, and stand as their own later group in place of this one, as the owner asks
- the cleanup it reveals: the mint writes the branch group onto every ticket, noted for the retro
- each fact stands once: each child links the design note chapter and restates none of it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
