---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: dispatch-writes-the-bundles/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-cloud-works-its-queue
parent: dispatch-writes-the-bundles
record:
  - step: do
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 3283b3705e2e7d56da2e02c63522c1ddd2856998
    hash_after: 307f4f1325405df36ec13a3525ac11f641ff1d72
    returns: 1
    why: "the hand-back met refused 5 times: tests under do expects green, and ./RUNME.sh check --errors answers The check names no red case and no finding at error."
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

marksTrunk in src/scripts/work-merge.js commits and pushes main, so the open road must write cloud: true into the worktree and never call marksTrunk or openGroup; name that in the change comment

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
