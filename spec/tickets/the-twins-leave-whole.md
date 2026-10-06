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
group: failures-stand-registered
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: fdfab33193f6869586a7571b3e20e419a0ab8fb3
    hash_after: fdfab33193f6869586a7571b3e20e419a0ab8fb3
    inputs:
      - name: ask
        hash: b7f931327270cefd
        size: 821
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 80caf3759422318bd925e4e5c2541244a04381f0
    hash_after: 80caf3759422318bd925e4e5c2541244a04381f0
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: e242c4d6149350f8
        size: 2818
    def: 08e16d07b0de477c
  - step: gate
    hand: box 83c32b2b4d58 · claude-code-remote · helper-4
    hash_before: 5a2875c06e0b7a33305bcf15836eab613988cec7
    hash_after: 36f677d1f32467be29fb69b94a48e1525d0f3233
    inputs:
      - name: design/draft
        hash: e242c4d6149350f8
        size: 2818
      - name: design/tests-red
        hash: 613a6eda8e875a5a
        size: 1263
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 5f194e83cad79e9e97c7cedcc57f418d903fe8a6
    hash_after: 71afd277cfc1236443bb6d7a77bd16a0591a1560
    answered:
      - name: lint
        exit: 0
        said: green
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 83d4130bca89729496b88001db63f45926321a9e
    hash_after: 83d4130bca89729496b88001db63f45926321a9e
    answered:
      - name: tests
        exit: 0
        said: green, 10 test(s) pass in 2 file(s); green, src/branches passes; green, src/quack passes
      - name: check
        exit: 0
        said: green
    inputs:
      - name: design/tests-red
        hash: 613a6eda8e875a5a
        size: 1263
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

The JS twins of ticket pull and branch leave the tree, so the desk refusal has one source, the failure door. A reader then finds one pull, in Go.

src/scripts/pull.js, pull-hand.js and work.js run under tests alone, and still carry callers. `deskRefusal` in `.claude/skills/level0/lib/cloud.js` builds its remedy past the failure door. It drifts from the Go text in `src/branches/take.go`.

- `src/scripts/ticket.js`, `ticket-yours.js` and `work-test.js` import nothing from the twins. A grep over `src/scripts` and `test` finds no such import
- src/scripts/pull.js, pull-hand.js and work.js stand gone, and so do the tests that cover them alone
- `deskRefusal` stands gone from `lib/cloud.js` and `test/level0/cloud-desk.test.js`. `deskSaid` and the node `desk-works-on-trunk` stay
- ./RUNME.sh check exits 0

none

none

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

The approach departs from the ask's first two done_when lines, and keeps its aim. The twins do not run under tests alone: copilot.js reaches work.js through .claude/skills/level0/lib/copilot-dispatch.js, and pull.js and pull-hand.js stand as hubs that ephemeral-pull.js, pull-escalate.js, work-answer.js and ticket.js import, the last behind the Go fill verb. Their retirement is a migration of its own across these modules, past this branch's edge. The defect the note names stands smaller: four desk refusals print their remedy past the failure door, and two print it twice. The fix: each raises desk-works-on-trunk with the said line alone, and the node's remedy prints once. In Go, take in src/branches/take.go raises a said line with no remedy, and commit in src/quack/commit.go raises through the failure door in place of printing command.DeskRefusal. In JS, take in src/scripts/work.js and deskRefused in src/scripts/pull-hand.js raise through failure(it.disk, it.log, it.root) with deskSaid, as deskGuard in src/bridge/bash.js already does, and answer their code once the raise resolves. Then deskRefusal leaves lib/cloud.js, DeskRefusal leaves src/modules/hooks/command/trunk.go, and deskRefusal leaves take.go. deskSaid, DeskSaid and the node stay.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/work.js: take, which printed deskRefusal
- src/scripts/pull-hand.js: deskRefused, which handOut and pull in src/scripts/pull.js call
- test/level0/cloud-desk.test.js: the deskRefusal cases
- src/branches/take.go: take, which raised deskRefusal's two lines
- src/quack/commit.go: the desk guard of the commit verb, which printed command.DeskRefusal

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/cloud-desk.test.js: a desk pull raises desk-works-on-trunk through the failure door, and its remedy prints once
- src/branches/take_failure_test.go: TestDeskTakePrintsTheRemedyOnce
- src/quack/commit_test.go: TestDeskCommitRaisesThroughTheDoor

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .claude/skills/level0/lib/cloud.js
- test/level0/cloud-desk.test.js
- src/scripts/pull-hand.js
- src/scripts/work.js
- src/branches/take.go
- src/branches/take_failure_test.go
- src/modules/hooks/command/trunk.go
- src/quack/commit.go
- src/quack/commit_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every name stands opened: deskSaid and deskRefusal in lib/cloud.js, deskRefused and handOut in pull-hand.js, pull in pull.js, take in work.js and take.go, DeskSaid and DeskRefusal in trunk.go, the commit guard in commit.go, deskGuard in bash.js, and failure in src/doors/failure.js
the callers list names every caller a grep for deskRefusal, DeskRefusal and deskRefused finds
the two done_when lines the approach keeps meet a test: deskRefusal gone from lib/cloud.js and its test, decided by the cloud-desk case, and the check; the two it departs from stand answered in the approach

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/cloud-desk.test.js test/level0/pull-hand-desk.test.js src/branches/take_failure_test.go src/quack/commit_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/cloud-desk.test.js
- test/level0/pull-hand-desk.test.js
- src/branches/take_failure_test.go
- src/quack/commit_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

All four fail on their own assertion. The Go take prints the remedy twice, once in its message and once off the node, and the commit prints it past the door with no id. A surprise moves the approach: the JS pull answers its code at once, and heard in test/level0/work-doors.js reads it so, with no log on the doors, so the JS refusal cannot wait on the door's async raise. The JS door in src/doors/failure.js then answers lines alone as well, and deskRefused prints them, with the row riding beside where a log stands. The named pull's remedy reads <name> off the node, and its message names the group.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the done_when lines meet a failing case: no deskRefusal in the plugin, a desk pull through the door, the Go take and the commit printing the remedy once, and the check
the JS cases reach git and the disk through fakeGit and fakeDisk, and the Go take reads the fake registry; the commit case writes the node into its own temp tree

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- the-twins-retire: the draft departs from done_when lines one and two and says why, and the tree bears it out: work.js has a caller outside the tests in .claude/skills/level0/lib/copilot-dispatch.js, and pull.js and pull-hand.js are imported by ephemeral-pull.js, pull-escalate.js, pull-writes.js, pull-gate.js, pull-chapter.js, pull-route.js, work-answer.js, work-unblock.js, work-free.js, work-held.js, work-review.js, ticket.js, ticket-yours.js and work-test.js. Moving those importers off the twins and deleting the three files is a migration of its own, so those two lines ride out as this child
- go-pull-desk-remedy-once: the callers list misses deskRefused in src/pull/pull_branch.go, the Go pull. It passes the remedy as a second said line to failure.Raise, and Raised.Lines in src/failure/raise.go also prints the node's remedy, so the Go pull prints the remedy twice, the same fault as take.go. The builder fixes it in place with a test beside TestDeskTakePrintsTheRemedyOnce
- desk-refusal-test-follows: dropping DeskRefusal from src/modules/hooks/command/trunk.go breaks TestDeskSaidBuildsTheMessageTheDeskRefusalOpensOn in trunk_test.go, which calls it. Neither size nor callers names that file. The builder rewrites that case to DeskSaid alone
- desk-size-names-the-door: tests-red/seen says src/doors/failure.js answers lines alone, so the JS refusal prints them without waiting on the async raise. That file stands outside size, so the builder adds it there or drops the change
- desk-remedy-names-the-group: the named pull's refusal used to name the group in the remedy (branch merge one-group). Under the new test it reads branch merge <name>, and only the message names the group, so a desk reader loses the exact command. Keep it, or carry the name into the node's remedy

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the size's files, plus the fallout the signature and the moved remedy force: pull.js calls deskRefused, and five desk cases now read the remedy off the node, so their trees hold it
- the JS refusals reach the failure door over the fake disk and log, and the Go take reads failure.Fake through deskNodes
- a comment over deskRefused, deskSaid in take.go and DESK_FAILURE names the approach
- the remedy stands on the node alone, the JS id once as DESK_FAILURE, and the test node once per language: DESK_NODE in work-doors.js, deskNodes in take_failure_test.go

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/cloud-desk.test.js test/level0/pull-hand-desk.test.js src/branches/take_failure_test.go src/quack/commit_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Every desk refusal now raises the node desk-works-on-trunk with its message alone. The node holds the remedy, and the failure door prints it once. Before, the JS pull, the JS take, the Go take and the commit verb each spelled the remedy in their own text. Two of them printed it twice, once in the text and once off the node. deskRefusal leaves lib/cloud.js, and DeskRefusal leaves trunk.go. The desk cases that read the remedy now hold the node in their trees. The ask's first two lines ride out as the-twins-retire, which closed with copilot taking through Go. The rest of that retirement stands parked as the note the-js-pull-stack-retires.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the files past the size are callers or cases the moved remedy forces, and no other file moves
- the JS refusals reach the failure door over the fake disk and log
- a comment over each changed function names the approach
- the remedy stands on the node alone, and each language holds one test node

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
