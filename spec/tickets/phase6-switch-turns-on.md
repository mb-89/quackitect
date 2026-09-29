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

The phase-6 shadow now runs. Since [[spec/tickets/window-keeps-the-index]], the window reaches the index and leaves it standing. Over the real session log it names no mismatch, and over a seeded copy it names one. Turning `migration.phase6switch` on lets a box take [[spec/tickets/tui-shell-switches-over]] once its other waits clear.

- `./RUNME.sh config` reads `migration.phase6switch true`
- the window over the session log writes no window row, while the index holds one pid
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/migration src/index src/tui

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The coordinator ran on main at 0b964e4, with the window at shadow. First it started se-index, which stood at pid 2514. Then it ran the window twice in a pseudo-terminal over the session log. No window row was stamped after the run began, and the index held pid 2514 throughout. A seeded copy of the log, with its first row changed, then made the window write one window-in-shadow row. So the compare runs and reads apart where the rows differ. The earlier fault, where each window read stopped the index, closed in pull request 55. So migration.phase6switch turns true.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one key in spec/config/level0.json
- the cleanup it reveals: none past pull request 55
- every fact stands once: the run lives on this ticket and the pull request

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
