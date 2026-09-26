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
    hash_before: ff46c2cca40b3c11a52d8d3f34b39e756a0b97b5
    hash_after: 493ec0908b88759e6e5022f908cc0c9eabc0ea1e
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

A design note specifies the index model: names, providers and defaults, `q.Derived`, and `q.Fold` over `session/`. It covers actions as door calls with an undo each, snapshots and revisions, the catalog check at start, and `quack why`. [[spec/design_input/the-index-holds-the-model#one-owner-per-name]] asks it. So does [[spec/design_input/the-index-holds-the-model#input-processing-output]]. So does [[spec/design_input/the-index-holds-the-model#the-wiring-analyzer]].

Every later phase builds on this note. Without it each box writes a model of its own.

- a design note under `spec/design_output` says it, and `./RUNME.sh lint` passes over it
- the note names the `clock/minute` input and the names under `session/<id>/`, as [[spec/design_output/migration#the-gaps-and-their-answers]] asks
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh check > /dev/null 2>&1 && echo green

## check

    ./RUNME.sh check

## says

[[spec/design_output/model]] specifies the index model:

- a name, its parts, and a family such as `ops/<id>` that the catalog holds once
- the topics the index holds, `clock/minute` and the names under `session/<id>/` among them
- `q.Derived`, `q.Fold` over `session/`, actions, and alternative providers
- one revision, a snapshot per run, and a commit naming its revision
- an action as door calls with an undo each, and `then` for a later call
- the catalog faults that stop the start, and what `quack why` answers

Weighed: a commit off an older revision, dropped or landed. It lands, and the
next run starts, so a busy input still lets values through. Assumed: `then`
carries a later call, so a hand-back reads the check before the push.

## checked

- the change follows the ask: the note covers each part the ask names, and the session names
- the cleanup it reveals: none, because the note changes no file a reader holds
- the note points at the design input for the rules and at the operations note for `ops/`


# Discussion

<!-- what anybody adds, at any time, on this ticket -->
