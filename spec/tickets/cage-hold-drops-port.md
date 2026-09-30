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
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d88b829f8cd8 · claude-code-remote
    hash_before: 233bbd3c48bcc166a13cf88f39b3215046dfdf4d
    hash_after: 233bbd3c48bcc166a13cf88f39b3215046dfdf4d
    inputs:
      - name: ask
        hash: a34b00a52e331586
        size: 749
      - name: [[spec/tickets/cage-call-holds-port]]
        hash: bc49d4efc513831a
        size: 986
      - name: [[spec/tickets/the-bridge-server-leaves]]
        hash: f6037bc7affa843e
        size: 247
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d88b829f8cd8 · claude-code-remote
    hash_before: e534d81c0a86285645577efd0b2d190036e7fb00
    hash_after: e534d81c0a86285645577efd0b2d190036e7fb00
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: 5cfd65b6199235a5
        size: 3793
    def: 08e16d07b0de477c
  - step: gate
    hand: box d88d1fd844dd · claude-code-remote
    hash_before: 42e12dd5d26940213ed80ca4e8a535bc972fa08e
    hash_after: 42e12dd5d26940213ed80ca4e8a535bc972fa08e
    inputs:
      - name: design/draft
        hash: 5cfd65b6199235a5
        size: 3793
      - name: design/tests-red
        hash: bbc2060d52184a48
        size: 1346
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d88d1fd844dd · claude-code-remote
    hash_before: 9ff456fc2000f682458faa9ff12196db495e329a
    hash_after: 9ff456fc2000f682458faa9ff12196db495e329a
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/cage-write-door-port.md:319:3: Sentence: A sentence holds 25 words. Cut this one in two."
    def: f150b8c0dc20fe45
---

# Ask

The Go side drops what a hold sets, where the bridge drops it. The drops:

- `stop.hold` back to off at the turn's end, off `dropsHold` in `src/bridge/stop.js`
- `ask.wanted` back to quiet once the update pays, off `dropsAsk` in `src/bridge/ask.js`

The holds port in [[spec/tickets/cage-call-holds-port]] reads the config alone, and writes none of it.

Without it, the switch keeps an owner's hold standing past the turn it holds, once [[spec/tickets/the-bridge-server-leaves]] lands. Every later call then meets a hold nobody set.

- a turn's end writes `stop.hold` off, and a paid update writes `ask.wanted` quiet, in a case of `src/modules/hooks`. `go test ./src/modules/hooks/...` decides it
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

The holds fold names each drop, and the door writes it.

The fold in `src/modules/hooks/fold.go` stays pure:

- `Said` gains `Drops`, the keys the event writes back and the value each takes
- `turnEnds` reads the held `stop.hold`, as `dropsHold` in `src/bridge/stop.js` does. At `finish` or `stop` it names the drop to `off`, and keeps the hold as `Holds.Stood`
- `Stood` is the mark `holdHere` reads, so the stop rules port finds the hold that ended the turn. A prompt that no helper sends clears it, as `sawPrompt` does
- `paid` takes the held config. Where the demand pays an update, it clears `Asked` as today
- where the held `ask.wanted` still equals the paid update, `paid` names the drop to `quiet`. A value pressed since stands, as `dropsAsk` in `src/bridge/ask.js` leaves it
- a helper's event moves nothing, as today, so a helper drops no hold

`Door.writes` in `src/modules/hooks/hooks.go` stamps the held config on every event, since a pay rides a display, a spoke post, a report or a turn's end. Today it stamps a tool call alone.

`Door.Hook` reads the fold's `Said.Drops` at the event's own place and hands each to `Outside.Drop`, in key order. A door with no Drop writes nothing. A failing write leaves the answer standing, as the shadow write does.

`src/config/config.go` gains `Drop(root, key, value)`. It writes one key into the local layer `Local` names and keeps every other key, as `writes` in `src/bridge/config.js` does. `listensHooks` in `src/quack/main.go` wires it as `Outside.Drop`, since `src/config` owns the layer's path and its reader.

What I weigh: the fold could write the file itself, but a fold holds no IO, and its replays run over no disk. Stamping every event costs a read of the config a post, which the tool calls pay today already. The stood mark lands here because the drop and the mark are one move in `dropsHold`. The stop rules port reads it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/hooks.go: Registers registers stepHolds as the holds fold
- src/modules/hooks/hooks.go: Door.writes lands each event on the holds fold
- src/modules/hooks/hooks.go: Door.Hook answers each post
- src/modules/hooks/holds.go: Door.held reads the fold's Said
- src/quack/main.go: listensHooks builds hooks.Outside
- src/quack/hook_test.go: builds hooks.Outside
- src/quack/hooks_test.go: builds hooks.Outside
- src/modules/hooks/hooks_test.go: doorOver builds Outside
- src/modules/hooks/fold_test.go: drives stepHolds

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/fold_test.go: TestATurnsEndDropsTheOwnersHold
- src/modules/hooks/fold_test.go: TestAPaidUpdateDropsTheAsk
- src/modules/hooks/fold_test.go: TestAnAskPressedSinceStandsAtItsPay
- src/modules/hooks/fold_test.go: TestAPromptClearsTheStoodHold
- src/modules/hooks/holds_test.go: TestTheDoorWritesEachDropItsFoldNames
- src/config/config_test.go: TestDropWritesOneKeyOfTheLocalLayer

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/hooks/fold.go
- src/modules/hooks/fold_test.go
- src/modules/hooks/hooks.go
- src/modules/hooks/holds_test.go
- src/config/config.go
- src/config/config_test.go
- src/quack/main.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every file and function named stands opened: dropsHold, holdHere and sawPrompt in src/bridge/stop.js, dropsAsk and asksForUpdate in src/bridge/ask.js, writes in src/bridge/config.js, endsTurn in src/bridge/server.js, stepHolds, turnEnds, paid and asksForUpdate in fold.go, Door.writes and Door.Hook in hooks.go, heldOf in holds.go, commandSettings in src/quack/command.go, and config.go, which holds Local and no writer
the callers list names every builder of Outside, found by grep over src, and every reader of the fold's Said
the first done_when line meets the fold tests for each drop and TestTheDoorWritesEachDropItsFoldNames, and the check line meets ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks src/config

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/fold_test.go
- src/modules/hooks/holds_test.go
- src/config/config_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Four tests stand red on their own assertion:

- `TestATurnsEndDropsTheOwnersHold`: the fold names no drop at the turn's end
- `TestAPaidUpdateDropsTheAsk`: the pay names no drop
- `TestTheDoorWritesEachDropItsFoldNames`: the door writes nothing, in both cases
- `TestDropWritesOneKeyOfTheLocalLayer`: the writer stands empty

Two stand green before the change, as guards: `TestAPromptClearsTheStoodHold` and `TestAnAskPressedSinceStandsAtItsPay`. Each holds the fold back from a drop it must not make, so it goes red where the change drops too much.

The scaffold adds the fields `Said.Drops`, `Holds.Stood` and `Outside.Drop`, the word `offHold`, and a `config.Drop` that writes nothing. The tests build, and fail on what they assert.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the first done_when line meets TestTheDoorWritesEachDropItsFoldNames and the fold tests, red now; the check line stands a checkpoint the implement step answers with ./RUNME.sh check
every door the tests reach has a fake: the door's writer through a recording Drop, the tree through t.TempDir, and the index through q/qtest in doorOver; the config test writes a root under t.TempDir, as every other case of that file does

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- the approach answers the ask: the fold names each drop as dropsHold and dropsAsk decide it, the door hands each to Outside.Drop, and config.Drop writes one key of the local layer as writes in src/bridge/config.js does
- done_when one meets TestATurnsEndDropsTheOwnersHold, TestAPaidUpdateDropsTheAsk and TestTheDoorWritesEachDropItsFoldNames, red now, with two green guards against a drop too many; done_when two is the check the implement answers
- fix in place: writes in src/bridge/config.js joins the layer under box.work, so config.Drop writes under the root the post names, the work root, and makes the whole folder of the layer, where the bridge makes .se alone
- weighed: the stood mark lands here beside the drop, since dropsHold sets both in one move, and the stop rules port reads it

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

the change touches the files the draft names, plus src/config/door.go, which holds every disk call of that package, holds.go, where Door.drops stands beside Door.held so hooks.go stays under the ceiling, and trunk.go with its test, for a bare number the commit guards port left
every door the change reaches has a fake: the writer through a recording Drop, the config test under a temporary root, and the index through q/qtest
a comment above each new function names the approach and links the ticket
the bridge owns the drop rules, the fold ports them once, and the copied layer path carries a comment naming its owner

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

The tests the implement lands beside, as the commit door reads them:

    ./RUNME.sh test src/modules/hooks/fold_test.go src/modules/hooks/holds_test.go src/config/config_test.go src/quack/hold_drops_test.go
