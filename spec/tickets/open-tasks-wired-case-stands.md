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
    hash_before: 14123d1cd8133164b424c04b7833aea30e3ff1d7
    hash_after: 14123d1cd8133164b424c04b7833aea30e3ff1d7
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/replayed-red-leaf-reads-green.md:18:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: c866c6618b36faa6
        size: 225
    def: f8b8918cfe3f920f
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft names TestTheWiredTreeAnswersItsOpenTasks in src/quack/main_test.go, and no such case stands, so no red test decides that the wiring binds work.tickets, work.places and work.cloud; the builder writes it at implement

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

TestTheWiredTreeAnswersItsOpenTasks stands in src/quack/main_test.go. It reads the real wiring file, loads the tickets, queue and work modules under their bound names, and counts a fake tree to one open task, so a dropped work.tickets, work.places or work.cloud wire turns it red. The case lands with open-tasks-come-from-work, and this ticket adds no code.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the named case stands and decides the binding
the cleanup: the unit case claiming the same tree leaves under fake-tree-runs-the-queue
one place: the fake tree stands in the wired case alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
