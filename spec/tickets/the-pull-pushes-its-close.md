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
group: the-review-lands-overnight
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: verdict
record:
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: a10a58d8cff4f43bb26befd7589b774fe759b265
    hash_after: a10a58d8cff4f43bb26befd7589b774fe759b265
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-2
    hash_before: d8c480105c2af77191a1b733c374f10b9a16cdd0
    hash_after: d8c480105c2af77191a1b733c374f10b9a16cdd0
  - step: implement/tests-red
    hand: box dcd73916add7 · claude-code-remote
    hash_before: eae7043ec77237e6b1e1d5c0acdbbd4217b36fdf
    hash_after: eae7043ec77237e6b1e1d5c0acdbbd4217b36fdf
    answered:
      - name: tests
        exit: 1
        said: assertion, 7 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 5dd7502fc2525df1a7af3a9be9abcef913edffe4
    hash_after: 5dd7502fc2525df1a7af3a9be9abcef913edffe4
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 9f90add824344e8c3c4a616a2693b1a34f3c15d2
    hash_after: 9f90add824344e8c3c4a616a2693b1a34f3c15d2
    answered:
      - name: tests
        exit: 0
        said: green, 7 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
---

# Ask

A hand-back on trunk takes one full check and lands pushed. Where the push door refuses, the hand reads the real cause and fixes it once.

Every hand-back on main comes back refused under a false cause, a moved main. The hand runs a second full check and pushes by hand, and a tests-red close waits unpushed with no word.

- the pull runs the check after it commits the close, and pushes on a pass
- a refused push answers with the push door's own cause
- on trunk the pull holds a tests-red close local, and says so
- a case under `test/level0` covers each line above
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

`pushed` in `src/scripts/pull-writes.js` owns the landing on origin, so the
change stands there, and its callers read what it answers.

| part | what changes |
|---|---|
| the answer | `pushed(it, branch, { red })` answers `{ ok, local, why }` in place of a bare flag |
| the check | on trunk, `pushed` runs `./RUNME.sh check` over the commit first, the way `landsAndPushes` in `commit-verb.js` runs it |
| a pass | the stamp names the commit, and the push goes |
| the cause | a refused push answers the push door's own lines, read off the error stream |
| the rebase | runs where git names a moved branch alone, and the refusal says so where it falls short |
| the red close | a leaf whose command expects `assertion` passes `red: true`, and on trunk the commit stays local |
| what it says | the close stands on this box, and the next green push carries it |
| off trunk | a work branch pushes as it does, because its push meets no battery |
| the callers | each of the eight sites prints `why` in place of the moved-branch sentence |
| the design | `spec/design_output/pull.md#the-rejected-push` names the check, the cause and the local close |

The cases, in `pull.test.js`:

- on trunk a pass runs the check, then the push, in that order
- a push the door refuses prints the door's own line, and no rebase runs
- a tests-red close on trunk runs no push, and the answer says it stands local

The callers:

- `pull.js`, at the person step, the take-back and the verdict
- `pull-writes.js`, at the pass, the fail, the became and the answered
- `pull-hand.js`, at the hand-out

The cost: a pass on trunk runs one full check, and the hand runs none of its own.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- design: a rebase on trunk moves the commit off the stamp, so `pushed` checks again before pushing.
- craft: at tests-green the `check` field and `pushed` each run the check, so the cost line names that leaf.
- craft: `pull.test.js` stands at 588 lines, so the three cases go in a new file beside it.
- craft: the table adds a row for a red check on trunk, where the close stays local.
- craft: the caller the list calls the verdict is the re-push of a hand-back the record holds already.
- craft: `repairPersonSteps` in `pull-hand.js` prints nothing today, so the callers row holds for seven sites.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/pull-push.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

The seven cases stand in `test/level0/pull-push.test.js`, and each fails on its own assertion.

- `pushed` answers a bare flag today, so the shape case fails.
- On trunk no check runs, so the order case fails.
- A door refusal runs a rebase today, so that case fails.
- A tests-red close pushes today, so the local case fails.
- The re-push of a recorded hand-back says a moved branch, so its case fails.

The surprise: `saidBy` in `commit-verb.js` reads both streams, so the case imports it, and it takes an export.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the cases touch `pull-push.test.js` and one export in `commit-verb.js`, both named in the approach.
- git and the check both run through the fake process door, so every door has a fake.
- the file header points at `spec/design_output/pull#the-rejected-push`, the approach's own section.

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

    ./RUNME.sh lint src/scripts/pull-push.js src/scripts/pull-writes.js src/scripts/pull.js src/scripts/commit-verb.js spec/design_output/pull.md test/level0/pull-push.test.js test/level0/pull-steps.test.js test/level0/pull-escalate.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the pull modules, `commit-verb.js`, the pull tests and the design note, each named in the approach.
- git and the check both run through the fake process door, so every door has a fake.
- `pull-push.js` points at `spec/design_output/pull#the-rejected-push`, which names the approach.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/pull-push.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A hand-back on trunk now runs the check over its close and lands pushed.

- `pushed` moves into `src/scripts/pull-push.js` and answers `{ ok, local, why }`.
- On trunk it runs `./RUNME.sh check` over the commit, so the stamp names the commit it pushes.
- A red check pushes nothing, and the answer names the check's own lines.
- A tests-red leaf on trunk stands on this box, and the next green push carries it.
- A rebase runs on a moved branch alone, and on trunk the check runs again after it.
- Any other refusal answers the push door's own lines.
- The callers print `why`, so no false moved-branch sentence stands.
- At tests-green the `check` field and `pushed` each run the check, and the design note says so.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the pull modules, `commit-verb.js`, the pull tests and the design note, each named in the approach.
- git and the check both run through the fake process door, so every door has a fake.
- `pull-push.js` points at `spec/design_output/pull#the-rejected-push`, which names the approach.

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
