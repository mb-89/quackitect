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
The vehicle contract proves a vehicle in another folder answers its own verbs. It proves that over a fake install, so it reaches no network, no editor, no package manager and no home register.

<!-- breaks, as text: what breaks if it is never done -->
The case runs the vehicle's real install. That install fetches binaries, links the editor and writes the home register, and takes ten seconds on a good day.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `test/contract/vehicle.test.js` and `test/contract/stub.test.js` run the install with every fetching want skipped
- the shim case points at the fake vehicle the file writes
- the two files spawn node once a case, which `grep -c 'outside.run' test/contract/stub.test.js` decides
- `./RUNME.sh check` is green, and neither file stands in the stamp's slowest ten

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
