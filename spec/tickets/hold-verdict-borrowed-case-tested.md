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
    hash_before: d200d5e97dff7e5665592687ccfc05ac700f4da6
    hash_after: d8d441a987371ca2b31c3b61331995c50091afed
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "  104.4  in all"
    inputs:
      - name: ask
        hash: afee96b37cfcbf3e
        size: 144
    def: 9ddc041fe26ea104
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The red test shows the lost refusal alone. A case where the helper's call is refused and the main call passes would decide the borrowed verdict.

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

`TestARefusedPostBetweenACallsWriteAndItsVerdictLeavesTheCallPassing` decides the borrowed verdict. Under the finish hold, a call within its grace writes, and a post past the grace lands refused before the call's verdict. The call then passes, and the later post keeps its own refusal. A helper's call meets no holds refusal, since the fold skips a helper's event, so the second post is the main agent's own. The case needs the fix of hold-verdicts-ride-the-post, so `writes` now hands `held` and `drops` the fold its own landing left, in d8d441a98.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, with the second post the main agent's own, since the fold refuses no helper's call
- the cleanup the change reveals: the red test of the lost refusal takes the landed value too
- the landed value stands once, as `ownLanding` in `src/modules/hooks/holds.go`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
