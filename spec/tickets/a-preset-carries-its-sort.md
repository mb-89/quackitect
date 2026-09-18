---
kind: [[ticket]]
state: open
urgency: now
depends_on: [the-tree-sorts-several-keys, the-queue-is-a-score]
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
group: the-work-editor-draws
step: do
---

# Ask

A preset is a filter somebody wrote down, and it carries a sort beside it. A
press puts both in. The person then changes either one, and the preset holds
nothing after the press.

Presets draw as buttons in the filter panel, and a press adds one to what
already stands. So two presses narrow twice, and a third press takes one off.
`not done` stands pressed when the tab opens.

| the preset | what it keeps | how it sorts |
|---|---|---|
| not done | every ticket the state leaves open | the board's own order |
| queue | what the queue hands out | the queue place |
| yours | the steps a person owns | oldest first |
| unsorted | the drafts, and the tickets naming no group | oldest first |

A slice is the same thing over a value the data carries. A column's values
answer the buttons, so a slice costs no declaration and moves as the data does.

`ReadBase` reads past `groups` today, and that key is where a declared preset
stands. [[spec/design_output/tree-view#a-base-file-says-it]]

The gain is a query a person presses. The filter line stays for what a person
types, and the common questions take one press.

- a press puts the preset's filter and its sort in
- a second press on another preset narrows both, and a press again takes it off
- `not done` stands pressed at the open, and a press takes it off
- a person changing the sort after a press keeps that sort
- a column's values draw as slices, with no line in the base file
- `go -C src/viewer test ./...` is green
- `./RUNME.sh check` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
