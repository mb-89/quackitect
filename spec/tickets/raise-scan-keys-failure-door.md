---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: failure-check-refuses/gate
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
group: failures-stand-registered
parent: failure-check-refuses
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: f0cd8521874f2ffba6b75e744291a97db2325821
    hash_after: f0cd8521874f2ffba6b75e744291a97db2325821
    answered:
      - name: tests
        exit: 0
        said: green, src/failure passes
      - name: check
        exit: 0
        said: "    1.8  test/contract/runme-road.test.js ./RUNME.sh hands config to its program, which names the verbs slice at its bui"
    inputs:
      - name: ask
        hash: 64b68eb19e7fc772
        size: 462
    def: 2d462fb262bf5b4d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft names no rule telling a failure raise from another raise, and src/scripts/probe-dry.js and src/scripts/probe-clear.js call an engine raise with literal event ids such as session.start and tool.call, so a scan matching a bare raise( names each as an unregistered id and TestEveryRaisedIdStandsAsANode stays red; key the JavaScript match to the handle the failure door answers, and add a fixture case holding an engine raise that RaiseFaults leaves alone

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/failure/check_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

RaiseFaults in src/failure/check.go matches a JavaScript raise only on a handle whose name carries failure, the handle the failure door answers. An engine raise with an event id such as session.start or tool.call reads as no failure. check_test.go holds a fixture with both engine raises, which RaiseFaults leaves alone.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the match keys to the failure door handle, with the fixture case
- the cleanup the change reveals is none past the pattern
- the pattern stands once, at the top of check.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
