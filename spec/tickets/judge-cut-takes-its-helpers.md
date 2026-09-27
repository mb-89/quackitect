---
kind: [[ticket]]
state: draft
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
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft misses helpers of the judge and their cases. forEvidence and labelOf in .claude/skills/level0/lib/guidance.js have judgeMaterial as their one caller. ruleBroken, FOLLOWS, LABELS and BREAKS in .claude/skills/level0/lib/pull.js serve the judge alone. quoted, parsed, refusals, QUOTE_MODEL and the configOf import in hooks/pull-tool.js go with judged. Their cases are the --judge cases in test/level0/pull-leaves.test.js, the forEvidence and labelOf cases in test/level0/guidance.test.js, and test/contract/guidance-rules.test.js. The judge.model fixtures stand in test/level0/projection.test.js, sidebar.test.js and clicks.test.js, and judge.maxSpans stands in config.test.js

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

The answer mark keeps rules out of the judge's material while `forEvidence` stands, so it leaves here, beside `forEvidence`:

- `answerMarker` and its comment in `spec/schemas/guidance.schema.yaml`
- the two `^` marks in `spec/guidance/voice.md`
- `ANSWER_MARK`, and the `^` in `MARK`, in `.claude/skills/level0/lib/guidance.js`
- the answer mark row of `spec/design_output/pull.md`
- the `^` case in `test/level0/guidance.test.js`
- the `^` assertions in `test/contract/guidance-rules.test.js`
