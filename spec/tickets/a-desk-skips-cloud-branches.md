---
kind: [[ticket]]
state: closed
step: design/person-1
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: person-1
        does: answers the question the engine asks
        by: person
        to: engine
        asks: "design/review fails back 2 times: `pull` in `src/scripts/pull.js` reaches `it.ready()`, which is `readyToMerge` in `src/scripts/work-review.js`, inside the take block on a desk alone. `pull#an-empty-queue-hands-cleanup` and `test/level0/ready.test.js` depend on that road. Say whether a desk pull still calls `it.ready()` before the hand-out, and list `readyToMerge` as a caller.; `test/level0/work-doors.js` hands every case `env: {}`, so each `work(ROOT, [\"take\"], ...)` case in `test/level0/work.test.js`, `test/level0/work-group.test.js` and `test/level0/work-orphan.test.js` drives `take` as a desk. List them as callers, and name how they reach a cloud box once `take` refuses on a desk.; `test/level0/work-group.test.js` asserts that a desk pull takes a marked group and a named one. List it beside `test/level0/pull-unbound.test.js`.; `onDesk` reads the cloud as `pushed` does, while `src/bridge/bash.js` reads it through `onACloud`. Name the one read the Bash door guard and the verbs share."
        evidence:
          - name: answer
            form: text
            says: the answer, which the step behind this one reads
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
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
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
        to: retro
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
process: [[spec/processes/standard]]
process_hash: 6bfe67ab65bf2e6d
record:
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: 0ed73f5c263eee3034470b49a6259578ee63ad83
    hash_after: 0ed73f5c263eee3034470b49a6259578ee63ad83
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-2
    hash_before: 287d591cdbea52af40e32418a29ba3f1130df008
    hash_after: 287d591cdbea52af40e32418a29ba3f1130df008
    returns: 1
    why: "`pull` in `src/scripts/pull.js` hands a desk on trunk `it.take(named || urgentGroup(it))`, so a guard in `take` turns a plain desk pull into a refusal while an urgent group stands. Name the change that road takes, and list `namedGroup` and `urgentGroup` in `src/scripts/pull-hand.js` as callers.; `trunkGuard` in `src/bridge/bash.js` guards `main` alone, so a desk's raw `git commit` on a `work/` branch lands past a guard in `landsAndPushes`. Name the door that refuses it, the Bash door or `.githooks/pre-commit`, or say why the commit verb alone answers the ask.; `release` in `src/scripts/work.js` moves a desk onto a `work/` branch and commits there through `letGo`. Say whether the guard reaches it."
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: 907345b23e215afea3bba92287e9977833b71762
    hash_after: 907345b23e215afea3bba92287e9977833b71762
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-4
    hash_before: 60d353d56e5f9358b8b2fa6589517a8d39c480e6
    hash_after: 60d353d56e5f9358b8b2fa6589517a8d39c480e6
    returns: 2
    why: "`pull` in `src/scripts/pull.js` reaches `it.ready()`, which is `readyToMerge` in `src/scripts/work-review.js`, inside the take block on a desk alone. `pull#an-empty-queue-hands-cleanup` and `test/level0/ready.test.js` depend on that road. Say whether a desk pull still calls `it.ready()` before the hand-out, and list `readyToMerge` as a caller.; `test/level0/work-doors.js` hands every case `env: {}`, so each `work(ROOT, [\\\"take\\\"], ...)` case in `test/level0/work.test.js`, `test/level0/work-group.test.js` and `test/level0/work-orphan.test.js` drives `take` as a desk. List them as callers, and name how they reach a cloud box once `take` refuses on a desk.; `test/level0/work-group.test.js` asserts that a desk pull takes a marked group and a named one. List it beside `test/level0/pull-unbound.test.js`.; `onDesk` reads the cloud as `pushed` does, while `src/bridge/bash.js` reads it through `onACloud`. Name the one read the Bash door guard and the verbs share."
urgent: true
reason: became
successors: [the-desk-findings-need-an-answer]
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A desk works on `main` alone, and takes a cloud branch into `main` by a merge and nothing else. A cloud box owns its branch, and the owner reads a desk's work on `main`.

Without it a desk commits its own work onto a group branch, `main` falls behind, and the desk runs a cloud group's leaves.

- a desk's pull on a `work/` branch refuses and names `main`, and a test drives it
- a desk's commit on a `work/` branch refuses and names `main`, and a test drives it
- a desk's `./RUNME.sh branch merge <name>` takes a cloud branch into `main`, and a test drives it
- `./RUNME.sh check` passes

# design

## person-1

<!-- design/review fails back 2 times: `pull` in `src/scripts/pull.js` reaches `it.ready()`, which is `readyToMerge` in `src/scripts/work-review.js`, inside the take block on a desk alone. `pull#an-empty-queue-hands-cleanup` and `test/level0/ready.test.js` depend on that road. Say whether a desk pull still calls `it.ready()` before the hand-out, and list `readyToMerge` as a caller.; `test/level0/work-doors.js` hands every case `env: {}`, so each `work(ROOT, ["take"], ...)` case in `test/level0/work.test.js`, `test/level0/work-group.test.js` and `test/level0/work-orphan.test.js` drives `take` as a desk. List them as callers, and name how they reach a cloud box once `take` refuses on a desk.; `test/level0/work-group.test.js` asserts that a desk pull takes a marked group and a named one. List it beside `test/level0/pull-unbound.test.js`.; `onDesk` reads the cloud as `pushed` does, while `src/bridge/bash.js` reads it through `onACloud`. Name the one read the Bash door guard and the verbs share. -->

### answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

One read, `onDesk(it, branch)`, answers true where the box stands off the cloud on a `work/` branch. It reads the cloud as `pushed` does. Every refusal names `git switch main`.

| road | the change |
|---|---|
| `ticket pull` on a `work/` branch | refuses before any read |
| the pull on `main` | calls `take` on a cloud box alone, so a desk pull hands out free tickets |
| a group a desk names | refuses, and names `branch merge` for a finished cloud branch |
| `./RUNME.sh commit` | refuses before the tests run, so nothing stages |
| a raw `git commit` or `git push` | the Bash door refuses it, in a guard beside `trunkGuard` |
| `branch take` | refuses on a desk |
| `branch release` | runs as it stands: it frees a claim and carries no work |
| `branch merge` | runs on `main` alone already |

The guard holds the agent's doors, and a person in a terminal keeps raw git. `.githooks/pre-commit` stays out of it, because `letGo` commits through git and meets that hook too.

`urgentGroup` leaves the tree, because the desk's road was its one caller. The design notes change with it:

- `pull#the-engine-takes-the-branch` drops the desk's road onto a group
- `work#a-box-writes-its-branch` names the desk guard

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/pull.js`, `pull`, which reads the branch first and holds the take road
- `src/scripts/pull-hand.js`, `namedGroup`, which the desk's refusal reads
- `src/scripts/pull-hand.js`, `urgentGroup`, which leaves the tree
- `src/scripts/commit-verb.js`, `landsAndPushes`, which runs the tests first
- `src/bridge/bash.js`, the check list beside `trunkGuard`
- `src/scripts/work.js`, `take`, which refuses on a desk
- `src/scripts/work.js`, `release`, which stands unchanged
- `src/scripts/work-merge.js`, `merge`, which the test drives on a cloud branch
- `test/level0/pull-unbound.test.js`, the case where a desk takes the group it names

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- the pull reaches `take` on a desk: the pull calls `take` on a cloud box alone, and `urgentGroup` leaves
- a raw `git commit` lands on a `work/` branch: the Bash door refuses it beside `trunkGuard`
- `release` commits on a `work/` branch: it runs as it stands, since it carries no work

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- `pull` in `src/scripts/pull.js` reaches `it.ready()`, which is `readyToMerge` in `src/scripts/work-review.js`, inside the take block on a desk alone. `pull#an-empty-queue-hands-cleanup` and `test/level0/ready.test.js` depend on that road. Say whether a desk pull still calls `it.ready()` before the hand-out, and list `readyToMerge` as a caller.
- `test/level0/work-doors.js` hands every case `env: {}`, so each `work(ROOT, ["take"], ...)` case in `test/level0/work.test.js`, `test/level0/work-group.test.js` and `test/level0/work-orphan.test.js` drives `take` as a desk. List them as callers, and name how they reach a cloud box once `take` refuses on a desk.
- `test/level0/work-group.test.js` asserts that a desk pull takes a marked group and a named one. List it beside `test/level0/pull-unbound.test.js`.
- `onDesk` reads the cloud as `pushed` does, while `src/bridge/bash.js` reads it through `onACloud`. Name the one read the Bash door guard and the verbs share.

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

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
