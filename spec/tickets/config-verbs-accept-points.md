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
record:
  - step: do
    hand: box 056798343132 · claude-code-remote
    hash_before: b61939df15e5de08eed35ae6e5e86ef631cf37fe
    hash_after: ccdc8cc77f9a6d909ad50ffecce064d34d01ef4c
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   36.2  in all"
    inputs:
      - name: ask
        hash: 35a4987211ca571f
        size: 540
    def: df12650931d480c9
reason: done
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

./RUNME.sh branch test src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The accept review of the config group names four small faults, and each closes here. The rules verb reads a message line that ends in a carriage return as the line without it. The calm in fix answers the file and the cause where a write fails, and the verb exits 1, as the JavaScript threw. The project verb reads the work root through the one constant guidance.go names, and compares two roots after filepath.Clean. The exports of cli-doors.js and quack-topic.js that only the ported verbs read leave the tree, and a guard test holds them out.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and the discussion says why config faults keep one root
- the cleanup the review reveals stands in this change
- the work root variable stands once, in guidance.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- The review also asks whether config faults read a stub's tracked layer. They read one root, the root `configAt` in `src/quack/main.go` reads. The JavaScript new slice already answered through that topic, so the port keeps what ran. Two roots there change a shared line the registry design keeps apart, so a later config ticket owns it.
