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
group: tui-shell-switches-over
depends_on: [v1-watch-sends-changes]
step: view
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
  - step: gate
    hand: box d88aea6eafd6 · claude-code-remote
    hash_before: ac721fb8540b078edc42b8ea74b301faae6e33a9
    hash_after: ac721fb8540b078edc42b8ea74b301faae6e33a9
    inputs:
      - name: design/draft
        hash: d1372ecac93da55e
        size: 2549
      - name: design/tests-red
        hash: 71f75553e780e505
        size: 615
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d88aea6eafd6 · claude-code-remote
    hash_before: a2def9c5f52cb2a4135b886d7c7f93efcf495714
    hash_after: a2def9c5f52cb2a4135b886d7c7f93efcf495714
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/the-tui-data-paths-leave.md:376:73: Passive: Write in the active voice and name who acts: 'is reached'."
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d88aea6eafd6 · claude-code-remote
    hash_before: 98501ed5e74701fafb6561f7abe0e62769cf0bfd
    hash_after: 98501ed5e74701fafb6561f7abe0e62769cf0bfd
    answered:
      - name: tests
        exit: 0
        said: green, src/tui/log passes
      - name: check
        exit: 0
        said: "spec/tickets/the-tui-data-paths-leave.md:376:73: Passive: Write in the active voice and name who acts: 'is reached'."
    inputs:
      - name: design/tests-red
        hash: 71f75553e780e505
        size: 615
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    hand: box d88aea6eafd6 · claude-code-remote
    hash_before: cdb9738dad611d2cdac6c4e3ad0e5f21ea84e822
    hash_after: cdb9738dad611d2cdac6c4e3ad0e5f21ea84e822
    inputs:
      - name: ask
        hash: 7acc0ab40e14130e
        size: 487
      - name: implement/tests-green
        hash: e34dd2dac9f7fff7
        size: 759
    def: 561b3819e1683d37
reason: done
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

accept with points
- log-tab-takes-its-rows: the log tab stands first, and the frame hands each message to the first tab taking it. So the tab takes a `registry.Change` named `log/rows` alone. Its stream's end lands as a message of its own, as `watchEnded` does in `src/tui/work/v1.go`. A case sends `work/rows` and wants it declined.
- log-approach-matches-tree: `src/tui/model_test.go` sends `LinesMsg` twice, so the callers and the size name it. `go.mod` keeps `fsnotify`, since the index, the files module and the watcher import it. The road reads `IndexRow`, so the shadow's `Row` gains no field.

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

- files: the size list, less go.mod, which keeps fsnotify for the index, the files module and the watcher. src/tui/model_test.go sends rows through the watch in place of LinesMsg. tail_test.go gives way to read_test.go, which holds ReadLog and the older door line. spec/design_output/tui.md names the watch as the way a line arrives.
- fakes: the tab reads through Watched, and registry.Fake stands for it in every case.
- comments: each new function points at this ticket, and the change routing points at log-tab-takes-its-rows.
- one place: rowsName moves to v1.go, the road owning it. The red case wanted Sel at -1 after a new session, and Rebuild follows to the newest row, as model_test.go's restart case pins. So the case now wants the newest row.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test src/tui/log/v1_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The log tab now draws off log/rows through the catalog the window hands it, and wakes on the /v1 watch, so its own tail and file watcher leave the window. A change with fewer rows than the tab holds reads as a new session. The tab takes log/rows alone and its own watch end alone, because it stands first and would swallow the work tab's changes. The frame mode reads its file once through ReadLog.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- files: tests-green adds no file past the implement leaf's.
- fakes: registry.Fake stands for the catalog and the watch.
- comments: each new function points at this ticket.
- one place: rowsName stands in v1.go, and the design note points at read.go.

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

pass: this box has no screen, so .se/scripts/logview renders the window off the index standing over this tree, with the log tab and the work tab under one frame. Every event passes through the frame's own dispatch. The log tab draws this session's rows with time, level, kind and said, and the work tab takes its own rows and its count beside it. A first run met the door while it stood up and drew the wait line, which the tab's watch-again answers after a pause.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The gate weighed these, and they stand:

| the claim | what the tree says |
|---|---|
| `log/rows` reads the window's session | `log.session` in `spec/wiring.yaml` names `files/.se/.log/session.jsonl`, the path the window opens by default. A window over another file reads the live session instead, and the frame mode keeps its own read. |
| the red cases decide the ask | the draw and the new session meet a case each. The details case reads `RecordOf`, which the details pane draws from. |
| the watch reaches the tab | the work tab's watch stands on this branch, and `registry.Stream` hands each change on. |
