---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: check-names-meet-their-goldens/gate
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
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: read-topics-land-in-shadow
parent: check-names-meet-their-goldens
record:
  - step: do
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 14fa5a46f5806ce5c59e44a21f0e01f48c69c0fc
    hash_after: 14fa5a46f5806ce5c59e44a21f0e01f48c69c0fc
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes; green, src/lsp passes
      - name: check
        exit: 0
        said: "src/scripts/guidance-shadow.js:12:1: CodeComment: Code carries no comment here. Write a header of at most five lines at "
    inputs:
      - name: ask
        hash: 255ceaed94f5d33f
        size: 188
    def: f849b4e6f26cc929
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

check.Registers stands in no wiring in src/quack/main.go, so the check names stand in a test catalog alone, where the group ask puts every read-only topic in shadow under its own slice key

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/check src/lsp

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The wiring now loads the check module as the check instance, so every check name stands on the index quack runs, beside the migration slice key the group ask reads. The module registers each twin under its bare name, and the instance carries the check prefix, the way the wiring names every port it leaves unwired. TestTheWiredTreeAnswersEveryCheckName in src/quack reads each name off the wired tree. Weighed: ten wires in spec/wiring.yaml would name each twin a third time, beside check.Twins and src/scripts/check-twins.js, so the instance prefix answers instead.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: check.Registers now stands in the wiring of src/quack/main.go and spec/wiring.yaml.
The cleanup the change reveals rides in it: the module test reads the bare twin names the module now registers.
The check prefix stands once, as check.Prefix, and the wiring instance gives it, with no wire repeating a twin name.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
