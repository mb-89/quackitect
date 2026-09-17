---
kind: [[ticket]]
state: open
urgency: now
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
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
group: guidance-rides-the-step
step: design/review
record:
  - step: design/draft
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: 4e539df340aeedf85645ff9bc65d83cd5bdf2519
    hash_after: 4e539df340aeedf85645ff9bc65d83cd5bdf2519
---

# Ask

Every script the engine runs comes under `code.fileLines`, so the write door takes a growth again.

The door refuses a growth on a file already past its ceiling, and takes a cut. So every change to the pull or the work verb carries a larger cut with it, in the same write. That cost lands on work having nothing to do with the file's size.

What breaks where nobody does it: each change to these files pays the same toll again, and the toll grows as the files do.

- `./RUNME.sh lint src/scripts` names no `FileCeiling`
- `./RUNME.sh lint test/level0` names no `FileCeiling`
- every module the split mints heads with what it is for, and says it once
- `./RUNME.sh check` exits 0 on the branch

For the change paying this toll, see [[spec/tickets/guidance-rides-step]].

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

| the ask asks | the approach answers |
|---|---|
| which files come down | the pull, the work verb, the command line, and the tests reading each |
| what decides a cut | the topic a chapter of the design output already names |
| what moves | whole functions, with the text they hold, and nothing else |
| what proves the move | the tests standing today, which pass before and after each cut |

TL;DR:

- No behaviour changes. Every cut moves a function whole, and its callers import it back.
- Each cut lands as its own write, because the door reads a file before and after.
- The pull comes down first, because the work verb and the tests read it.
- A module takes the name of the design output chapter it serves, so a reader finds it.

The pull, by topic:

| the module | what it takes |
|---|---|
| the leaf | the walk, the leaf and its chapter, and the sections under it |
| the stand | which tickets stand, which are takeable, and which wait |
| the hand-out | the offer, the hold, the work answer and the spawn prompt |
| the checks | the forms, the voice, the commands and the hand rules |
| the hand-back | passed, failed, became, refused, and the record each writes |
| the verb | the flags, the roads the verb takes, and the material the judge reads |

The work verb, by topic:

| the module | what it takes |
|---|---|
| the round trip | new, take, sync, done and release |
| the trunk | merge, close and what reads as merged |
| the reading | read, review and list |

The command line takes the same treatment, one module per verb group. Each test file follows its subject, so a test stands beside the module it drives.

| test | claim |
|---|---|
| every test standing today | the tree answers the same before and after each cut |
| the lint over the scripts | no `FileCeiling` stands |
| the lint over the tests | no `FileCeiling` stands |

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | the review hand reads this approach against the ask | open |
| 2 | a pass moves this ticket to the implement phase | open |

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

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
