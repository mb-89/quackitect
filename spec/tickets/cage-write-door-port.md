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
depends_on: [cage-command-rules-port]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d88b829f8cd8 · claude-code-remote
    hash_before: 8c35e8670417d30a5c6e7374ffa717890e1ace64
    hash_after: 8c35e8670417d30a5c6e7374ffa717890e1ace64
    inputs:
      - name: ask
        hash: 106cb5766c01d2f3
        size: 947
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d88b829f8cd8 · claude-code-remote
    hash_before: 59bb98b16071cf39b654e9898d00087a426bd2a2
    hash_after: 59bb98b16071cf39b654e9898d00087a426bd2a2
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: d67a71ab464aed7f
        size: 5545
    def: 08e16d07b0de477c
  - step: gate
    hand: box d88d1fd844dd · claude-code-remote
    hash_before: 0469b97a776cad4283c8482fe50718136dcaa4a4
    hash_after: 3c198f670833937837f2dfbf7d369c5cfd2ae4d4
    inputs:
      - name: design/draft
        hash: d67a71ab464aed7f
        size: 5545
      - name: design/tests-red
        hash: a142e138d4d49227
        size: 1604
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d88f0683f2d7 · claude-code-remote
    hash_before: a174d8d64135c4e38bb990e30a6016d8d77b789a
    hash_after: 35a84b0d7c4489a5a56aad932b17b35bd9228e11
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/cage-write-door-port.md:349:39: Vocabulary: ticketdoor stands outside the words this tree writes. Write a c"
    def: f150b8c0dc20fe45
---

# Ask

The `hooks` IO module refuses every Write, Edit, MultiEdit and NotebookEdit the bridge's write door refuses, with the same reason. The rules:

- a write naming no ticket, off `onToolWrite` in `src/bridge/write.js`
- the bless file, the conflict markers and the open ticket door
- the fields the engine owns, and a projection's owner
- the private rule, the schema and the voice

The Go checks under `src/modules/check` answer the schema, the markers and the private rule already, so the door calls them.

Without it, the cage key moving to `new` lets a write land that names no ticket. A write past its schema lands too.

- each rule meets a recorded log under `test/replay/cage`, and its `.shadow.jsonl` holds no row that rule decides. `go test ./src/modules/hooks/...` decides it
- each rule's refusal text reads as the bridge's text for the same write, in a table case of `src/modules/hooks`
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

The port keeps the order `onToolWrite` and `onWrite` in `src/bridge/write.js` give a harness write. `Door.refuses` in `src/modules/hooks/hooks.go` routes Write, Edit, MultiEdit and NotebookEdit to a new `Door.writeDoor`, beside the Agent and Bash roads. The god binding passes it, as `letsThrough` does. A harness write takes one of three roads:

- a path outside the root passes, since `onWrite` passes an outside path after the bless check, and the bless file stands inside the root
- a path inside the root other than `.se/HANDOVER.md` meets the no-ticket refusal, in the text `toolRefusal` in `src/engine/named.js` writes, `FIELD_HOW` included
- the handover meets the rest of `onWrite`: the schema door, then the voice door

The bless file, the conflict markers, the open ticket door, the fields the engine owns and the private rule each stand behind the no-ticket refusal on a harness write. The bless file and every ticket stand inside the root and off the handover. `privateDoor` skips `.se/`, and the owner door finds no projection there, since `spec/config/projections.json` targets nothing under `.se/`. So the hook answers each of those writes with the no-ticket refusal, and the port holds that answer per rule. A Go copy of `engineRestores` or `ticketDoor` decides no hook answer, so no test holds it. Those rules move with the patch tool's port, which calls `onWrite` inside the tool. A private note carries that.

Pure reads land in a new package `src/modules/hooks/write`, ported line for line with the refusal text alike:

- `write/door.go`: `ToolRefusal`, `Outside` off `outside`, `WholeAfter` off `wholeAfter`, and the handover road off `schemaDoor`, which calls `check.GovernorOf`, `check.KindOf` and `check.CheckNote`
- `write/refuse.go`: `RefusedKind` and `RefusedNote` off `lib/schema.js`, and `RefusedVoice` off `lib/refuse.js` `refusal`, sharing the body `command.RefusedCommand` writes

IO stays in the `hooks` module, in a new `writes.go`: it reads the file on disk through `disk{root}` for an Edit, and the schemas under `spec/schemas`. A new `Outside.Prose` takes a root, a path and a text, and answers the findings Vale and `src/prose` keep. `listensHooks` in `src/quack/main.go` wires it as the commit port wires `Outside.Voice`. The door splits refusals from form through the split the commit port lands in `command/voice.go`. A door with no Prose reads no voice.

The evidence follows the road the commit port took:

- `test/replay/cage/write-door-cases.json` holds a tree and per case the write, the kept voice findings, and the bridge's decision and text
- `test/level0/write-door-cases.test.js` drives `onToolWrite` over those cases, so a drift in the bridge reads there first
- `.se/scripts/write-door-log.mjs` prints `write-door.jsonl` off the bridge's own answers: a row a listed rule, with a `write-door.box.json` carrying the files and the voice
- `cage_test.go` `boxOf` reads `prose` off the box file into `Outside.Prose`, so the replay meets each row with an empty golden shadow
- the Write row of `every-refusal.shadow.jsonl` leaves the golden file

What I weigh: the ask names every rule of `onWrite`, and a harness write reaches three roads of it. Porting the unreachable rules costs a large Go copy of the ticket engine that no hook answer tests. Holding each rule's answer at the hook meets the ask's done lines as the cage reads them. The cost: a later patch port writes those rules anew, and the note names that. I assume the cage reads harness writes alone, since the bridge answers a patch call inside its tool.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/hooks.go: Door.refuses routes the write tools to Door.writeDoor
- src/modules/hooks/hooks.go: Door.Hook calls Door.refuses
- src/quack/main.go: listensHooks builds hooks.Outside with Prose
- src/modules/hooks/cage_test.go: TestReplayLogAnswersEveryRecordedLog builds the replay door
- src/modules/hooks/cage_test.go: boxOf and readsOf read the box file
- src/quack/hook_test.go: builds hooks.Outside
- src/quack/hooks_test.go: builds hooks.Outside

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/write/door_test.go: TestToolRefusalReadsTheBridgesText
- src/modules/hooks/write/door_test.go: TestWholeAfterAppliesEachEdit
- src/modules/hooks/writes_test.go: TestTheWriteDoorRefusesWhatTheBridgeRefuses, over write-door-cases.json
- src/modules/hooks/cage_test.go: TestReplayLogAnswersEveryRecordedLog, over write-door.jsonl
- test/level0/write-door-cases.test.js: the bridge answers each shared write case

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/hooks/hooks.go
- src/modules/hooks/writes.go
- src/modules/hooks/writes_test.go
- src/modules/hooks/cage_test.go
- src/modules/hooks/write/door.go
- src/modules/hooks/write/door_test.go
- src/modules/hooks/write/refuse.go
- src/quack/main.go
- test/replay/cage/write-door-cases.json
- test/replay/cage/write-door.jsonl
- test/replay/cage/write-door.box.json
- test/replay/cage/write-door.shadow.jsonl
- test/replay/cage/every-refusal.shadow.jsonl
- test/level0/write-door-cases.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened write.js, named.js, projection.js, projections.json, the handover schema, hooks.go, cage.go, cage_test.go, commits_test.go and the check exports, and checked each claim there
- the callers list names Door.refuses, Door.Hook, listensHooks, the replay's box readers and both quack tests building Outside
- the per-rule logs with an empty shadow decide the first done line, TestTheWriteDoorRefusesWhatTheBridgeRefuses decides the text line, and ./RUNME.sh check decides the last

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/writes_test.go
- src/modules/hooks/write/door_test.go
- src/modules/hooks/cage_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

`TestTheWriteDoorRefusesWhatTheBridgeRefuses` stands red on its own assertion in each case the bridge refuses, and green in each case it lets through. Today the door passes every harness write. The bridge twin `test/level0/write-door-cases.test.js` passes every case.

The replay stands red on `write-door`, `write-voice` and `every-refusal`, since the Write row leaves the golden file of the last. `write/door_test.go` stands red on the stubs of `ToolRefusal` and `WholeAfter`.

The surprises:

- the bridge's `decide` consumes the handover on its first read, so a recorded handover Edit reads no file and refuses on the kind. The log carries handover Writes alone, and the table drives each handover Edit through `onToolWrite` straight
- a live hook row carries no root, and the recorded logs stand under a fake root. The replay maps that root onto its own tree through `movedRoot`, which moves only the every-refusal Write and a Read of the older logs
- the bless guard reads a script's text, so the fill script takes the bless path off `BLESS_FILE`

The scaffold adds `Outside.Prose` and the `write` package with `Finding`, so the red tests build.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done line meets a red test: the replay over write-door, write-voice and every-refusal, the table test for the text, and the check at tests-green
- the doors the tests reach have fakes: `taughtProse` for Vale, and a temp tree off `stopTreeOf` for the disk

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- the approach answers the ask as the cage reads it: a harness write reaches three roads of onWrite, an outside path, the no-ticket refusal and the handover's schema and voice, and the rules behind the no-ticket refusal each answer with that refusal at the hook
- done_when one meets TestReplayLogAnswersEveryRecordedLog over write-door, write-voice and every-refusal, red now; done_when two meets TestTheWriteDoorRefusesWhatTheBridgeRefuses; done_when three is the check the implement answers
- fix in place: the rules the patch tool answers inside its tool travel on a private note, which stands on one box; the implement writes that line under Discussion of the-bridge-server-leaves, which owns where the patch tool runs once the bridge leaves
- fix in place: the bridge twin moved to test/contract/write-door-cases.test.js, since it reads the live schemas off the disk door
- fix in place: src/quack/main.go stands near the file ceiling, so the Prose wiring moves a coherent piece of it into a new file first, or wires through command.go as the stop port did
- weighed: porting engineRestores and ticketDoor costs a Go copy of the ticket engine that no hook answer tests, so the port holds each rule's answer at the hook

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

- the change touches the files the draft names, plus the ones the import rules forced: the Schema port in src/quack/writedoor.go, the StrangerFault export and the two Go wordings in src/modules/check, and the Refuses and Cut exports in the command package
- every door the change reaches has a fake: taughtProse and taughtSchema teach the hooks tests, and TestTheSchemaPortAnswersWhatEveryWriteTableTeaches holds the taught schema answers to the real check
- each new file opens with a header naming this ticket and the bridge function it ports
- the refusal wording stands once in src/modules/hooks/write, and the Discussion of the-bridge-server-leaves points here for the rules the patch tool keeps

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
