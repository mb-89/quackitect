---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: a-guard-reads-door-declarations/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: doors-declare-what-they-own
parent: a-guard-reads-door-declarations
record:
  - step: do
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: da47eb2ed19780447242324d98ae27f5f57773a4
    hash_after: 379d25da18a9c4cfefc9ee066b7a8390bc400b55
    answered:
      - name: tests
        exit: 0
        said: green, 9 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "  101.6  in all"
    inputs:
      - name: ask
        hash: 32371f26f64b1bf0
        size: 208
    def: ce98b9e976552e83
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the Vale rule DoorsOnly keeps its own hand-kept list of node: imports, Date.now, new Date() and Math.random beside the new guard, and the design names no fate for it; derive it, retire it, or say why it stays

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/outside-in-doors.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`DoorsOnly` stays, and the doors note says what retires it. While every JavaScript door stands at report, the guard refuses none of it, and `DoorsOnly` is the one refusal left. It also refuses `Math.random` and every `node:` module, and no declaration owns those. It retires in the change that drops report from the last JavaScript door, once a declaration owns `Math.random` and the guard refuses an undeclared `node:` module, as the Go floor does.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: it says why the rule stays, and names the change that retires it
the cleanup: the gap between the rule and the declarations, `Math.random` and undeclared `node:` modules, stands in the same note
one place: the fate stands once, under the declarations section of the doors note

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
