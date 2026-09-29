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
step: implement/change
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: quack-verbs-land-in-shadow
record:
  - step: design/draft
    hand: box d84fcad60110c · claude-code-remote
    hash_before: a4ec036db54d2595060023635a05ff2d17e6a389
    hash_after: a4ec036db54d2595060023635a05ff2d17e6a389
    inputs:
      - name: ask
        hash: 210de2d83f01697a
        size: 700
      - name: [[spec/design_output/model]]
        hash: 3e2cd8b099700681
        size: 74868
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d84fcad60110c · claude-code-remote
    hash_before: 5ba4f45baf5f11b7de7ca47edc1ae418844fda25
    hash_after: 5ba4f45baf5f11b7de7ca47edc1ae418844fda25
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q fails
    inputs:
      - name: design/draft
        hash: faa1a587698ca718
        size: 4110
    def: 08e16d07b0de477c
  - step: gate
    hand: box d84fcad60110c · claude-code-remote · helper-3
    hash_before: 6f558326fc5e69544c9301f7f43f7f91d1228cc8
    hash_after: 6f558326fc5e69544c9301f7f43f7f91d1228cc8
    inputs:
      - name: design/draft
        hash: faa1a587698ca718
        size: 4110
      - name: design/tests-red
        hash: 5851393963daace7
        size: 961
    def: dc4904ab364efa10
---

# Ask

`POST /v1/actions/<name>` stands for every action, off the registry. It answers within the wait the request sets with `Prefer: wait=N`, per RFC 7240 and [[spec/design_output/model#a-caller-sets-its-wait]]. The default wait is a config key of the `http` IO module.

An action then answers over HTTP the way it answers on the command line, and a script needs one request.

- `go test ./...` from the root passes
- a case posts to a fake action with `Prefer: wait=5`, and reads the result
- a case posts with `Prefer: wait=0`, and reads `202` with the fraction done, the time and the handle path
- a case posts with no `Prefer`, and reads the default wait off its config key
- `./RUNME.sh check` exits 0

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

The door serves one Huma operation an action, off the store's names, and the index manager runs each call.

| what changes | where it stands | what it does |
|---|---|---|
| the input type | `actionOf` and a new `Store.Input` in `src/q/action.go` | the registration keeps its input type, and `Input(name, body)` decodes a JSON body into it, an empty body into the zero value |
| the types | a new `Store.Types` in `src/q/action.go` | answers an action's input type and the type `q.Answers` declares, so a surface builds its schema |
| the call seam | `Manage` in `src/index/ops.go` | answers `Managed`: the stop, and a `Call` taking a name, an input, a caller and a wait |
| the manager | `Start` and `begins` in `src/modules/index/manager.go` | `Serves` answers the stop and the call. `Outside` gains `Accept`, which a nil refuses every request through |
| the route | `servesV1` in `src/index/v1.go`, and a new `src/index/actions.go` | `POST /v1/actions/<name>` a action: `RawBody` with the request schema off the input type, the `200` schema off the answer type with each `Out` field's label as its title and its doc as its description, and a `202` schema |
| the wait | `waitOf` in `src/index/actions.go` | reads `wait=N` off `Prefer` per RFC 7240, and answers `Preference-Applied`. With no `Prefer` it reads `http/config/wait` off the store |
| the key | a new `src/modules/http/http.go`, `spec/wiring.yaml`, `modules` in `src/quack/main.go` | the `http` module type registers `wait`, in seconds, built in at none, and the wiring loads it as `http` |

The answers:

- the action ends within the wait: `200`, the result, the handle path and the time gone by
- the wait runs out: `202`, `running`, the fraction done, the time gone by, and the handle path `/v1/values/ops/<id>`, which `GET` reads
- the action fails: `422`, with the reason the refusing module gives
- a body the input type refuses: `400`

The caller stands as `http`. The root's `Accept` routes a request to `disk` through `files.Accept`, and refuses every other module, since no action stands yet.

I assume the default key takes the instance prefix the wiring gives, as `migration/config/slices/verbs` does, so the door reads the name `http/config/wait`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/index/ops.go: Manage, door.manages, ServeManaged
- src/index/door.go: opensOn, which takes the call off the manager and hands it to servesV1
- src/index/v1.go: servesV1
- src/quack/main.go: manages, main, modules
- src/modules/index/manager.go: Start, begins, Outside
- src/modules/index/call.go: Call, which the manager's call wraps
- src/q/action.go: actionOf, ActionIn, Action
- src/index/failed_start_test.go: the manage stub
- src/index/door_test.go: the manage stub
- src/quack/manager_test.go: TestAnOverrideSetsTheSpanTheManagerTicksAt, over manager.Start

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/index/actions_test.go: TestAnActionAnswersItsResultWithinTheWait
- src/index/actions_test.go: TestAWaitOfNoneAnswersAcceptedWithTheHandle
- src/index/actions_test.go: TestNoPreferReadsTheDefaultWaitOffItsKey
- src/index/actions_test.go: TestTheOpenAPIEntryReadsTheAnswerFields
- src/q/action_test.go: TestAnActionDecodesItsInputOffJSON
- src/modules/http/http_test.go: TestTheWaitKeyStandsUnderTheInstance

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/q/action.go
- src/q/action_test.go
- src/index/ops.go
- src/index/door.go
- src/index/v1.go
- src/index/actions.go
- src/index/actions_test.go
- src/index/failed_start_test.go
- src/index/door_test.go
- src/modules/index/manager.go
- src/modules/http/http.go
- src/modules/http/http_test.go
- src/quack/main.go
- src/quack/testdata/tree.golden.json
- spec/wiring.yaml

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file the approach names stands opened: action.go, looks.go, store.go, send.go, call.go, manager.go, ops.go, door.go, v1.go, quack/main.go, and Huma's Register over RawBody and preset responses
- the callers list names every caller of Manage, manager.Start and actionOf a grep finds
- each done_when line names its case: wait=5 in the first, wait=0 in the second, no Prefer in the third, and go test and the check in tests-green

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/q src/index

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/q/action_test.go
- src/index/actions_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

- `Store.Input` answers no decode yet, so the JSON case fails on its own assertion
- `servesActions` registers nothing yet, so each post reads `404` and the OpenAPI document holds no `/actions/t/add`
- the manager seam, the `http` module and its wiring land whole in this step, since the cases reach the route through them. The module case passes, and the rest of `go test ./...` stays green
- what surprises the hand: an op ends at the state `done`, and the case first read `finished`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches q's action registration, the manager's start, the door's seam, the http module, the wiring and the root, as the draft names
- the index cases drive the real manager over a fake action and its accept, and the q case runs against the store alone
- each file carries a pointer at the ticket or the chapter on the wait

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- wait-key-meets-its-wiring: the no-Prefer case seeds http/config/wait itself through q.OutIn, and src/modules/http/http_test.go holds TestTheWaitKeyReadsNoneByDefault over config/wait, not the TestTheWaitKeyStandsUnderTheInstance the draft names; so no case ties the door's WaitName to the name the wiring binds the http module's key under. Add a case over the wiring's instance, or derive WaitName off httpmodule.WaitKey
- action-refusals-meet-cases: the 400 for a body the input type refuses and the 422 for a refusing module carry no case in src/index/actions_test.go
- gone-names-its-unit: Called.Gone encodes a time.Duration as nanoseconds; name the unit in the 202 schema or answer seconds, as the wait reads

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

The ticket `surfaces-read-the-output-fields` closes `became` onto this one. The OpenAPI entry of `POST /v1/actions/<name>` takes its response schema off `Presentation.Out`, the fields `q.Answers` declares. A case reads a field's `label` and `doc` there. An action with no `q.Answers` keeps an untyped result.
