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
    hash_before: c8ab6c68bb7bffd04a6ea658b2eb7bf9d36ed3e1
    hash_after: c8ab6c68bb7bffd04a6ea658b2eb7bf9d36ed3e1
    answered:
      - name: tests
        exit: 0
        said: green, src/viewer passes
      - name: check
        exit: 0
        said: 81 stand at warning, which the panel draws and check allows.
reason: done
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

    ./RUNME.sh branch test

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

One column draws the flags as letters, each in a fixed place. A letter stands
upper where its key reads true, and lower where it reads false:

| the letter | the key the answer writes |
|---|---|
| U | the ticket carries the urgent mark |
| Y | a person owns the step it stands on |
| W | a hand holds it, off the record |
| B | it waits on a ticket still open |
| T | a hand parks it for the next pull |

`spec/views/work.base` names each letter beside its key, so a new flag costs one
line there. The keys stay ordinary keys, so `urgent: true` keeps the lit rows
and `not urgent: true` keeps the rest.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: one column draws every declared letter, in its own place
- the cleanup it reveals: a view naming no order or letters falls through to the file
- the letters stand in the base file, and the drawing and the filter both read the keys

# Discussion

- The ask names a lit letter and a dim one, and the column draws upper and lower
- `yaml.Flat` answers one row for a key nobody names, so a reader counts its own result
