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
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
group: the-migration-writes-its-specs
---

# Ask

A design note specifies operations: the handle `ops/<id>`, its states, the one writer per tree, and what stays for how long. [[spec/design_input/the-index-holds-the-model#operations-carry-a-handle]] asks it.

A pull, the check and a retro each run past a hook's patience. A handle keeps the caller free and the hang in sight.

- a design note under `spec/design_output` says it, and `./RUNME.sh lint` passes over it
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh check > /dev/null 2>&1 && echo green

## check

    ./RUNME.sh check

## says

[[spec/design_output/operations]] specifies operations. An action declares
at registration whether it answers at once, `q.Action`, or with a handle,
`q.Op`. The handle `ops/<id>` is a key under a family the catalog declares
once, so the index adds no name at runtime.

The note names the fields, each move between the states and who makes it, and
the undo on failure and cancel. Writing operations queue one at a time per
checkout, and a git hook reads names alone. An index restart fails every
operation it finds unfinished. Two config keys hold the windows.

Weighed: a length each call decides, against one each action declares. The
declaration wins, because a caller then knows the answer's shape before it
calls. Assumed: a restart fails an operation it finds unfinished, because a half-run
door list resumes on state nobody checks.

## checked

- the change follows the ask: the note names the handle, its states, the one writer and the retention
- the cleanup it reveals: none, because the note changes no file a reader holds
- the note points at the design input for the rules, and gives each one its shape without restating it


# Discussion

<!-- what anybody adds, at any time, on this ticket -->
