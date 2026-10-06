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
group: level-zero-smoke
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box a694567529c5 · claude-code-remote
    hash_before: 4aa4f2a7920686bfee3287ed8c3875425b554edd
    hash_after: 4aa4f2a7920686bfee3287ed8c3875425b554edd
    inputs:
      - name: ask
        hash: 972de3a0dd10e09f
        size: 482
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box a694567529c5 · claude-code-remote
    hash_before: e4fef9d9e8e858d518636fb2058aee89debe46cd
    hash_after: e4fef9d9e8e858d518636fb2058aee89debe46cd
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/index fails
    inputs:
      - name: design/draft
        hash: 48ed21662d6469fb
        size: 2044
    def: 08e16d07b0de477c
  - step: gate
    hand: box a694567529c5 · claude-code-remote · helper-4
    hash_before: c4430eac27561b8e67b79cf452e78d1eaf5a340e
    hash_after: c4430eac27561b8e67b79cf452e78d1eaf5a340e
    inputs:
      - name: design/draft
        hash: 48ed21662d6469fb
        size: 2044
      - name: design/tests-red
        hash: 8a9506635862836c
        size: 722
    def: dc4904ab364efa10
  - step: implement/change
    hand: box a694567529c5 · claude-code-remote
    hash_before: 1db8b6d58eb138fe66846992b1750c871e1598ba
    hash_after: 1db8b6d58eb138fe66846992b1750c871e1598ba
    answered:
      - name: lint
        exit: 0
        said: "    2.7  test/contract/runme-road.test.js ./RUNME.sh hands get to quack, which reads the verbs slice off the index"
    def: f150b8c0dc20fe45
---

# Ask

The plan and review tools keep their server through a check, a branch switch and a merge, so a box spends no turns on it.

Boxes in most groups meet a plan tool with no server after a check or a merge, and spend calls starting it again.

- `go test ./src/quack/` passes a case where a server standing before the check still answers after it.
- `go test ./src/index/` passes a case where an index keeps answering after a merge changes the files under it.
- `./RUNME.sh check` exits 0

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

The cause: spawns in src/index/door.go starts se-index serve with no session of its own, so the door joins the process group of whatever starts it. A door the start road raises stands in the client's group and lives. A door a ./RUNME.sh call raises inside a check, a branch switch or a merge stands in that command's group, and whatever ends that group ends the door too: the tool running the command, a test runner, and the group kill the-check-ends-what-it-drops adds. The plan and review tools then meet no server, and the next event pays for a start. The fix: Detached in src/index/detach.go readies the door's command, with detach_unix.go giving it a session of its own and detach_windows.go a new process group with no console. spawns runs every door through it. A rebuild still stops a door on the old build, and the next call stands the new one, as the build stamp asks. That road stands as it is.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/index/door.go spawns, called by starts, called by reaches, called by every client of the door (V1, quack's verbs, the start road's standing)
- src/quack/ending.go endsWhole, whose group kill the door now stands apart from

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/index/detach_test.go TestADoorStandsInASessionOfItsOwn
- src/quack/ending_test.go TestAServerStandingBeforeTheCheckAnswersAfterIt

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/index/detach.go
- src/index/detach_unix.go
- src/index/detach_windows.go
- src/index/detach_test.go
- src/index/door.go
- src/quack/ending_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- door.go spawns and starts, main.go reaches, liveDoor and stands stand opened, and ps shows the live door in the client's process group, never a session of its own
- grep finds spawns called by starts alone, and starts by reaches, and the reach tests swap spawns for a fake
- the quack line meets the ending_test case, where a group kill like the check's leaves the detached process standing, and the index line meets detach_test, since a merge ends the command group that would hold the door. The check line is its own command

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/index/detach_test.go
- src/quack/ending_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both cases fail on their assertion: the stub leaves the door in its starter's group. The quack case runs the test binary as the child that starts a door, under the same group kill the check uses, so the door it starts meets the check's road. syscall carries no Getsid on Linux, so the cases read the process group, which a new session leads as well.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the quack line meets the group-kill case in ending_test, the index line meets detach_test, and the check line waits for tests-green
- both cases drive real processes as the one test of the detach road, and the reach tests keep their fake spawn

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- door-outlives-taskkill-tree: ending_windows.go ends a child with taskkill /T /F, which walks the parent-child tree by parent pid; a new process group with no console leaves the door in that tree while the quack verb that spawned it still runs, so on Windows the check's kill still ends the door. The Windows half wants a road that breaks the parent link, such as a short-lived starter that spawns the door and exits, and a windows-tagged case, since both red tests stand under !windows.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches src/index/detach*.go and door.go alone, the files the ask names, plus the minted ticket note
- the spawn reaches the process door, whose fake stands in q/qtest; the Windows case drives the real thing once
- detach.go names the approach: the door stands apart from its starter group and session, and the platform files say how
- the facts stand on the tickets the comments link, and the code repeats none of them

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

This ticket carries the test run of [[spec/tickets/ending-windows-tree-tested]], which closed `became` onto it. Its change landed: `endsWhole` ends the child's tree through `ending_unix.go` and `ending_windows.go`, and `ending_windows_test.go` proves the Windows road on the `windows-latest` runner. Its unix case shares `src/quack/ending_test.go` with this ticket's red case, so the tests-green here runs both.

This ticket also carries the tests-green step of [[spec/tickets/the-check-ends-what-it-drops]], which closed `became` onto it for the same file. That ask reads: `go test ./src/quack/` passes a case where a child the Vale call gives up on, and a process it starts, both stand ended once the call returns.
