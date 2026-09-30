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
step: gate
depends_on: ["tools-keep-their-own-names"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d89335a442109 · claude-code-remote
    hash_before: b06c5b5e74a9cb10d4139beefb905a116731fe73
    hash_after: b06c5b5e74a9cb10d4139beefb905a116731fe73
    inputs:
      - name: ask
        hash: c2115216999e4826
        size: 553
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d89335a442109 · claude-code-remote
    hash_before: f97e4782af32aa764fbb91a11c28b095dca045fa
    hash_after: f97e4782af32aa764fbb91a11c28b095dca045fa
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: dd884d28441201b2
        size: 5357
    def: 08e16d07b0de477c
---

# Ask

The patch, replace, undo and mint tools write through the Go write door, with the journal undo reads.

`src/bridge/apply.js` runs every write through `onWrite` in the bridge. Every file write in this tree goes through these tools, so the bridge cannot leave while it holds them.

- a patch lands atomically through the Go write door, and an undo puts the files back, in a case of `src/quack`. `go test ./src/quack/...` decides it
- a mint writes a note in its schema's shape, in a case of `src/quack`
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

A new IO module lands the edit tools in Go, and stays off the wiring until the flip, since the Go door lacks most rules the bridge's door runs.

1. A new IO module `src/modules/edits` holds the port. `apply.go` ports `applied` from `lib/apply.js` as `Applied(held, ops) Took`. It covers the exact, create, write, append, prepend and regex ops.
2. `edits/journal.go` ports `lib/undo.js` as `JournalOf`, `NameOf`, `NewestOn` and `Restores`. The JSON keys stay alike, so `commit-verb.js` and `pull-landed.js` read each entry unchanged.
3. `edits/edits.go` registers `edits/patch`, `edits/replace`, `edits/undo` and `edits/mint`. Each carries `q.ToolName` with `patch`, `replace`, `undo` or `mint_note`, plus `q.Doc` and `q.Writes`.
4. Each action lists one request to module `edits`, whose `NoUndo` names the journal. `edits.Accept` reads, judges, writes the journal, then writes the files.
5. The door moves into `src/modules/hooks/write`. `refusedVoice` leaves `hooks/writes.go` as `write.RefusedVoice`. A new `write.Judge` answers the schema refusal, then the voice refusal.
6. `Door.writeDoor` calls `write.Judge` for the handover. `write.TicketHow` exports `ticketHow`, and `command.TicketFault` checks the `ticket` field against it, as `unnamedIn` does in the bridge.
7. `src/quack/writedoor.go` gains `editDoor(root)`, which wraps `writeSchema` and `writeProse` in `write.Judge`. `accepts` in `src/quack/main.go` routes module `edits` to `edits.Accept`.
8. `modules` in `main.go` gains `edits`, and `spec/wiring.yaml` gains no line. The cage key reads new, so a wired module would answer the live tools at once.
9. `src/modules/check/mint.go` ports `mintNote` and `mintedNote` from `schema-mint.js`, over `front.Mint`, `ChaptersWanted`, `CheckNote`, `GovernorOf` and a newly exported `Minted`.
10. The replace action takes its file list from an injected sweep. `quack` wires it to the index's grep read, and the test hands a fake list.

What I weigh: holding the module off the wiring lands the Go side with no live flip, at the cost of one flip line later.
I assume the flip waits on a port of the door's missing rules: the bless file, conflict markers, the open-ticket door, engine fields, the owner, the private rule, code format and warnings.

Risks the gate may send out as children:
- the Go door lacks most rules onWrite runs, so the flip waits on their port
- Go regex takes no lookaround or backreference, so a pattern needs a parity case or a refusal naming it
- the flip must drop READ_TOOLS in level0.js, or the tools register twice
- the Go chapters stay flat, so a mint with nested steps differs from the JavaScript mint

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/writes.go: Door.writeDoor, which calls write.Judge and loses refusedVoice
- src/modules/hooks/write/door.go: ToolRefusal, which reads the exported TicketHow
- src/modules/hooks/write/refuse.go: RefusedVoice, moved in from hooks/writes.go
- src/modules/check/export.go: the alias block, which gains Minted
- src/quack/main.go: modules, which gains edits, and accepts, which routes module edits
- src/quack/writedoor.go: writeSchema and writeProse, which editDoor also calls
- src/quack/described_test.go: TestEveryModuleDescribesWhatItExposes, which now loads edits
- src/scripts/commit-verb.js and src/scripts/pull-landed.js: read the journal Go writes, unchanged
- src/index/tools.go: door.servesTools, which lists the edit tools once the flip wires them

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/edits_test.go: TestAPatchLandsAtomicallyThroughTheWriteDoor
- src/quack/edits_test.go: TestAFailingOpInAPatchWritesNothing
- src/quack/edits_test.go: TestAPatchTheSchemaRefusesWritesNoFile
- src/quack/edits_test.go: TestAPatchNamingNoOpenTicketWritesNothing
- src/quack/edits_test.go: TestAnUndoPutsEveryFileBack
- src/quack/edits_test.go: TestAnUndoRefusesAFileThatMovesSinceThePatch
- src/quack/edits_test.go: TestTheJournalReadsAsTheBridgeWritesIt
- src/quack/edits_test.go: TestAMintWritesANoteInItsSchemasShape
- src/quack/edits_test.go: TestAMintRefusesAPathAnotherKindGoverns
- src/quack/edits_test.go: TestTheEditModuleStandsOffTheWiring
- src/modules/edits/apply_test.go: TestEachOpReadsTheFileTheOpsBeforeItLeave
- src/modules/edits/journal_test.go: TestNewestOnWalksPastAnotherName
- src/modules/hooks/write/door_test.go: TestJudgeRefusesTheSchemaBeforeTheVoice
- src/modules/check/mint_test.go: TestMintFillsEachChapterTheSchemaNames

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/edits/edits.go, new
- src/modules/edits/apply.go, new
- src/modules/edits/journal.go, new
- src/modules/edits/apply_test.go, new
- src/modules/edits/journal_test.go, new
- src/modules/hooks/write/door.go
- src/modules/hooks/write/refuse.go
- src/modules/hooks/write/door_test.go
- src/modules/hooks/writes.go
- src/modules/check/mint.go, new
- src/modules/check/mint_test.go, new
- src/modules/check/export.go
- src/quack/main.go
- src/quack/writedoor.go
- src/quack/edits_test.go, new
- spec/design_output/apply.md, a pointer at the Go twin

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- a helper opened apply.js in both places, undo.js, write.js onWrite, tools.js and schema-mint.js line by line
- it opened writedoor.go, the write package, hooks/writes.go, command/ticket.go, tool.go, index/tools.go and Door.calls
- the first done line meets the patch and undo cases, the second the mint cases, and the third the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/quack/edits_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/edits_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every case reds on its own assertion. Each call answers that edits/patch, edits/undo or edits/mint names no action, and the case names the file, journal entry or note it wants.

The cases drive the quack index by action name over a temp tree, so they compile before the edits module stands. What surprises me: the off-wiring case passes today, since no line names the module yet. It guards the choice to hold the module off the wiring.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the first done line meets the patch and undo cases, the second the two mint cases, and the third the check at tests-green
- the cases build each tree in a temp folder, and reach no door past the quack index they open

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
