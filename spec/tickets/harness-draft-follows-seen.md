---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: example-harness-runs-on-fakes/gate
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
group: examples-run-as-tests
parent: example-harness-runs-on-fakes
record:
  - step: do
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: 3fa7daadffa7ddabfcbc4ec1259b8ea8495d5afd
    hash_after: e4df4ebd6af12bef967e33bd5f6d807b824cc067
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "   71.5  in all"
    inputs:
      - name: ask
        hash: 663a7273fa608a5b
        size: 247
    def: 6a9703180e521855
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft approach keeps a real temporary folder and its size list leaves out src/quack/examples_harness_test.go, while tests-red moves the harness onto files.FakeDisk in that file; the builder follows seen and brings the approach and size in line

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

The parent draft kept a real temporary folder and left the harness file off its size list, while tests-red built the harness over files.FakeDisk in examples_harness_test.go. A line under the parent Discussion now holds the fake disk, the harness file and the copy case over the draft, so the implementer builds what tests-red set up. The change touches no code, so the check stands for the tests.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, through Discussion, since the engine writes the parent draft fields
- the cleanup the change reveals: none
- every fact stands once: the line points at the files and the test by name

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
