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
    hand: box 3cd847cb11c · claude-code-remote
    hash_before: e0bbc332414b0e73b55e2cdb2c6a7b1cb1cecd58
    hash_after: e0bbc332414b0e73b55e2cdb2c6a7b1cb1cecd58
    inputs:
      - name: ask
        hash: 6d569ad6c5be9f46
        size: 579
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 3cd847cb11c · claude-code-remote
    hash_before: d777aed34fb400c3190138d77f21ecc8733c84d5
    hash_after: d777aed34fb400c3190138d77f21ecc8733c84d5
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/plans fails
    inputs:
      - name: design/draft
        hash: 4d4080678092430e
        size: 5304
    def: 08e16d07b0de477c
---

# Ask

The plan tool writes the plan file and the queue places off the Go side, and every listed tool carries the plan field.

`plans` in the bridge writes the file, and `withPlanField` adds the field to every tool. Without a port the engine's questions reach no answer once the bridge leaves.

- a plan call writes the plan file as the bridge writes it, in a case of `src/quack`. `go test ./src/quack/...` decides it
- every tool the index lists carries the plan field, in a case of `src/index`. `go test ./src/index/...` decides it
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

A new IO module `plans` carries the plan tool in Go. Like `waits`, it stays off `spec/wiring.yaml` until the flip. `q/tool` owns the plan field, and the index lists it on every tool.

1. `src/q/tool/tool.go` gains `PlanArg`, `PlanTool`, a `Plan` input type and `WithPlan(schema, name)`. `Plan` carries `working`, `done` and `add`, with the doc text of `planSpec` in `src/bridge/plan.js`. `WithPlan` adds `plan` to a schema, and skips the tool named `plan`, as `withPlanField` does.
2. `tool.Input` drops `plan` the way it drops `wait`, unless the input declares it.
3. `door.servesTools` in `src/index/tools.go` passes each schema through `WithPlan`, and `src/index/testdata/tools.golden.json` is regenerated.
4. A new `src/modules/plans` registers `plans/set` with `q.ToolName("plan")` and `q.IO()`, over `tool.Plan`. The module name keeps clear of the wired settings section `plan`, which would answer the live tool at once. `Accept` ports `plans`, `planned`, `plansHere`, `writes`, `placeWord` and `placesSaid`, every answer line word for word. It writes the file in the bridge's key order, indented by two spaces, with no HTML escape and a trailing newline.
5. `plans.Outside` holds `Read` and `Write` over the plan path, `Now`, `Most` off `plan.mostOpen`, and `Places(planText)`, the queue's outline places over a plan text.
6. `placesIn` and `placesOf` in `src/modules/queue/places.go` take exported names, so `Places` answers before the derived settles.
7. A new `src/quack/plans.go` wires `plansOutside`, whose `Places` reads the snapshot values bound to the queue's ports. `accepts` gains the plans case, and `modules` gains the module.
8. `Door.calls` in `src/modules/hooks/hooks.go` calls the plan action first where a Go-answered call carries a plan field, as `planRides` does. The fold already resets the count, so the door writes the file alone.

Boundaries with sibling tickets:
- level0-tools-leave-the-bridge drops `planTools`, `withPlanField` and `planRides` from the bridge, and the flip wires `plans`
- the engine's ask and its grace already stand in `src/modules/hooks/fold.go`, and this ticket leaves them alone
- log-report-stop-in-go owns the log, report and stop tools
- find-and-wait-in-go set the shape of an IO module off the wiring, which this ticket copies

What I weigh: one `Places` seam that recomputes the outline costs exporting `placesOf`. In return, a todo's place and the answer match the bridge without a wait for the derived.

I assume the Go places equal the queue field the bridge reads, since `places.go` ports `placesIn`. I assume the agent's level zero tools reach it through the index list.

Risks:
- a wrong binding of the queue's ports places every todo at the end with no error
- the bridge's debug line on the plan's todo count gets no Go twin
- Go's encoder differs from `JSON.stringify` on escapes, so a case seeds a non-ASCII title and an extra key

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/q/tool/tool.go: Input, which drops a riding plan field
- src/index/tools.go: door.servesTools, which lists each schema through WithPlan
- src/modules/hooks/hooks.go: Door.calls, which calls the plan action with a riding field
- src/modules/mcp/mcp.go: the server call, which reads tool.Input and drops the field too
- src/modules/queue/places.go: Places, placesOf and placesIn, which take exported names
- src/quack/accepts.go: accepts, which gains the plans case
- src/quack/main.go: modules, which gains plans, and manages, which hands accepts the queue bindings
- src/index/testdata/tools.golden.json: read by test/level0/index-tools.test.js, and regenerated

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/plans_test.go: TestAPlanCallWritesThePlanFileAsTheBridgeWritesIt
- src/quack/plans_test.go: TestAPlanFieldRidingAGoCallWritesThePlanFile
- src/quack/plans_test.go: TestThePlansModuleStandsOffTheWiring
- src/index/tools_test.go: TestEveryListedToolCarriesThePlanField
- src/index/tools_test.go: TestThePlanToolCarriesNoPlanField
- src/q/tool/tool_test.go: TestInputDropsARidingPlanField
- src/modules/plans/plans_test.go: TestAPlanWritesTheFileTheBridgeWrites
- src/modules/plans/plans_test.go: TestATodoAtADigitAnchorsBeforeTheRowAtThatPlace
- src/modules/plans/plans_test.go: TestTodosPastTheMostOpenStayOut
- src/modules/plans/plans_test.go: TestAHandoverTodoStaysOut
- src/modules/plans/plans_test.go: TestTheAnswerNamesEachNewTodosPlace

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/plans/plans.go, new
- src/modules/plans/plans_test.go, new
- src/q/tool/tool.go
- src/q/tool/tool_test.go
- src/index/tools.go
- src/index/tools_test.go
- src/index/testdata/tools.golden.json
- src/modules/hooks/hooks.go
- src/modules/queue/places.go
- src/quack/accepts.go
- src/quack/main.go
- src/quack/plans.go, new
- src/quack/plans_test.go, new

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I opened plan.js plans, planned, plansHere, placesSaid and placeWord, server.js withPlanField and planRides, fold.go called and planned, hooks.go calls, tool.go Input, index tools.go, queue places.go, and the waits module
- callers come from a search for plans, withPlanField, planRides, tool.Input, tool.Action, placesOf and the readers of the tools golden
- the first line meets TestAPlanCallWritesThePlanFileAsTheBridgeWritesIt, the second TestEveryListedToolCarriesThePlanField, and the third the check at tests-green

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/plans/plans_test.go src/quack/plans_test.go src/index/tools_test.go src/q/tool/tool_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/plans/plans_test.go
- src/quack/plans_test.go
- src/index/tools_test.go
- src/q/tool/tool_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every new case fails on its own assertion. The module cases run against a stub that registers nothing, and q/tool carries PlanArg, PlanTool, Plan and a WithPlan stub so the cases compile. A bare input carrying the plan field fails today, since the fallback wants the bare property alone. The riding case reuses the wait cases' world, which now loads the plans module beside waits and hands back its root. The first module case pins the bridge's key order: working, todos and places first, then the file's other keys.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the first line meets TestAPlanCallWritesThePlanFileAsTheBridgeWritesIt, the second TestEveryListedToolCarriesThePlanField, and the third the check at tests-green
- the module cases run over a fake file, a fixed clock and fake places, the quack cases over a temp tree and the real wiring, and the index cases over the door's own test catalog

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
