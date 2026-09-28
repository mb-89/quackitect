---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: groups-land-through-pull-requests/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-cloud-works-its-queue
parent: groups-land-through-pull-requests
record:
  - step: do
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: 0a66666a689d9066c27df7a260569f5cb75f3021
    hash_after: 0a66666a689d9066c27df7a260569f5cb75f3021
    answered:
      - name: tests
        exit: 0
        said: green, 60 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:271:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: cf8f6525dda4e3ed
        size: 171
    def: c1e6301a5c8b9caf
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the take case covers a branch behind main alone; add a case whose tip stands past work.staleAfter, and hand stuckIn a clock time, since take calls readFree(it) with no now

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/work.test.js test/level0/dispatch.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

branch take handed out a stuck hand-over when its branch stood behind main, but never when its tip stood past work.staleAfter. The take called stuckFirst with no clock time, so the stale test always read fresh. stuckFirst now defaults its time to the clock through nowOf in work-free.js, which the trigger reads too, and a new take case holds a tip two days old against a twelve-hour span.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: a stale case stands, and stuckIn gets a clock time
- the trigger's own clock line moves to nowOf in the same change
- nowOf answers the clock in one place for the take and the trigger

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
