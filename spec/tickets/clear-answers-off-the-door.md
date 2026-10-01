---
kind: [[ticket]]
state: open
step: gate
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
      - name: draft-2
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
      - name: tests-red-2
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft-2
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
    input: ["design/draft", "design/tests-red", "design/draft-2", "design/tests-red-2"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate", "design/draft-2"]
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
        input: ["design/tests-red", "design/tests-red-2"]
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
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d891eb165fd6 · claude-code-remote
    hash_before: f172a62732769c951cd8322939aa0ee246e35031
    hash_after: f172a62732769c951cd8322939aa0ee246e35031
    inputs:
      - name: ask
        hash: 347f33be92470662
        size: 650
      - name: [[spec/tickets/the-brief-leaves-the-bridge]]
        hash: 19bd52b73471bf7a
        size: 735
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d891eb165fd6 · claude-code-remote
    hash_before: 5d0bb60737cc2b7b80e0558ecd33ccd4214f25d9
    hash_after: 5d0bb60737cc2b7b80e0558ecd33ccd4214f25d9
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 33c98a0ec2e70d0b
        size: 2292
    def: 08e16d07b0de477c
  - step: gate
    hand: box 3cd847cb11c · claude-code-remote
    hash_before: 455604d60a7ba74166a56ffb02d1d8b45ae5a360
    hash_after: 455604d60a7ba74166a56ffb02d1d8b45ae5a360
    returns: 1
    why: "step 3 of the approach falls: `door` in .claude/skills/level0/hooks/level0.js hands a step's answer straight to the harness, and `clears` runs on the bridge's answer alone, at the `answer.clear` line of `seen`. Add the door road's clear to level0.js and the size list, with a case driving it to `$.prompt.submit`, as test/level0/caged-door.test.js drives the door.; `turn.complete` stands outside `DOORED` in .claude/skills/level0/hooks/cage.js, so the door never meets the event the approach answers. Name the ticket that adds it, or add it here with a case."
  - step: design/draft-2
    hand: box 3cd847cb11c · claude-code-remote
    hash_before: 5dd78f1182e51eb5962fd08bb226d08074b05947
    hash_after: 5dd78f1182e51eb5962fd08bb226d08074b05947
    inputs:
      - name: ask
        hash: 347f33be92470662
        size: 650
      - name: [[spec/tickets/the-brief-leaves-the-bridge]]
        hash: 19bd52b73471bf7a
        size: 735
    def: 2fcb4abe3d77d8a2
  - step: design/tests-red-2
    hand: box 3cd847cb11c · claude-code-remote
    hash_before: e5ca754552b1d673078da0e4e087eb22ff449980
    hash_after: e5ca754552b1d673078da0e4e087eb22ff449980
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft-2
        hash: 9a9409f1129baf82
        size: 3610
    def: 9c7cd4dd4a2dadb8
group: go-cage-switches-over
---

# Ask

The hooks door answers the clear at a turn's end, so a session due hands over with no bridge.

`endsTurn` in `src/bridge/server.js` answers `clear` through `clearsAfter`. The door has no `clear` effect, so the handover stops at the clear ticket once [[spec/tickets/the-brief-leaves-the-bridge]] flips the doors.

- a turn complete with the clear in hand answers a `clear` effect, in a case of `src/modules/hooks`. `go test ./src/modules/hooks/...` decides it
- `stepOf` in the cage maps the `clear` effect, in a case of `test/level0/cage.test.js`. `node --test test/level0/cage.test.js` decides it
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

The stops fold decides the clear at the turn's end, and the door answers it as a clear effect, as `clearsAfter` in src/bridge/handover.js does.

1. At a turn complete of the main agent whose reason reads answer and whose handover stands at clear, `stepStops` in src/modules/hooks/stops.go drops the handover as today. Where `clearsHere` holds, it also says a clear word carrying the resume prompt. The prompt is `RESUME` in handover.js, spelled again under a pointer.
2. `Door.Hook` in hooks.go answers that word as a clear effect whose text holds the prompt. It follows the stops fold's block answer, which reads a Stop alone.
3. `stepOf` in .claude/skills/level0/hooks/cage.js maps a clear effect to an answer carrying pass and the clear prompt. `door` in level0.js already runs `clears` on `answer.clear`.

The bridge keeps answering the turn's end until the-brief-leaves-the-bridge flips the doors, so this lands alone. What I weigh: the fold already holds the handover phase and the binding at the turn's end, so the decision stays pure and one effect carries it. I assume the turn complete event carries the facts the stops fold reads, since `stoppedOf` reads the holds on it today.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/stops.go: stepStops, at the turn complete
- src/modules/hooks/hooks.go: Door.Hook, which answers the clear
- .claude/skills/level0/hooks/cage.js: stepOf
- .claude/skills/level0/hooks/level0.js: door, which reads stepOf and runs clears

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/clear_test.go: TestATurnCompleteWithTheClearInHandAnswersTheClear
- src/modules/hooks/clear_test.go: TestATurnCompleteOffTheQueueKeepsTheConversation
- test/level0/cage.test.js: a clear effect answers the clear prompt

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/hooks/stops.go
- src/modules/hooks/hooks.go
- src/modules/hooks/clear_test.go, new
- .claude/skills/level0/hooks/cage.js
- test/level0/cage.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened endsTurn in server.js, clearsAfter and RESUME in handover.js, stepOf in cage.js, clears in level0.js, and stepStops and holdsForHandover in stops.go, and each claim holds there
- the callers list names the fold, the door, the cage's step and its reader
- the first done line meets the clear case, the second the cage case, and the third the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks/clear_test.go test/level0/cage.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/clear_test.go
- test/level0/cage.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The clear case reds on its own assertion: the door answers pass at the turn's end, with the clear in hand. The cage case reds too, since `stepOf` drops a clear effect and answers nothing.

The case off the queue passes today, and it holds the edge: a binding moved off the queue keeps the conversation. What surprises me: the red list takes the whole cage test file out of the check until tests-green, its passing cases among them.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the first done line meets the clear case, the second the cage case, and the third the check at tests-green
- the cases reach a temp tree and the fake index the package already uses, and the cage case reaches no door

## draft-2

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The stops fold decides the clear at the turn's end, and the door answers it as a clear effect, as `clearsAfter` in src/bridge/handover.js does. The plugin's door road runs the clear the effect carries.

1. At a turn complete of the main agent whose reason reads answer and whose handover stands at clear, `stepStops` in src/modules/hooks/stops.go drops the handover as today. Where `clearsHere` holds, it also says a clear word carrying the resume prompt. The prompt is `RESUME` in handover.js, spelled again under a pointer.
2. `Door.Hook` in hooks.go answers that word as a clear effect whose text holds the prompt. It follows the stops fold's block answer, which reads a Stop alone.
3. `stepOf` in .claude/skills/level0/hooks/cage.js maps a clear effect to an answer carrying pass and the clear prompt.
4. `door` in .claude/skills/level0/hooks/level0.js hands an answer carrying `clear` to `clears`, as `seen` does with the bridge's answer. Today `door` returns a step's answer to the harness, so no clear runs.

The event: `turn.complete` stands in the bridge's `DOORS` table, and the-brief-leaves-the-bridge makes `doors` in cage.js answer true for every event that table names. So this ticket answers the event once it reaches the door, and adds no event to `DOORED` itself.

The bridge keeps answering the turn's end until that flip, so this lands alone. What I weigh: the fold already holds the handover phase and the binding at the turn's end, so the decision stays pure and one effect carries it. I assume the turn complete event carries the facts the stops fold reads, since `stoppedOf` reads the holds on it today.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/modules/hooks/stops.go: stepStops, at the turn complete
src/modules/hooks/hooks.go: Door.Hook, which answers the clear
.claude/skills/level0/hooks/cage.js: stepOf
.claude/skills/level0/hooks/level0.js: door, which hands a clear answer to clears
.claude/skills/level0/hooks/level0.js: clears, which runs the clear and the resume prompt, unchanged

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/modules/hooks/clear_test.go: TestATurnCompleteWithTheClearInHandAnswersTheClear
src/modules/hooks/clear_test.go: TestATurnCompleteOffTheQueueKeepsTheConversation
test/level0/cage.test.js: a clear effect answers the clear prompt
test/level0/door-clear.test.js: a door answer carrying a clear runs the clear and submits the resume prompt

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

the gate's first finding, that door returns a step's answer and never runs clears: step 4 hands a clear answer to clears, and door-clear.test.js drives the door road to $.command.run and $.prompt.submit
the gate's second finding, that turn.complete stands outside DOORED: the-brief-leaves-the-bridge adds every event of the bridge's DOORS table, turn.complete among them, so this ticket names that ticket and adds no event. The door-clear case posts a tool call, which the door meets today, since the clear call reads no event

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/modules/hooks/stops.go
src/modules/hooks/hooks.go
src/modules/hooks/clear_test.go, new
.claude/skills/level0/hooks/cage.js
.claude/skills/level0/hooks/level0.js
test/level0/cage.test.js
test/level0/door-clear.test.js, new

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened door, seen and clears in level0.js, doors and DOORED in cage.js, DOORS and endsTurn in server.js, clearsAfter in handover.js, and the ask of the-brief-leaves-the-bridge, and each claim holds there
the callers list names the fold, the door, the cage's step, and the plugin's door road and its clear
the first done line meets the clear case, the second the cage case, the third the check, and the door-clear case holds the road the gate found missing

## tests-red-2

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks/clear_test.go test/level0/cage.test.js test/level0/door-clear.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/modules/hooks/clear_test.go
test/level0/cage.test.js
test/level0/door-clear.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The round's new case, test/level0/door-clear.test.js, fails on its own assertion: the door's clear effect reaches the harness as no answer, so the event goes on and no clear runs. The cases of the first round stand red as before: the clear case in clear_test.go and the cage case in cage.test.js.

What surprises me: cage.test.js also holds a red case of log-report-stop-in-go, which names the bridge's tools table, so that file stays out of the check until both tickets pass tests-green.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the first done line meets the clear case, the second the cage case, the third the check at tests-green, and the gate's road finding meets the door-clear case
the door-clear case runs over a fake disk, a fake door answering a clear, and fake command and prompt calls

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

reject
- step 3 of the approach falls: `door` in .claude/skills/level0/hooks/level0.js hands a step's answer straight to the harness, and `clears` runs on the bridge's answer alone, at the `answer.clear` line of `seen`. Add the door road's clear to level0.js and the size list, with a case driving it to `$.prompt.submit`, as test/level0/caged-door.test.js drives the door.
- `turn.complete` stands outside `DOORED` in .claude/skills/level0/hooks/cage.js, so the door never meets the event the approach answers. Name the ticket that adds it, or add it here with a case.

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
