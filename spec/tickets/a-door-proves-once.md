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
Vale and Biome are doors. One contract case each drives the real binary, and every other case takes the fake. The battery then spawns each program a handful of times, and a case proves a rule off a fixture in memory.

<!-- breaks, as text: what breaks if it is never done -->
About two hundred Vale spawns run across seven test files at once. The load alone turns a green case red, and a red under load names no cause.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `test/contract/vale.test.js` and `test/contract/biome.test.js` each hold one case driving the real binary, and the rest of the file drives the fake
- no other test file under `test/contract` spawns Vale or Biome, which `grep -l 'vale\|biome' test/contract/*.test.js` decides
- `./RUNME.sh check` is green, and the stamp's slowest ten hold no case over two seconds

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
