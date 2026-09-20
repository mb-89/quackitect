---
kind: [[ticket]]
state: open
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
group: the-battery-earns-its-time
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A case that proves a rule over one line spawns once over a text of many lines, and asserts the rule a line. A helper the Vale files share holds that shape, so five files write it once.

<!-- breaks, as text: what breaks if it is never done -->
The five Vale files spawn the binary a case a line, and the twins between `vale.test.js` and `paragraph.test.js` prove one rule twice.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- one helper under `test/contract` runs Vale once over a text and answers the findings a line
- the twins the battery reading names in `spec/rationales/effect.md` stand once, which `node --test test/contract/vale.test.js test/contract/paragraph.test.js` decides
- `./RUNME.sh check` is green

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
