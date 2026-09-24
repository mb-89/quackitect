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
group: the-ticket-answers-the-editor
step: implement/change
record:
  - step: design/draft
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: a3a8a31febf0c81458ac97b0041d5b4132762795
    hash_after: a3a8a31febf0c81458ac97b0041d5b4132762795
  - step: design/review
    hand: box 2bc65ec92430 · claude-code-remote · helper-2
    hash_before: 6452e5465edc274fa4e610b7924846048c479bd6
    hash_after: 6452e5465edc274fa4e610b7924846048c479bd6
  - step: implement/tests-red
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: db97542d0fae8d72c5e4189f824133576ae0c091
    hash_after: db97542d0fae8d72c5e4189f824133576ae0c091
    answered:
      - name: tests
        exit: 1
        said: assertion, 6 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: d03a491cc323735a6dc822cb34d3c089aa881304
    hash_after: d03a491cc323735a6dc822cb34d3c089aa881304
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 75b8d1a94ab39130e0de8c0c688fc2784547ceb0
    hash_after: 75b8d1a94ab39130e0de8c0c688fc2784547ceb0
    answered:
      - name: tests
        exit: 0
        said: green, 13 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 2bc65ec92430 · claude-code-remote · helper-7
    hash_before: 7915d57a4880c6c41e394c5bef55582c7e01aea6
    hash_after: 7915d57a4880c6c41e394c5bef55582c7e01aea6
    returns: 1
    why: "`waiting` reads only the leaf's own `by`, so a person step inherited from a parent goes uncounted; call `stepPathOf` and `leafOf` in src/scripts/pull-route.js, which resolve the nearest `by`; `frontIn` repeats `frontOf` in src/engine/group.js, and `ticketsHere` already carries `front`; the tagged-then-score order repeats the pools of `handOut` in src/scripts/pull-hand.js, so the two drift; no case sets `by: person` on a parent step and asserts the ticket counts; `./RUNME.sh check` exits 0, and queue.test.js with ticket-yours.test.js pass"
  - step: implement/reflect
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: e5e9ecf1e1d6f0f17f0aad0c9af056e4aa2c8a4c
    hash_after: e5e9ecf1e1d6f0f17f0aad0c9af056e4aa2c8a4c
  - step: implement/change
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 45ced2c6686494d36bab464b4d51979a32fa88ed
    hash_after: 45ced2c6686494d36bab464b4d51979a32fa88ed
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 37e2005df4902047045aead808016a5a51914ffd
    hash_after: 37e2005df4902047045aead808016a5a51914ffd
    answered:
      - name: tests
        exit: 0
        said: green, 15 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 2bc65ec92430 · claude-code-remote · helper-11
    hash_before: c69881c20f5e53366fda9f73b5f0639db660db0c
    hash_after: c69881c20f5e53366fda9f73b5f0639db660db0c
    returns: 2
    why: "craft: `handOut` still builds its own tagged pool, so `taggedFirst` has one caller and the drift stands; fix: `handOut` calls `taggedFirst`, or both read one tagged filter from pull-hand.js; craft: `waiting` reads `front.step` raw, so an empty pointer skips the first leaf `stepPathOf` resolves; `leafOf` now resolves the nearest `by`, and a case proves a person phase counts; `frontIn` now delegates to `frontOf`, which answers the repeated front finding; `ticket.js` and `cli.js` only wire the verb and its usage, trivial and inside the ask; `./RUNME.sh check` exits 0, and queue.test.js with ticket-yours.test.js pass, 15 tests; no retro stands in the handback"
  - step: implement/reflect
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 8ffc985e37597f245ae4d0cb05c53bbf48b7e6cd
    hash_after: 8ffc985e37597f245ae4d0cb05c53bbf48b7e6cd
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A person sees how many tickets wait on them, and takes the one the queue hands them, without reading the tree.

A step marked by: person waits unseen until a hand pulls past it.

- ./RUNME.sh ticket yours --count prints the count of tickets whose current step a person holds, as JSON
- ./RUNME.sh ticket yours --next prints the ticket the queue in src/scripts/pull-queue.js hands a person, as JSON
- ./RUNME.sh test test/level0/queue.test.js passes

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

A new file, `src/scripts/ticket-yours.js`, holds the verb and one pure function, `waiting`. A ticket waits on a person where both hold:

- its state reads open
- the leaf its pointer names carries `by: person`

The verb reads the tickets through `ticketsHere` in `src/scripts/pull-hand.js`. It orders them the way `handOut` orders a pool, tagged first and then `sorted` over `weighing`.

| the call | the JSON it prints |
|---|---|
| `ticket yours --count` | `count` |
| `ticket yours --next` | `ticket`, `path` and `step` of the first, or `ticket` as null |
| `ticket yours` | `tickets`, each with its `ticket`, `path` and `step`, in queue order |

The exit is 0 on every road, since nothing waiting is an answer.


### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/ticket.js` `ticket`, which dispatches the new verb and prints its usage line
- `src/scripts/cli.js` the `ticket` entry, whose `says` names the verbs
- `src/scripts/pull-hand.js` `ticketsHere`, `sorted` and `weighing`, which the verb calls unchanged


### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first draft


## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- `--count` counts open tickets whose pointed leaf carries `by: person`, as the ask calls for
- `--next` orders through `sorted` over `weighing`, which calls `queued` in pull-queue.js
- `ticketsHere`, `sorted` and `weighing` stand unchanged, so every caller keeps its road

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh test test/level0/ticket-yours.test.js


### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Every case fails on its own assertion, with the verb unknown and `waiting` a stub. The cases stand in a new file, `test/level0/ticket-yours.test.js`, beside the new module. The queue order reads git for the day each ticket came in, so the cases hand the verb `fakeGit`, which answers an empty log.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. It adds the verb's module and its cases.
- every door the change reaches has a fake. The cases drive the fake disk and the fake git.
- a comment names the approach the change implements. Both new files open on the design input they build.


## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

The findings share one class: the change rebuilt a reading the pull already owns. The first fix lifted the order, and left its first caller behind. The fix for the class is one filter, `taggedIn`, which `handOut` and `taggedFirst` both call. The pointer reads through `stepPathOf`, as every pull road reads it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. The fix touches the verb's module, the pull's order, and the cases.
- every door the change reaches has a fake. The new case drives the fake disk.
- a comment names the approach the change implements. The lifted function points at the queue's note.


## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

./RUNME.sh lint src/scripts/ticket-yours.js src/scripts/ticket.js src/scripts/cli.js test/level0/ticket-yours.test.js


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. It adds the verb's module, wires the dispatch, and names the verb in the command line's list.
- every door the change reaches has a fake. The verb reaches the disk and git, and the cases drive both fakes.
- a comment names the approach the change implements. The module opens on the design input, and each function points at its note.


## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh test test/level0/ticket-yours.test.js test/level0/queue.test.js


### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check


### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`./RUNME.sh ticket yours` answers the tickets waiting on a person, as JSON. `waiting` in `src/scripts/ticket-yours.js` holds the rule: an open ticket whose pointer's leaf a person holds. `leafOf` answers the hand, so a person named on a phase holds each leaf under it.

| the flag | the answer |
|---|---|
| `--count` | how many wait |
| `--next` | the first in queue order, or a null ticket |
| none | every one, in queue order |

`taggedFirst` in `src/scripts/pull-hand.js` holds the order: a tagged ticket first, then `sorted` over `weighing`. So the button the work group draws takes the ticket the pull would hand a person.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. It touches the verb's module, the dispatch, the command line's list, and the cases.
- every door the change reaches has a fake. The cases drive the fake disk and the fake git.
- a comment names the approach the change implements. Each new function points at the design input it builds.


# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- spec/tickets/yours-counts-the-waiting.md
- src/scripts/ticket-yours.js
- src/scripts/pull-hand.js
- src/scripts/ticket.js
- src/scripts/cli.js
- test/level0/ticket-yours.test.js
- src/scripts/pull-route.js
- src/engine/group.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

fail

- craft: `handOut` still builds its own tagged pool, so `taggedFirst` has one caller and the drift stands
- fix: `handOut` calls `taggedFirst`, or both read one tagged filter from pull-hand.js
- craft: `waiting` reads `front.step` raw, so an empty pointer skips the first leaf `stepPathOf` resolves
- `leafOf` now resolves the nearest `by`, and a case proves a person phase counts
- `frontIn` now delegates to `frontOf`, which answers the repeated front finding
- `ticket.js` and `cli.js` only wire the verb and its usage, trivial and inside the ask
- `./RUNME.sh check` exits 0, and queue.test.js with ticket-yours.test.js pass, 15 tests
- no retro stands in the handback

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every fact the change adds stands in one place. It still fails, since the tagged pool stands in `handOut` and in `taggedFirst`.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
