---
kind: [[ticket]]
state: open
steps:
  - name: design
    steps:
      - name: owner-read
        does: reads the ask a handover carries, before any draft
        by: person
        when: handed
        input: ask
        evidence:
          - name: read
            form: verdict
            says: pass where the ask says what the owner said, or fail with the owner's words
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it"]
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: tests
            form: list
            says: every test the change adds, one a line, as a file and a test name
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
          - name: size
            form: list
            says: every file the approach touches, one a line
      - name: tests-red
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft
        checklist: ["every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides", "every door the tests reach has a fake"]
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: red
            form: list
            says: every test file standing red until tests-green closes, one a line, which the check leaves out
          - name: seen
            form: text
            says: what you see, and what surprises you
  - name: gate
    gate: does the approach answer the ask, and does a red test decide every done_when line
    does: reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points
    not: design/draft
    tags: ["review"]
    input: ["design/draft", "design/tests-red"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    steps:
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: design/tests-red
        to: retro
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
  - name: accept
    gate: does the whole work answer the ask, and does every command of the route pass
    final: true
    when: backlog
    does: reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points
    not: implement/change
    tags: ["review", "accept"]
    input: ["ask", "implement"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: view
    does: reads the change in the view the ask names
    by: person
    when: view
    on_fail: implement
    to: retro
    input: ["ask", "implement/tests-green"]
    evidence:
      - name: seen
        form: verdict
        says: pass where the view shows the ask's number, or fail with what it shows
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
step: implement/tests-green
group: loose-fixes-99f4547
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d84d8ece51e9 · claude-code-remote
    hash_before: 4c78004d4e84c6736984f92cdde87e5f584bb79a
    hash_after: 4c78004d4e84c6736984f92cdde87e5f584bb79a
    inputs:
      - name: ask
        hash: 1f514ff46886bda3
        size: 690
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d84d8ece51e9 · claude-code-remote
    hash_before: 8cbb1a3bd3e4382d45ee7e6b247d4cb9b21e31e6
    hash_after: 8cbb1a3bd3e4382d45ee7e6b247d4cb9b21e31e6
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 3217cd1df5ef706b
        size: 1828
    def: 08e16d07b0de477c
  - step: gate
    hand: box d84e33ce20f7 · claude-code-remote
    hash_before: 2cc357fa6591fb43bd339dcb40affb89f458b61c
    hash_after: 2cc357fa6591fb43bd339dcb40affb89f458b61c
    inputs:
      - name: design/draft
        hash: 3217cd1df5ef706b
        size: 1828
      - name: design/tests-red
        hash: 5efa799e33716409
        size: 712
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d84e33ce20f7 · claude-code-remote
    hash_before: 3b51a0a8855d2e95498ea0e9daabaf1221dd1f47
    hash_after: b5a03253c7ee7bc22cd76229b5e4742a6390e9ac
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
---

# Ask

A gate passing with points lands its hand-back on `origin` in one push. `minted` in `src/scripts/pull-writes.js` tags each point `todo`, and the push door refuses a delta carrying a tagged note.

The gain is a gate hand-back that pushes at once, with its points standing at the front of the queue.

Without it every gate point costs an untag through `./RUNME.sh ticket todo <name> --off` and a second commit by hand. A box meeting the refusal also stands one push behind until it notices.

- a case under `test/level0` passes a gate with points, and the pass commit's push lands
- the points still stand first in the queue after the push
- `./RUNME.sh check` exits 0

view: none

from: none

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->

<!-- the form is verdict -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

minted (src/scripts/pull-writes.js:112) tags a gate point with `todo: true` and adds a `point: gate` front field beside it. taggedIn in .claude/skills/level0/lib/todo.js skips a note whose front carries `point: gate`, so the push door (src/scripts/prepush.js:109) lets the point through and its tag stays on origin. taggedFirst and the queue keep reading the tag, so a box pulling origin sees the points first. Assumption: a point tagged on origin ranks first on every box, which is the gain the ask names. Cost: a hand untagging a point with `ticket todo --off` clears the tag and the field stays harmless.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/scripts/prepush.js: the push check loop over refs, calling taggedIn,src/scripts/pull-writes.js: minted, the one writer of a gate point,src/scripts/pull.js: line 476, the caller of minted,src/scripts/pull-hand.js: taggedFirst, reads the tag and stays unchanged,src/scripts/work-stands.js: isTagged reader, stays unchanged

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

test/level0/pull-gate.test.js: a gate pass with points lands its push,test/level0/pull-gate.test.js: the points stand first in the queue after the push,test/level0/prepush.test.js: a tagged note carrying point gate passes the door, and a bare tagged note stays refused

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first on a first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/scripts/pull-writes.js,src/scripts/prepush.js,test/level0/pull-gate.test.js,test/level0/prepush.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened: prepush.js:109, todo.js taggedIn and pull-writes.js:112 were read, and the point field is my addition
- the callers list names every caller: drawn from a grep of minted, taggedIn, taggedFirst and isTagged
- every done_when line names the test that decides it: each maps to a case in pull-gate.test.js, and check exits 0 through ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/prepush.test.js test/level0/pull-gate.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

test/level0/prepush.test.js,test/level0/pull-gate.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Two new cases fail on their own assertions: the push door returns code 1 on a tagged point, and the minted point carries no point field. The existing cases in both files stay green. Surprise: the gate case can read the ticket text alone, so it needs no new fake.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a test that fails: the push lands in prepush.test.js, the first-in-queue tag in pull-gate.test.js, and check exits 0 stays for the green leaf
- every door the tests reach has a fake: the fake disk and fake repo already stand in both files

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

The approach answers the ask, and a red case decides each line: the push door case in prepush.test.js, and the queue tag case in pull-gate.test.js. The builder fixes two gaps in place. The ticket schema holds additionalProperties false on the front, so it admits the point field first. The size list names prepush.js, and the approach changes taggedIn in .claude/skills/level0/lib/todo.js.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/scripts/pull-writes.js .claude/skills/level0/lib/todo.js spec/schemas/ticket.schema.yaml

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the ask needs, plus the schema the gate named
- no door: the change reads and writes ticket text alone
- a comment names the approach in todo.js, and pull-writes.js carries the minted comment
- the point field stands once, as POINT and GATE_POINT in todo.js, and pull-writes.js imports both

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

# accept

<!-- reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# view

<!-- reads the change in the view the ask names -->

## seen

<!-- pass where the view shows the ask's number, or fail with what it shows -->

<!-- the form is verdict -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
