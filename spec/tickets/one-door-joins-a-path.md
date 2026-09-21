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
  - step: implement/tests-green
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: ad48cde33335b307c471a8c8d1a48988ee6bfa99
    hash_after: ad48cde33335b307c471a8c8d1a48988ee6bfa99
    answered:
      - name: tests
        exit: 0
        said: green, 11 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 137 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: verdict
    hand: box d40a1b367f4d · claude-code-remote · helper-25
    hash_before: 85f359362e9695bd46e4629cc7c987387f397999
    hash_after: 85f359362e9695bd46e4629cc7c987387f397999
    returns: 1
    why: "The case in `test/level0/trunk-door.test.js` over a dotted script path passes on the old slash join too, because `clean` in `tokens.js` strips the leading dot before the door reads, so it proves nothing about the change: drop it, or hand the door a path the old join loses.; The comment over that case credits the join with a fact `clean` owns, so the note repeats a fact standing elsewhere: point it at `tokens.js` or drop it with the case.; `fileText` takes the hand and joins through `it.join`, and every caller hands it a hand, so the first bullet stands.; `holds` hands its own hand to `fileText`, and the slash it wrote is gone, so the second bullet stands.; The remaining case in `test/level0/precommit.test.js` drives `holds` under a join of its own over one fake disk, which runs the notes reading and the test reading both, and the record says it fails on its own assertion before the change, so the third bullet stands.; The notes reading takes its empty branch under that join, because the fake disk lists children by slash, and the standing notes case covers the full branch under the slash join.; The check on the tests-green commit exits zero by the record, and the lint over `src` exits zero here.; The three test files pass here, and the door's standing script case drives `reader` in `src/bridge/bash.js` already.; `notesIn` and `batteryHere` in `src/bridge/bash.js` still write the slash, and the ask names the hook alone, so that stays outside this ticket.; No handback stands on this ticket, so no retro question rides along."
  - step: implement/reflect
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 2e23d9de6718ca3866a2878a2449e0f5c073b603
    hash_after: 2e23d9de6718ca3866a2878a2449e0f5c073b603
  - step: implement/change
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 073646578b330f9b97c88444d874a4e3d42c8993
    hash_after: 073646578b330f9b97c88444d874a4e3d42c8993
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: e3a906fa91aab76cffa8172f7ef4cd6a51e5ab80
    hash_after: e3a906fa91aab76cffa8172f7ef4cd6a51e5ab80
    answered:
      - name: tests
        exit: 0
        said: green, 11 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 140 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: verdict
    hand: box d40a1b367f4d · claude-code-remote · helper-26
    hash_before: 999a1db1c9c83194b0c68e3a18811f837b421e6a
    hash_after: 999a1db1c9c83194b0c68e3a18811f837b421e6a
reason: done
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

- `fileText(it, path)` in `.claude/skills/level0/lib/scripted.js` reads the disk, the root and the join off the hand, and writes no slash. An absolute path stays as it is.
- `src/scripts/precommit.js` hands `fileText` its `it`, which carries the join already.
- `src/bridge/bash.js` hands it the box's disk and work root with the `join` of `node:path`. That is the pure import the door rule passes.
- A case in `test/level0/precommit.test.js` drives `holds` over a fake disk with a join of its own. It asserts the reading reaches the file that join names.


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

- the case hands the hook a join of its own
- the fake disk holds a standing test under that join
- the hook reads the test through a slash it writes itself, finds nothing, and refuses the delta as untested
- what surprises the hand: the notes' reading joins through the hand already. The two readings in one file part ways on the separator alone


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

The class: a case written to satisfy the commit door's ask for a test beside a file. It held no proof of the change.
- The dotted path case passed under the old join too. The token cleaner strips the leading dot before the door reads, so the case asserted a fact another module owns.
- The fix for the class: a case names what the change makes true and what the old code made false. A file with no such case for it takes no case at all.
- The door's standing script case drives the reader already, so the dotted case goes.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the fix touches the bash door's test alone, and nothing the ask leaves out
- the cases drive the hook and the door over fake disks
- the reading's comment names the ticket, and the dropped case's comment goes with it


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

The shared reading of a file takes the hand and joins the path through the hand's own join. So the hook's two readings part ways on nothing. The hook hands its own hand in, which carried the join already.
- The bash door's box carries no join.
- So the door builds a small reader off the work root and the join of the path module. That join is the pure import the door rule passes.
- A case hands the hook a join of its own over a fake disk.
- It asserts the hook finds the standing test under that join.
- The door's standing script case drives its reader.


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

- .claude/skills/level0/lib/scripted.js
- src/bridge/bash.js
- src/scripts/precommit.js
- test/level0/precommit.test.js
- test/level0/trunk-door.test.js
- spec/tickets/one-door-joins-a-path.md
- spec/guidance/review/reviewing.md

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass

- `fileText` takes the hand and joins through `it.join`, and every caller hands it a hand, so the first bullet stands.
- `holds` hands its own hand to `fileText`, and writes no slash now, so the second bullet stands.
- The case in `test/level0/precommit.test.js` drives `holds` under a join of its own over one fake disk. That runs the notes reading and the test reading both. The record says it fails on its own assertion before the change, so the third bullet stands.
- The check on the tests-green commit exits zero by the record, and the lint over `src` exits zero here.
- The three test files pass here, and the door's standing script case drives `reader` in `src/bridge/bash.js`.
- The dotted case and its comment left `test/level0/trunk-door.test.js`. The hunk left there adds one blank line at the end, which redesigns nothing.
- `notesIn` and `batteryHere` in `src/bridge/bash.js` still write the slash. The ask names the hook alone, so that stays outside this ticket.
- The reflect chapter names the class. That is a case written for the commit door's ask, with no proof of the change. The dropped case is the fix.
- No handback stands on this ticket, so no retro question rides along.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The fact that the hand's join is the one place a path joins stands in the comment over `fileText`. The comments over `reader` and the case point at the ticket.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
