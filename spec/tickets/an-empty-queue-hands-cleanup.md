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
group: the-editor-holds-the-drawing
step: design/review
record:
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: dffed25933787f0bf1f0f49c35246aaa0fd28d3a
    hash_after: dffed25933787f0bf1f0f49c35246aaa0fd28d3a
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-2
    hash_before: 20c28d1bbd74ca8249357d990dc4f1625161f04a
    hash_after: 20c28d1bbd74ca8249357d990dc4f1625161f04a
    returns: 1
    why: "`pull-writes.js`'s `onward` also calls `handOut`, and stands out of the callers list.; `pull-cleanup.test.js`'s fixture carries no `method`.; `asks` joins `box.method` with no guard, and `holdHere` calls it once a hold file stands.; So the refactor row's hold check throws against that fixture, and the approach names no read that survives it."
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: 2f4d47d2dd0e543fdae5fbd4e873a6b8e7be7c98
    hash_after: 2f4d47d2dd0e543fdae5fbd4e873a6b8e7be7c98
---

# Ask

A desk whose queue stands empty still owes the tree its cleanup. So the pull hands that cleanup out as implicit tickets, in order, whenever one applies. A done cloud branch comes first, on a desk alone. The warnings on the refactor list come next, and the main session drains them. The problems the check names come last.

Without it a session with an empty queue waits, while warnings and failed checks stand until a person remembers them.

- a desk pull meeting no ticket hands out the oldest file on the refactor list, as `test/level0/pull-cleanup.test.js` drives it
- a file the refactoring hand holds stays out of that hand-out, and the same test drives it
- an empty list and a failed or stale check stamp hand out the check, and the same test drives it
- a cloud box's pull meeting no ticket hands out none of it, and the same test drives it

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

The pull answers a new word, `cleanup`, where `handOut` meets no leaf to hand, no spawn and no name asked, on a desk alone. A cleanup ticket carries no file and no hold, so each pull reads the list again. The answer names the work and the verbs, in this order:

| order | applies where | the answer hands |
|---|---|---|
| merge | a done cloud branch stands | nothing new: the desk pull on trunk hands it ahead of the queue already, through `it.ready` |
| refactor | the refactor list holds a warning on a file the refactoring hand holds no hold on | the oldest such file by its last commit, with `drains(file)` |
| check | the list stands empty, and the check stamp reads failed or names a commit other than `HEAD` | `./RUNME.sh check`, and the fixes it names |

- The merge keeps its place ahead of the free tickets, because a closed ticket rules it there.
- `src/scripts/pull-cleanup.js` holds the reading, because `pull-hand.js` stands near its ceiling.
- `spec/design_output/pull.md` takes the answer row and a chapter.
- The pull reads the hold file itself, off `it.disk` at `it.work`, and skips the file it names.
- `holdHere` reads the config through `box.method`, which the pull's context lacks.
- A stale hold skips its one file until the next spawn or session clears it.

<!-- the form is text -->

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

- `src/scripts/pull-hand.js` `handOut`, at its wait
- `src/scripts/pull.js` `pull`, which returns what `handOut` answers
- `src/scripts/pull-writes.js` `onward`, which calls `handOut` after a pass

<!-- the form is list -->

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

- `onward` calls `handOut`: the callers list names it, and a pass meeting no next leaf hands out the cleanup too
- `holdHere` needs `box.method`: the pull reads the hold file itself, so the fixture needs no `method`

<!-- the form is list -->

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- `pull-writes.js`'s `onward` also calls `handOut`, and stands out of the callers list.
- `pull-cleanup.test.js`'s fixture carries no `method`.
- `asks` joins `box.method` with no guard, and `holdHere` calls it once a hold file stands.
- So the refactor row's hold check throws against that fixture, and the approach names no read that survives it.

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
