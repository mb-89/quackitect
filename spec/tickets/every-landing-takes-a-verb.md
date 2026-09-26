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

The agent reaches git through the engine alone. A hand lands, proves red, renames and takes in a cloud branch through a verb. Each commit carries the files of its own ticket alone.

`landed` in `src/scripts/pull-landed.js` runs `git add -A`, so a pass commit carries a sibling hand's edits under the ticket's name. No verb proves a test red, and the commit verb over a renamed ticket leaves the old file. `merge` in `src/scripts/work-merge.js` reads `work/<name>` alone. The shell door passes `git mv` under `spec/tickets`.

- `landed` in `src/scripts/pull-landed.js` stages the ticket and the paths its step's hand writes. A case in `test/level0/landed.test.js` leaves a sibling's edit unstaged after a pass
- `spec/design_output/pull.md` under `The refused commit` names what a hand-back stages
- `./RUNME.sh test --red <test> <source>...` sets the named sources aside, runs the test and puts them back. It answers red or refuses, with a case for each answer in `test/level0/test-verb.test.js`
- `./RUNME.sh commit` naming the new path after `./RUNME.sh rename` lands the old path's deletion in the same commit. A case in `test/level0/commit-verb.test.js` decides it
- `./RUNME.sh branch merge` takes a `claude/` branch and reads it against main. It merges the branch or names main as carrying its work, then runs the check and deletes the branch. A case in `test/level0/work-group.test.js` decides it
- `findings` in `.claude/skills/level0/lib/bash.js` refuses `git mv` under `spec/tickets`. It names `./RUNME.sh rename`, with a case in `test/level0/bash.test.js`
- The Bash door refuses every git command that writes the repository, and names the verb standing for it. A case in `test/level0/bash.test.js` decides it
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
