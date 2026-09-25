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
step: design/review
record:
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: c1784e141f3fe804dcc2f04470a25a0ed880cf09
    hash_after: c1784e141f3fe804dcc2f04470a25a0ed880cf09
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-2
    hash_before: 72c970e44b46c42c421b97a9f42e2d0ab5a340fa
    hash_after: 72c970e44b46c42c421b97a9f42e2d0ab5a340fa
    returns: 1
    why: "| grade | finding | fix |; |---|---|---|; | design | `the-editor-takes-an-inset` and `the-owner-walks-a-ticket` stand open at a `by: person` step in the open group `the-editor-holds-the-drawing`, so the rule turns `./RUNME.sh check` red where it lands | name what the implement step does with the two, so the third line of the ask holds |; | design | `branch unblock` refuses on a cloud box, and the finding names it on every box | name the line the finding gives a cloud box, or name the change that lets a cloud box hand the question out as the ask says |; | craft | `waiting` in `src/scripts/ticket-yours.js` already names an open ticket at a person leaf | call it from the rule in place of a second reader |; | craft | the leaf reader stands in `src/scripts/pull-route.js`, and `lib/copilot-dispatch.js` already imports from `src` | import the reader where it stands, and drop the move |; | craft | `treeFaults` runs from `src/scripts/cli-read.js`, which the callers list leaves out | name `cli-read.js` in place of `cli-check.js` |; | craft | the approach names no test | name the fake tree the test feeds: a child at a person step refused, and a child closed `became` passed |"
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: a1d7cf67a1452cb44dfe9feb4004fdc860236f1c
    hash_after: a1d7cf67a1452cb44dfe9feb4004fdc860236f1c
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-4
    hash_before: b7536508e337614380d046f9ea6d290bcbc46d97
    hash_after: b7536508e337614380d046f9ea6d290bcbc46d97
    returns: 2
    why: "| grade | finding | fix |; |---|---|---|; | design | `the-editor-takes-an-inset` and `the-owner-walks-a-ticket` stand open at a `by: person` step in the open group `the-editor-holds-the-drawing`, so the rule turns `./RUNME.sh check` red where it lands | name what the implement step does with the two, so the third line of the ask holds |; | design | `branch unblock` refuses on a cloud box, and the finding names it on every box | name the line the finding gives a cloud box, or name the change that lets a cloud box hand the question out as the ask says |; | craft | `waiting` in `src/scripts/ticket-yours.js` already names an open ticket at a person leaf | call it from the rule in place of a second reader |; | craft | the leaf reader stands in `src/scripts/pull-route.js`, and `lib/copilot-dispatch.js` already imports from `src` | import the reader where it stands, and drop the move |; | craft | `treeFaults` runs from `src/scripts/cli-read.js`, which the callers list leaves out | name `cli-read.js` in place of `cli-check.js` |; | craft | the approach names no test | name the fake tree the test feeds: a child at a person step refused, and a child closed `became` passed |; fail; | grade | finding | fix |; |---|---|---|; | design | `readingFor` in `src/scripts/cli-read.js` runs the JavaScript `RULES` only where `se-lsp` answers nothing, and the check's `rules` part takes the served list wherever `se-lsp` stands, so a rule in `tree.js` alone leaves `./RUNME.sh check` green and the first line of the ask fails | name the list the check reads under `se-lsp`: `Rules` in `src/lsp/check.go` with a Go test, or `aloneOver` in `src/bridge/findings.js` calling `waiting` |; | design | step 3 merges `work/the-editor-holds-the-drawing` to main, and `branch merge` takes a group at `done` alone, while four of its children stand open at `design/draft` | name a road the verbs take: the rule lands after the group merges, where the merge drops `group` from an open child, or name the verb that frees the two on main |; | craft | the tree a rule reads carries no environment, so the rule cannot tell a desk from a cloud box | name where the rule reads `inCloud` from `.claude/skills/level0/lib/cloud.js`, or give both boxes one finding naming both roads |; | craft | the callers list names `tree.js` and `cli-read.js` alone | name the callers of the list the first fix picks |"
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: 10014328df598d0745dadfdd5646ae53bad01fea
    hash_after: 10014328df598d0745dadfdd5646ae53bad01fea
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-6
    hash_before: 5491c3251755590d0e71def5be7579ceb9192776
    hash_after: 5491c3251755590d0e71def5be7579ceb9192776
    returns: 3
    why: "| grade | finding | fix |; |---|---|---|; | design | `the-editor-takes-an-inset` and `the-owner-walks-a-ticket` stand open at a `by: person` step in the open group `the-editor-holds-the-drawing`, so the rule turns `./RUNME.sh check` red where it lands | name what the implement step does with the two, so the third line of the ask holds |; | design | `branch unblock` refuses on a cloud box, and the finding names it on every box | name the line the finding gives a cloud box, or name the change that lets a cloud box hand the question out as the ask says |; | craft | `waiting` in `src/scripts/ticket-yours.js` already names an open ticket at a person leaf | call it from the rule in place of a second reader |; | craft | the leaf reader stands in `src/scripts/pull-route.js`, and `lib/copilot-dispatch.js` already imports from `src` | import the reader where it stands, and drop the move |; | craft | `treeFaults` runs from `src/scripts/cli-read.js`, which the callers list leaves out | name `cli-read.js` in place of `cli-check.js` |; | craft | the approach names no test | name the fake tree the test feeds: a child at a person step refused, and a child closed `became` passed |; fail; | grade | finding | fix |; |---|---|---|; | design | `readingFor` in `src/scripts/cli-read.js` runs the JavaScript `RULES` only where `se-lsp` answers nothing, and the check's `rules` part takes the served list wherever `se-lsp` stands, so a rule in `tree.js` alone leaves `./RUNME.sh check` green and the first line of the ask fails | name the list the check reads under `se-lsp`: `Rules` in `src/lsp/check.go` with a Go test, or `aloneOver` in `src/bridge/findings.js` calling `waiting` |; | design | step 3 merges `work/the-editor-holds-the-drawing` to main, and `branch merge` takes a group at `done` alone, while four of its children stand open at `design/draft` | name a road the verbs take: the rule lands after the group merges, where the merge drops `group` from an open child, or name the verb that frees the two on main |; | craft | the tree a rule reads carries no environment, so the rule cannot tell a desk from a cloud box | name where the rule reads `inCloud` from `.claude/skills/level0/lib/cloud.js`, or give both boxes one finding naming both roads |; | craft | the callers list names `tree.js` and `cli-read.js` alone | name the callers of the list the first fix picks |; fail; | grade | finding | fix |; |---|---|---|; | craft | three answers contradict the approach: a merge on the group's branch, a rule calling `waiting`, and `test/level0/group-asks.test.js` | rewrite the three to the approach: unblock on `main`, a Go reader, `src/lsp/group_test.go` |; | craft | `leafOf` takes `by` from the nearest step on the path, and `stepPathOf` reads an empty `step` as the first leaf | name both in the Go reader, and feed `group_test.go` a leaf under a `by: person` parent |; | craft | the unblock table in [[spec/design_output/work#a-person-step-leaves]] reads the child \"in this group\" off the branch | name the line the design gains for `unblock` on `main`, beside the check's line |; The design findings of both earlier rounds stand answered. `./RUNME.sh check` on `main` exits 0."
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: 7b357bc6a37623d589a47e24460198b7f7ce5d25
    hash_after: 7b357bc6a37623d589a47e24460198b7f7ce5d25
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A cloud box works a group to its merge and waits on nobody. A question for the owner leaves the group as a ticket of its own, and the group merges.

Without it a child at a person step stands in the cloud with nobody to answer it, and the group stays open.

- `./RUNME.sh check` fails on an open group holding a child at a step `by: person`, and a test drives it
- the check passes once that child leaves the group through `./RUNME.sh branch unblock`
- `./RUNME.sh check` passes

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

A Go rule `groupAsksNobody` joins `Rules` in `src/lsp/check.go`, because the check reads the list `se-lsp` sweeps. It names a ticket where all three hold:

- the ticket stands open, and names a `group`
- that group's ticket stands open
- the leaf its `step` names under `steps` reads `by: person`

| part | what it does |
|---|---|
| the module | `src/lsp/group.go`, with its leaf reader: it walks `steps` along the `step` path |
| the leaf's `by` | the nearest step on the path that names `by`, and `anyone` where none does, as `leafOf` reads it |
| an empty `step` | the first leaf of the route, as `stepPathOf` reads it |
| the reading | the tickets under `spec/tickets`, through `tree.Names` and `tree.Read`. A closed ticket passes, as `isHistory` reads it |
| the finding | names the ticket and its step, and both roads: a desk runs `./RUNME.sh branch unblock <ticket> <successor>`, and a cloud box takes the step, per rule 7 of [[spec/guidance/cloud]] |
| an unblocked child | closes `became`, so the rule passes it |
| the design | [[spec/design_output/work#a-person-step-leaves]] gains two lines: the check holds an open group to no person step, and on `main` the unblock verb reads the group off the child |

The leaf reader in `src/scripts/pull-route.js` stays for the pull. The Go rule reads the same `steps` shape, which the ticket schema owns.

`branch unblock` today reads the group off the branch name. A desk works on `main`, so on `main` the verb reads the group off the child's own `group` field. A cloud box still refuses it.

The implement step frees the two children of `the-editor-holds-the-drawing` before the rule lands:

1. mint a successor for `the-editor-takes-an-inset` and one for `the-owner-walks-a-ticket`, outside the group, each opening at a `by: person` step
2. on `main`, run `./RUNME.sh branch unblock` for each
3. land the rule, so `./RUNME.sh check` stands green

The tests:

- `src/lsp/group_test.go` feeds a fake tree: a child open at a person step draws the finding, and a child closed `became` passes
- the same test feeds a leaf with no `by` under a `by: person` parent, which draws the finding
- `test/level0/unblock.test.js` gains a case: on `main`, the verb frees a child by its own `group` field

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/lsp/check.go`, `treeFaults`, which runs `Rules`
- `src/lsp/check.go`, `Checker.Sweep`, which calls `treeFaults`
- `src/scripts/cli-read.js`, `readingFor`, which reads `se-lsp`'s list for the check
- `src/scripts/work-unblock.js`, `unblock` and `refuses`, which read the group

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- two children stand open at a person step: the implement step unblocks both on `main` before the rule lands
- `branch unblock` refuses on a cloud box: the finding names both roads, and a cloud box takes the step
- `waiting` already names a person leaf: the rule stands in Go, so a Go reader reads the leaf as `leafOf` does
- the leaf reader stands in `src/scripts/pull-route.js`: nothing moves, and it stays for the pull
- `treeFaults` runs from `cli-read.js`: the callers name `readingFor` there
- the approach names no test: `src/lsp/group_test.go` feeds the fake tree the approach names
- the check reads `se-lsp`'s list, so a rule in `tree.js` never fires: the rule stands in Go, in `Rules`
- `branch merge` takes a done group alone: nothing merges, and `unblock` runs on `main` off the child's `group` field
- a rule cannot tell a desk from a cloud box: one finding names both roads
- the callers name `tree.js` alone: they name the Go sweep, the check's reader and the unblock verb
- the Go rule reads a leaf with no `waiting` to call: it carries a small leaf reader of its own
- three answers disagree with the approach: each now names `main`, the Go reader and `group_test.go`
- the Go reader names no `by` from a parent, and no empty `step`: the approach names both, and a test feeds the parent case
- the design reads the child's group off the branch: it gains a line for `unblock` on `main`

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

| grade | finding | fix |
|---|---|---|
| design | `the-editor-takes-an-inset` and `the-owner-walks-a-ticket` stand open at a `by: person` step in the open group `the-editor-holds-the-drawing`, so the rule turns `./RUNME.sh check` red where it lands | name what the implement step does with the two, so the third line of the ask holds |
| design | `branch unblock` refuses on a cloud box, and the finding names it on every box | name the line the finding gives a cloud box, or name the change that lets a cloud box hand the question out as the ask says |
| craft | `waiting` in `src/scripts/ticket-yours.js` already names an open ticket at a person leaf | call it from the rule in place of a second reader |
| craft | the leaf reader stands in `src/scripts/pull-route.js`, and `lib/copilot-dispatch.js` already imports from `src` | import the reader where it stands, and drop the move |
| craft | `treeFaults` runs from `src/scripts/cli-read.js`, which the callers list leaves out | name `cli-read.js` in place of `cli-check.js` |
| craft | the approach names no test | name the fake tree the test feeds: a child at a person step refused, and a child closed `became` passed |

fail

| grade | finding | fix |
|---|---|---|
| design | `readingFor` in `src/scripts/cli-read.js` runs the JavaScript `RULES` only where `se-lsp` answers nothing, and the check's `rules` part takes the served list wherever `se-lsp` stands, so a rule in `tree.js` alone leaves `./RUNME.sh check` green and the first line of the ask fails | name the list the check reads under `se-lsp`: `Rules` in `src/lsp/check.go` with a Go test, or `aloneOver` in `src/bridge/findings.js` calling `waiting` |
| design | step 3 merges `work/the-editor-holds-the-drawing` to main, and `branch merge` takes a group at `done` alone, while four of its children stand open at `design/draft` | name a road the verbs take: the rule lands after the group merges, where the merge drops `group` from an open child, or name the verb that frees the two on main |
| craft | the tree a rule reads carries no environment, so the rule cannot tell a desk from a cloud box | name where the rule reads `inCloud` from `.claude/skills/level0/lib/cloud.js`, or give both boxes one finding naming both roads |
| craft | the callers list names `tree.js` and `cli-read.js` alone | name the callers of the list the first fix picks |

fail

| grade | finding | fix |
|---|---|---|
| craft | three answers contradict the approach: a merge on the group's branch, a rule calling `waiting`, and `test/level0/group-asks.test.js` | rewrite the three to the approach: unblock on `main`, a Go reader, `src/lsp/group_test.go` |
| craft | `leafOf` takes `by` from the nearest step on the path, and `stepPathOf` reads an empty `step` as the first leaf | name both in the Go reader, and feed `group_test.go` a leaf under a `by: person` parent |
| craft | the unblock table in [[spec/design_output/work#a-person-step-leaves]] reads the child "in this group" off the branch | name the line the design gains for `unblock` on `main`, beside the check's line |

The design findings of both earlier rounds stand answered. `./RUNME.sh check` on `main` exits 0.

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
