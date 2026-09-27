---
kind: [[ticket]]
state: closed
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
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
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/design]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass, pass with findings naming a child a line, or fail with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every row the design review passes with stands fixed in the change"]
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
step: implement/tests-green
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
group: the-foundation-lands-unchanged
depends_on: [the-q-core-holds-names]
record:
  - step: design/draft
    hand: box d7a69cb6601d7 · claude-code-remote
    hash_before: c12beb185bf3c00632dee34d3432f94389aaca7a
    hash_after: 2780b45e84f2da699e3eca7fba58aeaaf7614312
  - step: design/review
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: f091d93507b67cfdce7df777fa43755586beb1d3
    hash_after: f091d93507b67cfdce7df777fa43755586beb1d3
  - step: implement/tests-red
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 4b4a6fa55005aab5370bcf6dc03bcc856fe7ef10
    hash_after: 4b4a6fa55005aab5370bcf6dc03bcc856fe7ef10
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/ops fails
  - step: implement/change
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: e070756c6a132a981645e608f79512aad0d0d3cf
    hash_after: e070756c6a132a981645e608f79512aad0d0d3cf
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/sqlite-runs-pure-go.md:111:1: Sentence: A sentence holds 25 words. Cut this one in two."
  - step: implement/tests-green
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 480f0584dd08236ed1f6fa39815f65246268d79d
    hash_after: 480f0584dd08236ed1f6fa39815f65246268d79d
    answered:
      - name: tests
        exit: 0
        said: green, src/ops passes; green, src/watchdog passes; green, src/q passes; green, src/index passes
      - name: check
        exit: 0
        said: "spec/tickets/sqlite-runs-pure-go.md:111:1: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

Operations and leases stand in the core: `ops/<id>` with its states and its retention, one writer per tree, the watchdog, the stale marks and `session/alarms`. The phase 0 notes on operations and watchdogs say the shape.

Every action after this one returns a handle, and every part holds a lease. Without them a hang looks like a part at work.

- - `go test ./...` from the root passes
- a case lets a lease expire, and reads each name of its provider as stale
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The shape stands in [[spec/design_output/model#operations]] and [[spec/design_output/model#watchdogs]]. This slice lands the state each note holds, over an injected clock, and leaves the processes it acts on to the phase that brings them.

| the package | what it holds |
|---|---|
| `src/ops` | the family `ops/<id>`, the moves the states table allows, the writer queue, the restart, the deadline and the retention |
| `src/watchdog` | the leases, the wait before a restart, the alarms, and the given name `session/alarms` |
| `src/q` | the stale mark: `Store.Stale` marks a part, `Snapshot.Stale` reads it, and a commit of the part clears it |
| `src/index` | the table `op`, which keeps each operation past a restart, behind the seam `ops.Keep` |
| `spec/config/level0.json` | the keys both notes name, with their defaults, and their schema rows |

- A part is a topic, the first segment of a name, so a stale `work` marks every name under `work/`.
- An id reads the start time, zero-padded, and a counter, so ids sort by start time.
- A move off the states table refuses, and names both states.
- `Book.Restart` moves every `queued` or `running` operation to `failed`, with the reason the index restarts.
- `Book.Expire` fails an operation past its deadline, and `Book.Sweep` drops an ended one past its window.
- The wait doubles from `watchdog.backoff.first` up to `watchdog.backoff.cap`.
- `watchdog.faults` faults inside `watchdog.window` raise an alarm, and `Clear` takes it off `session/alarms`.

What waits:

- a restart of a process, for the doors process
- a deadline over a derived name, for the scheduler the q core leaves waiting
- the undo steps of a failed operation, for `q.Action`, and meanwhile `undone` records what a runner reports
- the lease heartbeat, for the work loop
- the surfaces, for the command line and the HTTP door


### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/q/store.go` `Commit`, which clears the stale mark of each part it writes
- `src/index/door.go` `Serve`, which opens the keep and runs `Book.Restart` at start
- `src/index/index.go` `shape`, which gains the table `op`
- `spec/config/level0.json` and `spec/config/level0.schema.json`, which gain the keys

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `src/watchdog/lease_test.go` `TestAnExpiredLeaseMarksEachNameOfItsPartStale`, deciding the second done line
- `src/watchdog/lease_test.go` `TestTheWaitDoublesUpToItsCap`
- `src/watchdog/lease_test.go` `TestFaultsInTheWindowRaiseAnAlarm`
- `src/watchdog/lease_test.go` `TestAClearedAlarmLeavesSessionAlarms`
- `src/q/store_test.go` `TestACommitOfThePartClearsItsStaleMark`
- `src/ops/ops_test.go` `TestAStartAnswersAQueuedHandle`
- `src/ops/ops_test.go` `TestTheIdsSortByStartTime`
- `src/ops/ops_test.go` `TestAWriterWaitsBehindTheWriterAhead`
- `src/ops/ops_test.go` `TestAReaderRunsBesideAWriter`
- `src/ops/ops_test.go` `TestAMoveOffTheTableRefuses`
- `src/ops/ops_test.go` `TestARestartFailsEveryOpInFlight`
- `src/ops/ops_test.go` `TestAnOpPastItsDeadlineFails`
- `src/ops/ops_test.go` `TestAnEndedOpLeavesAfterItsWindow`
- `src/index/ops_test.go` `TestTheOpRowsOutliveTheDoor`
- `go test ./...` from the root, deciding the first done line
- `./RUNME.sh check`, deciding the third

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- both notes, the config file, the store and `Serve` stand opened
- a search for `ops/` and `lease` in Go names no caller beyond the list
- each done line names its test in the tests list

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings

- stale-marks-follow-the-provider: key a stale mark by the provider, not the topic. The watchdogs note names a part as a process, a door or a provider. A sibling provider under the same topic stays current.
- actions-declare-op-and-writes: add `q.Op` and `q.Writes` beside `q.Deadline` in `src/q/q.go`. An action then declares its handle and its write, and the writer queue gains a caller.
- op-moves-reach-the-log: land the session log rows of kind `op` and `watchdog`, and `ops/cancel`. Otherwise name them under what waits.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh test src/ops src/watchdog src/q src/index

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Every new test fails on its assertion against stubs that compile. The rest of each package stays green. A bare `go test ./src/index` fails every test on `no such module: fts5`, because the tag lives in `src/scripts/cli-go.js`. The test verb passes it, and [[spec/tickets/sqlite-runs-pure-go]] owns the bare run. `TestACancelEndsAQueuedOrRunningOp` joins the list and answers [[spec/tickets/op-moves-reach-the-log]].

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the tests touch `src/ops`, `src/watchdog`, `src/q` and `src/index`, which the draft names
- the clock and the keep have fakes in each test, and the index test runs the real table
- each test file opens on a comment pointing at its design note
- each fact points at the operations or the watchdogs note
- the review rows stand answered: the stale mark keys by provider, and `ops/cancel` has its test

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the files the draft names. `config.Count` moves out of `src/lsp`, so one place reads a count
- the clock and the keep take fakes, and the store stands real in each test
- each file opens on a comment pointing at the operations or the watchdogs note
- the key names stand in the config and both notes point at them
- the stale mark keys by provider, and `Book.Cancel` answers `ops/cancel`

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh test src/ops src/watchdog src/q src/index

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

Operations and leases stand in the core, over an injected clock.

| the part | what it does |
|---|---|
| `src/ops` | `Book` starts an operation under `ops/<id>`, queues writers one at a time, and moves by the states table alone |
| `src/ops` | `Restart`, `Expire` and `Sweep` fail an operation in flight, fail one past its deadline, and drop an ended one past its window |
| `src/watchdog` | `Dog` holds the leases, marks an expired provider stale, doubles the wait to its cap, and raises an alarm under `session/alarms` |
| `src/q` | `q.Op` and `q.Writes` declare an action, and a stale mark keys by provider until its next commit |
| `src/index` | the table `op` keeps each operation, and the door fails every one in flight at its start |
| `src/config` | `config.Count` reads a count, and `src/lsp` reads through it |

What I assume, for the reader at the merge:

- The keys take the two-level form the environment names back, such as `ops.keepDone`. Both notes name the new keys.
- The defaults are my own guess. The windows take an hour and a day. The wait runs from a second to a minute. Five faults in five minutes raise an alarm.
- A bare `go test ./...` fails on `fts5` in `src/index`, so the first done line waits on [[spec/tickets/sqlite-runs-pure-go]]. The test verb passes the tag.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the files the draft names, and `src/config` and `src/lsp` for the one count reader
- the clock and the keep take fakes in each test
- each file opens on a comment pointing at its design note
- the key names stand in the config alone, and both notes point at them
- the review rows stand fixed, and `says` names each assumption

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- `ops/cancel` lands in this change, as `Book.Cancel`. It moves a `queued` or `running` operation to `cancelled`, per the states table. [[spec/tickets/op-moves-reach-the-log]]
- The session log rows of kind `op` and `watchdog` wait on a Go writer of the session log. `lib/log.js` owns that log today, per [[spec/design_output/migration]]. Meanwhile the index pushes each move under `ops/<id>`.
