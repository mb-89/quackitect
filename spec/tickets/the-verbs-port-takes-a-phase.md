---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: does the work the ask names, and says what came back
    by: person
    to: engine
    input: ask
    evidence:
      - name: result
        form: text
        says: what came back, which the step behind this one reads
  - name: follow
    does: carries the result into the tree, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: result
    needs: ["branch test"]
    checklist: ["the change follows the result, or the discussion says why it departs", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process: [[spec/processes/person]]
process_hash: 781b200dbb69dec3
step: follow
record:
  - step: do
    hand: box d8921a909c1fa5 · claude-code-remote
    hash_before: d3e2821000a6b044431bcd96aa07620ae00fbf5a
    hash_after: d3e2821000a6b044431bcd96aa07620ae00fbf5a
    inputs:
      - name: ask
        hash: a9f73d8a03b7f98b
        size: 822
      - name: [[spec/tickets/the-verbs-leave-node]]
        hash: ad7b41ebfb9eacde
        size: 305
    def: c093c04dc9e56675
  - step: follow
    hand: box d8921a909c1fa5 · claude-code-remote
    hash_before: 1b6ca98b7ad23605e7e3754e6ca42df92872ad3c
    hash_after: 1b6ca98b7ad23605e7e3754e6ca42df92872ad3c
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/migration passes
      - name: check
        exit: 0
        said: "   79.8  in all"
    def: 9765995063d5dc32
reason: done
---

# Ask

The owner decides whether the port of every Node verb to Go becomes a migration phase behind its own switch, or waits. Phase 4 closed with three Go twins, so the port has no owner, and `programOf` in `src/quack/verbs.go` still hands every other verb to node. A cloud box adds no phase to the owner's design input and turns no switch on. The work comes from [[spec/tickets/the-verbs-leave-node]].

The commands, in order:

1. Read `programOf` in `src/quack/verbs.go`, and the phase table in `spec/design_input/the-migration-runs-in-slices.md`.
2. Write the answer under `result`: a new phase with its key under `migration`, or a wait with its reason.
3. `./RUNME.sh ticket pull the-verbs-port-takes-a-phase --pass`

- `./RUNME.sh ticket pull` hands the follow step out, and `result` names the phase and its key, or the wait

# do

<!-- does the work the ask names, and says what came back -->

## result

<!-- what came back, which the step behind this one reads -->
<!-- the form is text -->

A new phase 11, key migration.phase11, decided by the owner on the coordinator report.

# follow

<!-- carries the result into the tree, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/modules/migration/migration_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The owner chose a phase for the verbs port. Phase 11 stands under the key migration.phase11 in spec/config/level0.json. It also stands in the phase table of src/modules/migration/migration.go. Its group the-verbs-run-in-go closed through pull request 106. The tree already carries the result, so this step names where it stands and adds nothing.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the result: phase 11 and its key stand where the result names them
- every fact stands in one place: the phase table holds the phase, and this ticket points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The owner's answer, for `result`: a new phase 11, key migration.phase11, decided by the owner on the coordinator's report. The phase stands in [[spec/design_input/the-migration-runs-in-slices#the-phases]], and its group is [[spec/tickets/the-verbs-run-in-go]].

The pull runs on `main` or on the group's own branch alone, and the box that opens phase 11 pushes no `main`. So the pass waits for a hand on `main`:

    ./RUNME.sh ticket pull the-verbs-port-takes-a-phase --owner-says --pass --fields '{"result": "A new phase 11, key migration.phase11, decided by the owner on the coordinator report."}'
