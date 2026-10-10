---
kind: [[ticket]]
state: closed
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
group: branches-and-pull-report-truly
step: do
record:
  - step: do
    hand: box 8339730da099 · claude-code-remote
    hash_before: 1b50ed7ae094e8227942beac8a9b90488c40fd84
    hash_after: 1b50ed7ae094e8227942beac8a9b90488c40fd84
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "  100.1  in all"
    inputs:
      - name: ask
        hash: ef7e2dcac975213d
        size: 568
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: `branch done`, `branch release`, `branch open` and `branch close` stop at a refused commit and name git's refusal, before any push or pull request.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `leaves` in `src/branches/done.go` drops the commit's error, pushes an unchanged branch and opens an auto-merge pull request for a group still open. `letGo`, `marksTrunk` and `closeVerb` drop it the same way.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/branches/ -run TestARefusedCommitStopsTheVerbBeforeThePush` passes, with no push and no pull request after a refused commit
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/branches/done_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`branch done`, `branch release`, `branch open` and `branch close` dropped the error of their commit. They then pushed an unchanged branch, and done opened an auto-merge pull request for a group still open. `commitsOrStops` in `src/branches/merge.go` now runs each of those commits. On a refusal it takes each file the verb wrote back to HEAD's text, raises `branch-commit-refused` with git's words, and the verb answers red before any push. It restores only the files the verb wrote, because `done` reads no dirty tree and a hard reset would drop the owner's edits. `close` over every merged branch answers red where one commit came back refused.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the four verbs stop at a refused commit and name git's refusal
- the change carries its cleanup: close over every merged branch reads a refusal too
- the fact stands once: `commitsOrStops` alone runs the four commits, and `spec/failures/branch-commit-refused.md` names the remedy

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
