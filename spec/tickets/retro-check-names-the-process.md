---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-retro-reads-the-backlog/design/review
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
group: the-process-stays-editable
parent: the-retro-reads-the-backlog
record:
  - step: do
    hand: box d7da794434cd · claude-code-remote
    hash_before: a84cc6df93547f687ff02eb87d16d7eab9f6b4c1
    hash_after: dc80bbc14e4e360a327be114b30ac86349d2dd69
    answered:
      - name: tests
        exit: 0
        said: green, 9 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-retro-reads-the-backlog.md:168:230: Vocabulary: ticketfaults stands outside the words this tree writes."
    inputs:
      - name: ask
        hash: db5df8a9e089865a
        size: 308
    def: 8aa9a61b644a31e1
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

rules 4 and 5 of spec/guidance/retro/check name a ticket name, a gain, a breaks and a done_when as what an open class and a promotion carry, so a hand following them writes no process and the new ticketFaults refuses every mint; add process to both rules and to the fixtures of test/level0/retro-mint.test.js

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/retro-mint.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Rules 4 and 5 of spec/guidance/retro/check name the process beside the ticket name, gain, breaks and done_when, so a hand writing a class or a promotion names the route its ticket mints onto. The fixtures in test/level0/retro-mint.test.js carry a process, so they stand valid once the-retro-reads-the-backlog makes ticketFaults refuse a ticket naming none.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: both rules and both fixtures name the process
the change reveals no cleanup beyond rule 5 fitting the word cap, which rides in it
the process field stands once in each rule, and the mint code owns what it means

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
