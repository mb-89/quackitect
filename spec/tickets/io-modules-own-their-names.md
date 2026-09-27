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
step: gate
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-foundation-closes-its-gaps
depends_on: [qtest-holds-a-module]
record:
  - step: design/draft
    hand: box d7e10c2f00cd · claude-code-remote
    hash_before: f308edf1579aa67196285baca842c7a6b21d3d9f
    hash_after: f308edf1579aa67196285baca842c7a6b21d3d9f
    inputs:
      - name: ask
        hash: bcdbc7329f8b47c7
        size: 911
      - name: [[spec/design_output/model]]
        hash: eb315d7a681bc4e4
        size: 74362
      - name: [[spec/tickets/the-hooks-door-lands]]
        hash: c21e482c59aaf856
        size: 5915
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e10c2f00cd · claude-code-remote
    hash_before: dbd629865e6fe85bdd99a364aab70ca5e636f029
    hash_after: dbd629865e6fe85bdd99a364aab70ca5e636f029
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/files fails
    inputs:
      - name: design/draft
        hash: 4bb243c676234557
        size: 6140
    def: 08e16d07b0de477c
---

# Ask

The IO modules `watch`, `disk`, `clock` and `env` stand, each with the flag, per [[spec/design_output/model#io-modules]]. `watch` writes `files/<path...>`, and `clock` writes `clock/minute`. `env` writes `env/<name>` at start, and `disk` writes a file on request. The `hooks` IO module lands in phase 5, with [[spec/tickets/the-hooks-door-lands]].

The core then stores what a module commits, and knows no input of its own. Each IO module keeps its fake inside, and its test needs no disk and no clock.

- `go test ./...` from the root passes
- a case reads the index core as the writer of no name under `files/`, `clock/` or `env/`
- a case sends `disk` a write request, and reads the file come back through `watch`
- each IO module's test runs over `qtest` and the fake of its outside
- each fake of the outside passes one contract suite, run against the fake and the real outside
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

Seven pieces, following spec/design_output/model at IO modules are modules, its file carries its fake, IO modules and their fakes, and an action lists requests. It builds on the wiring of the-wiring-file-binds-ports, and implements after it and after analyzers-read-the-io-flag, since onlyq refuses os in a module without the flag.

One, q: the option IO() marks a registration, and Store.Send(name, input, accept) runs the requests an action answers in order. accept names the IO module of each request, each Then reads the answers, and a failing request runs the undo of every request before it, newest first. The index runs the requests, and a module names them alone.

Two, src/modules/files/disk.go: the interface Disk with Write and Remove, the real disk over a root folder, and FakeDisk, a map keyed by the forward-slash path. FakeDisk calls the hands listening on each write. The registration accepts the requests disk.write and disk.remove, with q.IO().

Three, src/modules/files/watch.go: the interface Watch, handing each change as a path and its text. The real watch runs fsnotify over the tracked paths, and FakeWatch hands the changes a test pushes. The registration writes the out-port family <path...>, of the type files.Content, which moves from src/index. The wiring binds watch.<path...> to files/<path...>. FakeWatch listens on FakeDisk, so a disk write comes back through watch.

Four, src/modules/clock/clock.go: Clock with Now, the real clock, and FakeClock, which stands still until Tick. The out-port minute is wired to clock/minute. src/modules/env/env.go: Env with Environ, the real one reading the SE_ variables, and FakeEnv over a map. Its out-port family <name> is wired to env/<name>, written once at start.

Five: each IO module keeps a contract suite beside its file, such as disk_contract_test.go, under the build tag contract. It runs the same cases against the fake and against the real outside in a temporary folder. cli-check.js runs go test with -tags contract, per the model's line that the check runs every tag.

Six, the composition root: src/index becomes package index, and its func main becomes index.Main(types). The new src/quack/main.go imports the topic packages under src/modules, reads spec/wiring.yaml and calls index.Main. So nomodule holds, since src/quack is neither the index nor a door nor a renderer. go-source.js builds se-index off src/quack. spec/wiring.yaml names watch, disk, clock and env and their wires.

Seven: registersTopics drops the files family and publishes, and the index's walk keeps its SQLite rows for the /v1 reads alone. The door reads files/ values as any, so the moved type reaches /v1 as the same JSON.

Weighed: one composition root in this ticket, against a ticket of its own. The migration places the one quack binary in phase 1, the-manager-becomes-a-module and tickets-becomes-a-module need the same root, and no ticket of this group builds it. The first of the three to implement lands it. Weighed: two watchers stand while the walk keeps its rows, against the index feeding watch, since the index reaches no module. projections-read-the-mirror retires the walk's own watcher. Assumed: the hooks module stays in phase 5, as the ask says.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/index/topic.go: registersTopics and door.publishes, which leave the files family
src/index/door.go: Serve and the settle calling publishes
src/index/main.go: main, which becomes index.Main
src/index/contract_test.go: inProcess, which calls registersTopics
src/index/topic_test.go: the files topic cases, which move to the watch module
src/q/action.go: Store.Act, beside the new Store.Send
src/q/q.go: the Option set, which takes IO
src/scripts/go-source.js: BUILDS, where se-index builds off src/quack
src/scripts/cli-check.js: the Go part, which runs go test with -tags contract

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/q/send_test.go: TestSendRunsTheRequestsInOrderAndFollowsThen
src/q/send_test.go: TestAFailingRequestUndoesTheOnesBeforeIt
src/modules/files/files_test.go: TestADiskWriteComesBackThroughWatch, over q.Load, FakeDisk and FakeWatch
src/modules/files/disk_contract_test.go: TestDiskKeepsItsContract, against FakeDisk and a temporary folder
src/modules/files/watch_contract_test.go: TestWatchKeepsItsContract, against FakeWatch and fsnotify over a temporary folder
src/modules/clock/clock_test.go: TestTheMinuteMovesOnTick
src/modules/clock/clock_contract_test.go: TestClockKeepsItsContract
src/modules/env/env_test.go: TestEnvWritesEachVariableAtStart
src/modules/env/env_contract_test.go: TestEnvKeepsItsContract
src/index/topic_test.go: TestTheCoreWritesNoInputName, reading registersTopics as the writer of no name under files/, clock/ or env/

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/q/q.go
src/q/send.go
src/q/send_test.go
src/modules/files/disk.go
src/modules/files/watch.go
src/modules/files/files_test.go
src/modules/files/disk_contract_test.go
src/modules/files/watch_contract_test.go
src/modules/clock/clock.go
src/modules/clock/clock_test.go
src/modules/clock/clock_contract_test.go
src/modules/env/env.go
src/modules/env/env_test.go
src/modules/env/env_contract_test.go
src/quack/main.go
src/index/*.go, the package line of each file
src/index/main.go
src/index/topic.go
src/index/door.go
src/index/topic_test.go
src/index/contract_test.go
src/scripts/go-source.js
src/scripts/cli-check.js
spec/wiring.yaml

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened spec/design_output/model at IO modules are modules, its file carries its fake, IO modules and their fakes, an action lists requests, one binary many processes and the build checks imports, spec/design_output/migration at the src/index row and the quack binary gap, src/index/topic.go, door.go and main.go, src/scripts/go-source.js and cli-check.js, and checked each claim there
the callers come off a grep for registersTopics, publishes, filesFamily, Content, Act, go test and se-index over src
each done_when line names its test: TestTheCoreWritesNoInputName decides the core, TestADiskWriteComesBackThroughWatch decides the round trip, each module's test and contract suite decide the fakes, and go test and the check decide the first and last

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/files src/modules/clock src/modules/env

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/q/send_test.go
src/modules/files/files_test.go
src/modules/files/disk_contract_test.go
src/modules/files/watch_contract_test.go
src/modules/clock/clock_test.go
src/modules/clock/clock_contract_test.go
src/modules/env/env_test.go
src/modules/env/env_contract_test.go
src/index/core_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every case fails on its own assertion over stubs that import no os: Send runs no request, the fakes hand no change, the minute reads 0, env commits nothing, and the core still writes files/a.md. The contract suites stand under the tag contract, so go test with -tags contract runs them red on both the fake and the real side. The surprise: the tree test read the generated <package>.test main of each module package as a module, which imports os and the package under test, so the test now skips those mains. The tests call q.NewStore(c, nil), so the implement of the-wiring-file-binds-ports drops the nil here too. Each module commits by its local names, and the loader binds them once the wiring lands.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line meets a test that fails: TestTheCoreWritesNoInputName, TestADiskWriteComesBackThroughWatch, each module test and each contract suite, and go test and the check decide the rest as commands
each IO module file carries its fake, FakeDisk, FakeWatch, FakeClock and FakeEnv, and each untagged test runs over the fake alone

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
