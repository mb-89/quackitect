---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-log-tab-reads-v1/gate
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
group: tui-shell-switches-over
parent: the-log-tab-reads-v1
record:
  - step: do
    hand: box d88aea6eafd6 · claude-code-remote
    hash_before: 6de35b07c2503d50d40bd9ec5a2f7ddd3a6d5021
    hash_after: 6de35b07c2503d50d40bd9ec5a2f7ddd3a6d5021
    answered:
      - name: tests
        exit: 0
        said: green, src/tui/log passes
      - name: check
        exit: 0
        said: "spec/tickets/the-tui-data-paths-leave.md:376:73: Passive: Write in the active voice and name who acts: 'is reached'."
    inputs:
      - name: ask
        hash: 2f2bb14b07d85529
        size: 237
    def: 21b058f33a8e4913
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`src/tui/model_test.go` sends `LinesMsg` twice, so the callers and the size name it. `go.mod` keeps `fsnotify`, since the index, the files module and the watcher import it. The road reads `IndexRow`, so the shadow's `Row` gains no field.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/tui/log/v1_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The implement commit of the-log-tab-reads-v1, 98501ed5e, already carries this change. `src/tui/model_test.go` feeds rows through `registry.Change` on `log/rows` in the helpers `arrive` and `watched`, so no case sends `LinesMsg`. `go.mod` keeps `fsnotify`, since the index, the files module and the watcher import it. The road reads `IndexRow`, so the shadow's `Row` gains no field. This leaf adds no code.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: model_test.go names no LinesMsg, go.mod keeps fsnotify, and Row stands unchanged
the cleanup: the shadow's rowsName constant left in the same commit, and nothing else surfaced
one place: the says field points at the commit and repeats no code

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
