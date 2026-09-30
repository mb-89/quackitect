---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-work-tab-reads-v1/gate
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
group: tui-shell-switches-over
parent: the-work-tab-reads-v1
record:
  - step: do
    hand: box d889b5fc6cd8 · claude-code-remote
    hash_before: e07dacffa4b0fa7d4c3b7eebc05248393639f30f
    hash_after: e07dacffa4b0fa7d4c3b7eebc05248393639f30f
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/work passes; green, src/modules/queue passes
      - name: check
        exit: 0
        said: "spec/tickets/work-tab-waits-sends-changes.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: a0cfc9f6e8d696ab
        size: 262
    def: b10bf3e839860457
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Row.Todo in src/modules/work/rows.go reads the front's todo alone, while the branch verb the tab drops also lights it for a plan override (overrides in src/scripts/work-answer.js), so a ticket placed with p loses its todo letter once the tab reads the rows alone

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/work/overrides_test.go src/modules/queue

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A ticket a hand places with the place chord lights its todo letter in `work/rows`, as the branch verb's answer lit it. The queue module answers `queue/overrides`, the places the plan file overrides, off the parser the queue already holds. The work module reads it through `work.overrides` in `spec/wiring.yaml`, the way it reads `queue/places`, since a module imports no other. `TestAPlanOverrideLightsTheTodoLetter` covers the fold.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the rows fold the override into the todo letter
- the cleanup it reveals, the import rule, shaped the change: the overrides ride the index in place of an import
- the plan's parse stands once, in the queue module, and the work module reads its answer

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
