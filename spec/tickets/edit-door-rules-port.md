---
kind: [[ticket]]
state: closed
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
todo: false
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
  - step: do
    hand: box d89586721a117 · claude-code-remote
    hash_before: 570a14cfe3379eb3936a272cfb378c16167cdb86
    hash_after: 570a14cfe3379eb3936a272cfb378c16167cdb86
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/the-brief-leaves-the-bridge.md:227:92: Vocabulary: openssession stands outside the words this tree writes. "
    inputs:
      - name: ask
        hash: 1b3e767cd9bd5f73
        size: 236
    def: f6f5975f3f858eb1
reason: done
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

./RUNME.sh test src/quack/editdoor_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The Go edit door now runs the rules the bridge write door runs before the schema and the voice. It refuses the bless file, and passes a draft and a path outside the tree. It refuses markers in a ticket git lists unmerged. It refuses an edit of an open ticket past its Discussion. It puts the engine fields back on any other ticket, and refuses an edit of those fields alone.

It refuses a file a projection owns. It refuses a text carrying a token or a run out of a note under .se/notes. The pure reads stand in hooks/write/rules.go and in the command package. quack/writedoor.go composes them in the bridge order. The door the edits module calls now reads the text before the write, and answers the text that lands.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change ports the six rules the ask names, and leaves the formatter to the flip
- the clear case failing on the base stands as a private note
- each wording stands once: the texts in write, the notes folder in command

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
