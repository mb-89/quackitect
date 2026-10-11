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
group: branches-and-pull-report-truly
step: do
record:
  - step: do
    hand: box 8339730da099 · claude-code-remote
    hash_before: de49636669385d17c1b975c436928c8f274f0af8
    hash_after: de49636669385d17c1b975c436928c8f274f0af8
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "   96.0  in all"
    inputs:
      - name: ask
        hash: eeca8dfdb0f02c74
        size: 395
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: `branch test --red` keeps every working edit, whatever sources it names.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `setAside` in `src/branches/test.go` copies a source named twice over its own aside copy, and removes a named folder's files. `putBack` then restores HEAD's text, or an empty file.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/branches/ -run TestRedSetsEachSourceAsideOnce` passes
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/branches/test_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`setAside` in `src/branches/test.go` copied a source named twice over its own aside copy. It also read a named folder as one missing file and removed what stood under it. `putBack` then wrote back HEAD's text, or an empty file. `asideFiles` now names each file once: a file as itself, and a folder as each file under it on disk or at HEAD. `branch test --red` then keeps every working edit, whatever sources it names.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the red run keeps every working edit
- the change reveals no cleanup
- the fact stands once: `asideFiles` alone expands the named sources

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
