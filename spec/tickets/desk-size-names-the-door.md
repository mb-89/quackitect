---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-twins-leave-whole/gate
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
parent: the-twins-leave-whole
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: e0d67c333ec34b41e81add684005000db2fb1f7e
    hash_after: e0d67c333ec34b41e81add684005000db2fb1f7e
    answered:
      - name: tests
        exit: 0
        said: green, 2 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "  114.9  in all"
    inputs:
      - name: ask
        hash: ab17614b111f1ff5
        size: 207
    def: b3995cb871db2080
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

tests-red/seen says src/doors/failure.js answers lines alone, so the JS refusal prints them without waiting on the async raise. That file stands outside size, so the builder adds it there or drops the change

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/failure.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The failure door in src/doors/failure.js answers lines beside raise: the same lines a raise prints, at once, with no row. A JS caller answering its code at once, as the desk pull does, prints a refusal through the door this way, and the-twins-leave-whole names this file in its change. The fake door answers the same lines, and the contract case holds the two together.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the door's file joins the change, and the change it carries lands here
no cleanup follows: linesOf stays the one builder of a refusal's lines, which raise and lines both read
the lines stand built in one place, linesOf, and the fake reads the real liner

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
