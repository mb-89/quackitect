---
kind: [[ticket]]
state: closed
steps:
  - name: answer
    does: answers the question the ask carries
    by: person
    to: engine
    input: ask
    evidence:
      - name: answer
        form: text
        says: the answer, which the step behind this one reads
  - name: do
    does: carries the answer out, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: answer
    needs: ["branch test"]
    checklist: ["the change follows the answer, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process: [[spec/processes/question]]
process_hash: d1a6e26348695e24
step: do
group: the-cloud-follow-ups-land
record:
  - step: answer
    hand: box d81c8e27d9d7 · claude-code-remote
    hash_before: ccec105cc0521f631d0a0d9b12fa122abbd2ef7b
    hash_after: ccec105cc0521f631d0a0d9b12fa122abbd2ef7b
    inputs:
      - name: ask
        hash: 763d4f27c5def99a
        size: 505
      - name: [[spec/tickets/the-cloud-works-its-queue]]
        hash: 7b2d07e7792d5e73
        size: 15971
    def: 2280015d497a3abd
  - step: do
    hand: box d81c8e27d9d7 · claude-code-remote
    hash_before: 11a75d442afd73d290a42c4a7b6ca7dd679acc7f
    hash_after: d08bae06a7cb74dc27746152f0892165a0ee8047
    returns: 1
    why: the check stays red while the-owner-runs-the-dispatch waits at answer inside the same group, so this do leaf waits for that answer
    answered:
      - name: tests
        exit: 1
        said: "spec/tickets/the-owner-runs-the-dispatch.md:1:1: GroupAsksNobody: the-owner-runs-the-dispatch stands at answer, a step a"
      - name: check
        exit: 1
        said: "spec/tickets/the-owner-runs-the-dispatch.md:1:1: GroupAsksNobody: the-owner-runs-the-dispatch stands at answer, a step a"
  - step: do
    hand: box d81c8e27d9d7 · claude-code-remote
    hash_before: f60dfed7c2d706106c8293f7b9f0018b3a1952bf
    hash_after: 899aa84b4f530e650c058c279289c8cc4f78596a
    answered:
      - name: tests
        exit: 0
        said: green, 34 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/replayed-red-leaf-reads-green.md:18:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: answer
        hash: e73fa4a78d44d170
        size: 364
    def: 9395391d8c0e6392
reason: done
---

# Ask

The owner says whether a cloud box opens its group's pull request. The work skill says it does, and `AGENTS.md` says a session opens none. The question comes from [[spec/tickets/the-cloud-works-its-queue]].

The agent takes the call `AGENTS.md` makes, and opens none. `AGENTS.md` names itself the rule over any other default, and a pull request reaches past the branch.

- the pull request over `work/the-cloud-works-its-queue`

- the answer names which rule stands, and the other file changes to match it

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is text -->

The owner rules that a cloud box opens its group's pull request from work/<group> against main, with auto-merge on and the merge method MERGE. The owner merges nothing by hand. The work skill stands, and AGENTS.md changes to match it: a cloud session working a group opens the group's pull request through the work skill, and a desk session opens none.

# do

<!-- carries the answer out, with the test that covers it -->

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

The work skill owns how a box hands its group over. It opens the pull request from the group branch against main, and turns auto-merge on with the merge method MERGE, so the owner merges nothing by hand. AGENTS.md already let a cloud session open that pull request, and now says it merges itself, pointing at the work skill for the rest. No test reads the two prose files. The check holds their form, and the dispatch suite covers the hand-over they finish.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the answer: a cloud box opens its pull request with auto-merge on, MERGE
- the cleanup the change reveals: the ask read an older AGENTS.md, and main already carried the cloud exception
- every fact stands once: the merge method stands in the work skill, and AGENTS.md points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
