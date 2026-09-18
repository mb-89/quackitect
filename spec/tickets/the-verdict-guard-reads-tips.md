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
group: the-warnings-feed-a-refactorer
step: design/draft
record:
  - step: design/draft
    hand: box dd2a59294365 · claude-code-remote
    hash_before: b743c4264990c3b6ed50c9fcc7ded1f61fad972b
    hash_after: b743c4264990c3b6ed50c9fcc7ded1f61fad972b
  - step: design/review
    hand: box dd2a59294365 · claude-code-remote · helper-2
    hash_before: 425880b7dac0cbd15209f1c0c640a89a29f14f89
    hash_after: 425880b7dac0cbd15209f1c0c640a89a29f14f89
    returns: 1
    why: "`landed` stages `add -A`, so a sibling's hand-back commits the write this hand leaves in the tree. The range then touches the ticket in hand, and the approach refuses the case the ask passes. Say what the guard does with a hunk this hand wrote.; The verdict leaf takes `read` as form `files`, and `changedSince` spans the first `hash_before` to the tip. A sibling's commit puts its files in that span. Then `formFault` refuses the hand-back for leaving them out. Carry the approach to that guard too.; An empty range and a failed git call both answer no line. The approach gives the two opposite verdicts. Name the `ok` the git door answers as what tells them apart.; The approach refuses a range touching the ticket in hand alone. So this hand's commit under another path passes. The ask refuses this hand's own write, and names no path."
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->

A verdict hand keeps its pass while a sibling hand on the same box commits:

- one box runs a reader beside its own work, which is the shape a group branch takes
- the reading lands once, in place of once a sibling commit

<!-- breaks, as text: what breaks if it is never done -->

The guard reads the hold's tip against the branch tip, and a helper moves no tip of its own.

| what moves the tip | what the guard does |
|---|---|
| the hand's own write | refuses, which is the rule it holds |
| a sibling hand's commit | refuses, and the reading goes to waste |

The box then drops the hold, spawns a second hand, and pays the reading twice. This run paid it once, on [[spec/tickets/the-runtime-files-stand-apart]] at verdict. The guard stands in `handFaults`, under `src/scripts/pull-chapter.js`.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- a case drives a verdict hand-back where a sibling commits, and the pull takes it
- a case drives one where the hand's own read moves, and the pull refuses it
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The guard asks git what moved, in place of whether anything moved.

| what the guard reads today | what it reads |
|---|---|
| the hold's tip against the branch tip | the files the commits between the two touch |

So a verdict hand-back refuses where that range touches the ticket in hand, and
passes where a sibling's commit touches other files.

| the question | the answer |
|---|---|
| why the ticket file | a reader writes its verdict there, and that write is what the rule guards |
| what a sibling touches | its own ticket, and the files its change carries |
| where the guard stands | `handFaults`, under `src/scripts/pull-chapter.js` |
| what answers the range | the git door, at `log --format= --name-only <hold>..<tip>` |
| what it costs | one git call a verdict hand-back, over a commit or two |
| a range git reads nowhere | it answers as a move, which keeps today's refusal |

**The cases.**

- a sibling's commit moves the tip, and the pull takes the verdict
- a commit touching the ticket in hand moves it, and the pull refuses
- the tip stands where the hold left it, and the pull takes the verdict
- git answers nothing for the range, and the pull refuses

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- `landed` stages `add -A`, so a sibling's hand-back commits the write this hand leaves in the tree. The range then touches the ticket in hand, and the approach refuses the case the ask passes. Say what the guard does with a hunk this hand wrote.
- The verdict leaf takes `read` as form `files`, and `changedSince` spans the first `hash_before` to the tip. A sibling's commit puts its files in that span. Then `formFault` refuses the hand-back for leaving them out. Carry the approach to that guard too.
- An empty range and a failed git call both answer no line. The approach gives the two opposite verdicts. Name the `ok` the git door answers as what tells them apart.
- The approach refuses a range touching the ticket in hand alone. So this hand's commit under another path passes. The ask refuses this hand's own write, and names no path.

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
