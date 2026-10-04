---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: check-verbs-run-in-go/accept
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
group: check-verbs-run-in-go
parent: check-verbs-run-in-go
record:
  - step: do
    hand: box f8b80b32320c · claude-code-remote
    hash_before: 26d60a91f1c4205e00416b1bbdf7003edf9964c7
    hash_after: 55c2b9e42e13d470a122b631aa0cfb762de52465
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "    3.0  test/contract/runme-road.test.js ./RUNME.sh hands config to its program, which names the verbs slice at its bui"
    inputs:
      - name: ask
        hash: 47caab1ef205f92e
        size: 112
    def: 10060d5272d03a03
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

checkDoorsOf takes its root off QUACKITECT_ROOT, so a review the index starts checks main in place of the branch

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A review builds a worktree of the branch and runs `se-index verb <worktree>/src/scripts check` there, under the env the hooks door hands it, where `QUACKITECT_ROOT` names the method root. The Go check took its root off `index.Root`, which reads that variable, so the review checked main in place of the branch. The node program it replaced read the tree its own file stood in. `checkDoorsOf` now takes `roadRoot`: the folder over `src/scripts` in the verb road quack runs under, and `index.Root` where no road stands. The test verb rides the same doors, so its road follows. The fix stands in `checkdoors.go` alone and touches no line of the shared road in `verbs.go`, so the parallel ports meet no conflict there.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the check roots at the tree its road names, so a review checks the branch
- the cleanup the change reveals: the children the check starts still inherit the method root's variable, as they did under the node check, so the change keeps that and adds no second root
- every fact stands in one place: `roadRoot` alone reads the road, and its comment names the ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
