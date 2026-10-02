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
step: do
record:
  - step: do
    hand: box d8921a909c1fa5 · claude-code-remote
    hash_before: 541c365ca410f0219bbcb28a1aa5087e24cfd941
    hash_after: 541c365ca410f0219bbcb28a1aa5087e24cfd941
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: The rules pass.
    inputs:
      - name: ask
        hash: ca103ceab2905307
        size: 370
      - name: [[spec/tickets/module-processes-switch-over]]
        hash: 0a32db0c3452e5e4
        size: 357
      - name: [[spec/tickets/node-leaves-the-boxes]]
        hash: e6099ee6a209fa79
        size: 213
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Phase 9 stands switched over now that [[spec/tickets/module-processes-switch-over]] has closed on main. A crash in one module process leaves the others answering, and a run of crashes raises an alarm. Turning `migration.phase10` on lets a box take [[spec/tickets/node-leaves-the-boxes]].

- `./RUNME.sh config` reads `migration.phase10 true`
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/split_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Phase 9 closed on main at 7568989, with every child of module-processes-switch-over closed and the check green on Linux and Windows. The coordinator stood the index on that commit. It placed the IO process and twenty module processes, one each, and the standing answered.

Phase 9 asks that a crash in one part leaves the others running and raises an alarm. Two cases in src/quack/split_test.go hold that on the live split. One kills the guidance process, and the tickets process keeps answering under the pid it started with. The other kills guidance twice, and session/alarms names guidance alone. Both pass on main, so migration.phase10 turns true.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one key in spec/config/level0.json
- the cleanup it reveals: none
- every fact stands once: the run lives on this ticket and the pull request

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
