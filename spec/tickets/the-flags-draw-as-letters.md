---
kind: [[ticket]]
state: open
urgency: now
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
group: work/the-work-editor-draws
step: do
---

# Ask

A row carries one boolean key a flag, and the view draws them as one column of
letters. A letter stands lit where its key reads true, and dim where it reads
false.

| the letter | the key it reads |
|---|---|
| U | urgent |
| Y | a person owns the step this ticket stands on |
| W | a hand works it |
| B | it waits on a ticket still open |
| T | a hand parks it for the next pull |

The keys stay ordinary keys. The filter needs no new word for them.

Three things follow:

- a person names the key and its value, and the rows light up
- the word `not` in front keeps the other rows, and the filter reads it today
- a flag sorts like any column, because it is one
- a new flag costs a line in the base file, because the key already stands

The letters hold fixed places, so nothing shifts as one lights. `renderMarks`
in `src/viewer/footer.go` draws the footer that way, and this is that function
once a row.

The gain is one column saying five things. A person reads a row's whole state
in five characters, and filters on any one of them.

- a row draws every declared letter, lit or dim, in a fixed place
- `urgent: true` keeps the lit rows, and `not urgent: true` keeps the rest
- a flag no row carries draws dim on every row
- adding a letter costs a line in the base file
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
