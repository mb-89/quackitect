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
group: hooks-v1-hold-the-line
step: do
record:
  - step: do
    hand: box f9a277082525 · claude-code-remote
    hash_before: 3a61416f3b2df7584b975d477f8ef3f5f5055bb1
    hash_after: 3a61416f3b2df7584b975d477f8ef3f5f5055bb1
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   75.9  in all"
    inputs:
      - name: ask
        hash: df9c6694d924c84c
        size: 484
    def: df12650931d480c9
reason: done
---

# Ask

The types part runs tsc where the engine laid its declarations alone. A box whose engine lays none says so and carries on, as a box with no claude does.

An engine build refusing the empty print prompt lays no types. The part then runs tsc without its base config, turns red on every cloud box, and blocks the push verb.

- `./RUNME.sh test src/quack` passes a `typesHold` case where the load lays no types, and the part answers 0 with its line
- `./RUNME.sh check` passes on this box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The types part runs tsc where the engine laid its base config alone. A load laying none says so and answers 0, as a box with no claude does. Main landed the same fix while this branch carried its own twin of it. The merge in f8a48f2c4 keeps main's `typesHold` and its case table in `src/quack/check_types_test.go`, and the branch's twin leaves.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the case passes, and runs no tsc, where claude lays no types, in `TestTheTypesPart`
- the cleanup the change reveals: the branch's second `laidTypes` constant leaves with the merge
- the laid config's path stands once, as `laidTypes` in `src/quack/check.go`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
