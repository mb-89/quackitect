---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: branch-done-opens-the-pr/gate
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
group: engine-verbs-hold
parent: branch-done-opens-the-pr
record:
  - step: do
    hand: box 57a5a484096e · claude-code-remote
    hash_before: dae16da56ae7a6e58b856e02330e611d8feeafe2
    hash_after: 973f55b0612a56b8ffe0a33685961ef23f822ed6
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "    2.0  test/contract/vale-paths.test.js a rationale reads the same by its absolute path as by its relative one"
    inputs:
      - name: ask
        hash: c4945eae4b0e4ada
        size: 497
    def: aeb558b18945ff5c
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

plan.Done takes every work branch at done, and origin holds many closed work branches with no commit main lacks (git rev-list --count origin/main..origin/work/<name> reads 0, e.g. work/phase2-switch-turns-on). The hub refuses a pull request over such a branch with 422, so fire answers codeRed on every run. Keep a branch in Done only where that count stands above zero, and add a dispatch case on a done branch level with main that sends no POST. The builder fixes it in place in planned or fire.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/dispatch_level_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The dispatch keeps a done work branch in plan.Done only where origin holds a commit on it that main lacks, so a closed branch level with main draws no pull request and no 422 from the hub. The parent change lands with it, since this fix stands on it: done and the dispatch open a work branch pull request through workPull and pullOpens, on the one send door the doors carry.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: aheadOfTrunk in src/branches/dispatch.go reads the rev-list count, and planned keeps a done branch only where it stands above zero.
The cleanup the change reveals is in the change: the parent pull road, which this fix needs, lands in the same commit, and its red tests pass.
The ahead rule stands once, in aheadOfTrunk, and the pull road once, in pullOpens in src/branches/dispatch_fire.go.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
