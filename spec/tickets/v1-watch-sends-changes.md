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
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d889b5fc6cd8 · claude-code-remote
    hash_before: 21f4b2fc0b7859579517c9e5454c2460138c9be6
    hash_after: 21f4b2fc0b7859579517c9e5454c2460138c9be6
    inputs:
      - name: ask
        hash: 817f149b07ac76c5
        size: 682
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d889b5fc6cd8 · claude-code-remote
    hash_before: afc5b2c39bba46c9123eeba729a5173bcbf4d0d3
    hash_after: afc5b2c39bba46c9123eeba729a5173bcbf4d0d3
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/index fails
    inputs:
      - name: design/draft
        hash: a04101e5619b08bc
        size: 2494
    def: 08e16d07b0de477c
  - step: gate
    hand: box d889b5fc6cd8 · claude-code-remote · helper-4
    hash_before: b3ab1017685cba034481f26377d895e61eafb2cc
    hash_after: b3ab1017685cba034481f26377d895e61eafb2cc
    inputs:
      - name: design/draft
        hash: a04101e5619b08bc
        size: 2494
      - name: design/tests-red
        hash: ad805c8cd278a55f
        size: 785
    def: dc4904ab364efa10
---

# Ask

The door answers `GET /v1/watch` as a server-sent event stream, so every client of `/v1` wakes on a change and polls nothing. The window gets a client of it beside `registry.V1`.

The window wakes today through the JSON-RPC `changes` call alone, the index client this group takes out. Without a watch on `/v1`, the window either polls or keeps that client, and the sidebar's switch meets the same wall.

- `GET /v1/watch?names=<a>,<b>` pushes one event a change, with the name and its revision. A case under `src/index` decides it
- the window's watch client hands each event on as a message. A case over a fake stream decides it
- `./RUNME.sh check` exits 0

view: none

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

The door serves `GET /v1/watch?names=<a>,<b>` through the `sse` package of the HTTP library, beside the values route in `src/index/v1.go`. The OpenAPI document then names the stream and its event.

- The door gains a commit channel. The `OnCommit` hook in `Serve` closes it on every commit and makes the next, the way `moved` does for the tick.
- The handler checks every name with `store.Declared` first. A name the catalog lacks answers a 404 problem, before the stream opens.
- It settles the scheduler once, as the values route does. It then sends one `change` event a name, carrying `name`, `revision` and `value`.
- It waits on the commit channel or the request's end. On each commit it reads a snapshot, and sends an event for each name whose JSON form moved.
- The window's client stands in `src/tui/registry/watch.go`. `V1.Watch` reads the stream's `data:` lines and hands each `Change` on, and ends with the stream.
- `Stream` runs a watch off the tab, and `Next` answers the next change as a message, so a tab arms `Next` again after each one.

Weighed: the event carries the value, so a tab makes no second read. It costs the bytes of a large value on each change, the same bytes a read costs. Assumed: a compare of JSON forms a name answers what moved, since the snapshot carries one revision for the whole store.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/index/door.go Serve, whose OnCommit hook closes the commit channel as well
- src/index/v1.go door.servesV1, which registers the watch
- src/tui/registry/v1.go V1, which gains Watch
- src/tui/registry/fake.go Fake, which gains the changes a case seeds

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/index/v1watch_test.go TestV1WatchSendsEachNamedValueOnConnect
- src/index/v1watch_test.go TestV1WatchSendsAChangeToANamedValue
- src/index/v1watch_test.go TestV1WatchAnswersANameTheCatalogLacksWithAProblem
- src/tui/registry/watch_test.go TestTheWatchHandsEachEventOnAsAMessage
- src/tui/registry/watch_test.go TestTheWatchEndsWithItsStream

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/index/v1.go
- src/index/door.go
- src/index/v1watch_test.go
- src/tui/registry/watch.go
- src/tui/registry/watch_test.go
- src/tui/registry/fake.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file and function the approach names stands opened on this branch, and the `sse` package stands in the module cache at the version go.mod names
- the callers list names each function the change reaches, found by git grep
- each done_when line names its test: the door cases, the registry cases, and the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/index src/tui/registry

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/index/v1watch_test.go
- src/tui/registry/watch_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The three door cases fail on their status and their bodies: `/v1/watch` answers the plain not-found page, and the stream ends before any event. The two registry cases compile against a stub `watch.go` and read an empty message. The fake needed a `Watch` of its own before the registry case compiled, so the stub carries one that hands nothing on.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a failing case: the door's stream, the window's client, and the check once both pass
- the door cases run a real door over a temp tree, as v1_test.go does. The registry cases run a local test server and registry.Fake, so no case reaches the box's own index

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- watch-refuses-before-it-streams: `sse.Register` in huma v2.36.0 wraps the handler in a `StreamResponse` that writes 200 and `text/event-stream` before `f` runs, so the handler cannot answer the 404 problem `TestV1WatchAnswersANameTheCatalogLacksWithAProblem` wants. The builder checks `store.Declared` in a `huma.Resolver` on the input, which huma runs before the handler and whose `StatusError` sets the status, or registers through `huma.Register` and returns `huma.Error404NotFound` before the `StreamResponse`
- watch-callers-name-opens-on: the `OnCommit` hook the approach extends stands in `opensOn` in `src/index/door.go`, not in `Serve`, so the callers line names `opensOn`

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

- watch-callers-name-opens-on: the approach and the callers line say `Serve`, and the engine freezes both. Read `opensOn` in `src/index/door.go` in their place. The `OnCommit` hook the commit channel extends stands there, and `Serve` only calls `opensOn` with `net.Listen`.
