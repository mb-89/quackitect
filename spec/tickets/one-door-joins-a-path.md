---
kind: [[ticket]]
state: open
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
step: implement/tests-green
record:
  - step: design/draft
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 6116e64d8ab8ee46c2bbc837619438c991b328ad
    hash_after: 6116e64d8ab8ee46c2bbc837619438c991b328ad
  - step: design/review
    hand: box d40a1b367f4d · claude-code-remote · helper-24
    hash_before: bb88563c9bdf2adbae518374cfc353b4c769f0c6
    hash_after: bb88563c9bdf2adbae518374cfc353b4c769f0c6
  - step: implement/tests-red
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 637391c6ac85159593537ef9c0dfd6cb019d5a9a
    hash_after: 637391c6ac85159593537ef9c0dfd6cb019d5a9a
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: b9d481d756b6600545222f082da97c7ead012be6
    hash_after: b9d481d756b6600545222f082da97c7ead012be6
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
---

# Ask

One place owns a thing, and a path join is a thing. Two joins in one file drift
apart, and the one writing the slash breaks where a box takes another separator.

In `src/scripts/precommit.js` one reading joins a path through the hand's own
join, and another writes the slash itself.

- One place joins a path, and every other caller asks it.
- The reading writing a slash takes that join.
- A case drives both readings over a fake disk.
- `./RUNME.sh check` exits 0.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The hand's `join` is the one place a path joins, and `fileText` takes it.

| reading in `src/scripts/precommit.js` | joins through | change |
|---|---|---|
| `notesOf` | `it.join` | none |
| `holds`, through `fileText` | a slash `fileText` writes itself | `fileText` takes the hand |

- `fileText(it, path)` in `.claude/skills/level0/lib/scripted.js` reads `it.disk`, `it.root` and `it.join`, and writes no slash. An absolute path stays as it is.
- `src/scripts/precommit.js` hands `fileText` its `it`, which carries the join already.
- `src/bridge/bash.js` hands it the box's disk and work root with the `join` of `node:path`, the pure import the door rule passes.
- A case in `test/level0/precommit.test.js` drives `holds` over a fake disk with a join of its own, and asserts the reading reaches the file that join names and no path with a slash the hand never wrote.


## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
The draft names `it.join` as the one place a path joins, and `fileText` takes it, so the first bullet has a concrete change.
The draft moves `holds` off the slash `fileText` writes, so the second bullet has a concrete change.
The draft names a case in `test/level0/precommit.test.js` over a fake disk with a join of its own, so the third bullet has a test.
The check exits zero on the tree today, and the implement step carries the `check` evidence for the fourth bullet.
Every file and function the draft names stands in the tree, and `src/bridge/bash.js` takes `join` from `node:path` the way its siblings do.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh branch test test/level0/precommit.test.js


### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

- the case hands the hook a join of its own and a fake disk holding a standing test under that join
- the hook reads the test through a slash it writes itself, finds nothing, and refuses the delta as untested
- what surprises the hand: the notes' reading joins through the hand already, so the two readings in one file part ways on the separator alone


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the case stands in the hook's test, and the change reaches the shared reading, the hook and the bash door
- the case drives the hook over a fake disk and a fake git, and touches nothing else
- the case's comment names the ticket, and the reading's comment names it too


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

./RUNME.sh lint src


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the shared reading, the hook, the bash door and the hook's case
- the reading reaches the disk the hand carries, which the case fakes
- the reading's comment names the ticket, and the bash door's reader names it too


## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test test/level0/precommit.test.js


### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check


### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The shared reading of a file takes the hand and joins the path through the hand's own join, so the hook's two readings part ways on nothing. The hook hands its own hand in, which carried the join already. The bash door's box carries no join, so the door builds a small reader off the work root and the join of the path module, the pure import the door rule passes. A case hands the hook a join of its own over a fake disk and asserts the hook finds the standing test under that join.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the shared reading, the hook, the bash door and the hook's case
- the case drives the hook over a fake disk and a fake git, and touches nothing else
- the reading's comment names the ticket, and the bash door's reader names it too


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
