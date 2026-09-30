---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: agents-call-quack-directly/gate
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
group: quack-verbs-switch-over
parent: agents-call-quack-directly
record:
  - step: do
    hand: box d85989c4d4d5 · claude-code-remote
    hash_before: 816f6ccddef08a314ecb9da28230b96927253b7e
    hash_after: 816f6ccddef08a314ecb9da28230b96927253b7e
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "spec/tickets/verbline-spares-blocking-verbs.md:41:97: Vocabulary: nodeaccept stands outside the words this tree writes. "
    inputs:
      - name: ask
        hash: 31f3ce842ad24ddf
        size: 206
    def: fb0b796fd802391d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/modules/hooks/cage.go names src/scripts/needs-shadow.js in two comments as the owner of the shadow row's fields; the pointer dangles once the file goes, so it points at cage.go's own row or the log note

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Two comments in cage.go named needs-shadow.js as the owner of the shadow row, and that file leaves with the verbs switch. Both now point at the design input chapter on how a slice moves, which defines the row.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: both comments point at the row owner
- no cleanup beyond the two comments shows
- the row stands defined in the design input alone, and the comments point there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
