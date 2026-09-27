---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: a-moved-input-marks-steps/design/review
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
step: do
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-process-stays-editable
parent: a-moved-input-marks-steps
record:
  - step: do
    hand: box d7d9b0d5dfcf · claude-code-remote
    hash_before: 0f220c255a82286ec2566f1b4699191d96a1ce55
    hash_after: 9d3f22868405596d824d6b004dc189fc7b2d452c
    answered:
      - name: tests
        exit: 0
        said: green, 14 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "test/level0/retro-collect.test.js:1:1: FileCeiling: A file holds 600 lines, and the file holds 678. Split it by topic."
    inputs:
      - name: ask
        hash: 1b5cbc28855f1331
        size: 156
    def: 90b8f9f7c0b698b1
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

hashText in src/scripts/pull-bless.js hashes a chapter for the bless already, so the stale read takes its chapter hash from one function both modules import

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/pull-bless.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The bless hash in src/scripts/pull-bless.js, now named blessHash, hashes its chapters with hashText out of .claude/skills/level0/lib/hash.js, the function the stale read in src/scripts/pull-stale.js imports, and both read a chapter through chapterText. It drops the detour through hashOf, which wrapped the text in a JSON string, and the slice, which cut nothing. A bless stored before the change reads as moved, and no tracked ticket holds one. A case in test/level0/pull-bless.test.js pins the bless hash to hashText over chapterText.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: one hash function, imported by both modules
the rename from hashText to blessHash is the cleanup the shared import reveals, because the local name hid the imported one
the hash lives in lib/hash.js alone, and both modules point at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
