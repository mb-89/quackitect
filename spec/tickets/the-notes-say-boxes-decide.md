---
kind: [[ticket]]
state: open
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

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
