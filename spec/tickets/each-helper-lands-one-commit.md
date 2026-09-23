---
kind: [[ticket]]
state: open
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/reviewing]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: design/draft
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: reflect
        does: names the class of error in the findings, and the fix for the class
        when: returned
        input: verdict
        evidence:
          - name: class
            form: text
            says: the class of error the findings describe, and the fix for the class
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
        evidence:
          - name: tests
            form: command
            expects: green
            says: the same tests pass
          - name: check
            form: command
            expects: 0
            says: the check is green on the commit
          - name: says
            form: text
            says: what changes and why, for a reader who was not there
  - name: verdict
    does: reads every hunk against the ask and the approach
    not: implement
    on_fail: implement/reflect
    reads: [[spec/guidance/review/reviewing]]
    input: ["diff", "implement"]
    to: retro
    checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
group: the-review-lands-overnight
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/draft
record:
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: edbf8035f331c6b5a82210bf4f13c0ce8ef1c778
    hash_after: edbf8035f331c6b5a82210bf4f13c0ce8ef1c778
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-2
    hash_before: c46a382e999e12a5f47ead2b901f7fd292bce616
    hash_after: c46a382e999e12a5f47ead2b901f7fd292bce616
    returns: 1
    why: "design: the stated cost misreads both halves. The hold file under `.se/.runtime` survives a server restart.; design: `spawns` in the bridgehead fires `refactor.answered` on a failed spawn too, so that path already releases.; design: a hold lost with a dying bridgehead then refuses every hand for good. The approach needs a release for that case.; design: `checked` in `src/bridge/apply.js` calls `onWrite` without the `agentId`. The owning hand's patch then refuses.; craft: `landsOnTrunk` reads a bare `git push` on `main` as a pass. The row needs that case too.; craft: the spawn event carries a kind and an empty `agentId`, so a parallel helper writing first owns the file.; craft: the row, the guidance line and the cases otherwise answer the Ask."
---

# Ask

Each commit carries one helper's work, which one review reads and one undo takes back. The commit verb's check then gates every landing on main.

A batch commit carries many topics past the commit verb, and two hands write one file. A step commit carries another topic's code, and no review reads it as one change.

- a Bash row answers a raw `git commit` or `git push` on main with `./RUNME.sh commit`
- the refactor hold stands until the refactor hand hands back
- the write door refuses another hand's write to a held file
- `spec/guidance/working.md` lands each helper's work through `./RUNME.sh commit` once its report and tests pass
- a case under `test/level0` covers the row and the hold
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

One commit a helper, through the commit verb, and one hand a held file.

| part | the file | what changes |
|---|---|---|
| the row | `src/bridge/bash.js` | `trunkGuard` refuses a raw `git commit` or `git push` on `main`, on a desk too |
| what it says | the same | the refusal names `./RUNME.sh commit "<message>"`, which lints, checks and pushes |
| what passes | the same | a commit the CLI makes, because the pull and the merge run git off the Bash door |
| the hold | `src/bridge/stop.js` | `refactorHand` writes `{ file, hand }` into a hold file under `.se/.runtime` |
| the hand | the same | the first helper write to that file fills `hand` with its `agentId` |
| the release | the same | `onRefactorAnswered` removes the hold, and nothing else does |
| the refusal | `src/bridge/write.js` | `onWrite` refuses a write to the held file from any other `agentId`, the session's own included |
| the path | `.claude/skills/level0/lib/runs.js` | the hold file's name stands beside `REFACTORS` |
| the guidance | `spec/guidance/working.md` | one actionable: land each helper's work through `./RUNME.sh commit` once its report and tests pass |

The assumption: the door tells hands apart by `agentId` alone, so the first helper to write the file owns it.

The cases:

- `bash.test.js`: `git commit -m x` on `main` refuses and names the verb, and on a work branch it passes
- `stop.test.js` or its neighbour: the hold stands from the spawn to the answer
- `write.test.js`: the session's write to the held file refuses, and the owning hand's write lands

The callers:

- `onBash` runs `trunkGuard` on every Bash call
- `onStop` in `stop.js` calls `refactorHand`, and the bridgehead fires `refactor.answered`
- `onWrite` serves Write, Edit and the patch tools

The cost: a hand dying before its answer leaves the hold, and a restart of the server clears it.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail
- design: the stated cost misreads both halves. The hold file under `.se/.runtime` survives a server restart.
- design: `spawns` in the bridgehead fires `refactor.answered` on a failed spawn too, so that path already releases.
- design: a hold lost with a dying bridgehead then refuses every hand for good. The approach needs a release for that case.
- design: `checked` in `src/bridge/apply.js` calls `onWrite` without the `agentId`. The owning hand's patch then refuses.
- craft: `landsOnTrunk` reads a bare `git push` on `main` as a pass. The row needs that case too.
- craft: the spawn event carries a kind and an empty `agentId`, so a parallel helper writing first owns the file.
- craft: the row, the guidance line and the cases otherwise answer the Ask.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
