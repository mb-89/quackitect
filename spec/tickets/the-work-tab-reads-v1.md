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
depends_on: [v1-watch-sends-changes]
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d889b5fc6cd8 · claude-code-remote
    hash_before: 7a2750446de8c8074f6f3087db54b5e108de3788
    hash_after: 7a2750446de8c8074f6f3087db54b5e108de3788
    inputs:
      - name: ask
        hash: 87ed5e12d18b37a3
        size: 788
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d889b5fc6cd8 · claude-code-remote
    hash_before: 79adf20880a29baa63279bbe8270bfa2bf9e790e
    hash_after: 79adf20880a29baa63279bbe8270bfa2bf9e790e
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/tui/work fails
    inputs:
      - name: design/draft
        hash: 234ed95717bef22c
        size: 3068
    def: 08e16d07b0de477c
  - step: gate
    hand: box d889b5fc6cd8 · claude-code-remote · helper-4
    hash_before: 07306b46892cd86e1661f2fe2252d4d8bfe21486
    hash_after: 07306b46892cd86e1661f2fe2252d4d8bfe21486
    inputs:
      - name: design/draft
        hash: 234ed95717bef22c
        size: 3068
      - name: design/tests-red
        hash: 7a798193d358629a
        size: 772
    def: dc4904ab364efa10
---

# Ask

The work tab draws `work/rows` and its badge `work/open-tasks` off `/v1`, and wakes on the watch. The rows carry each place, the cloud flag and the plan's todos already, so the branch verb's second answer leaves.

The tab spawns `src/scripts/verbs/branch.js list --json` on every wake and lays that answer over the rows, a second copy of what `work/rows` answers. Its own JSON-RPC client reads the door's standing file and starts the index binary itself.

- `git grep -n 'branch list --json\|askIndex\|runVerb\|startIndex' src/tui` answers nothing
- a case under `src/tui/work` draws the tab over a fake catalog's `work/rows`. The queue column, the cloud letter and a todo row read the rows alone
- `./RUNME.sh check` exits 0

view: the work tab, and the count behind its name

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

The tab reads three names off the catalog the window already hands it, and wakes on the watch the ticket `v1-watch-sends-changes` builds. Its implement waits on that ticket.

- `work.Tab` gains `From`, the catalog the window builds, as `registry.Catalog` and `registry.Watcher` both. `main.go` hands it in place of the `Shadow`.
- `Init` reads `files/spec/views/work.base`, `work/rows` and `work/open-tasks` once, and starts `registry.Stream` over the last two. Each `registry.Change` redraws the rows or the count off the event's value, and arms `registry.Next` again.
- `ViewOver` in `shadow.go` becomes the one road from rows to a tree, in a file of its own. It lays the cloud letter, the todo letter and the queue off each row, and keeps the link off each row's path.
- `Row` in `src/modules/work/rows.go` gains `path`, `route` and `changed` off the ticket, since the flags, the links and the recently done sort read them.
- The label reads `work/open-tasks` alone.
- `workindex.go` leaves whole. `runVerb`, `startIndex` and `postJSON` leave `door.go`. `Places`, `PlacesIn`, `PlacesAt`, `PlacesCmd`, `Placed`, `runPlaces`, `NodeAt` and `placesVerb` leave `workplaces.go`, and `Load` and `Cmd` leave `work.go`.
- A watch that ends shows its reason in the tab's wait text, and the tab opens a new stream after `frame.Poll`.

Weighed: the base file read through the index keeps the tab off the disk whole. It costs a read at start. Assumed: `files/<path...>` answers every tracked file, as `src/modules/files/watch.go` declares.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/tui/main.go newModelOver, which builds the work tab
- src/tui/work/work.go Tab.Init, Tab.Update, Tab.Label and Tab.takes
- src/tui/panes_test.go and src/tui/shipped_test.go, which call work.Load and work.PlacesIn
- src/tui/work/queuecolumn_test.go, which calls PlacesAt
- src/modules/work/rows.go rowOf and branchRow, which build Row
- src/modules/queue and src/quack golden cases, which read work/rows

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/tui/work/v1_test.go TestTheWorkTabDrawsOffWorkRowsAlone
- src/tui/work/v1_test.go TestTheWorkTabRedrawsOnAWatchedChange
- src/tui/work/v1_test.go TestTheCountReadsWorkOpenTasks
- src/modules/work/rows_test.go TestARowCarriesItsPathRouteAndChange

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/tui/work/work.go
- src/tui/work/workplaces.go
- src/tui/work/workindex.go
- src/tui/work/door.go
- src/tui/work/shadow.go
- src/tui/work/view.go
- src/tui/work/v1_test.go
- src/tui/work/queuecolumn_test.go
- src/tui/work/workplaces_test.go
- src/tui/panes_test.go
- src/tui/shipped_test.go
- src/tui/main.go
- src/modules/work/rows.go
- src/modules/work/rows_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file and function the approach names stands opened on this branch: work.go, workplaces.go, workindex.go, door.go, shadow.go, workitems.go, main.go, the rows module and the files module's family
- the callers list names every caller git grep finds of Load, PlacesIn, PlacesAt, Placed, askIndex, ViewOver and Row
- each done_when line names its test: the git grep line, the v1_test.go cases, and the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/tui/work/v1_test.go src/modules/work/rows_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/tui/work/v1_test.go
- src/modules/work/rows_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

`Read` answers the stub's error, the tab takes no `registry.Change`, and the label stays bare. The row's JSON carries no path, route or change. The surprise: the draw case needs `files/spec/views/work.base` seeded as a content value with its text, since the tab reads the base file through the index too.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the grep line meets the change itself, the draw line meets TestTheWorkTabDrawsOffWorkRowsAlone, the wake meets TestTheWorkTabRedrawsOnAWatchedChange, and the check closes it
- the cases read through registry.Fake, the fake of the /v1 door, and the module case reads through its own seeds

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- work-tab-waits-sends-changes: depends_on names v1-watch-streams-changes, which stands closed while registry.Watch, Stream and Next are still stubs; the approach waits on v1-watch-sends-changes, so depends_on names that ticket, or the pull hands implement before the watch stands
- work-tab-callers-complete: the callers list and size miss src/tui/work_test.go (Load, IndexStandingAt), src/tui/workdetail_test.go, src/tui/workedit_test.go, src/tui/workplace_test.go and src/tui/workplaces_test.go (Load, PlacesIn, Placed, PlacesMsg, PlacesCmd, NodeAt), src/tui/work/door_post_test.go (postJSON), src/tui/work/shadow_test.go (ViewOver, IndexRow), and src/quack/testdata/tree.golden.json, which the new Row fields move
- rows-todo-folds-overrides: Row.Todo in src/modules/work/rows.go reads the front's todo alone, while the branch verb the tab drops also lights it for a plan override (overrides in src/scripts/work-answer.js), so a ticket placed with p loses its todo letter once the tab reads the rows alone
- rows-cloud-matches-branches: PlacesIn marks every unmerged standing branch and its tickets cloud, while tickets/cloud marks only a group carrying the cloud mark and its tickets, so an unmarked standing branch loses its cloud letter; the ask asserts the rows carry the flag already, and no test pins which rule holds

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

The gate names callers the draft misses. The implement takes each one, as a caller and in the size:

| the file | what it reads |
|---|---|
| `src/tui/work_test.go` | `Load`, `IndexStandingAt` |
| `src/tui/workdetail_test.go` | `Load` |
| `src/tui/workedit_test.go` | `Load`, `Placed` |
| `src/tui/workplace_test.go` | `Load`, `PlacesIn`, `Placed`, `PlacesMsg` |
| `src/tui/workplaces_test.go` | `PlacesIn`, `Placed`, `PlacesCmd`, `NodeAt` |
| `src/tui/work/door_post_test.go` | `postJSON` |
| `src/tui/work/shadow_test.go` | `ViewOver`, `IndexRow` |
| `src/quack/testdata/tree.golden.json` | the new fields of `Row` |
