---
kind: [[ticket]]
state: open
step: design/tests-red
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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it", "every config key the approach adds names each default file it lands in"]
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
process_hash: c671f20a6ae2a4a6
group: javascript-leaves
depends_on: ["pull-scripts-leave"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 4a043276ab03c8ce7c7b1e3fb73b4877b98c04b6
    hash_after: 4a043276ab03c8ce7c7b1e3fb73b4877b98c04b6
    inputs:
      - name: ask
        hash: a843dde77873d922
        size: 420
    def: c01ae0f2ace0cecb
---

# Ask

The ticket, guidance, hold and vehicle scripts leave with their tests, since their verbs run in Go.

The ticket scripts stay as dead twins, and their tests cost every check.

- `git ls-files 'src/scripts/ticket*.js' 'src/scripts/guidance-*.js' 'src/scripts/ephemeral*.js' src/scripts/vehicle.js` answers nothing
- `go test ./src/pull/... ./src/quack/... ./src/vehicle/...` passes
- `./RUNME.sh check` exits 0

none

none

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

1. ticket-route.js and vehicle.js leave. The git ls-files line names no other ticket, guidance, hold or vehicle script.
2. test/contract/vehicle.test.js and test/level0/outside-hand.test.js leave whole, since every case reads vehicle.js.
3. test/level0/vehicle.test.js drops each case reading vehicle.js, and keeps the cases over lib/vehicle.js alone.
4. It drops the fakeClock and fakeDisk imports that only the leaving cases read.
5. src/vehicle/vehicle_test.go already holds every leaving vehicle case, one Go case for each JS case.
6. TestVehicleAProducedVehicleStandsAlone holds the contract cases for identity, roots and the travelling files.
7. TestVehicleTheRegisterSplitsItsListTheWayTheCallerSays holds the outside-hand case and the USERPROFILE-before-HOME case.
8. TestRouteAheadOnly and TestTicketRouteVerb already hold every road through ticket-route.js, the record-named leaves included.
9. src/pull/testdata/drawing_edits.json holds the drawing's front, and the route each move and drop answers.
10. route_test.go embeds that file and passes each route through RouteOf and RouteAheadOnly.
11. drawing-edit.test.js asserts that moved and dropped answer the fixture's routes, in place of aheadOnly.
12. drawing-page.test.js asserts the page posts what moved in edit.js answers, in place of aheadOnly.
13. src/quack/ticket_scripts_test.go globs the done_when patterns and the two leaving tests, and stays red while any stands.
14. Go comments name the Go owner: ReachedOf, RouteAheadOnly, MethodRootFrom, the vehicle package.
15. vehicle.md points its scope, its stands-alone proof, rootsHere and filesOf at the Go owners and their tests.
Weighed: dropping the aheadOnly asserts. The extension-to-verb interface then stands untested.
Weighed: spawning the Go binary from the drawing tests. A spawn puts a real door in every unit case.
Weighed: a literal route in both Go and JS. Two copies drift, and one fixture keeps one owner.
Weighed: deleting the dead exports in lib/vehicle.js here. plugin-libs-leave owns lib/vehicle.js and its tests.
Assumed: outside-in-doors.test.js keeps src/scripts/vehicle.js as a probe label, since Vale reads a temp folder.
Assumed: the lib cases in test/level0/vehicle.test.js stay until plugin-libs-leave removes lib/vehicle.js.
Assumed: the stale cli, vehicle-verb and mint-verb glob in .vale.ini waits for scripts-folder-leaves.
Assumed: check.go names lib/vehicle.js, which stays, so its comment stays.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- test/level0/drawing-edit.test.js: the move and drop cases, which read aheadOnly
- test/contract/drawing-page.test.js: the edit-ahead case, which reads aheadOnly
- test/contract/vehicle.test.js: every case, which reads identityHere, produce and rootsHere
- test/level0/outside-hand.test.js: its one case, which reads registerDirs
- test/level0/vehicle.test.js: the cases reading attach, detach, identityHere, methodRootFrom, produce, readRegister, registerDirs, registerVehicle, rootsHere
- test/contract/outside-in-doors.test.js: the pid probe labelled src/scripts/vehicle.js, which needs no file and stays
- src/modules/tickets/drawn.go: reachedOf, whose comment names reachedOf in ticket-route.js
- src/pull/route.go: the header naming ticket-route.js
- src/pull/walk.go: the header naming reachedOf in ticket-route.js
- src/pull/route_test.go: the header naming test/level0/ticket-route.test.js
- src/quack/ticket_route.go: the header naming ticket.js and routed in ticket-route.js
- src/quack/ticket_route_test.go: the header naming src/scripts/ticket.js
- src/quack/vehicle_verb_test.go: TestVehicleVerbHereNamesTheRootsAndTheRegister, whose comment names methodRootFrom
- src/vehicle/vehicle.go: the header naming src/scripts/vehicle.js
- spec/design_output/vehicle.md: Scope, a-vehicle-stands-alone, two-roads-to-the-vehicle and the filesOf closure lines

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/ticket_scripts_test.go: TestTheTicketAndVehicleScriptsStandNowhere
- src/pull/route_test.go: TestEveryRouteTheDrawingsEditsAnswerKeepsTheReachedLeaves

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first: no review has read this draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/scripts/ticket-route.js
- src/scripts/vehicle.js
- test/contract/vehicle.test.js
- test/level0/outside-hand.test.js
- test/level0/vehicle.test.js
- test/level0/drawing-edit.test.js
- test/contract/drawing-page.test.js
- src/pull/testdata/drawing_edits.json
- src/pull/route_test.go
- src/pull/route.go
- src/pull/walk.go
- src/quack/ticket_scripts_test.go
- src/quack/ticket_route.go
- src/quack/ticket_route_test.go
- src/quack/vehicle_verb_test.go
- src/modules/tickets/drawn.go
- src/vehicle/vehicle.go
- spec/design_output/vehicle.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb named stands opened and checked there: RouteAheadOnly, RouteOf, ReachedOf, RegisterDirs, the Go vehicle cases, edit.js
- the callers list names every importer and comment git grep finds for both scripts and their exports, outside spec/tickets and spec/retros
- TestTheTicketAndVehicleScriptsStandNowhere decides the first line, the go test line with the new route case the second, and the check at tests-green the third
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->

<!-- the form is list -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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

- pull-scripts-leave removes `guidance-hand.js` and `ephemeral.js`, since `pull-route.js` and `guidance-hand.js` import each other. This ticket keeps `ticket-route.js` and `vehicle.js`.
