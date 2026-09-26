---
kind: [[ticket]]
state: open
group: the-verbs-land-whole
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
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
step: design/draft
---

# Ask

A read, a grep and a scratch write pass the shell door, a landing behind a pipe meets it, a pure move commits with no test, and the pull tool and the shell verb read one hand.

`GIT_VERB` in `.claude/skills/level0/lib/trunk.js` matches `git push` or `git commit` anywhere in the text, so a read quoting either meets the commit verb refusal. `LandingFollowsItsGate` refuses a read before `;` and passes a pipe before `&&`, the harness scratchpad reads as a tree path, a pure move asks a test, and the pull tool runs the verb with no harness env.

- `touchesGit` in `.claude/skills/level0/lib/trunk.js` reads git as the command word of a segment, and a case in `test/level0/trunk.test.js` passes a grep whose quoted pattern names `git push` or `git commit`
- `LandingFollowsItsGate` in `.claude/skills/level0/lib/bash.js` passes a read-only segment before `;` and refuses a pipe before `&&` ahead of a landing, with both cases in `test/level0/bash.test.js`
- `FREE` in `.claude/skills/level0/lib/bash.js` takes the harness scratchpad, and a case in `test/level0/bash.test.js` passes a redirect into it
- `untestedIn` in `.claude/skills/level0/lib/tested.js` passes a delta whose lines move and change nothing, with a case in `test/level0/tested.test.js`
- `.claude/skills/level0/hooks/pull-tool.js` runs the verb under the session's harness env, and a case in `test/level0/level1.test.js` reads the hand the tool's pull takes as the hand the shell verb reads
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

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
