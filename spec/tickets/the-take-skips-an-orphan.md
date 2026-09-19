---
kind: [[ticket]]
state: open
urgent: true
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
group: the-verbs-take-the-shell
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: implement/tests-red
record:
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: 372edf2ccc0e7222883028c2a1b2b2ebeebf03c2
    hash_after: 372edf2ccc0e7222883028c2a1b2b2ebeebf03c2
  - step: design/review
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 30d9aa356a8b5e42a2101d829acdbb0eb82661c9
    hash_after: 30d9aa356a8b5e42a2101d829acdbb0eb82661c9
    returns: 1
    why: "`standingAll` stands in `src/scripts/work-stands.js`, and `src/scripts/work.js` imports it; `branches` stands in that same file, so the standing and the list read one place; `movedOnTrunk` stands unexported in `src/scripts/work-merge.js`, so name what carries its read across; `take` stands in `src/scripts/work.js`, so the row reading `the same file` names two files; the counts of refs and of standing words drop, because `git merge-base` answers them [[spec/guidance/voice]]; the owner's row stands on a cloud branch, so say what this box does with those refs [[spec/guidance/cloud]]"
  - step: design/draft
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 142ebe3ef48ccec6aeae2fa7acd8d880c5e9c50a
    hash_after: 142ebe3ef48ccec6aeae2fa7acd8d880c5e9c50a
  - step: design/review
    hand: box b99ea8ab11a8 · claude-code-remote · helper-4
    hash_before: 6ca52d0acd8478c8db2a9f9d64921b368bd25c3b
    hash_after: 6ca52d0acd8478c8db2a9f9d64921b368bd25c3b
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The take hands out a branch a box can work. A box spends its session on the work, and none of it on a branch no sync reaches.

<!-- breaks, as text: what breaks if it is never done -->
A rewrite of trunk leaves five refs sharing no ancestor with it. The take picks one, the sync dies on unrelated histories, and the box stalls. That checkout also carries an older command line, where `branch` is no verb, so the next firing of the routine prints usage and does nothing.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `./RUNME.sh branch take` passes over a branch sharing no ancestor with trunk, and names it as skipped
- `./RUNME.sh branch list` marks such a branch, so a reader sees why no box takes it
- a test drives the take over a fake with one orphan and one branch, and the take answers the second
- the owner closes the five refs standing orphaned today, or cuts each again from trunk

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

One question answers it: does the branch share an ancestor with trunk?

`git merge-base origin/main origin/<branch>` answers 0 where one stands. `movedOnTrunk` in `src/scripts/work-merge.js` already asks git that, and it stands unexported today.

| what changes | where |
|---|---|
| a read naming an orphan, exported | `src/scripts/work-merge.js` |
| the standing reads `orphan` | `standingAll` in `src/scripts/work-stands.js` |
| the listing marks it | `refsHere` in that same file |
| the take passes over it, and names it | `take` in `src/scripts/work.js` |
| the case drives one orphan beside one branch | `test/level0/work.test.js` |

The standing:

| what git answers | the standing |
|---|---|
| `merge-base` fails | `orphan` |
| anything else | the words it reads today |

`take` walks the branches at `todo` and picks the first. An orphan reads `orphan` in place of `todo`, so the take passes it over and says which it skipped.

`fakeGit` answers a command by name, so the case answers `merge-base` red for one branch and green for another. The take answers the second, and the said names the first.

What this box does with the refs standing orphaned: it leaves them. `branches` reads `work/*` alone, so the take reaches none of them, and the guard covers the next rewrite. A person who wants one gone runs git.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

pass

- the take reads `refsHere`, and the closing paragraph names `branches`, which no caller uses

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

The ask reads five orphaned refs, and `git merge-base origin/main <ref>` answers seven. The draft names each.

None of the seven stands under `work/`, and `branches` reads `work/*` alone. So the take reaches none of them today, and the last row of the ask waits for a person on its own account.
