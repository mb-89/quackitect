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
group: the-modules-start-together
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The lsp IO module runs Vale over the whole tree each time an index starts, and the run takes a minute or two of one core. A stop of the index leaves that run going, its parent gone, until it ends on its own. So every contract case and probe starting an index on a full tree leaves a whole-tree lint behind, and the rest of the check runs beside it on fewer cores.

- gain: a stopped index takes its tool runs down with it, so the check's later parts get the box's cores back
- breaks: each index start and stop on a full tree costs the box a core for minutes after the stop, and the slow cases slow further
- done_when: `./RUNME.sh branch test src/modules/lsp/door_test.go` passes a case where a halt ends a running tool at once
- done_when: after `./RUNME.sh index standing` and a stop over a copy of the tree, no Vale process of that copy stands
- done_when: `./RUNME.sh check` exits 0

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
