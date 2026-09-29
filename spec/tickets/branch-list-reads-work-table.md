---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: pull-verbs-become-actions/gate
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
group: quack-verbs-land-in-shadow
parent: pull-verbs-become-actions
record:
  - step: do
    hand: box d8509c02d5db · claude-code-remote
    hash_before: a68452ede8484870e3a52f7514c35f230488e4db
    hash_after: a68452ede8484870e3a52f7514c35f230488e4db
    answered:
      - name: tests
        exit: 0
        said: green, 20 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/work-verbs-become-actions.md:260:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 915711da7cd4d8f5
        size: 236
    def: 894320b5dd55a1cb
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft edits BRANCH by hand to match the doing table in work.js, which leaves two copies to drift again; the drift ticket asks BRANCH built off the table work answers, so one place owns the names, with a case holding the two together

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/branch-needs.test.js test/level0/pull-steps.test.js test/level0/pull-push.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The branch verbs a step names under needs now read the table work answers, WORK_VERBS in src/scripts/work.js, and BRANCH leaves pull-route.js. VERBS reads the table through a getter when a need asks, since work.js imports the pull and a read at load meets the table unbuilt. A case holds every verb of the table to the needs check, open and unblock among them, and new answers no more. The BRANCH case leaves the red file of pull-verbs-become-actions, since this case takes its place.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one table owns the names, and a case holds the needs check to it
- the BRANCH case in the red needs file leaves, since the new case covers it
- the names stand once, in WORK_VERBS, and the pull reads them there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
