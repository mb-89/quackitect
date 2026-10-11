---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: hold-verdicts-ride-the-post/gate
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: hooks-v1-hold-the-line
parent: hold-verdicts-ride-the-post
record:
  - step: do
    hand: box f9a277082525 · claude-code-remote
    hash_before: 6dbe6cc59cc109156f63a0e740d40b3e7483c057
    hash_after: 6dbe6cc59cc109156f63a0e740d40b3e7483c057
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "  102.8  in all"
    inputs:
      - name: ask
        hash: b1ec068e2bd65618
        size: 139
    def: 9ddc041fe26ea104
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The red test calls `held` with its present signature. The implement step rewrites that call to hand it the `landed` value `writes` answers.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/hooks/holds_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`TestAHelpersPostBetweenACallsWriteAndItsVerdictLeavesTheCallsRefusal` takes the value the main call's `writes` answers, and hands it to `held`. The helper's later write answers a value the case drops. The change landed with the fix in d8d441a98.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the red case calls `held` with the main call's own landing, and passes
- the cleanup the change reveals: the lock case `TestTheFieldReadersRunBeforeTheDoorsLock` reads the new answer of `writes` too
- the landed value stands once, as `ownLanding` in `src/modules/hooks/holds.go`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
