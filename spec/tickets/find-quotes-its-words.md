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
    hash_before: 1f70d622412b82a788ea6ea27a6fa9bac9dd2ae7
    hash_after: 170de1b830b57a3d167e8b867e8563bf71d6916e
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "   59.9  in all"
    inputs:
      - name: ask
        hash: 96424cb858b25a05
        size: 523
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a search for a ticket id, a file name or a dotted Go name answers its rows, and a malformed query reads as a query fault in place of a dead index.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `Find` and `Notes` in `src/index/find.go` bind the raw words as an FTS5 expression, so `the-sweep-prepares-once`, `index.go` and `door.took` fail, and search reports the healthy index dead.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/index/ -run TestFindTakesPunctuatedWords` passes over kebab, dotted, slashed and quoted words and a bare `AND`
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/index

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`Find` and `Notes` in `src/index/find.go` hand FTS5 the words through `phrased`, which quotes each word and doubles its quotes. A ticket id, a file name, a dotted name, a path, a quote and a bare AND now each find their line, where each failed as a query fault before. `TestFindTakesPunctuatedWords` failed red on every word and passes now.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the fix sketch, and no caller relies on FTS5 operators
- the quoting stands in `phrased` alone
- search keeps its dead-index line, which a query fault no longer reaches

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
