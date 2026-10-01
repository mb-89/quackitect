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
depends_on: ["tools-keep-their-own-names", "spawn-answers-off-the-door"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 3cd847cb11c · claude-code-remote
    hash_before: 742a0a0b1792969d6436683b5642a897e04d5236
    hash_after: 742a0a0b1792969d6436683b5642a897e04d5236
    inputs:
      - name: ask
        hash: e9c9e022659be7a6
        size: 503
      - name: [[spec/tickets/spawn-answers-off-the-door]]
        hash: e31e3e8fdb75c4ab
        size: 676
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 3cd847cb11c · claude-code-remote
    hash_before: 1e4231ad78d580b0412496fd79e0e5acb7eebb1c
    hash_after: 1e4231ad78d580b0412496fd79e0e5acb7eebb1c
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: cc6f95e3f9cda4bf
        size: 5123
    def: 08e16d07b0de477c
---

# Ask

The review tool spawns its reviewer off the hooks door, and the door answers the reviewer's report.

The bridge answers a review with a spawn and reads the report back on the agent answered event. The door has no spawn effect of its own before [[spec/tickets/spawn-answers-off-the-door]].

- a review call answers a spawn, and the agent answered event answers the report, in a case of `src/modules/hooks`. `go test ./src/modules/hooks/...` decides it
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

The hooks door answers `review_branch` with a spawn and its token, and answers the reader's report on `agent.answered`. The plugin carries the door's spawn and posts the report back to the door.

1. `Listen` and `serves` move out of `src/modules/hooks/hooks.go` into a new `src/modules/hooks/listen.go`, unchanged, since `hooks.go` stands at the edge of `code.fileLines`.
2. A pure package `src/modules/hooks/review` ports `readerAsks`, `fence`, `readerSays`, `line`, `report`, `redly` and `closing` off `.claude/skills/level0/lib/review.js`. `Material` holds the fields `branch review --json` prints: branch, ask, handback, stat, diff, check and retro. The sample answer prints through a struct, so its keys keep the order `JSON.stringify` gives them.
3. `Outside.Review(root, branch)` answers the material, or why the verb gathered nothing, the way `reviewsBranch` runs `src/scripts/verbs/branch.js review <name> --json`. None answers nothing, and the call goes on to the bridge.
4. A new `Door.reviewed` in `src/modules/hooks/review.go` answers two events.
   - On a `tool.call` naming `mcp__level0__review_branch`, it asks `Outside.Review`, keeps the material under a token off `Now` in hex, and answers `Effect{Kind: resultKind, Result: {spawn, back}}`. The spawn's prompt takes `readerAsks` over the helper layer `brief.LayerFor` answers.
   - On `agent.answered`, it takes the material its token names, drops it, reads a deny, an error or `readerSays`, logs the read, and answers `Effect{Kind: resultKind, Result: {result: report}}`. A token nobody holds answers the bridge's line.
5. `Door.Hook` tries `reviewed` after `searches` and before `calls`.
6. In `.claude/skills/level0/hooks/level0.js`, `door()` hands an answer carrying `spawn` to a new `doorSpawns`, which spawns as `spawns` does and posts the back event through `doorAsk`. The step that back answers stands as the tool's answer.

Boundaries with sibling tickets:
- spawn-answers-off-the-door owns the wrap of a spawn the harness makes, which this spawn meets as any spawn does
- level0-tools-leave-the-bridge drops `review_branch` from the bridge's `TOOLS`
- log-report-stop-in-go adds its own branch to `Door.Hook`, so the two merges meet in that chain

What I weigh: a result carrying `{spawn, back}` is the shape the plugin already spawns from, so the door needs no new effect kind, against the research pass's spawn kind. The tokens stand in the door's memory, as `box.reviews` stands in the bridge's, so a restart loses a review in flight on both sides.

I assume: the door's `Now` gives the token its uniqueness, as the bridge's clock does.

Risks:
- the plugin change runs only where the cage reads new, and a plugin test drives it with a fake door
- the reader prompt is long, so the case table pins its frame with a short material, and a drift in the rules text shows there

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/modules/hooks/hooks.go: Door.Hook, which gains the reviewed branch
src/modules/hooks/hooks.go: Outside, which gains Review
src/modules/hooks/hooks.go: Listen and Door.serves, which move to listen.go
src/quack/main.go: the hooks.Outside it builds, which gains the Review seam, which runs the branch verb
.claude/skills/level0/hooks/level0.js: door, which hands a spawn to doorSpawns
.claude/skills/level0/hooks/level0.js: spawns, whose spawn call doorSpawns shares
.claude/skills/level0/hooks/cage.js: stepOf, which hands the result on unchanged
src/bridge/review.js: reviewsBranch and onAgentAnswered, which the table checks, unchanged

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/modules/hooks/review/review_test.go: TestTheReviewCasesAnswerAsTheBridge
src/modules/hooks/review/review_test.go: TestAReaderAnswerOutsideJSONCountsOneFix
src/modules/hooks/review_test.go: TestAReviewCallAnswersASpawnUnderAToken
src/modules/hooks/review_test.go: TestTheAnsweredEventAnswersTheReport
src/modules/hooks/review_test.go: TestATokenNobodyHoldsAnswersTheBridgesLine
src/modules/hooks/review_test.go: TestAReviewNamingNoBranchSaysWhatItTakes
test/level0/review-cases.test.js: the bridge answers every case of review-cases.json
test/level0/door-spawn.test.js: a door's spawn answer spawns, and its back post reaches the door

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/modules/hooks/hooks.go
src/modules/hooks/listen.go, new
src/modules/hooks/review.go, new
src/modules/hooks/review_test.go, new
src/modules/hooks/review/review.go, new
src/modules/hooks/review/review_test.go, new
src/quack/main.go
.claude/skills/level0/hooks/level0.js
test/replay/cage/review-cases.json, new
test/level0/review-cases.test.js, new
test/level0/door-spawn.test.js, new

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every name stands opened: reviewsBranch, onAgentAnswered, readerAsks, readerSays, report, stepOf, door, spawns, doorAsk, Door.Hook, Effect, Outside, LayerFor and ForHelper, and the research pass's spawn kind and plugin claims fell there
the callers list names the hook chain, the outside, the moved listener, the quack seam, and the plugin's door and spawn paths
the Go done_when line rests on TestAReviewCallAnswersASpawnUnderAToken and TestTheAnsweredEventAnswersTheReport, and the check line on ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks/review/review_test.go src/modules/hooks/review_test.go test/level0/door-spawn.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/modules/hooks/review/review_test.go
src/modules/hooks/review_test.go
test/level0/door-spawn.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every new case fails on its own assertion:
- the review package's cases, against stubs answering empty values
- the door's cases, against a door that passes the review call and the answered event
- the plugin case, whose door answers a spawn that never runs

The table `test/replay/cage/review-cases.json` carries the bridge's own answers, read off a red run of `test/level0/review-cases.test.js`, which now answers green and pins the bridge.

What surprises me:
- the formatter lays a JSON file out again on write, so an exact edit has to read the file first
- `resultOf` stands in the hooks search cases already, so the review cases take `reviewResultOf`
- `Outside.Review` lands now as a stub field, and `hooks.go` stands a few lines under its ceiling, so the move of the listener comes first at the change

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the Go done_when line meets TestAReviewCallAnswersASpawnUnderAToken and TestTheAnsweredEventAnswersTheReport, and the check line waits for tests-green
the door cases run over doorOver with a fake Review seam, the package cases over the table, and the plugin case over a fake disk, a fake door and a fake spawn

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

- A research pass for the draft, read only and not yet checked by a gate:
  - `spawned` in `src/modules/hooks/spawn.go` rewrites a spawn the harness makes. Nothing lets the door start one, so this ticket adds a `spawn` effect kind.
  - `src/modules/hooks/hooks.go` stands near its line ceiling, so `Listen` and `serves` move into a new `listen.go` first.
  - A pure package `src/modules/hooks/review` ports `readerAsks`, `readerSays` and `report` off `.claude/skills/level0/lib/review.js`.
  - `Outside.Review` gathers the material, and `Door.reviewed` answers the spawn on the call and the report on `agent.answered`, under a token.
  - Every answer rides `Result` with no `Text`, so `NewDecisionOf` reads a pass.
  - One case table, `test/replay/cage/review-cases.json`, holds the prompt and report both sides answer.
