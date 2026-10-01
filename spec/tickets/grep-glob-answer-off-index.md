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
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 3bb3757611c · claude-code-remote
    hash_before: dad4ec434d69a34c0838b48e8a34359285be598f
    hash_after: 29ff61ebbb42f7b79308ed5e7465a0f7c19851cc
    inputs:
      - name: ask
        hash: c27601d44e8c7e54
        size: 498
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 3cd847cb11c · claude-code-remote
    hash_before: 491b20f90139c4de92eb1c2ecfba4c7b47ee6b8e
    hash_after: 491b20f90139c4de92eb1c2ecfba4c7b47ee6b8e
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: b554f8da3399cec8
        size: 8434
    def: 08e16d07b0de477c
---

# Ask

Grep and Glob answer off the index through the hooks door, as `answersFromIndex` in the bridge answers them.

Under `new` the cage passes Grep and Glob to the harness, so a search reads the disk and misses what the index holds. The loss stands today.

- a Grep call answers the index's lines, in a case of `src/modules/hooks`. `go test ./src/modules/hooks/...` decides it
- a Glob call answers the index's paths, in a case of `src/modules/hooks`
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

Grep and Glob answer off the index inside the hooks door, over the `Reads` seam the sibling find-and-wait-in-go opens. The door ports `answersFromIndex`, `asked` and `said` from the bridge, and passes to the harness wherever the bridge passes.

1. `src/index/ops.go`: `Reads` gains `Grep(ask GrepAsk) (GrepSaid, error)` and `Glob(ask GlobAsk) (GlobSaid, error)`. `readKeep` answers them through `Grep(k.db, ask)` and `Glob(k.db, ask)` in `src/index/grep.go`, the same calls `door.answers` makes for the methods `grep` and `glob`.
2. `src/modules/hooks/hooks.go`: `Outside` gains `Index func(method string, params map[string]any) (map[string]any, error)`. `onlyQ` in `src/imports/imports.go` keeps a module from importing `src/index`. So the seam carries the wire shape the bridge reads off `box.index.ask`, and `src/index` keeps the one owner of the ask and answer types.
3. A new `src/modules/hooks/search.go` ports `asked`, `grepAsked`, `globOf`, `KINDS` and `globAsked` from `.claude/skills/level0/lib/index.js`. It also ports `said`, `grepSaid`, `globSaid`, `row` and `cut`, and `globShape` and `grepShape` from `src/bridge/search.js`. Every answer line stays word for word, `HEAD_LIMIT` included.
4. `Door.searches(e)` answers `Effect{Kind: resultKind, Result: shape}`, where shape is `globShape` or `grepShape`. It reads each field through `callField`, so a flat event and one nesting `input` both reach it. It passes in every case where `answersFromIndex` returns `PASS`: no `Index`, no ask, an absolute `path`, or an `Index` error.
5. `Door.Hook` tries `d.searches` after `d.refuses` and before `d.calls`, on `toolEvent` alone. `tool.Action` names no action for Grep or Glob, so `d.calls` passes them today.
6. `NewDecisionOf` in `src/modules/hooks/cage.go` reads a result effect with an empty `Text` as `PassWord`. Today it reads every result on a tool short of `tool.Prefix` as `RefuseWord`. Without the change, a live shadow and `ReplayLog` would read an index answer as a refusal, while `OldDecisionOf` reads the bridge's own answer as a pass.
7. `src/quack/main.go`: `listens` and `listensHooks` take `reads index.Reads`, and `manages` hands them the reads the sibling's fifth `Manage` argument carries. `listensHooks` sets `Outside.Index` to `indexAsk(reads)` where reads stands, and leaves it nil otherwise.
8. A new `src/quack/searches.go` holds `indexAsk(reads)`. It decodes the params into `index.GrepAsk` or `index.GlobAsk` through JSON and calls `reads.Grep` or `reads.Glob`. It encodes the answer back into a map, so the door reads what `se-index` prints.
9. `src/quack/finds_test.go`: `fakeReads` gains `Grep` and `Glob`, since the wider interface stops it compiling otherwise.

Boundaries with sibling tickets:
- find-and-wait-in-go owns `ReadsOf`, `Find`, the fifth `Manage` argument and `door.manages` passing `ReadsOf(one.db)`. This ticket adds Grep and Glob to that seam alone.
- level0-tools-leave-the-bridge owns dropping `answersFromIndex` and the Grep and Glob lines of `TOOLS` in `src/bridge/server.js`. This ticket leaves the bridge serving.
- `warmIndex` and the bridge's `reads the rows` log line drop out on the Go side. The Go index stands up with the manager, and the door holds no session logger.

What I weigh: a map seam over JSON keeps the module inside `onlyQ`, and leaves `src/index` the one owner of the ask and answer types. It costs typed fields at the door, which the bridge never had either.

I assume: find-and-wait-in-go lands its fifth `Manage` argument first, so this ticket takes `depends_on` on it. The harness takes the hook's returned shape as the Grep or Glob tool result, as it does for the bridge's `answer.result`. `stepOf` in `.claude/skills/level0/hooks/cage.js` returns `one.result` unchanged, so the client needs no change.

Risks:
- `passesOn` in `src/modules/hooks/brief.go` reads a single pass alone, so a Grep answered off the index carries no brief, and its canary waits for the next pass
- Go regexp takes no lookaround and no backreference, so such a pattern answers through the harness off the disk, as the bridge does on a refusal
- the cage replay goldens under `cageLogs` hold while `doorOver` sets no `Index`, and a replay wiring one would need new goldens
- `Glob` in `src/index/grep.go` orders by mtime and caps at `globPathLimit`, which the harness's own Glob may order apart

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/hooks.go: Door.Hook, which gains the searches branch after refuses and before calls
- src/modules/hooks/hooks.go: Outside, which gains the Index field
- src/modules/hooks/cage.go: NewDecisionOf, which reads a result with no text as pass
- src/modules/hooks/cage.go: Door.ReplayLog, which reads NewDecisionOf for every recorded row
- src/modules/hooks/cage.go: Door.shadows, which reads NewDecisionOf for a live post
- src/index/ops.go: Reads and readKeep, which gain Grep and Glob
- src/index/grep.go: Grep and Glob, which readKeep calls, unchanged
- src/quack/main.go: manages, which hands the reads to listens
- src/quack/main.go: listens and listensHooks, which take the reads and set Outside.Index
- src/quack/accepts.go: accepts, which takes index.Reads and compiles against the wider interface, unchanged
- src/quack/finds_test.go: fakeReads, which gains Grep and Glob to satisfy the wider Reads
- src/modules/hooks/hooks_test.go: doorOver, which sets no Index, so every existing case passes Grep and Glob as today
- src/quack/hooks_test.go, src/quack/hook_test.go, src/quack/waits_test.go and src/modules/hooks/describe_test.go: hooks.New with no Index, unchanged
- src/bridge/server.js: TOOLS, whose Grep and Glob entries keep serving the bridge path, unchanged

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/search_test.go: TestAGrepAnswersTheIndexsLines
- src/modules/hooks/search_test.go: TestAGlobAnswersTheIndexsPaths
- src/modules/hooks/search_test.go: TestAGrepCountsAndListsFilesAsTheBridgeSays
- src/modules/hooks/search_test.go: TestAGrepTypeReadsAsItsGlob
- src/modules/hooks/search_test.go: TestAGrepTheIndexRefusesPassesToTheDisk
- src/modules/hooks/search_test.go: TestAGrepOnAnAbsolutePathPasses
- src/modules/hooks/search_test.go: TestADoorWithNoIndexPassesGrepAndGlob
- src/modules/hooks/cage_test.go: TestDecisionOfReadsTheDoorsAnswer, which gains a case where a Grep answered with a result reads PassWord
- src/index/ops_test.go: TestTheReadsGrepAndGlobTheRowsTheDoorFinds
- src/quack/searches_test.go: TestTheIndexAskCarriesTheAskAndTheAnswer

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/index/ops.go
- src/index/ops_test.go
- src/modules/hooks/hooks.go
- src/modules/hooks/cage.go
- src/modules/hooks/cage_test.go
- src/modules/hooks/search.go, new
- src/modules/hooks/search_test.go, new
- src/quack/main.go
- src/quack/searches.go, new
- src/quack/searches_test.go, new
- src/quack/finds_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I opened src/index/ops.go (Reads, ReadsOf, the Find stub, Manage with four arguments) and src/index/grep.go (GrepAsk, GrepSaid, GlobAsk, GlobSaid, Grep, Glob). I opened src/index/glob.go (matcher, under), src/index/answers.go (the grep and glob methods) and src/quack/accepts.go (reads index.Reads). I opened src/quack/main.go (manages passing accepts(root, store, nil), listens, listensHooks). I opened src/modules/hooks/hooks.go (Outside, Hook, calls, refuses, callField), cage.go (OldDecisionOf, NewDecisionOf, shadows, ReplayLog) and brief.go (passesOn). I opened src/q/tool/tool.go (Prefix is index_), src/imports/imports.go (onlyQ), src/bridge/search.js, .claude/skills/level0/lib/index.js and .claude/skills/level0/hooks/cage.js and level0.js (stepOf, door, UNGUARDED). I also opened spec/guidance/code/testing.md and both sibling tickets, and checked each claim there.
- Callers come from searches for hooks.New, NewDecisionOf, ReadsOf, readKeep, index.Reads, manages( and listens across src. The Outside field is optional, so the hooks.New callers with no Index stay unchanged. fakeReads in src/quack/finds_test.go is the one implementer that the wider interface breaks.
- The Grep line meets src/modules/hooks/search_test.go: TestAGrepAnswersTheIndexsLines, decided by go test ./src/modules/hooks/... The Glob line meets src/modules/hooks/search_test.go: TestAGlobAnswersTheIndexsPaths. The check line meets ./RUNME.sh check exiting 0 at tests-green. Each hooks case runs against q/qtest and a local index fake that scans seeded texts, as rules 11 and 12 of spec/guidance/code/testing.md ask.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks/search_test.go src/modules/hooks/cage_test.go src/index/ops_test.go src/quack/searches_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/search_test.go
- src/modules/hooks/cage_test.go
- src/index/ops_test.go
- src/quack/searches_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Six hooks cases fail on their own assertion, with the door passing every Grep and Glob. The absolute path case and the no index case hold today, and stand as guards the change keeps. The index reads and the quack index ask fail against their stubs. Reads now carries Grep and Glob, so fakeReads and the noReads of find-and-wait-in-go gain both methods to compile. The hooks fake index sends each answer through JSON, so the door meets float64 numbers, as se-index prints them.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the Grep line meets TestAGrepAnswersTheIndexsLines, the Glob line meets TestAGlobAnswersTheIndexsPaths, and the check line meets the check at tests-green
- the hooks cases run over q/qtest and a fake index scanning seeded texts, the quack case over fakeReads, and the index case over a temp tree

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
