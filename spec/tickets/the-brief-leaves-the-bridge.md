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
group: go-cage-switches-over
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d891eb165fd6 · claude-code-remote
    hash_before: b33a214d41b2df61bdb0c8709fecdfee19d25543
    hash_after: 904412bb702dbef9157103b0e2f9e28b6a8b56b5
    inputs:
      - name: ask
        hash: 19bd52b73471bf7a
        size: 735
      - name: [[spec/tickets/the-bridge-server-leaves]]
        hash: f6037bc7affa843e
        size: 247
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 40b0ad3f11a · claude-code-remote
    hash_before: 1f6b4296871cc195d1cf3dfcb725227bc3986d2e
    hash_after: 1f6b4296871cc195d1cf3dfcb725227bc3986d2e
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: bd62b8780e86dc2c
        size: 2200
    def: 08e16d07b0de477c
  - step: gate
    hand: box 40b0ad3f11a · claude-code-remote
    hash_before: 5eed27c129863a63369579d60ce91a812b0a53b9
    hash_after: 5eed27c129863a63369579d60ce91a812b0a53b9
    inputs:
      - name: design/draft
        hash: bd62b8780e86dc2c
        size: 2200
      - name: design/tests-red
        hash: e5b36c0792060d5c
        size: 1009
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 40b0ad3f11a · claude-code-remote
    hash_before: 93d3054fd0980c7485392d1979afd4d49dc0193c
    hash_after: 4a6f6e742dab8a999127fcf2289824fc910bf003
    returns: 1
    why: "the flip waits on start-road-starts-the-index: the cold probe found no hooks door in a fresh box, so the brief never reached the session. The Discussion carries the change that lands once the start road stands"
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/the-brief-leaves-the-bridge.md:304:450: Vocabulary: stepbrief stands outside the words this tree writes. Wr"
depends_on: ["brief-answers-off-the-door","prompt-answers-off-the-door","spawn-answers-off-the-door","clear-answers-off-the-door","level0-tools-leave-the-bridge","start-road-starts-the-index"]
---

# Ask

The brief, the canary debt and every event the bridge's `DOORS` table names answer off the hooks door.

The rules, the tools block and the canary come off `onSessionStart` and `onPromptContext` in `src/bridge/guidance.js`. A session with no bridge reads no rule, so [[spec/tickets/the-bridge-server-leaves]] waits.

- `doors` in `.claude/skills/level0/hooks/cage.js` answers true for every event the bridge's `DOORS` table names, in a case of `test/level0/cage.test.js`. `node --test test/level0/cage.test.js` decides it
- a session start posted to the hooks door answers the brief with the canary line, in a case of `src/modules/hooks`. `go test ./src/modules/hooks/...` decides it
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

This ticket flips the doors last, once five ports give every event of the bridge's DOORS table an answer off the hooks door. Today `Door.Hook` answers pass for every event but a tool call, a Stop and a spoke post. So a flip now drops the brief, the canary debt, the prompt's row, the helper layer and the clear.

1. brief-answers-off-the-door: the brief on the prompt context, the reset at a session start, the first call's layer, and the canary debt.
2. prompt-answers-off-the-door: the answer-first line as an event effect, and a Go writer of the session log's rows.
3. spawn-answers-off-the-door: the helper layer on a spawn.
4. clear-answers-off-the-door: the clear effect at a turn's end.
5. level0-tools-leave-the-bridge also answers the tool describe and agent answered events, and the tool registration a session start answers today.
6. This ticket then makes `doors` in cage.js answer true for every key of DOORS, and drops those doors from server.js and guidance.js.

The ask's second done line names a session start. The brief rides the prompt context, since `opensSession` answers `register` and no brief. The first child's case decides the line in that form.

What I weigh: each port lands alone and keeps the bridge answering its event until the flip, so every commit stands working. I assume the harness takes added context on the prompt context alone, as level0.js reads it today.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- .claude/skills/level0/hooks/cage.js: doors, DOORED
- .claude/skills/level0/hooks/level0.js: seen, which asks doors
- src/bridge/server.js: DOORS
- src/bridge/guidance.js: onSessionStart, onPromptContext

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/cage.test.js: the door decides every event the bridge's DOORS table names

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .claude/skills/level0/hooks/cage.js
- test/level0/cage.test.js
- src/bridge/server.js
- src/bridge/guidance.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the helper opened server.js, guidance.js, cage.js, level0.js and hooks.go, and I checked opensSession and DOORS myself
- the callers list names what the flip touches, and the five ports carry the rest
- the first done line meets the cage case, the second the first child's case, and the third the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/cage.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/cage.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The cage case fails on its own assertion: the door decides two events, and the bridge keeps the other thirteen its DOORS table names. The case reads the table through doorEvents, which server.js exports as it exports toolNames, so the list stands once.

The second done line rests on TestAPromptContextAfterAStartAnswersTheCanary in src/modules/hooks, which brief-answers-off-the-door landed and which stands green. The draft takes the prompt context form, since the session start answers no brief.

What surprises me: the comment over UNGUARDED in cage.js still named the read tools the last ticket dropped, so it now names the harness reads alone.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the cage case decides the first done line over the real DOORS table, and stands red
- the canary case decides the second line, green already, and the check line waits for tests-green
- the case reads doors alone, over no server and no disk

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- brief-owes-after-a-clear: the flip hands session.end and turn.said to the door, and the brief fold in src/modules/hooks/brief.go keeps two bridge rules nowhere. onSessionEnd in src/bridge/guidance.js opens the canary debt again after a clear, setting owes and dropping paid, and stepBrief takes no session.end. repeats in guidance.js logs HEARD.again where a paid session writes the canary line again, and the Go side logs nothing. Port both into stepBrief with a case each in brief_test.go before the flip lands

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the landed part touches the brief fold and its cases alone, and the flip stands back out of the tree
- the brief fold logs through the door, whose cases drive a temp tree
- each comment names the ticket, and the Discussion names the change the flip carries
- the canary words stand once on the Go side, pointing at HEARD in the plugin

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

The flip waits on [[spec/tickets/start-road-starts-the-index]]. The commit door's cold probe ran the flip in a fresh box. The tools reached the session, and the rules and the canary did not. The start road there brings up the bridge alone, and no hooks door answers at `.se/.runtime/hooks.json`, so the prompt context passes with no brief.

The change landing once the start road stands:

- `DOORED` in `cage.js` takes every event of the bridge's `DOORS` table
- `door` in `level0.js` hands an event effect on through `next`, and merges a describe's named after
- `door` merges the step's blocks and afters into the harness's answer
- `caged-door.test.js` gains a case for each of the three, and its prompt case reads the prompt reaching the door
- the doors case in `cage.test.js` reads the prompt context as the door's

The brief fold's log rows land ahead of the flip. The cold probe reads the context row naming the blocks, and the canary rows.
