---
kind: [[ticket]]
state: closed
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
urgent: true
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-cloud-works-its-queue
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: 34d5b55f402412744df52d2ef9b01f92d9661648
    hash_after: 34d5b55f402412744df52d2ef9b01f92d9661648
    inputs:
      - name: ask
        hash: c2d9d8a68a724897
        size: 824
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: 0c9e5cf245326579f9f78255c72766667574b056
    hash_after: 0c9e5cf245326579f9f78255c72766667574b056
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 0c57d926e888efe8
        size: 1351
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e2326ed644e · claude-code-remote · helper-4
    hash_before: aac392e94ab265fb978ee8ef638fce3aba751fdd
    hash_after: aac392e94ab265fb978ee8ef638fce3aba751fdd
    inputs:
      - name: design/draft
        hash: 0c57d926e888efe8
        size: 1351
      - name: design/tests-red
        hash: f004df8bc19e41fc
        size: 568
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: 8aa38c50ac3ebba5174c727c6da9c04c5321ab3b
    hash_after: 8aa38c50ac3ebba5174c727c6da9c04c5321ab3b
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: 0009be55b77a93cf73cbcf38ddd955942d818d7d
    hash_after: 0009be55b77a93cf73cbcf38ddd955942d818d7d
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "src/scripts/work.js:67:1: correctness/noUnusedImports: Several of these imports are unused."
    inputs:
      - name: design/tests-red
        hash: f004df8bc19e41fc
        size: 568
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

A gate's reject inserts the phase again as copies, and `reworked` in `src/scripts/pull-gate.js` copies each leaf's `input` as it stands. So `tests-red-2` reads `draft`, and the gate reads the first round alone. The route check then finds every field of `draft-2` unread, and refuses its pass.

With the fix, each copy reads the copies of its own round. Every later step reading a copied leaf reads its copy beside it, so each round keeps a reader.

Without it every rejected ticket stops at its second draft, and no hand moves it.

- a case in `test/level0/pull-gate.test.js` finds `tests-red-2` reading `draft-2` after a reject
- a case there finds the gate reading both rounds after a reject
- a case there finds the pass of `draft-2` landing after a reject
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

Commit `34d5b55f` lets a stuck ticket move: the route check counts a copy read where its origin leaf is read. What stays is the input each copy hands on. `tests-red-2` reads `draft`, so its hand gets the first round, and the gate and implement read the first round alone.

In `reworked` in `src/scripts/pull-gate.js`, a copy whose `input` names a sibling that also takes a copy reads that copy instead: `draft` becomes `draft-2`. Every step after the copies that reads a copied leaf by path gains the copy path beside it, so the gate and implement read every round.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/scripts/pull-gate.js`: `rejected` calls `reworked`, which rewires the copies
- `.claude/skills/level0/lib/schema-route.js`: `slotFaults` reads the rewired route at every hand-back

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `test/level0/pull-gate.test.js`: a reject's copy reads the copy of its sibling
- `test/level0/pull-gate.test.js`: after a reject the gate and implement read both rounds

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/scripts/pull-gate.js`
- `test/level0/pull-gate.test.js`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened `reworked`, `readIn`, `entryNamed` and the reject cases, and each claim stands there
- the callers list names the reject and the route check
- the first two `done_when` lines meet a case each, the schema-slots case holds the third, and the check decides the last

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/pull-gate.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/pull-gate.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both cases fail on their own assertion: the copy of tests-red reads draft, and the gate and change read the first round alone. The fixture gains the inputs a standard route carries, and the older reject cases stay green on it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line on the copies meets a case, the schema-slots case holds the pass, and the check decides the last
- the cases reach the disk and git through the fakes pull-doors.js hands out, and nothing else

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- second-draft-pass-case: the third done_when line meets no case in test/level0/pull-gate.test.js; the draft points at the schema-slots case, which checks the route alone, so add a case there that rejects, hands draft-2 back, and finds its pass landing
- reject-fixture-takes-standard-route: the GATED fixture holds input on implement/change, while the standard route holds it on the implement phase and has tests-green read design/tests-red, so add a case finding both rewired after a reject

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/scripts/pull-gate.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches src/scripts/pull-gate.js alone, which the size list names
- the change reaches no door, since reworked reshapes the route in memory
- rewired and readsBoth each carry a comment naming the approach, with a link to the gate section
- the copy suffix stands in reworked once, and the route check reads its own ROUND

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/pull-gate.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A gate's reject copies the phase before it as a new round. The copies now read the copies of their own round, so tests-red-2 reads draft-2. Every later step that reads a copied leaf by path reads its copy beside it, so the gate and implement read each round. Before this, the copies read the first round alone, and the next hand got the old draft as its input. The route check counts a copy as read where its origin is read, which lets a ticket stuck before this fix move.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches src/scripts/pull-gate.js and its test alone
- the change reaches no door, since reworked reshapes the route in memory
- rewired and readsBoth each carry a comment naming the approach
- the copy suffix stands once in reworked, and the route check reads its own ROUND

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
