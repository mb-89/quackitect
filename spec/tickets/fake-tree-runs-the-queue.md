---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: open-tasks-come-from-work/gate
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
group: open-tasks-shadow-lands
parent: open-tasks-come-from-work
record:
  - step: do
    hand: box d81c1a402acf · claude-code-remote
    hash_before: 1b097f6dc837c3a224c1bf9122e8607ab34bb63d
    hash_after: 97d0854b8dc2e241e008eb30dc8f8bbd542077e5
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/work passes; green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/replayed-red-leaf-reads-green.md:18:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 1ce13efd7091eab3
        size: 236
    def: f8b8918cfe3f920f
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

TestOpenTasksReadsAFakeTreeOfTickets seeds the places by hand, and open-tasks reads the places alone, so its tickets reach no port the count reads; the wired case over a fake tree of tickets decides the done_when line, not the unit case

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/work src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The unit case TestOpenTasksReadsAFakeTreeOfTickets leaves the work module: it seeds tickets and cloud rows the count reads nowhere, so it holds the places alone under a name claiming the tree. The wired case in src/quack/main_test.go holds the fake tree over the tickets, queue and work modules, and decides the line.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the wired case decides the line, and the unit case that claims it leaves
the cleanup: the unit case goes in this change, and fed keeps its ports because rows.go reads them
one place: the fake tree stands in the wired case alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
