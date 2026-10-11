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
    hand: box f689bbb375f6 · claude-code-remote
    hash_before: 97e45157870d5eba457891fabe69810a6daf4d10
    hash_after: a7a5ece904036867d2ce2000050bd3d9013b909c
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes
      - name: check
        exit: 0
        said: "   59.2  in all"
    inputs:
      - name: ask
        hash: 08808c27d8241d40
        size: 550
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: the sweep and the editor raise `GroupAsksNobody` on a cloud group's child holding a person step, as lint does.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `groupAsksNobody` in `src/modules/check/group.go` asks `tree.Names` for `spec/tickets/` with its trailing slash. `Texts.Names` compares `path.Dir` against that folder and names no ticket, so the rule never fires in the sweep or the editor.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/modules/check/ -run TestGroupAsksNobodyFiresInTheSweep` passes over an open group and a child whose step reads `by: person`
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/check

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`Tree.Names` in `src/modules/check/tree.go` trims a folder trailing slash before it asks the source, so `Texts.Names` and the disk answer alike. `groupAsksNobody` now reads the tickets in the sweep and the editor, as it did in lint. `TestGroupAsksNobodyFiresInTheSweep` failed red and passes now.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change takes the fix sketch second form, in `Tree.Names` once
- the slash rule stands in `Tree.Names` alone
- the check stays green with the rule live in the sweep

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
