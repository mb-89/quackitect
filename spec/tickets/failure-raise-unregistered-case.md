---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: failure-verbs-raise-and-register/gate
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
parent: failure-verbs-raise-and-register
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 4d1e953cf21aa6bfe156c8969942f809dcbb5896
    hash_after: 4d1e953cf21aa6bfe156c8969942f809dcbb5896
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: 82e851f7c3e30087
        size: 195
    def: 9da33ea199bff5a7
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft exits exitFailed on an unregistered id but says nothing of the row it writes, and no case decides it. The design note says the message still prints and the id stands named unregistered.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/verb_failure_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

TestFailureRaiseOfAnUnregisteredIdLogsItAtErrorAndFails decides the raise of an id no node carries. The verb exits failed and still prints the message, then names the id unregistered. It writes the row at error with the id under failure, as the design note says.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one case decides the exit, the print and the row
- the cleanup the change reveals is none past the case
- the behaviour stands once, in the design note, and the case holds the verb to it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
