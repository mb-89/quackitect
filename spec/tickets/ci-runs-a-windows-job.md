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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it"]
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: tests
            form: list
            says: every test the change adds, one a line, as a file and a test name
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/design]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass, pass with findings naming a child a line, or fail with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every row the design review passes with stands fixed in the change"]
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
step: implement/tests-green
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
group: the-foundation-lands-unchanged
record:
  - step: design/draft
    hand: box d7a69cb6601d7 · claude-code-remote
    hash_before: bab88996cad2665b17b16d68f75a56c255689865
    hash_after: bab88996cad2665b17b16d68f75a56c255689865
  - step: design/review
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: ce3805b0166862125192e187b7f332ccccb77cb1
    hash_after: ce3805b0166862125192e187b7f332ccccb77cb1
  - step: implement/tests-red
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: a1fae23f24d255eb31072c34a1f4382309c633b9
    hash_after: a1fae23f24d255eb31072c34a1f4382309c633b9
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/change
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 9c5d9dfa9d5f424350e09914e6675030071a275d
    hash_after: 9c5d9dfa9d5f424350e09914e6675030071a275d
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
---

# Ask

The check workflow under `.github/workflows` runs on Windows beside Linux.

Some people work on Windows, and the cloud boxes run Linux. Without the job a Windows fault lands unseen.

- the workflow names a Windows runner, and its run on the branch passes
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The check job in `.github/workflows/check.yml` runs over a matrix of two runners, `ubuntu-latest` and `windows-latest`, with `fail-fast: false`, so a fault on one still shows the other.

| the step | on Windows |
|---|---|
| `./RUNME.sh check` | runs under `shell: bash`, the Git Bash every Windows runner carries, which the install reads as `MINGW` and so takes its Windows build |
| the cache of `.se/bin` | keys on the runner's system as well as the pinned versions, so each system restores its own binaries |
| the Go setup | reads the one `go.mod` at the root, which [[spec/tickets/go-code-shares-one-module]] leaves there |

A fault the Windows run shows is this ticket's to fix, in the file it names, until both runs pass on the branch. The implement step reads the run through the GitHub tools.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `.github/workflows/check.yml` the `check` job, which GitHub runs on every push
- `src/scripts/install.sh` the system case, which the Windows run reaches first

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/check-workflow.test.js` "the check runs on a Linux runner and a Windows runner", deciding the runner half
- the Windows run of the check workflow on the branch, read through the GitHub tools, which decides its second half
- `./RUNME.sh check`, which decides the second done line

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the workflow, `RUNME.sh` and the system case of the install stand opened
- a search for `workflows` and `check.yml` over the tree names no other reader of the workflow
- each done line names its test in the tests list

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

pass

<!-- the form is verdict -->

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/check-workflow.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

The one case fails on its first assertion, the matrix line, since the workflow names `ubuntu-latest` alone. No surprise: nothing else in the tree reads the workflow.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the new test alone, inside the ask
- the test reads the workflow through the disk door, and touches no other door
- the head comment names the approach and links this ticket
- the runner names stand in the workflow, and the test matches them
- the review passes with no rows

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint .github/workflows/check.yml test/contract/check-workflow.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the workflow and its test, both inside the ask
- the test reads the real workflow, so it moves to `test/contract/check-workflow.test.js`, where `FakeDoorsInTest` puts it
- the workflow names this ticket beside the matrix
- the runner list stands in the workflow alone
- the review passes with no rows

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
