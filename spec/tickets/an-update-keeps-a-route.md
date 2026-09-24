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
process: [[spec/processes/standard]]
process_hash: 7a1a6e274b56e7ee
group: the-ticket-answers-the-editor
depends_on: [the-route-edits-ahead]
step: implement/tests-red
record:
  - step: design/draft
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: d0b8b00e88342b65c07a58d2425724b380df306f
    hash_after: d0b8b00e88342b65c07a58d2425724b380df306f
  - step: design/review
    hand: box 2bc65ec92430 · claude-code-remote · helper-2
    hash_before: 0cafd8cf4e31221684b2906a3db5f8a9397519cd
    hash_after: 0cafd8cf4e31221684b2906a3db5f8a9397519cd
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A route a person edits survives the next process update, or the verb names where it drifts.

ticket update overwrites a person's edit to a step ahead of the pointer without a word.

- ./RUNME.sh ticket update keeps a step a person edited ahead of the pointer, or names the drift and changes nothing
- ./RUNME.sh test test/level0/ticket-verb.test.js passes

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

`ticket update` finds the process version the ticket copied, and compares the steps the ticket has yet to reach against it. The ticket's `process_hash` names that version. The verb walks `git log` over the process file, and reads each version through `git show` until `processHash` answers the ticket's hash.

| what the verb finds | what it does |
|---|---|
| the version, and every step past the reached leaves stands as that version wrote it | copies the new route as it does today |
| the version, and a step past the reached leaves differs from it | names each such step as drift, changes nothing, and exits 1 |
| no version answering the hash | says the base stands nowhere in the history, changes nothing, and exits 1 |
| either refusal, under `--over` | copies the new route over the edit, as it does today |

A step differs where it stands added, dropped, moved, or changed. A phase compares every field but `steps`. `reachedOf` in `src/scripts/ticket-route.js` names the reached leaves, so a leaf the route verb holds is a leaf this verb skips. The comparison reads through `canonicalOf`, as `aheadOnly` does.

A new module, `src/scripts/ticket-drift.js`, holds `driftOf` and the history walk. The walk reaches git through the git door, and the cases drive `fakeGit`.


### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/ticket.js` `update`, which asks `driftOf` before it writes, and reads `--over`
- `src/scripts/ticket.js` `ticket`, whose usage line names `--over`
- `test/level0/ticket-verb.test.js` the update cases, whose ticket carries a hash no history answers, so each passes `--over`


### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first draft


## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

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
