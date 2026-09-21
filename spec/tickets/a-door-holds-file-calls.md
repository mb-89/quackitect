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
step: implement/change
record:
  - step: design/draft
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 783b7e57c9dfc19139b57a67586509f777e4ecb4
    hash_after: 783b7e57c9dfc19139b57a67586509f777e4ecb4
  - step: design/review
    hand: box d40a1b367f4d · claude-code-remote · helper-2
    hash_before: b40b04e059e8cae8eec0d2cc94bcd66116a934ca
    hash_after: b40b04e059e8cae8eec0d2cc94bcd66116a934ca
  - step: implement/tests-red
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 4303130bf199a676675638cf00469d8cb7d6d701
    hash_after: 4303130bf199a676675638cf00469d8cb7d6d701
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
---

# Ask

A Go test drives the code with a fake, so a case replays and touches no box.

A package reading a file in many places takes the real disk in every test. A
case then depends on the tree it runs in.

- A rule refuses an import of `os` outside each package's `door.go`.
- Every Go package reading a file names that reading in one file.
- A Go test drives the reading through a fake the package holds.
- `./RUNME.sh lint src` names no such import.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The `os` import stands in each package's `door.go`, the rule refuses it anywhere else, and the server's tree reads through a disk a test fakes.

| piece | where | what changes |
|---|---|---|
| the rule | `spec/config/styles/VoiceVale/OutsideInDoors.yml` | refuses a Go import line naming `os` or a package under it, beside the `os/exec` line it holds |
| the sections | `.vale.ini` | `[**/src/**/door.go]` stands off the rule, so a package under `src/engine` reads as the rest; `[**/src/**/*_test.go]` stands off it too, because a Go case drives the real thing over a folder it writes, the way `test/contract` does |
| the doors | `door.go` in `src/config`, `src/lsp`, `src/tui`, `src/engine/swap`, `src/index` | each names the outside once: a reading, a writing, a stat, a folder, a remove, the executable, the environment, the arguments, the exit, the standard streams, the pid, and the interrupt. `src/config` and `src/engine/swap` get a `door.go`; the other three grow theirs |
| the callers | every other `.go` file importing `os` | calls the door's name for the same thing. `os.FileInfo` and `os.DirEntry` read as `fs.FileInfo` and `fs.DirEntry` out of `io/fs`, and `os.IsNotExist` as `errors.Is` over `fs.ErrNotExist`, both pure |
| the fake | `src/lsp` | `Tree` holds a `Disk`, the interface `door.go` defines with the real one beside it. `treeAt` builds the real disk, and `fake_test.go` holds a memory disk that behaves: what a case writes, it reads back, and a stat or a listing answers out of the same map |
| the cases | `src/lsp/tree_test.go`, `test/contract/outside-in-doors.test.js` | one drives `Read`, `Exists`, `Names` and `Paths` over the fake, with no folder on the box; the other feeds Vale an `os` import at a module's path and at a `door.go` path, and asserts the rule refuses one and passes the other |

The design output for the door rule stands at [[spec/design_output/doors#a-door-reads-the-outside]], and its table takes the Go import row.


## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
The rule file, the sections, each package named, the tree's constructor and its reading methods, and the contract test stand in the tree.
The rule row and the contract case answer the import bullet with a refusal at a module path and a pass at a door path.
The doors row answers the one-file bullet, and the lint run over the tree proves it.
The fake row and the tree case answer the fake bullet, with a memory disk behind the server's tree.
The callers row answers the lint bullet, and the pure reads out of the standard library keep the callers off the import.
The door section in the config reaches one folder under the source root, so the wider glob the draft names is what holds the swap package.
The fake reaches the server package alone, and the other packages keep the real disk in their cases under the test section the draft adds.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh branch test test/contract/outside-in-doors.test.js


### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

- the Vale case feeds the rule a Go import of `os` at a module's path, and the rule passes it, because the rule names the command import alone
- the case at a door's path passes already, and so does the case at a test's path
- the Go case over the memory disk waits for the interface, because a case naming a field the tree lacks builds nothing, and the branch test reads a build fault as no assertion
- what surprises the hand: the door section in the config reaches one folder under the source root, so the swap package's door reads as a module today


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the cases stand in the Vale contract test, and the Go case joins the tree's test with the change
- the Vale case drives the real binary, and the Go case drives the memory disk the package holds
- each case's comment names the ticket, and the door's interface takes the same pointer


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
