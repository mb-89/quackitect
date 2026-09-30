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
group: boxes-keep-their-own-tickets
step: do
record:
  - step: do
    hand: box d81dbc8656d8 · claude-code-remote
    hash_before: 415716dcafc8cb8de5b0c64b358bacbd2a1a82bb
    hash_after: 091f5548656d374e7271b1c527763fcb1ed18fd4
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: f2c375b298b2d7ad
        size: 619
    def: df12650931d480c9
reason: done
---

# Ask

The notes agents read say the owner's rulings: a box decides every step itself and records what it weighed, a box keeps the tickets it mints in its own group, and the dispatch and the boxes open no GitHub issue.

Without it an agent reads the old road, hands a question out, and waits on a person.

- `spec/guidance/cloud/cloud.md` rules 6, 7 and 9 say the rulings, and `./RUNME.sh lint spec/guidance/cloud/cloud.md` passes
- `AGENTS.md`, `.claude/skills/work/SKILL.md`, `.claude/skills/dispatch/SKILL.md` and `spec/design_output/work.md` say the same, each pointing at the owner of the rule
- `./RUNME.sh check` passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/work-merge-cloud.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The cloud guidance already holds the rulings. The work skill, AGENTS.md and the design output now point at it: a box decides every step, keeps what it mints in its group, and opens no GitHub issue. The dispatch skill says it hands a question to a box. The test named drives filesUp, which leaves person work alone loose on main.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, with one pointer a note
the cleanup: the dispatch skill description named the old issue road, and now names the box
the rule stands once in the cloud guidance, and each note links to it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
