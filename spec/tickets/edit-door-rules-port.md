---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: edit-tools-answer-in-go/gate
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
todo: true
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: go-cage-switches-over
parent: edit-tools-answer-in-go
depends_on: ["edit-tools-answer-in-go"]
record:
  - step: do
    hand: box d894eee95148f · claude-code-remote
    hash_before: e299712d42dfc788506680d99754a4c0f32ba409
    hash_after: e299712d42dfc788506680d99754a4c0f32ba409
    returns: 1
    why: waits on edit-tools-answer-in-go, whose edits module this port writes into; depends_on now names it
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
      - name: check
        exit: 0
        said: "spec/tickets/the-brief-leaves-the-bridge.md:227:92: Vocabulary: openssession stands outside the words this tree writes. "
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the Go edit door lacks the bless file, the conflict markers, the open ticket door, the engine fields, the owner and the private rule that onWrite runs, and the bridge ticket hands them to this port, so a child ports them before the flip

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/edits_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Nothing changes yet. The rules port into the edits module, which edit-tools-answer-in-go builds, so this child waits on it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change waits on its parent, and depends_on names it
- no cleanup stands yet, since no code changes
- no fact lands yet

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
