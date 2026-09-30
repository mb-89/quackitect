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

The phase-8 shadow reads clean. The sidebar's own draw, over this tree with the live index, names no badge or button apart. A tampered catalog makes it name one. Turning `migration.phase8switch` on lets a box take [[spec/tickets/sidebar-switches-over]] once its other waits clear.

- `./RUNME.sh config` reads `migration.phase8switch true`
- the sidebar's draw under shadow tells no shadow line over the live index
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/sidebar-views.test.js src/modules/migration

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The coordinator ran on main at f87ffa1, with the sidebar at shadow and se-index standing. It loaded src/extension/sidebar.js in node, behind a door of the real disk, the live index over its v1 port and the verb runner the lens uses. It then called the draw twice. Each draw read 183 rows off index/names and told no shadow line. A third draw added a thousand to every count off index/names, and it told one line, for work/open-tasks. So the compare runs and reads apart where the paths differ. The draw ran in node and not inside the editor, and the door differs from the editor's in its adapter alone. So migration.phase8switch turns true.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one key in spec/config/level0.json
- the cleanup it reveals: none
- every fact stands once: the run lives on this ticket and the pull request

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
