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
group: the-engine-fixes-its-faults
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d7e124b659cd · claude-code-remote
    hash_before: 42f67bfc499953402f8a851f4e492b5904b3dc65
    hash_after: 42f67bfc499953402f8a851f4e492b5904b3dc65
    inputs:
      - name: ask
        hash: 1bbc468645a2588a
        size: 860
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e124b659cd · claude-code-remote
    hash_before: a8810adb2308946930e57e1a71670fa871072c30
    hash_after: a8810adb2308946930e57e1a71670fa871072c30
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 0f14bd33d54f26c5
        size: 2686
    def: 08e16d07b0de477c
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

The push door refuses a push to a `work/` branch while an open hold on it names another box. Every other hand lands its change on `main`, and the holder takes it in with `branch sync`. So a branch has one writer at a time.

Without it any session pushes onto a branch a box holds. On 09-27 the desk pushed a one-line fix onto `work/the-foundation-closes-its-gaps` while a box held it. The box's own commits diverged from the remote, and the box stopped. The merge watch's rule already says this, and nothing enforced it.

- a case in `test/level0/prepush.test.js` refuses a push to a `work/` branch another box holds
- the refusal names the holder, and `main` as the road
- a case there lets the holding box push its own branch
- a case there lets a push through to a `work/` branch nobody holds
- `./RUNME.sh check` exits 0

The view: none.

The source: none.

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

The push door reads the hold off the branch's own group ticket, and refuses a push from any other box.

| part | where | what it does |
|---|---|---|
| the hold | `heldBy(repo)` in `src/scripts/prepush.js` | for a ref naming `refs/heads/work/<group>`, reads `git show origin/work/<group>:spec/tickets/<group>.md`, and answers `heldIn(text)?.hand`, or empty where no hold stands or git answers nothing |
| this box | `boxIdHere(it)` in `src/scripts/pull-hand-of.js`, new | reads the id out of the box file, then the identity file, and writes nothing. `boxOf` calls it first, so one read names the box |
| the refusal | `holds(refs, stampText, carried, cloud, heldBy, box)` | where a hold names a hand whose `box <id>` differs from `box`, answers code 1 with `heldElsewhere(branch, hand)` |
| the words | `heldElsewhere` in `prepush.js` | names the branch and the holder, says a branch has one writer, and names `main` as the road: land the change there, and the holder takes it in with `./RUNME.sh branch sync` |
| the wire | `main` in `prepush.js` | passes `heldBy(git)` and `boxIdHere` over the root |

A hand with no `box` word, a person's hold, reads as no box, so a desk's hold refuses a box and a box's hold refuses a desk. The door reads the remote tip, the claim every box sees, and needs no fetch past the one git already ran for the push.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/scripts/prepush.js`, `main`, the one caller of `holds` in `src`
- `src/scripts/pull-hand-of.js`, `handOf`, which calls `boxOf`, and `boxOf` now reads `boxIdHere` first
- `test/level0/prepush.test.js`, which calls `holds` with no hold reader, and reads every branch as free

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `test/level0/prepush.test.js`, a push to a work branch another box holds refuses, and names the holder and main
- `test/level0/prepush.test.js`, the holding box pushes its own branch
- `test/level0/prepush.test.js`, a push to a work branch nobody holds lands
- `test/level0/pull-hand-of.test.js`, the box id read writes nothing where no box file stands

The done lines and the case deciding each:

- the refusal: the first case
- the holder and main named: the first case
- the holder's push: the second case
- the free branch: the third case
- the check: `./RUNME.sh check`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/scripts/prepush.js`
- `src/scripts/pull-hand-of.js`
- `test/level0/prepush.test.js`
- `test/level0/pull-hand-of.test.js`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `holds`, `main`, `heldIn`, `handOf`, `boxOf` and the claim this box's group ticket carries stand opened, and each reads as the table says
- a search for `holds(` and `boxOf(` over `src` and `test` names the callers
- each done line names the case deciding it

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/prepush.test.js test/level0/pull-hand-of.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/prepush.test.js
- test/level0/pull-hand-of.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Two cases fail on their own assertion over the stubs: the refusal of a branch another box holds, and the box id read. The holder's push and the free branch pass, because each guards the side the door lets through. The cloud case of cloud-boxes-leave-trunk-alone stands red in the same file, since both tickets land in `holds`.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done line meets a case: the refusal and its words fail red, and the holder's push and the free branch guard the other side
- the hold reader rides in as an argument, and the box read runs over a fake disk, so no case reaches git or the disk

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# implement

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
