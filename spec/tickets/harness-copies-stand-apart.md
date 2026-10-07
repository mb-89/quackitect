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
    hash_before: 3088b233134e81a76f1cf56a8306d06555c6bd86
    hash_after: 5dd39e14083b198e4d2c93d5f0b76d5728121bd9
reason: became
successors: [example-harness-runs-on-fakes]
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

no red test shows each example runs over its own copy; the builder adds a case where one example's write stays unseen by another run beside it

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

go test ./src/quack/ -run TestEachExampleWritesOverItsOwnCopy, red on the stub harness until example-harness-runs-on-fakes lands; src/quack/examples_test.go stands on that ticket's red list

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

TestEachExampleWritesOverItsOwnCopy runs one example parking a note at .se/tickets/stray.md, then a second example expecting that note. The second must miss, and the fixture tree must hold no such file, so each example runs over its own copy. It stays red until the harness lands, and turns green with it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: a case where one example write stays unseen by another
- the cleanup the change reveals: none past the stub harness, which the parent builds
- every fact stands once: the notes folder rides in as the path pull.Notes names

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
