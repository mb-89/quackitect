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
The battery's stamp records what a retro reads for a regression. That is time a test file, and the spawns a run makes with how many are Vale. It is the parts a red run leaves unrun, and the red case's own words.

<!-- breaks, as text: what breaks if it is never done -->
The stamp keys the slowest cases on a name two files share. It holds no spawn count, and hides the other parts' drift on a red run.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the stamp `./RUNME.sh check` writes carries a time a test file, a spawn count and the parts unrun
- `test/level0/battery.test.js` covers each field off a fixture
- the retro report draws the new fields under the battery chapter

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
