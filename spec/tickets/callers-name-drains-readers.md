---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-split-deployment-takes-over/gate
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
group: module-processes-switch-over
parent: the-split-deployment-takes-over
record:
  - step: do
    hand: box b1311a2beaed · claude-code-remote
    hash_before: f85e93436cd5f0ee3cac4a71c2fb680a870b29cb
    hash_after: 780e2a0475f9427b022e4155afd3d42ce9a2427b
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "spec/tickets/the-split-deployment-takes-over.md:293:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 5278475349aac00c
        size: 144
    def: 3134c855268208f1
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the callers list leaves out src/index/answers.go value and tickets and src/index/v1.go, which read one.drains, which now waits on the placements

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

The callers of the door's drain, which now waits on the placements, are these. In src/index/answers.go, the value answer and the tickets answer each call one.drains before they read the store. In src/index/v1.go, valueOf and the read beside it call it too. Each runs on an HTTP handler's goroutine and holds no lock the placements' commit takes, so the wait blocks no answer it waits on. TestTheValueAnswerWaitsOnTheManagersSettle in src/index/door_test.go holds that the value answer drains through the manager's settle.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change names every reader of the drain, as the ask says, and a case holds the value answer to it
- the read reveals no cleanup
- each caller stands once, in its file, and this line points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
