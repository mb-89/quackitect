---
kind: [[ticket]]
state: open
step: design/draft
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

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

One guard, `onDesk(it, branch)`, stands in `src/scripts` and answers a refusal where the box is a desk and the branch starts `work/`. The desk reads as `it.cloud ?? inCloud(it.env)`, the read `pushed` takes.

| verb | what the guard does |
|---|---|
| `ticket pull` | refuses before any read, and names `git switch main` |
| `./RUNME.sh commit` | refuses before the tests run, so nothing stages |
| `branch take` | refuses on a desk, because a desk leaves a cloud branch |
| `branch merge` | runs on `main` alone already, and takes the branch in by a merge |

The design notes change with it. `pull#the-engine-takes-the-branch` drops the desk's road onto a group, and `work` names the guard.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/pull.js`, `pull`, which reads the branch first
- `src/scripts/commit-verb.js`, `landsAndPushes`, which runs the tests first
- `src/scripts/work.js`, `take`, the desk's road onto a group
- `src/scripts/work-merge.js`, `merge`, which the test drives on a cloud branch

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first draft

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- `pull` in `src/scripts/pull.js` hands a desk on trunk `it.take(named || urgentGroup(it))`, so a guard in `take` turns a plain desk pull into a refusal while an urgent group stands. Name the change that road takes, and list `namedGroup` and `urgentGroup` in `src/scripts/pull-hand.js` as callers.
- `trunkGuard` in `src/bridge/bash.js` guards `main` alone, so a desk's raw `git commit` on a `work/` branch lands past a guard in `landsAndPushes`. Name the door that refuses it, the Bash door or `.githooks/pre-commit`, or say why the commit verb alone answers the ask.
- `release` in `src/scripts/work.js` moves a desk onto a `work/` branch and commits there through `letGo`. Say whether the guard reaches it.

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
