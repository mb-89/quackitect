---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: config-answers-keys-and-overrides/gate
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
group: sidebar-switches-over
parent: config-answers-keys-and-overrides
record:
  - step: do
    hand: box d88dc33717d8 · claude-code-remote
    hash_before: 44ab3d61b486211f94c285c254674d71a1692de2
    hash_after: 44ab3d61b486211f94c285c254674d71a1692de2
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/config passes
      - name: check
        exit: 0
        said: "spec/tickets/the-lens-calls-actions.md:307:61: Vocabulary: fakedisk stands outside the words this tree writes. Write a c"
    inputs:
      - name: ask
        hash: 33f4409fb8b86aee
        size: 108
    def: 3bda54621f1d9975
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft gives a built-in an empty layer, and the red case now wants `built-in`, as `quack config` answers.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/config/config_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The gate found four places where the config draft departs from the code. The engine writes the draft while the ticket stands open. So a list under its Discussion carries each correction, and the build reads it there: the built-in layer name, the node request the module builds, the dotted key both actions take, and the one resolver config/keys owns.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask through the one chapter a hand may write on an open ticket, and keys_test.go already wants built-in
- the other points of the gate close as answered by this list
- each name points at the file owning it: BuiltIn, configRows and the catalog

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
