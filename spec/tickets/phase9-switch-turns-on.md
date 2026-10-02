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
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The phase-9 shadow reads clean now that [[spec/tickets/process-shadow-reads-clean]] has landed. The index stands under the processes shadow, places each module once, and writes no processes row over a run of ten minutes. Turning `migration.phase9switch` on lets a box take [[spec/tickets/module-processes-switch-over]].

- `./RUNME.sh config` reads `migration.phase9switch true`
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/work-held.test.js test/level0/stand.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The coordinator ran the index twice under the processes shadow. The first run was on main at 62967e2, before the fix. There, the shadow wrote rows for queue/places, work/rows, work/yours and clock/minute. A second standing against the running index hung, and each module stood twice.

The second run was on main at e02d9d9, after the fix, with se-index built fresh. It ran twelve minutes, with a standing, a branch list and a config read each minute. The log held eight processes rows before the run and eight after, all from the first run. The standings answered, and each module stood once. So migration.phase9switch turns true.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one key in spec/config/level0.json
- the cleanup it reveals: none
- every fact stands once: the run lives on this ticket and the pull request

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
