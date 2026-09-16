---
kind: [[ticket]]
state: draft
urgency: now
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The check answers green on trunk again, so `branch done` lands a branch and the
tense rule keeps its teeth.

<!-- breaks, as text: what breaks if it is never done -->
The rules verb answers findings at error on trunk, so `branch done` reads a red
battery and refuses every branch. Each finding sits on a word the tagger marks
past, where the sentence stands in the present.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `./RUNME.sh lint spec src` answers no finding at error on trunk
- the tense rule keeps firing on a sentence written in the past, proven by a test over its own fixture
- `spec/schemas/paragraph.schema.yaml` carries whatever the fix adds, because the rule file writes itself again at each projection
- the owner rules whether the tagger's misfires join the exceptions, or the sentences take a rewrite

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
