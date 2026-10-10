---
kind: [[ticket]]
state: open
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
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: the index door keeps the folders it watches and says which it fails to watch, sweeps after a lost burst of events, and renews its lease while a value call drains.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `opensOn` in `src/index/door.go` drops a failed watch with no line and the whole watcher with it, `drains` in `src/watcher/watcher.go` throws away the overflow error, and `took` holds the door guard through a drain, so the lease lapses and every read queues behind it.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/index/ ./src/watcher/` passes with a case for a failed watch keeping the others, an overflow marking a sweep, and a value drain leaving the guard free
- `./RUNME.sh check` answers 0

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
