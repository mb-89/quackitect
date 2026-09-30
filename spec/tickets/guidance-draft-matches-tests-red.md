---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-guidance-topic-lands/gate
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
parent: the-guidance-topic-lands
record:
  - step: do
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: c49ec42cd2ff68758e0440f228278127e6741a1b
    hash_after: c49ec42cd2ff68758e0440f228278127e6741a1b
    answered:
      - name: tests
        exit: 0
        said: green, 9 test(s) pass in 3 file(s); green, src/modules/guidance passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: c79a8388599e6c62
        size: 251
    def: 6662140e6eca978b
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft tests list leaves out TestGuidanceGoldenOldMeetsNew and the case a missing binary writes nothing, and its approach names an env port where tests-red carries each note env on Read.Env and filters it in Notes; write the answer under Discussion

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/guidance-shadow.test.js test/level0/guidance-shadow-wiring.test.js test/level0/guidance-golden.test.js src/modules/guidance

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The discussion of the-guidance-topic-lands now names what tests-red settled past the draft: the env a note names rides on Read.Env and Notes filters on it, with no env port, and the tests the draft list leaves out. The guidance module, quack guidance, the shadow and its wiring land with it, since every test the discussion names stood red until they ran, and they pass now. The golden holds no leaf the old reader and the module answer apart.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask under Discussion, since the engine writes the draft field, and the tests it names now run green.
The cleanup the change reveals rides in it: the stubs give way to the module and the shadow, and guidanceFiles and an empty old section each take a case.
The discussion points at the module and the test files, and repeats no rule.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
