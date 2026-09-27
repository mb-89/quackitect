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
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-engine-fixes-its-faults
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d7e124b659cd · claude-code-remote
    hash_before: a35f3ec45b7a093d1a54b414463d558a50e88bf3
    hash_after: a35f3ec45b7a093d1a54b414463d558a50e88bf3
    inputs:
      - name: ask
        hash: ec90a86efbfacd2b
        size: 629
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e124b659cd · claude-code-remote
    hash_before: 3278daa60e7999129cfe1ea3568177d127f2e7ec
    hash_after: 3278daa60e7999129cfe1ea3568177d127f2e7ec
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 33ddc7cac7b78a33
        size: 1980
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e2385398cd · claude-code-remote
    hash_before: a2560f830ca68e9409b7dbc78c551a8f1c615573
    hash_after: a2560f830ca68e9409b7dbc78c551a8f1c615573
    inputs:
      - name: design/draft
        hash: 33ddc7cac7b78a33
        size: 1980
      - name: design/tests-red
        hash: c22c9f5e28a58838
        size: 623
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d7e2385398cd · claude-code-remote
    hash_before: 824e4494c2aa9bc8b22f8cb7cf1a359e5fd94cbf
    hash_after: 824e4494c2aa9bc8b22f8cb7cf1a359e5fd94cbf
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/sync-takes-its-own-branch.md:282:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d7e2385398cd · claude-code-remote
    hash_before: eea325d3fdfff38dec2e5b4a381feb4ce422f13f
    hash_after: eea325d3fdfff38dec2e5b4a381feb4ce422f13f
    answered:
      - name: tests
        exit: 0
        said: green, 21 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/sync-takes-its-own-branch.md:282:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
    inputs:
      - name: design/tests-red
        hash: c22c9f5e28a58838
        size: 623
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

A cloud box pushes its own work branch alone, and `main` takes its work through `branch merge` on a desk. So the owner reads what lands on `main` before it lands.

Without it a cloud box pushes onto `origin/main`, as `claude/focused-cray-mug1k7` did with a merge of its own. Every desk then takes trunk in again before its own push, and unread work stands on `main`. The owner rules that no box but the desk pushes `main`.

- a case in `test/level0/prepush.test.js` refuses a push to `main` from a cloud box
- a case there lets a cloud box push its own work branch
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

The push door every push meets refuses `main` on a cloud box, before it reads the battery.

| part | where | what it does |
|---|---|---|
| the refusal | `holds(refs, stampText, carried, cloud)` in `src/scripts/prepush.js` | where `cloud` holds and a ref names `refs/heads/main`, answers code 1 with `cloudLeavesTrunk()` |
| the words | `cloudLeavesTrunk` in the same file | says a cloud box pushes its own work branch alone, and `main` takes its work through `./RUNME.sh branch merge <name>` on a desk |
| the read | `main` in the same file | passes `inCloud(process.env)` out of `.claude/skills/level0/lib/cloud.js`, the one answer to where the session runs |

The hook stands at `.githooks/pre-push`, and `install.sh` points `core.hooksPath` there, so a raw `git push`, `./RUNME.sh push` and a push from a verb all meet it. The session's Bash door already sends a trunk push through the verb, and `trunkGuard` in `src/bridge/bash.js` stands unchanged. A desk passes `cloud` false, so its green push to `main` lands as today.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/scripts/prepush.js`, `main`, the one caller of `holds` in `src`
- `.githooks/pre-push`, which runs `prepush.js`
- `test/level0/prepush.test.js`, which calls `holds` with the stamp alone, and reads `cloud` as false

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `test/level0/prepush.test.js`, a cloud box pushing main meets the refusal, whatever the battery says
- `test/level0/prepush.test.js`, a cloud box pushes its own work branch

The done lines and the case deciding each:

- the refusal of main: the first case
- the work branch: the second case
- the check: `./RUNME.sh check`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/scripts/prepush.js`
- `test/level0/prepush.test.js`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `holds`, `main`, `.githooks/pre-push`, `trunkGuard`, `inCloud` and the hooks path in `install.sh` stand opened, and each reads as the table says
- a search for `holds(` over `src` and `test` names the callers
- each done line names the case deciding it

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/prepush.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/prepush.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The cloud refusal fails on its own assertion: `holds` reads no fourth argument yet, so a green stamp lets the push to main through. The work branch case passes, because it guards the side a cloud box keeps. The refusal holds on an empty stamp too, so the cloud rule answers before the battery.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done line meets a case: the refusal of main fails red, and the work branch case guards the other side
- the door reaches no outside: the case hands `holds` the refs, the stamp and an empty delta

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- prepush-reds-land-together: three tickets hold red cases in `test/level0/prepush.test.js`. So each `tests-green` waits on the other two. The first builder lands every `holds` change the three drafts name in one change, and the others pass their change on it

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches `src/scripts/prepush.js` alone. Under prepush-reds-land-together, `holds` also takes the hold and engine reads the other two drafts name, and their wiring in `main` stays with them
- `holds` reads its outside through arguments, and the cases hand it every one
- each new read points at the ticket it serves
- the refusal words stand once, in `cloudLeavesTrunk` and `heldElsewhere`

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/prepush.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A cloud box could push `main`, so unread work landed there. The push door `holds` in `src/scripts/prepush.js` now takes a `cloud` flag, and refuses a push to `main` where it holds. The refusal names the work branch and `./RUNME.sh branch merge` on a desk. `main` passes `inCloud(process.env)`. `holds` also takes the hold and engine reads that one-writer-holds-a-branch and push-gate-needs-the-engine name, since the three share one red test file.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches `prepush.js` alone
- the cases hand `holds` every read
- each read points at its ticket
- the words stand once

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

The draft reads [[spec/design_input/the-cloud-runs-itself]] first. There a cloud group lands through a pull request, per [[spec/tickets/groups-land-through-pull-requests]]. A rule on `main` takes pull requests alone, and its last chapter leaves that rule open. This ticket holds the refusal on the cloud box itself, so it holds while the rule stands open.
