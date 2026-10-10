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
group: hooks-v1-hold-the-line
step: do
record:
  - step: do
    hand: box ead181ee874b · claude-code-remote
    hash_before: b09304552647933d61c97cbcac5297a094532801
    hash_after: 2152d15d2be24732097ff4f94e558f7b74bba2c3
    returns: 1
    why: The fix and its test stand in 2152d15d2, and the check is red on this box's types part alone, which types-wait-for-laid-types fixes first.
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 1
        said: "  test/level0/stub-typed.test.js:12: the stub's manifest names TypeScript modules alone, and its JavaScript module stand"
---

# Ask

The rules layer counts as given on a call that passes on alone. A first call the index answers or a door refuses leaves the layer for the next call.

Where `prompt.context` missed the door, a first `Grep` the index answers marks the layer given and drops it. The session then runs without its rules: `src/modules/hooks/brief.go:118`, finding 3.

- `./RUNME.sh test src/modules/hooks` passes a case: a first `Glob` the index answers hands no layer, and the next `Read` does
- `./RUNME.sh check` passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A call the holds let through now offers the rules layer and leaves Given alone. The door marks the session handed once briefs() hands the layer, and stamps the mark on the session next event, where the fold sets Given. A first call the index answers or a door refuses so leaves the layer for the next call that passes on, as spec/design_output/level0 says under Rules ride the first answer.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: TestAFirstCallTheIndexAnswersLeavesTheLayerForTheNext
- the cleanup: none revealed
- the stamp field stands once, in brief.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
