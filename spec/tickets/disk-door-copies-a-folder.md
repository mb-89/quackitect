---
kind: [[ticket]]
state: closed
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
step: do
record:
  - step: do
    hand: box d6f05e3a585030 · claude-code
    hash_before: feb5627e3a4028b7ca70c19e8bb7490052e04a3c
    hash_after: feb5627e3a4028b7ca70c19e8bb7490052e04a3c
    answered:
      - name: tests
        exit: 0
        said: green, 30 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: 2 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The disk door copies a folder in one call, and producing a vehicle takes it. So a vehicle lands in the time the disk takes, and the contract case proving one pays no write a file.

<!-- breaks, as text: what breaks if it is never done -->
Producing a vehicle writes every file of the method through the door one by one, and the method holds over a thousand. The vehicle case stands in the battery's slowest ten for that alone.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `src/doors/disk.js` and its fake answer a folder copy, and `test/contract/disk.test.js` holds the pair to one answer
- `produce` in `src/scripts/vehicle.js` takes it, and `test/contract/vehicle.test.js` stays green
- the vehicle case leaves the slowest ten of the stamp `./RUNME.sh check` writes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/contract/disk.test.js test/level0/vehicle.test.js test/contract/vehicle.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`copyFolder` in `src/doors/disk.js` lands a folder in one `cpSync`. Its filter
reads each path relative to the folder, and a folder it refuses carries nothing
under it along. The bytes and the run bits travel whole, so a binary stays a
binary. The fake answers the same, and a contract case holds the pair.
`produce` in `src/scripts/vehicle.js` takes it with `travels` as the filter, in
place of a walk reading and writing each file as text.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the first two lines of the ask, and the discussion says why the third departs
- the cleanup: the text copy corrupting a binary goes with the walk, so a vehicle carries an image byte for byte
- one place: the filter stays `travels` in `lib/vehicle.js`, and the door takes it as an argument

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- The produce case stands seventh of the slowest ten, at about a second and a half. One call still writes every file of the method, and the disk pays per file. The case above it, a vehicle answering its own verbs, runs the install and leaves this change untouched. A vehicle carrying fewer files, or a case producing it once for the whole battery, takes the case out of the ten.
