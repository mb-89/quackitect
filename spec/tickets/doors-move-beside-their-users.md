---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: remaining-js-names-its-reason/gate
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
point: gate
todo: true
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: javascript-leaves
parent: remaining-js-names-its-reason
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the group inventory in spec/tickets/javascript-leaves.md marks src/doors/disk.js, proc.js, wire.js and fake/behaves.js, fake/disk.js, fake/proc.js, fake/vscode.js as moves under this ticket, each leaving src/doors for a home beside its user, and the approach keeps src/doors/ standing instead. git grep finds no product file importing disk.js, proc.js or wire.js, only their own tests under test/contract, so the reason "the doors the extension's tests, the hooks' tests and the Vale scripts drive" holds for vale.js and the fakes alone. Move or delete each and point its inventory row at the result.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh test test/contract/disk.test.js test/contract/proc.test.js test/contract/wire.test.js src/modules/examples/examples_test.go

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

The change departs from the ask: every file stays in `src/doors`. `src/extension/editor-doors.js` builds each door's path at runtime and loads `clock.js`, `disk.js`, `http.js` and `proc.js` from there, which `git grep` on an import line misses. So the extension is the user of `disk.js` and `proc.js`. `proc.js` stands on `clock.js` and `disk.js`. `wire.js` owns `node:http` in `src/doors/owns.yaml` for the contract tests. Each fake stands beside its door, as [[spec/design_output/doors#a-fake-behaves]] says. A move splits doors that stand on each other, or walks a test around a door. The inventory rows of the group now read `stays, door`, and so do the stale `clock` and `http` rows, whose files stand as well.
