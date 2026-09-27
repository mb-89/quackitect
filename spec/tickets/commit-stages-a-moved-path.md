---
kind: [[ticket]]
state: closed
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
todo: false
record:
  - step: do
    hand: box d7db8e8df0103 · claude-code-remote
    hash_before: a10d98176677b0c2ff7563944393f98671f563f4
    hash_after: b29903571196c7734eb04ed3951fc8be8921c6a6
    answered:
      - name: tests
        exit: 0
        said: green, 20 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-moves-to-plan.md:121:99: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 02bd8f1b8b17be40
        size: 265
    def: a2194809b3c2a4b3
reason: done
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

./RUNME.sh test test/level0/commit-verb.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The commit verb names the old path of a journaled rename beside the new one, so the deletion rides the same commit. After the rename stages that deletion, the old path stands neither on disk nor in the index, and git add refuses it, so the commit stands undone. The add now takes a moved path only where it stands on disk or in the index. The commit still names it, because git commit matches a path through HEAD too.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the add keeps out a from path standing neither on disk nor in the index
the change reveals no cleanup beyond the two move tests, which now assert the add and the commit apart
the new fact stands once, in stagable in src/scripts/commit-verb.js, and the tests point at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

This ticket carries `parent` and no `group`, so `childrenOf` in src/scripts/pull-hand.js leaves it out and the pull on work/the-process-stays-editable answers wait. The mint in src/scripts/pull-writes.js now names a group's own gate as the group, so a point minted from here on stands in its group. The accept minted this ticket before that fix, and no verb writes `group` on a standing ticket. Add `group: the-process-stays-editable` to its frontmatter, and the next cloud pull on the branch hands it out. Until then a desk pull on main hands it out as a free ticket.

The write door refuses `group: the-process-stays-editable` on this ticket: it holds every frontmatter field of an open ticket, beyond `state`, `step` and `steps`, and answers that the engine writes it. The pull by name answers that this ticket stands behind the queue, and the pull with no name answers wait. So the point and the group's retro stay blocked until a verb writes `group` on a standing ticket, or the door lets `group` through. The ask under `do` stands undone.
