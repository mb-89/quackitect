---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: retro-verbs-become-actions/gate
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
parent: retro-verbs-become-actions
record:
  - step: do
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 50b227afe861b21e357092d6302dd02728d7e030
    hash_after: 50b227afe861b21e357092d6302dd02728d7e030
    answered:
      - name: tests
        exit: 0
        said: green, 1 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/work-verbs-become-actions.md:260:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: f1d1855241ba3f34
        size: 170
    def: f77f3daa2180b2fe
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the usage in src/scripts/retro.js prints no audit line and joins backlog and mint on one line, so the draft reads no usage doc for audit; the usage prints one line a verb

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/retro-usage.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The retro usage in src/scripts/retro.js prints one line a verb, audit among them, so a draft reading the usage finds every verb. The test in test/level0/retro-usage.test.js reads the printed verbs against the list RetroVerbs names in src/modules/verbs/retro.go. Its regex now spells the two-space indent as a count, which clears the Biome warning.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: one usage line a verb, audit among them
the regex fix Biome named rides this change
the verb list stands in RetroVerbs, and the test cites it in place of a second list

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
