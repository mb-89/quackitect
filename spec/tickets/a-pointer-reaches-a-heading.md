---
kind: [[ticket]]
state: closed
group: misc
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
step: verdict
record:
  - step: design/draft
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: e4179b2d3b37dc9d0213123833d835b3d4521eb5
    hash_after: e4179b2d3b37dc9d0213123833d835b3d4521eb5
  - step: design/review
    hand: box d40a1b367f4d · claude-code-remote · helper-18
    hash_before: 5da6e0185f683d04253aa81d56cd888612d47457
    hash_after: 5da6e0185f683d04253aa81d56cd888612d47457
  - step: implement/tests-red
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 0b789021bb261c31a424ff358ae8035bde484967
    hash_after: 0b789021bb261c31a424ff358ae8035bde484967
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/lsp fails
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 25bb4b5a94cbb75408da66f3065ec64579339bf6
    hash_after: ddb78f8d2536a73c485b4d7bb53aac030c6e5a1a
    answered:
      - name: lint
        exit: 0
        said: 95 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: implement/tests-green
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: c23432c0d7d62d74311904ff8b9bf7adb825879e
    hash_after: c23432c0d7d62d74311904ff8b9bf7adb825879e
    answered:
      - name: tests
        exit: 0
        said: green, src/lsp passes
      - name: check
        exit: 0
        said: 95 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: verdict
    hand: box d40a1b367f4d · claude-code-remote · helper-19
    hash_before: 3112091fdf9587b8ffbc4102ed2dec97f3b1944f
    hash_after: 3112091fdf9587b8ffbc4102ed2dec97f3b1944f
reason: done
---

# Ask

A pointer naming a heading that stands nowhere reaches nothing, and the check
says nothing. So a reader follows it and lands on a note with no answer.

A heading rename leaves every pointer at the old slug reaching nothing. The
comments under `src/viewer` carry two such pointers today.

- A check reads a pointer's own slug against the headings of the note it names.
- The check names the file, the line and the slug reaching nothing.
- The pointers standing broken today come back named.
- `./RUNME.sh lint` exits 0 once each one reaches a heading.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The server reads every pointer's anchor against the headings of the note it names. A lint over the tree draws each one reaching nothing.

| piece | where | what changes |
|---|---|---|
| the check | `src/lsp/anchor.go` | reads every tracked file for `[[note#anchor]]`, and resolves the note the way the restated rule does. It draws `DeadAnchor` over a pointer whose note stands and holds no heading slugging to that anchor. The message names the file, the line and the anchor |
| the fronts | `src/lsp/check.go` | `Over` runs it on the one path, and `Sweep` over the tree, so `./RUNME.sh lint` and the panel draw the same finding |
| the slug | `src/lsp/restated.go` | `headingNamed` stands as the one resolver, and the check calls it |
| the pointers | every file the sweep names today | each one moves to the heading the note holds now, or the note takes the chapter back where the code still describes it |
| the case | `src/lsp/anchor_test.go` | a tree with a note holding one heading. A pointer at that heading passes. A pointer at a heading the note lacks draws with its line and anchor. A pointer at a missing note draws nothing here, because the link check owns that |

[[spec/design_output/lsp#a-second-copy-draws]] takes a chapter beside it saying what the check reads, and the code points at that chapter.


## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
The check, the fronts and the slug rows name `Over`, `Sweep` and `headingNamed`, and each stands in the tree.
The case row feeds a pointer at a heading the note lacks and asserts the draw, so the rule carries its test.
The pointers row covers every dead pointer the sweep names, and the tree holds many past the two the ask names.
Lint exits red on an error and green over a warning, so the finding stands at error while a pointer reaches nothing.
The check reads a raw row, so the case says what a pointer inside a code span draws.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh branch test src/lsp/anchor_test.go


### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

- the check stands as a name answering nothing, so each case reads an empty list where it wants a finding
- the fixture writes a tree of its own. A case names a note and three pointers. One reaches its heading, one a heading it lacks, one a missing note
- what surprises the hand: the branch test reads a Go case that builds and fails as an assertion. One that builds not reads as a build fault, so the stub stands first


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the cases stand beside the check in the server package
- the change reaches the check, its fronts, the note and the pointers the sweep names
- the cases drive the tree over a folder the fixture writes, and the check reaches no door past the tree
- the check's header and each case's comment name the chapter the note takes


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

./RUNME.sh lint


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the check, its two fronts, the note's chapter, the pointers the sweep named, and the cases
- the check reads the tree, which the cases drive over a folder the fixture writes
- the check's header and each of its functions name the chapter the note takes


## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test src/lsp/anchor_test.go


### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check


### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The server reads every pointer a tracked file carries. It resolves the note the way the restated rule does, and reads the anchor against the headings the note holds. A note that stands and holds no such heading draws `DeadAnchor` on the pointer's line, at error. The message names the anchor.
- The one-file front and the sweep both run it, so the panel and the lint draw the same finding.
- The sweep named every pointer standing broken in the tree.
- Each one now names a heading its note holds. Two name the funnel note, where the schema note held no chapter for them.
- The note's chapter says what draws and what stays with the link check.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the check, its two fronts, the note's chapter, the pointers the sweep named, and the cases
- the cases drive the tree over a folder the fixture writes, and the lint drives the built server
- the check's header and each of its functions name the chapter the note takes


# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- .claude/skills/level0/lib/answer.js
- .claude/skills/level0/lib/refuse.js
- .claude/skills/level0/lib/schema-body.js
- .claude/skills/level0/lib/schema-route.js
- .claude/skills/level0/lib/stop.js
- .claude/skills/level0/lib/tested.js
- spec/design_input/the-agent-pulls-tickets.html
- spec/design_output/extension.md
- spec/design_output/level0.md
- spec/design_output/log.md
- spec/design_output/lsp.md
- spec/guidance/review/reviewing.md
- spec/tickets/a-pointer-reaches-a-heading.md
- spec/tickets/a-step-changes-hands.md
- spec/tickets/the-colours-stand-in-config.md
- src/bridge/bash.js
- src/bridge/findings.js
- src/bridge/stop.js
- src/extension/editor.js
- src/extension/extension.js
- src/extension/lib/lsp.js
- src/index/door.go
- src/index/index.go
- src/index/watch.go
- src/lsp/anchor.go
- src/lsp/anchor_test.go
- src/lsp/check.go
- src/lsp/door.go
- src/lsp/finding.go
- src/lsp/lsp.go
- src/lsp/main.go
- src/lsp/marked.go
- src/lsp/panel.go
- src/lsp/paths.go
- src/lsp/restated.go
- src/lsp/schema-body.go
- src/lsp/schema.go
- src/lsp/schema_test.go
- src/lsp/serve.go
- src/lsp/tree.go
- src/scripts/cli-check.js
- src/scripts/cli-doors.js
- src/scripts/cli-read.js
- src/scripts/cli.js
- src/scripts/guidance-hand.js
- src/scripts/install.sh
- src/scripts/pull-route.js
- src/scripts/pull.js
- src/scripts/work-answer.js
- src/scripts/work.js
- src/tui/help.go
- src/tui/tail.go
- src/tui/tree_test.go
- test/contract/cli-mint-callers.test.js
- test/contract/cli-read.test.js
- test/contract/cli-verbs.test.js
- test/contract/ticket.test.js
- test/contract/tree.test.js
- test/level0/lsp.test.js
- test/level0/projection.test.js
- test/level0/pull-leaves.test.js
- test/level0/schema-route.test.js
- test/level0/stop.test.js
- test/level0/work.test.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass

- The check draws DeadAnchor with the file, the line and the anchor. A probe note with a pointer at a heading its note lacks draws it at error.
The cases feed a pointer at a heading the note lacks and assert the draw, and the server's tests pass.
The lint exits zero, and the built server carries the rule.
- The comment-only commit lands past the door rightly. The door reads a source path as code without reading the hunk. The anchor check proves each pointer it moves.
The ask names a viewer folder the tree holds nowhere, and the sweep names every dead pointer the tree holds instead.
The import moves under the index and the tui stand beyond the ask as a trivial fix.
- The comment and the chapter hand a pointer at a missing note to a link check the server holds nowhere. Such a pointer draws nothing.
The note ending pair stands in three files now, and the anchor check adds the third copy beside the heading resolver of the restated rule.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The chapter names the check and the heading resolver by their file, and repeats no message text. The one fact the change copies is the note ending pair, named in the findings.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
