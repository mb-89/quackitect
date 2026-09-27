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
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
group: the-process-stays-editable
step: design/review
record:
  - step: design/draft
    hand: box d7d8cca563b1 · claude-code-remote
    hash_before: 662be7132628f329f574a568aaaf7d8ecda7d266
    hash_after: 662be7132628f329f574a568aaaf7d8ecda7d266
---

# Ask

The retro mints each class onto the process it needs, and reads every prose criterion the backlog closes. [[spec/design_input/level-two]] asks it in its chapters The trivial ticket and The other processes.

Today `src/engine/retro/mint.js` writes every class as a standard ticket, and a prose criterion in the backlog stays unread.

- `retro mint` mints each class onto the process the class names, and refuses a class naming none. A case in `test/level0/retro-mint.test.js` decides it
- `spec/processes/retro.yaml` carries a backlog check after the audit, which reads each prose criterion the window closes. A case under `test/level0` decides it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

- A class's ticket names its route under process, and a promotion's ticket does too.
- ticketFaults in src/engine/retro/mint.js refuses a ticket naming no process, or one processAt finds nowhere.
- mintOne passes --process= off the ticket, and the constant ROUTE leaves.
- The verb retro backlog in src/engine/retro/backlog.js reads every ticket trunk closes in the window and naming no group, off the since collect writes.
- closedIn, cut out of cloudInto in src/scripts/retro-collect.js, answers those closes for both.
- A prose criterion is an Ask bullet naming no command in backticks. The verb prints each one.
- The verb answers 1 while backlog.json in the retro's folder holds no verdict for a printed criterion. It answers 0 once each holds `holds` or `falls short` with its reason.
- spec/processes/retro.yaml gains the step backlog after audit, its evidence that command, and chapter takes input backlog.
- A criterion falling short reaches classify as a finding, as spec/guidance/retro/classify reads the retro's folder.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/engine/retro/mint.js mintOne, which reads the route off the ticket,src/engine/retro/mint.js mintFaults and ticketFaults, which refuse a ticket naming no process,src/engine/retro/mint.js mint, which calls both,src/scripts/retro.js retro, whose dispatch gains backlog,src/scripts/retro-collect.js cloudInto, which shares closedIn,spec/processes/retro.yaml the steps audit and chapter

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

test/level0/retro-mint.test.js a class naming trivial mints a trivial ticket,test/level0/retro-mint.test.js a class naming no process is refused,test/level0/retro-mint.test.js a class naming a process that stands nowhere is refused,test/level0/retro-backlog.test.js the backlog verb prints each prose criterion of a backlog ticket the window closes,test/level0/retro-backlog.test.js the backlog verb answers 1 while a criterion holds no verdict, and 0 once each does,test/level0/retro-backlog.test.js a group's ticket and a criterion naming a command stay out,test/level0/retro-route.test.js the retro route holds backlog after audit

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

mint.js, classes.js, retro.js, retro-collect.js and retro.yaml stand opened, and each claim checked there
the callers list names each function the process field and the backlog step change
each done_when line maps to a retro-mint, retro-backlog or retro-route case

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
