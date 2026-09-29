---
kind: [[ticket]]
state: closed
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
  - step: do
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: d0a5d09eb7b412c2f13e45fd08db6e065ed012ac
    hash_after: d0a5d09eb7b412c2f13e45fd08db6e065ed012ac
    answered:
      - name: tests
        exit: 0
        said: green, 31 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:271:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 1853c3d0f5d12c97
        size: 194
    def: 76beff46e9d5f076
  - step: do
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: c0362c7dc22e6e55b701481cee32b40cf5f75962
    hash_after: 3f7debea7ac8d75567c2813ebeffc39c8c795032
    why: dispatch-writes-the-bundles answers this ask
reason: answered
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

./RUNME.sh test test/level0/dispatch.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The dispatch writes the cloud marker into its own worktree commit, and calls neither `marksTrunk` nor `openGroup`, because both push main. The comment beside the write in `writesOf` in `src/scripts/dispatch-write.js` names both. The earlier hand-back named `check --errors` as its test command, which answers no green line, so this one names the dispatch cases.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and the comment names the two functions
- the cleanup is the test command alone, and it rides this hand-back
- the reason stands once, in the comment beside the write

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
