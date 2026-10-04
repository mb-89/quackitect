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

A box whose index dies mid-work brings it back and saves its work. The start road runs once more after each fall, and while the door stays down the cage passes the commands that restart the index, stop a stale one under `.se/.runtime`, and commit and push a work branch. Every other guarded call still meets the refusal.

A box whose index falls after the session start stays locked out. The cage refuses `git commit` and `git push`, and the start road never runs again. So the box idles with its work stranded until the coordinator archives it.

- `./RUNME.sh test test/level0/caged-door.test.js` passes a case where the door answers, falls, starts once more, passes the recovery commands, and refuses the rest
- `./RUNME.sh test test/level0/cage.test.js` passes the table of recovery commands and the chains, forces and main pushes it refuses
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh test test/level0/cage.test.js test/level0/caged-door.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A box whose index died mid-work stayed locked out. Two causes stood in the door road.

- The start road ran once a session. An index dying after the session start never started again. Now a door that answers clears a settled road, so each fall takes one more start before the cage refuses.
- The cage passed a bare `./RUNME.sh serve` or `doctor` alone. A commit or a push met the refusal, so the box could not save its work. Now `recovers` in `cage.js` passes the commands that bring the index back and save the work. The refusal names them.

A command passes only where the shell reads it as one plain command. The words take no chain, pipe, redirect, substitution or glob outside quotes, and a leading `cd <folder> &&` alone. A commit takes no amend and no skipped hook. A push names `origin` and a work branch, with no force, no delete and no other ref. A kill is a `pkill -f` naming a path under the runtime folder, because the hook reads no process table and the path scopes the kill. Every other guarded call still meets the refusal, so a dead door opens nothing wide.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the start road runs once more a fall, and the cage passes the recovery commands alone
- the cleanup it reveals: a commit hook needing a live index is a note of its own, `commit-hooks-need-the-index`
- every fact stands once: the recovery rules live in `recovers` in `cage.js`, and the refusal text names them

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
