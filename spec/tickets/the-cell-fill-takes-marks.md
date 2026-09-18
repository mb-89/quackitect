---
kind: [[ticket]]
state: closed
urgent: true
depends_on: [the-work-tab-draws]
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
    hash_before: 7f975f0553e6337cb2dfe71d07950dbb8bd409ac
    hash_after: 7f975f0553e6337cb2dfe71d07950dbb8bd409ac
    answered:
      - name: tests
        exit: 0
        said: green, src/viewer passes
      - name: check
        exit: 0
        said: 82 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

`Fill` writes a value into every row the view holds. So a person wanting five
rows of the fifty on screen filters down to those five first. That is a filter
written to stand in for a choice.

Marks answer it. A person marks rows, and the fill reaches the marked ones
alone. With nothing marked the fill reaches the view, the way it does today.

| what a person does | what the view does |
|---|---|
| marks a row | the row stands marked, and the mark draws on it |
| shift and a row | every row from the last mark to this one |
| marks with a fill standing | the fill reaches the marked rows |
| changes the filter | every mark goes |

Marks going on a filter change keeps a fill honest. A mark a person cannot see
is a row a fill writes blind.

This is how a person moves work between groups. Mark the rows, edit `group` in
the cell, and every marked row takes it. So no drag crosses two panels, and the
editor stays one.

`Take` and `Fill` each answer the rows keeping the value they carry, so a schema
refusing a value is already said. [[spec/design_output/tree-view#a-schema-refuses-a-value]]

- a press marks a row, and the same press takes the mark off
- shift and a row marks the run from the last mark
- a fill with marks standing reaches the marked rows alone
- a fill with nothing marked reaches the view, as it does today
- a filter change takes every mark off
- an afternoon of edits lands in one press
- `go -C src/viewer test ./...` is green
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

A person marks rows, and a fill standing over marks reaches those rows alone.
With no mark standing the fill reaches the view, so the plain fill stays what
it is:

| what a person does | what the view does |
|---|---|
| `m` on a row | that row takes a mark, and `m` again takes it off |
| `M` on a row | every row from the last mark to this one takes one |
| a fill over marks | the value reaches the marked rows |
| a change to the filter | every mark goes |

A marked row draws its mark, so a person reads what a fill reaches. A mark a
person cannot see is a row a fill writes blind, so a narrowing drops them all.

This is how a person moves work between groups: mark the rows, write `group` in
the cell, and every marked row takes it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: a fill reads the marks, and the filter takes them off
- the cleanup it reveals: the fill asks one function for its rows, marked or not
- the marks stand in `treemark.go`, and the fill and the drawing both read that one


# Discussion

- The mouse reaches a row of the work tree, and `m` and `M` carry the marks
- An afternoon of edits lands in one press, because the fill reads every mark
