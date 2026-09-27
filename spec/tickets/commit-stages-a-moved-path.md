---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-process-stays-editable/accept
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
parent: the-process-stays-editable
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

movedFrom in src/scripts/commit-verb.js adds the old path of a rename the rename verb journals, after the rename stages its deletion, so git add refuses the pathspec and the commit stands undone; keep a from path out where it stands neither on disk nor in the index

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

This ticket carries `parent` and no `group`, so `childrenOf` in src/scripts/pull-hand.js leaves it out and the pull on work/the-process-stays-editable answers wait. The mint in src/scripts/pull-writes.js now names a group's own gate as the group, so a point minted from here on stands in its group. The accept minted this ticket before that fix, and no verb writes `group` on a standing ticket. Add `group: the-process-stays-editable` to its frontmatter, and the next cloud pull on the branch hands it out. Until then a desk pull on main hands it out as a free ticket.
