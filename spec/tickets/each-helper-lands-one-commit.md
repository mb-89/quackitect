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
step: implement/change
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
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 4caa6dda863464c6c21eaf97492e0c545c455c85
    hash_after: 4caa6dda863464c6c21eaf97492e0c545c455c85
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-4
    hash_before: a927c492425955067b1b02bf23344e563a44a43b
    hash_after: a927c492425955067b1b02bf23344e563a44a43b
  - step: implement/tests-red
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 07b0c191d80c9f351af2f8843b988454d05d1644
    hash_after: 07b0c191d80c9f351af2f8843b988454d05d1644
    answered:
      - name: tests
        exit: 1
        said: assertion, 11 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
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
| the row | `src/bridge/bash.js` | `trunkGuard` refuses a raw `git commit` or `git push` landing on `main`, on a desk too |
| a bare push | the same | a `git push` naming no branch lands on `main` where the box stands on it, so it refuses too |
| what it says | the same | the refusal names `./RUNME.sh commit "<message>"`, which lints, checks and pushes |
| what passes | the same | a commit the CLI makes, because the pull and the merge run git off the Bash door |
| the hold | `src/bridge/stop.js` | `refactorHand` writes `{ file, hand, since }` into a hold file under `.se/.runtime` |
| the hand | the same | the first helper write to that file fills `hand` with its `agentId` |
| the release | the same | `onRefactorAnswered` removes the hold, and a failed spawn fires it too |
| the age | the same | a hold older than `refactor.holdFor` reads as none, and the next hand takes the file |
| the start | `opensSession` in `src/bridge/server.js` | a session start drops the hold, because no hand of the last session answers into this one |
| the refusal | `src/bridge/write.js` | `onWrite` refuses a write to the held file from any other `agentId`, the session's own included |
| the patch road | `checked` in `src/bridge/apply.js` | the write it hands the door carries the call's `agentId` |
| the mint road | `src/bridge/tools.js` | the same, for the note the mint writes |
| the path | `.claude/skills/level0/lib/runs.js` | the hold file's name stands beside `REFACTORS` |
| the span | `spec/config/level0.json` | `refactor.holdFor`, beside `refactor.grace` |
| the guidance | `spec/guidance/working.md` | one actionable: land each helper's work through `./RUNME.sh commit` once its report and tests pass |

The assumption: the door tells hands apart by `agentId` alone, so the first helper to write the file owns it.

The cases:

- `bash.test.js`: `git commit -m x` on `main` refuses and names the verb, and on a work branch it passes
- `bash.test.js`: a bare `git push` standing on `main` refuses
- `stop-hold.test.js` or its neighbour: the hold stands from the spawn to the answer, and reads as none past the span
- `write.test.js`: the session's write to the held file refuses, and the owning hand's write lands
- `apply.test.js`: the owning hand's patch lands on the held file

The callers:

- `onBash` runs `trunkGuard` on every Bash call
- `onStop` in `stop.js` calls `refactorHand`, and the bridgehead fires `refactor.answered`
- `onWrite` serves Write, Edit, the patch tools and the mint

The answers to the earlier review:

- the cost read wrong: the age and the session start release a stale hold
- a failed spawn: it fires the answer, so it releases the hold
- a bridgehead dying mid-hand: the age releases it
- the patch and mint roads: both carry `agentId`
- the bare push: it refuses where the box stands on `main`

The cost: a hand working past the span loses the hold, and another hand may then write its file.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
- design: the row, the hold, the write door, the guidance line and the cases answer the Ask.
- design: each earlier finding stands answered. The age, the session start and the failed spawn release the hold.
- design: the patch road and the mint road carry the `agentId` into `onWrite`.
- craft: `touchesGit` reads the whole command. A commit verb message naming `git commit` then refuses. Test that case.
- craft: a push naming `main` from a cloud work branch keeps the hand-back text. The commit verb there pushes the work branch.
- craft: the first writer still owns the held file. The approach names this cost, so the reader sees it.
- craft: a Bash write such as `sed -i` meets no write door. The hold covers Write, Edit, the patch and the mint.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/trunk.test.js test/level0/trunk-door.test.js test/level0/refactor-hold.test.js test/level0/hold-roads.test.js test/level0/apply-door.test.js test/level0/hand-tools.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Eleven cases fail on their own assertion, and each names the row or the hold it waits for.

- `trunk.test.js`: a commit verb message naming `git commit` touches no git, and a bare push on `main` lands there
- `trunk-door.test.js`: a raw landing on `main` names `./RUNME.sh commit "<message>"`, on a desk too
- `trunk-door.test.js`: a work branch pushing `main` keeps the hand-back text
- `refactor-hold.test.js`: the spawn writes the hold, the answer takes it off, and the door lets the owning hand alone through
- `hold-roads.test.js`: the patch and the mint carry the hand, and a session start drops the hold
- the surprise: `stop.js` stands at 592 lines and `server.js` at 599, so the hold takes a module of its own

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the tests touch the files the approach names, and a new module holds the hold
- the tests reach disk, proc and clock through fakes alone
- each new case carries a pointer to the design note it proves

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
