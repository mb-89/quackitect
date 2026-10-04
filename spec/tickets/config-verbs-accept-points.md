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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: config-verbs-run-in-go
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The group's accept review names four small faults in the port, and each closes here.

- `rules` reads a message line ending in a carriage return as the line without it
- the calm in `fix` exits 1 and names the file where a write fails, as the JavaScript threw
- `verb_project.go` reads the work root through `workRootVar` and compares roots with `filepath.Clean`
- `SHAPE`, `SCRIPTED`, `GUIDANCE` and `ROUNDS` leave `cli-doors.js`, and `configRowsOf` leaves `quack-topic.js` with its test
- `go test ./src/quack` and `./RUNME.sh check` pass

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

- The review also asks whether config faults read a stub's tracked layer. They read one root, the root `configAt` in `src/quack/main.go` reads. The JavaScript new slice already answered through that topic, so the port keeps what ran. Two roots there change a shared line the registry design keeps apart, so a later config ticket owns it.
