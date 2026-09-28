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
group: the-cloud-works-its-queue
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 71ae70f7eb56cc006e6325c3f98a7f4e883ce8f8
    hash_after: 71ae70f7eb56cc006e6325c3f98a7f4e883ce8f8
    inputs:
      - name: ask
        hash: 50d9d461a66c6351
        size: 1574
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 5a2557d24d86ab34
        size: 13510
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: e41775d65d82a50eea7c2dc0d1cf14a807acfb5e
    hash_after: e41775d65d82a50eea7c2dc0d1cf14a807acfb5e
    answered:
      - name: tests
        exit: 1
        said: assertion, 10 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: a8e6e03e1f365b94
        size: 3074
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e093d924e2 · claude-code-remote · helper-4
    hash_before: 677b96e98418fca7614cde82485f40af9e781d63
    hash_after: 677b96e98418fca7614cde82485f40af9e781d63
    inputs:
      - name: design/draft
        hash: a8e6e03e1f365b94
        size: 3074
      - name: design/tests-red
        hash: e58eac2283e8490b
        size: 779
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: a2c1998d689c09272dc3e56d7142deffd8c4edb5
    hash_after: a2c1998d689c09272dc3e56d7142deffd8c4edb5
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 34c0e142271ace9a07627e50e675f28d909e3787
    hash_after: 60c97257be9ce2cc62c5dff96369a78d19f9134c
    answered:
      - name: tests
        exit: 0
        said: green, 13 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:271:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: design/tests-red
        hash: e58eac2283e8490b
        size: 779
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

`./RUNME.sh dispatch --dry` computes the plan of [[spec/design_input/the-cloud-runs-itself#the-dispatcher]] off `origin/main` and the work branches, and prints it. So the desk reads what the dispatcher would do beside its own work, before anything acts on the plan. The plan holds the ready groups, the loose agent tickets to bundle, the stuck hand-overs, the stale holds, and the questions for a person.

Without it the dispatcher's rule lives in no code, and the skill and the later Action hold nothing to run. `./RUNME.sh cloud trigger` names the free branches alone. It reads no bundle, no stuck hand-over and no question.

- `./RUNME.sh dispatch --dry` prints the plan, and `--json` prints it as JSON
- a case in `test/level0/dispatch.test.js` lists a group whose dependencies stand closed as ready
- a case there lists a group waiting on an open group as waiting
- the cases there run over the fake git doors of `test/level0/work-doors.js`
- a case there lists a hold past `work.staleAfter` as ready, and a fresh hold as held
- a case there lists the loose agent tickets to bundle, and a ticket for a person under the questions alone
- a case there lists a group at done whose branch stands behind `origin/main` as a stuck hand-over
- a case there lists a group at done past `work.staleAfter` as a stuck hand-over too
- a case there finds the run writing no file, making no commit and pushing nothing
- a case there finds `freeNow` in `src/scripts/work-free.js` and the plan naming the same ready groups
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

A new module src/scripts/dispatch.js holds planOf(it, now), which reads git once through readWork(it, true): the work branches and the tickets on origin/main. It answers five lists. Ready takes freeIn over the branches with the config and the clock, so a stale hold reads free the way the take reads it, and ready names the same groups freeNow names where no hold stands. Held names each hold younger than work.staleAfter. Waiting names each open group whose dependencies stand open, with what it waits for. Stuck names each group at done whose branch stands on origin unmerged, where git rev-list --count origin/<branch>..origin/main answers past zero, or where the tip age runs past staleSpan. Bundles names every open ticket on origin/main carrying no group, no group process and no person wait, under one fix bundle for the top, since no parent stands yet. Questions names every open ticket on origin/main or on a branch where waitsOnPerson holds, with the group it holds open. The verb dispatch(root, argv, doors) runs planOf and prints it as rows, or as one JSON object under --json. It takes --dry alone for now, and a run without it answers 2 and names the child bringing the writes. waitsOnPerson leaves src/scripts/work-answer.js as an export, so the queue and the plan read one rule. The verb table in cli.js gains dispatch beside cloud.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/cli.js: the verb table gains a dispatch row calling dispatch(it.work, rest, it)
- src/scripts/work-answer.js: the queue reads waitsOnPerson, which becomes an export and keeps its body
- src/scripts/dispatch.js: planOf reads freeIn, staleClaim and staleSpan off src/scripts/work-free.js and readWork off src/scripts/work-stands.js, and changes neither

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/dispatch.test.js: a group whose dependencies stand closed reads ready
- test/level0/dispatch.test.js: a group waiting on an open group reads waiting
- test/level0/dispatch.test.js: a hold past work.staleAfter reads ready, and a fresh hold reads held
- test/level0/dispatch.test.js: the loose agent tickets stand in the bundle, and a ticket for a person under the questions alone
- test/level0/dispatch.test.js: a group at done behind origin/main reads as a stuck hand-over
- test/level0/dispatch.test.js: a group at done past work.staleAfter reads as a stuck hand-over
- test/level0/dispatch.test.js: the dry run writes no file, makes no commit and pushes nothing
- test/level0/dispatch.test.js: freeNow and the plan name the same ready groups
- test/level0/dispatch.test.js: --json prints the plan as one JSON object

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/scripts/dispatch.js
- src/scripts/cli.js
- src/scripts/work-answer.js
- test/level0/dispatch.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened work-free.js, work-stands.js, work-answer.js, cli.js and cli-doors.js, and each named function stands there as the approach says
- the callers list names the verb table, the queue reading waitsOnPerson, and the reads the plan takes
- each done_when line names its case under tests, and ./RUNME.sh check decides the last

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/dispatch.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/dispatch.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Ten cases fail on their own assertion against a stub planOf answering empty lists, and the case keeping a fresh group at done off the stuck list passes, as a negative case does. The json case parsed empty output first and threw a SyntaxError, which the runner reads as a build fault, so it asserts an object before it parses one. The fake git answers a command no case names with exit 0 and no output, so merge-base reads a shared base and no branch reads orphan.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a failing case, and ./RUNME.sh check decides the last at tests-green
- the cases reach git, the disk and the clock through fakeGit, fakeDisk and fakeClock alone

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept: the approach answers the ask, and a red case decides every done_when line but the check, which tests-green runs
- the gate adds the case the verb table carries dispatch to test/level0/dispatch.test.js, since no case reached the row ./RUNME.sh dispatch runs
- the implementer reads now off it.clock where planOf takes no now, since every case calls planOf(it) alone
- the implementer prints --json on one line, since the case matches the output against ^{.*}$ with no s flag
- a ready row carries both group and branch, since names reads group and the freeNow case reads branch

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/scripts/dispatch.js src/scripts/cli.js src/scripts/work-answer.js test/level0/dispatch.test.js test/level0/work-answer.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the draft names, and the case beside the waitsOnPerson export
- the cases reach git, the disk and the clock through the fakes alone
- the header of src/scripts/dispatch.js names the dispatcher chapter it implements
- the parts of the plan stand once in PARTS, and the stale span stays in work-free.js

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/dispatch.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

./RUNME.sh dispatch --dry prints the dispatcher plan off origin/main and the work branches, and --json prints it as one JSON line. The plan names the ready groups, the stuck hand-overs, the fresh holds, the groups waiting on another, one bundle of the loose agent tickets, and the tickets waiting on a person. It writes nothing, so a desk runs it beside its own work and compares. Ready reads freeIn, the rule the take reads, so the plan and the take agree on a stale hold. waitsOnPerson in work-answer.js is now an export, and the queue and the plan read one rule. A branch answers for its own children alone, because every branch carries the whole ticket folder, and an older copy on another branch read as a question before that.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the draft names, the case beside the export, and the hooks case the check refused
- the cases reach git, the disk and the clock through the fakes alone
- the header of src/scripts/dispatch.js names the dispatcher chapter it implements
- the parts of the plan stand once in PARTS, and the stale span stays in work-free.js

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
