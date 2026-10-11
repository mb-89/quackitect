---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: quoted-fronts-round-trip/gate
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
group: tickets-keep-their-chapters
parent: quoted-fronts-round-trip
record:
  - step: do
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: c2e40442f208bdf5f27b1621a30e75d68c1f029f
    hash_after: 495b45445181833cf4b016f61cff274911acf489
    answered:
      - name: tests
        exit: 0
        said: green, src/yaml passes
      - name: check
        exit: 0
        said: "   62.8  in all"
    inputs:
      - name: ask
        hash: 68ca8f29dab435f2
        size: 404
    def: f0e563b5ce6828f8
reason: done
---

# Ask

A flow list item holding an escaped quote reads as one item, because the flow split skips an escaped quote as `QuotedWhole` does.

An item holding an escaped quote and then a comma splits into two items, so a list field reads back with an item the writer never wrote.

- go test ./src/yaml passes a case where a flow item holding an escaped quote and a comma reads as one item
- ./RUNME.sh check is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/yaml

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`flowItems` in `src/yaml/yaml.go` keeps a backslash and the character after it inside a double-quoted item, as `QuotedWhole` reads them, so an escaped quote no longer ends the item. An item holding an escaped quote and then a comma reads as one item. `TestAFlowItemKeepsAnEscapedQuote` reads such a list.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- no cleanup stands past the change
- the escape rule stands beside the one in `QuotedWhole`, each over its own read

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
