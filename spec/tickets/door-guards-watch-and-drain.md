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
    hash_before: 503c4287eb00f23f8307b5c1c7d39e6d3fd8ea20
    hash_after: ddde1a268984fd07a8e6ef1571a03db01698a53a
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes; green, src/watcher passes
      - name: check
        exit: 0
        said: "   57.8  in all"
    inputs:
      - name: ask
        hash: 3d9e5a79523d7df7
        size: 658
    def: df12650931d480c9
reason: done
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

    ./RUNME.sh test src/index src/watcher

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The index door keeps its watch and its lease. `folders` adds every folder past one that fails and answers the first failure, so `watches` keeps the watch and `opensOn` names the failure on stderr. `watcher.Hearing` hands each fsnotify error to the door, and an overflow marks a sweep of the whole tree for the next settle. `took` drains a value or tickets call before it takes the guard, so the work loop renews the lease. Three new cases cover the failed watch, the overflow and the guard-free drain.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the fix sketch for both findings
- the watch rows in the index design note name the failure and the overflow
- the drain rule stands in `drainsFirst` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
