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
group: tui-shell-switches-over
depends_on: [v1-watch-streams-changes]
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d889b5fc6cd8 · claude-code-remote
    hash_before: df41b3226c24c186d868b6f0d8cb84f65ebf0c9a
    hash_after: df41b3226c24c186d868b6f0d8cb84f65ebf0c9a
    inputs:
      - name: ask
        hash: 7acc0ab40e14130e
        size: 487
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d889b5fc6cd8 · claude-code-remote
    hash_before: e4aba5e415f51e7b7fa00184e0c04b72b1d5292a
    hash_after: e4aba5e415f51e7b7fa00184e0c04b72b1d5292a
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/tui/log fails
    inputs:
      - name: design/draft
        hash: d1372ecac93da55e
        size: 2549
    def: 08e16d07b0de477c
---

# Ask

The log tab draws `log/rows` off `/v1`, and wakes on the watch. The tab's own tail of the session file leaves.

The tab reads the session file through its own tail and file watcher. That makes a second reader of what the `log` module answers, and the two parse it apart.

- `git grep -n 'fsnotify' src/tui` answers nothing
- a case under `src/tui/log` draws the tab over a fake catalog's `log/rows`, with the details pane whole
- `./RUNME.sh check` exits 0

view: the log tab

from: none

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

The log tab reads `log/rows` off the catalog the window hands it, and wakes on the watch the ticket `v1-watch-sends-changes` builds. Its implement waits on that ticket.

- `log.Tab` gains `From`, the catalog and the watch, as the work tab does. `main.go` hands it in place of the `Shadow`.
- `Init` starts `registry.Stream` over `log/rows`. Each `registry.Change` reads the rows off the event's value.
- `RecordOf` maps a row of the `log` module to a `Record`: the time parsed off `at`, the level, the kind, the said, the text, the extras and the broken mark. The raw line the details show reads the row's JSON.
- A change whose rows hold fewer than the tab holds reads as a new session, so the tab starts again the way a rotated tail does. Otherwise the rows past the ones held land as new, and follow moves as it does now.
- The wide `Row` in `shadow.go` gains `text` and `extra`, matching the module's row.
- `tail.go`, `newTailer`, `tailErrMsg` and `LinesMsg` leave, and `fsnotify` leaves the window.
- The `--frame` mode draws one frame off the file its command line names, so it reads that file once through `ParseRecord`, with no watcher.

Weighed: each change carries the whole session's rows, which costs bytes on a long session. A range read, rows past a count, answers that later where it bites. Assumed: `log/rows` reads the session the window's path names, since both read the session file under `.se/.log`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/tui/main.go newModelOver, which builds the log tab, and Frame, which reads the Tailer
- src/tui/log/tab.go Tab.Init and Tab.Update, which read the tail's messages
- src/tui/log/golden_test.go and src/tui/log/tail_test.go, which read the tail
- src/tui/frame/footer.go and the window tests, which read the log tab's rows

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/tui/log/v1_test.go TestTheLogTabDrawsOffLogRows
- src/tui/log/v1_test.go TestAShorterLogReadsAsANewSession
- src/tui/log/v1_test.go TestTheDetailsDrawARowWhole

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/tui/log/tab.go
- src/tui/log/tail.go
- src/tui/log/tail_test.go
- src/tui/log/v1.go
- src/tui/log/v1_test.go
- src/tui/log/shadow.go
- src/tui/main.go
- go.mod

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file and function the approach names stands opened on this branch: the log tab, its tail, its view and shadow, detail.go, record.go, and the log module's Row and RowOf
- the callers list names every caller git grep finds of newTailer, LinesMsg, Tailer and the log tab's Shadow
- each done_when line names its test: the fsnotify grep, the v1_test.go cases, and the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/tui/log/v1_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/tui/log/v1_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The tab takes no `registry.Change`, so it holds no row, and `RecordOf` answers an empty record. The surprise: a map in the shadow's `Row` breaks the compares that test it for equality. So the road reads its own `IndexRow`, and the shadow's `Row` leaves with the compares.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the fsnotify grep meets the change itself, the draw meets TestTheLogTabDrawsOffLogRows and TestTheDetailsDrawARowWhole, and the check closes it
- the cases read through registry.Fake, the fake of the /v1 door, and touch no file

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
