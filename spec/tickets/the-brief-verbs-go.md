---
kind: [[ticket]]
state: open
urgency: whenever
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
step: design/review
record:
  - step: design/draft
    hand: box d42624a67d18a8
    hash_before: d248ef965fa407e15019f6460dc42588001238c9
    hash_after: 95484c2790d805874cf2fa8b06113b661095578d
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The branch verbs read a group alone, and the brief code goes with them:

- `take` over a brief
- `done` over a brief
- `read` and `review` over a brief
- `release` over a brief
- the brief file the copilot lane reads

Every brief has merged, so the verbs carry two roads and walk one. A reader of the work verbs learns the brief first, and the brief left the tree.

- `./RUNME.sh branch list` names every branch as a group
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

| where the brief stands | what stands after |
|---|---|
| `take`, and the claim behind it | the group claim alone, so `freeIn` answers groups |
| `done`, and the drop behind it | the group's leaves road alone |
| `read` and `review` | the group ticket as the text they show |
| `release`, and the status it writes | the group's record, which `letGo` already writes |
| `list`, which names a kind | the one kind, so the column goes |
| `new`, which takes a brief off trunk | the group ticket, which the mint writes and the pull cuts a branch for |
| the copilot lane | the group ticket, at the path the ticket names |

The brief is one file at the root, and a group ticket says the same in the
tree. Every branch on this box carries a group, so each verb walks the group
road and the other road stands dead. The change reads each verb, cuts the
brief half, and leaves the group half as it stands.

`withContract` writes the routine's steps into a brief, and the pull's
hand-out says the same to a hand. So the contract goes with the brief, and the
`branch new` verb takes a group name in place of a file.

The constant and its readers go last: `BRIEF` in the work verbs, the review
verb, the review library and the copilot lane. A test naming a handover moves
to the group ticket it stands for. For details, see
[[spec/design_output/work#a-brief-drains-first]].

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- The approach cuts the code and leaves the tree. A reader of the verbs learns the brief first, from the notes.
- The work design output teaches the brief in six chapters, and the approach leaves all six standing:
  - What a work branch is
  - A brief drains first
  - What the status says
  - Two handovers
  - The round trip
  - Every brief carries the contract
- Name each chapter, and what stands in its place.
- The cloud guidance sends a cloud box's result into the brief file. Say what a cloud box writes instead.
- The handover schema names the root brief as a path it governs. Say what stands there after.
- Say that the box handover stays. The copilot lane reads both paths, and a session writes a fresh one at the finish.
- The approach points for its details at the chapter A brief drains first, which goes with the change.
- The rows hold against the code, verb by verb. The list names a kind, the new verb reads the root brief.
- The take verb walks two roads, and the release verb falls through to the group record.
- `./RUNME.sh check` answers 0 here, so the change carries that baseline.
- The branch review verb finds the branch nowhere. This ticket reaches code at implement.

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
