---
kind: [[ticket]]
state: closed
urgent: true
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
record:
  - step: do
    hand: box 4089f1b3b6bc · claude-code-remote
    hash_before: 7ed105363fe66c62428bd6bf7fb2026c84c61b1e
    hash_after: 7ed105363fe66c62428bd6bf7fb2026c84c61b1e
    answered:
      - name: tests
        exit: 0
        said: green, src/tui passes
      - name: check
        exit: 0
        said: 83 stand at warning, which the panel draws and check allows.
reason: done
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
- `go -C src/tui test ./...` is green
- `./RUNME.sh check` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A preset is a filter this tree writes down, and it carries a sort beside it. A
press puts both in, and the person changing either one keeps that change:

| the preset | what it keeps | how it sorts |
|---|---|---|
| not done | every ticket the state leaves open | the board's own order |
| queue | what the queue hands out | the queue place |
| yours | the steps a person owns | the oldest first |
| unsorted | the drafts, and the tickets naming no group | the oldest first |

`spec/views/work.base` names them under `groups`, and `not done` stands in when
the tab opens. The panel draws each as a button with the key that presses it,
and a line a person types joins the presses.

A slice is the same thing over one column's values, which `Slices` answers off
the data, so it costs no line in the file.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the presets carry their sorts, and a slice reads a column's values
- the cleanup it reveals: the answer carries when a ticket came in, so the oldest sorts first
- the presets stand in the base file, and the tab and the panel both read that one list

# Discussion

- The mouse stands off the filter panel, so a key under alt presses a button there
- The ask names the oldest first, and the answer carries when a ticket came in under `--queue`
