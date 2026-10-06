---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: takeover-rescues-unpushed-commits/gate
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
group: boxes-hold-and-hand-back
parent: takeover-rescues-unpushed-commits
record:
  - step: do
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: 84b20d162ebed45ee3e8ae2085619286509089ed
    hash_after: 84b20d162ebed45ee3e8ae2085619286509089ed
    answered:
      - name: tests
        exit: 0
        said: green, 2 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "    3.3  test/contract/index.test.js a stopped index leaves no se-index process past the case"
    inputs:
      - name: ask
        hash: c20b3a95a463adb3
        size: 209
    def: 38c3e335ed14370b
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the check workflow runs on a push to every branch. So each rescue push starts a CI run that answers red, and each beat push starts one too. Add `branches-ignore` for `rescue/**` and `beats/**` under `on.push`.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/check-workflow.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The check workflow now ignores a push to rescue/** and beats/** under on.push. A rescue branch carries red work on purpose, and a beat branch carries only the hold's heartbeat, so a CI run on either answers red or spends a runner for nothing. A pull request against main still runs the check, and so does a push to every other branch. The contract test in test/contract/check-workflow.test.js pinned the on: block, so it moves with the workflow and names the skip.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: branches-ignore for rescue/** and beats/** under on.push, nothing else
the cleanup the change reveals: the contract test pinning the triggers moves in the same change; nothing else surfaced
every fact stands in one place: the skip lives in check.yml, the test pins it, and the workflow comment points at this ticket instead of restating the rescue design

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
