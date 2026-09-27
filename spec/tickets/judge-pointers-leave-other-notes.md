---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-judge-leaves-the-code/design/review
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
group: the-engine-holds-the-route
parent: the-judge-leaves-the-code
record:
  - step: do
    hand: box d7d809305dcf · claude-code-remote
    hash_before: da15c9a43c5f7088dd3f78a5e240673564b83366
    hash_after: 969964e5573f2a0d47e1f4b5bcc86b58eeba3cee
    answered:
      - name: tests
        exit: 0
        said: green, 17 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-moves-to-plan.md:121:99: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

sentences outside pull.md name the pull's judge. They stand in spec/design_output/hook-protocol.md in the chapter on classify, in spec/design_output/level0.md beside answer.enabled, and in the hooks.json description, which brand.js does not stamp. The cut rewrites each, and the callers list names hooks.json beside brand.js

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/brand.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The sentences outside pull.md that name the pull judge leave: the classify paragraph of spec/design_output/hook-protocol.md, the answer.enabled paragraph of spec/design_output/level0.md, and the plugin description in hooks.json and in brand.js. A case in test/level0/brand.test.js holds the stamped description to the pull alone.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: each named sentence drops the judge, and brand.js drops the same words.
The change reveals no cleanup past the parent cut, which the parent Discussion names.
The change adds no fact, and the description stands in hooks.json and brand.js as it stood before.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
