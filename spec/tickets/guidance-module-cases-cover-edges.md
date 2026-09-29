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
    hash_before: 963274102c4420fadf274f45359e4ab5720c6b29
    hash_after: 963274102c4420fadf274f45359e4ab5720c6b29
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/guidance passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: c3657816f87b9360
        size: 200
    def: 6662140e6eca978b
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

guidanceText lets a work root stand over the method root notes, and namesUnder drops a note whose name opens with an underscore, and no module case covers either while the golden reads this tree alone

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/guidance

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The guidance module now takes a case for each edge of the old reader the golden never meets: TestAWorkRootNoteStandsOverTheMethodRootNote holds a work root note over the method root note of its name, as guidanceText reads it, and TestANoteOpeningWithAnUnderscoreStandsAsADraft drops a note whose name opens with an underscore, as namesUnder does. Both cases landed with the module change under guidance-draft-matches-tests-red.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: one module case for each edge.
The change reveals no cleanup.
Each edge stands once, in src/modules/guidance/guidance.go, and its case reads it there.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
