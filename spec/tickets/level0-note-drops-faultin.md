---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: javascript-leaves/accept
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
group: javascript-leaves
parent: javascript-leaves
record:
  - step: do
    hand: box ba1101ec7b2d · claude-code-remote
    hash_before: d5ca19d3b3d9e46907715aea9ab8ed9c89cea531
    hash_after: d5ca19d3b3d9e46907715aea9ab8ed9c89cea531
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "   74.2  in all"
    inputs:
      - name: ask
        hash: 4a8e501bddc72673
        size: 212
    def: de2763c66d557865
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

spec/design_output/level0.md, section 'A broken rule says so', names faultIn in lib/vale.js, which unloaded-js-readers-leave deleted; name the code that stops ./RUNME.sh lint on a broken rule now, or cut the line

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The section A broken rule says so named faultIn in lib/vale.js, which the group deleted. It now names lspRules in src/quack/rules.go, which turns a failed rules load into a RulesLoad error that the lint verb stops on. The change touches prose alone, so the check stands for the tests.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: it names the code that stops the lint now
- the cleanup: no other line names faultIn or lib/vale.js outside tickets and retros
- one place: the line points at the function, and repeats none of its logic

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
