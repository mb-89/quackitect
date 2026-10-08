---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: go-waits-on-events/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: doors-declare-what-they-own
parent: go-waits-on-events
record:
  - step: do
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 6aa74894f7b634416ae62999b3dacdd1c1a8c22e
    hash_after: 6aa74894f7b634416ae62999b3dacdd1c1a8c22e
    answered:
      - name: tests
        exit: 0
        said: green, src/watcher passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: 4b5e81a3b91d14ee
        size: 186
    def: d6b1f4f6b79afd91
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/watcher/watchertest/watchertest.go:58 time.After is a walk-around in a Go file that is no test, and the callers list leaves it out, so the first done_when line stays unmet without it

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/watcher

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

stopsWithin in src/watcher/watchertest/watchertest.go takes a q.Clock and waits on clock.After in place of time.After. The doors list names no walk-around in that file, so the first done_when line of the parent holds for it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask
the walk-arounds left in watchertest_test.go belong to go-tests-meet-the-doors, which owns the test files
the wait reads the clock its caller hands, and q.Clock stands once in src/q/clock.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
