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
group: tickets-keep-their-chapters
step: do
record:
  - step: do
    hand: box ad0d66ffa433 · claude-code-remote
    hash_before: 3d5cb7abd1abc8e7bf7581b5f9032e5a957ec5c4
    hash_after: fa23b6dd3e87695a912cb6c21808290c619d746b
    answered:
      - name: tests
        exit: 0
        said: green, src/config passes
      - name: check
        exit: 0
        said: "   66.5  in all"
    inputs:
      - name: ask
        hash: e243ddfd1d578801
        size: 463
    def: df12650931d480c9
reason: done
---

# Ask

config.Drop leaves a local layer that fails to parse untouched and returns the error, and it writes through a temp file and a rename, so a reader never meets a truncated layer.

A local config that fails to parse loses every setting the first time any verb calls Drop, and a reader racing the truncate reads an empty layer.

- go test ./src/config passes a case where Drop over a malformed file errors and leaves the file byte for byte
- ./RUNME.sh check is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/config

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Drop in `src/config/config.go` reads the local layer itself. A missing file starts an empty layer, and a file that fails to parse returns an error naming the layer, so a hand edit loses no key. The writer in `src/config/door.go` writes a file beside the layer and renames it over, so a reader meets the old layer or the new one, whole. The case `TestDropRefusesALocalLayerThatFailsToParse` holds the broken file byte for byte.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask for Drop; the config verb's own write path carries the same pattern and stays out of this ask
- no cleanup stands past the change
- the rule stands once, in the comment on Drop and on the writer

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
