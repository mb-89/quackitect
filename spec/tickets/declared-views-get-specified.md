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
record:
  - step: do
    hand: box d7a540d981d5 · claude-code-remote
    hash_before: f4c6afdcb342b3ef0ff3b60fede53048456f3f8a
    hash_after: ea2824884d416f530c3bc64a3921edb8376e6c69
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

A design note specifies the declared views: the name `spec/views/work.base` reads, the actions its keys call, the log as a view, and the tabs `index`, `cli` and `help`. [[spec/design_input/the-index-holds-the-model#a-view-is-a-declaration]] asks it.

Phase 6 builds one renderer, and it draws what the declarations say and nothing else.

- a design note under `spec/design_output` says it, and `./RUNME.sh lint` passes over it
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh check > /dev/null 2>&1 && echo green

## check

    ./RUNME.sh check

## says

[[spec/design_output/views]] specifies the declared views. A base file gains
`reads`, `badge`, `actions` and `follow`. An action entry pairs a trigger with
an effect: a call, a cell edit, a form, a jump or a preset cycle.

The work view reads `work/rows` and draws `work/open-tasks` in its header. The sidebar
badge reads that name too, so the two counts become one. The log is a base file over
`log/rows`, a fold over `session/`. The `index`, `cli` and `help` tabs are base
files over registry names, and the form in `cli` comes off an action's input
type. The index checks every name a view reads or calls at start.

Weighed: the registry tabs as built-in screens, against base files. Base files
win, because the ask wants a renderer drawing declarations alone. Assumed: the
tab order rides a config key, `window.tabs`, which phase 6 adds.

## checked

- the change follows the ask: the note names the reads, the actions, the log view and the registry tabs
- the cleanup it reveals: none, because the note adds keys and changes no file a reader holds
- the note points at the tree-view note for the keys standing today, and repeats none of them

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
