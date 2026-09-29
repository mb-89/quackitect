---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: copilot-meets-the-hooks-door/gate
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
group: go-cage-lands-in-shadow
parent: copilot-meets-the-hooks-door
record:
  - step: do
    hand: box d85490c97110e · claude-code-remote
    hash_before: 7f483097cd3b86e2b056f14a7b2936d8b61940c1
    hash_after: 7f483097cd3b86e2b056f14a7b2936d8b61940c1
    answered:
      - name: tests
        exit: 0
        said: green, 3 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: ab99ecf6b96abaff
        size: 262
    def: 60c95432c26efd34
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

asksText in src/bridge/config.js joins box.method for the tracked file, and neither the it in test/level0/copilot-shadow.test.js nor the it in src/scripts/copilot.js carries method, so shadowsHook throws before it reads migration.cage; give both a method of root

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/copilot-shadow.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The config reader joins method for the tracked file, so both the Copilot it in src/scripts/copilot.js and the one the shadow case builds carry method, the root. With it, shadowsHook in src/scripts/copilot-shadow.js reads migration.cage, and in shadow runs the hook verb of se-index with the input and the runtime answer as old. copilot.js calls it after handle, through the deadline-bound process door, and a throw leaves the runtime answer standing. The three shadow cases pass.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change gives both it objects a method of root, as the ask says, and lands shadowsHook, which the method fix exists to reach
- the change reveals no further cleanup
- the binary path stands once, in copilot-shadow.js, off the RUN folder folders.js owns

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
