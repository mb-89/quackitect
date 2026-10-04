---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: box-verbs-port-to-go/gate
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
group: box-verbs-run-in-go
parent: box-verbs-port-to-go
record:
  - step: do
    hand: box 8ca46dccf16b · claude-code-remote
    hash_before: 4d9f56f4786014fbf74aa342a574d8215c43882b
    hash_after: 4d9f56f4786014fbf74aa342a574d8215c43882b
    answered:
      - name: tests
        exit: 0
        said: green, 11 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "   57.2  in all"
    inputs:
      - name: ask
        hash: 03d25f5be871976c
        size: 167
    def: 89146b8ec86d255d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

once verbs/probe.js leaves, probe-dry.js needs a main guard to run as its own entry, and test/level0/probe-dry.test.js reads probeApart's argv; implement updates both.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/probe-dry.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

probe-dry.js runs as its own program through verbMain, reading the doors off cli-doors.js only when it runs as main, so the check importing it loads nothing more. probeApart starts that entry over the working change, and the probe-dry test reads the new argv. logRows moves into probe-cold.js, which every probe module already imports, with its torn-line case beside it, so probe.js imports nothing back and can leave with the verb. The survey cases move into survey_test.go beside survey.go. The check runs the dry probe through the entry, and every line passes.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the ask names the entry guard and the test, and both land
- the runtime folder in survey.go now names folders.js beside its copy, as the tree test asks
- logRows stands once, in probe-cold.js, with its test in probe-cold.test.js

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
