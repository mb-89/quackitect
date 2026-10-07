---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-check-runs-beside/accept
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
group: the-check-runs-beside
parent: the-check-runs-beside
record:
  - step: do
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: 3d926988151bcd3395edaf9606bab47af5e3fa6e
    hash_after: cc469551d49477de260a8ed23456b5f9910c34ba
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   87.0  in all"
    inputs:
      - name: ask
        hash: 0ac7d2bb2c4c626e
        size: 408
    def: 19e22e6832dfdbb6
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the check in the review's fresh worktree goes red in the cases reaching the index through RUNME.sh, lint-twins and runme-road. Lint-twins also ran red once on this box after a Go change. With every part starting at once, the tests part can meet an index still restarting on a new binary. Find the cause, make those cases wait for a live index or the check wait out the restart, and prove it on branch review.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/check_battery_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The check runs a ready step alone before its parts: the install, then one ask of the index, so a door stands on the build the disk holds. Once every part started at once, a part could read a binary mid-swap or a door going down, so lint-twins and runme-road answered nothing. branch review answers check passes on the fix.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the ready step closes the race, and the design names which part waits and why
- the cleanup the change reveals stands as notes: reviews-share-one-worktree and battery-load-flickers
- the ready step and its reason stand once in spec/design_output/work.md, and the code points there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
