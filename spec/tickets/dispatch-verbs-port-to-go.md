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
group: dispatch-verbs-run-in-go
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 89388e314a84 · claude-code-remote
    hash_before: 327d463ce2830b8897b5891525add34a379467be
    hash_after: 327d463ce2830b8897b5891525add34a379467be
    inputs:
      - name: ask
        hash: 0eac3f0d7cae79f5
        size: 679
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 89388e314a84 · claude-code-remote
    hash_before: db3d707fcfe61124354bb385451cbdb41ab65e24
    hash_after: 6b56649e0c7a97885915007a9d12a2f4974f94b6
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 6966bd6d7cd4bf05
        size: 4039
    def: 08e16d07b0de477c
  - step: gate
    hand: box 89388e314a84 · claude-code-remote · helper-4
    hash_before: 0da234231756437e47a54868da08750d8350d2b2
    hash_after: 0da234231756437e47a54868da08750d8350d2b2
    inputs:
      - name: design/draft
        hash: 6966bd6d7cd4bf05
        size: 4039
      - name: design/tests-red
        hash: e2bd44fe2f366469
        size: 981
    def: dc4904ab364efa10
---

# Ask

The verbs dispatch run in Go, each registered in its own file under `src/quack`, and their JavaScript leaves the tree.

The dispatch reads the waits, the free groups and the marker through the Go copy the work verbs land. The Action and the boxes then agree on what is free. Until it lands, these verbs start node, and `dispatch*.js` stay in the tree.

- `go test ./src/quack ./src/modules/...` passes, with a case for every road the verbs' JavaScript tests cover
- `./RUNME.sh <verb>` reaches no node for each of dispatch
- `ls src/scripts/verbs` names none of dispatch
- a search of `src` names no importer of a JavaScript module this group deletes
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

The dispatch ports into the Go package src/branches, beside the work verbs it reads, and src/quack/dispatch.go registers it from its own file. dispatch.go in the package carries the plan (planned, idleIn, looseOpen, bundlesOf, closesOf, leftForPerson, personOf, the printed rows and the JSON) and the run (carried, refused). dispatch_write.go carries opensOf, writeState, fixName, the fix ask, writesOf, fixGroup, land and opens. dispatch_fire.go carries the fire and the write branch's pull request. The plan reads the Go copy #94 landed (readWork, standingAll, trunkOf, freeIn, staleClaim, stuckIn, waitsOf, waitsIn, onPersonRoute, markOff), so the Action and the boxes agree on what is free. The fix group mints through check.Minted over check.SchemasIn, and a route copy in dispatch_write.go reads spec/processes/<name>.yaml, keeps its key order through yaml.Doc, and hashes ask and steps the way processHash in lib/schema-route.js does, over hashText in route.go. The http door rides a Send func handed to Dispatch beside the Doors, so doors.go takes no new field and no shared line changes. Weighed: askFaults ran Vale over a constant ask at each run; the Go run drops that call, a Go case runs Vale over the minted fix group once, and the check on the write branch's pull request lints every ticket it lands. The JSON and the printed plan keep their shape, since the Action reads --json. dispatch.js, dispatch-write.js, dispatch-fire.js and verbs/dispatch.js leave; an import walk over every .js file names no other module the four alone keep alive. The JS tests dispatch.test.js, dispatch-fire.test.js and dispatch-fixtures.js leave with them, their roads ported to Go, and the planOf case in work-stands.test.js moves to Go.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/verbs.go verbs: runs a registered verb, now dispatch
- src/quack/twins.go nodeAccept: hands an index action naming dispatch to the Go verb
- RUNME.sh: ./RUNME.sh dispatch reaches quack verb
- .github/workflows/dispatch.yml: runs ./RUNME.sh dispatch --json --fire
- .claude/skills/dispatch/SKILL.md: runs ./RUNME.sh dispatch --dry
- test/level0/work-stands.test.js: imports planOf from dispatch.js
- test/contract/verb-programs.test.js RUNS: imports verbs/dispatch.js

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/branches/dispatch_test.go: the plan roads of dispatch.test.js (ready, waiting, held, stuck, person, bundles, opens, closes, parents, the dry run, --json)
- src/branches/dispatch_write_test.go: one fix group, one commit on claude/dispatch-<commit>, a standing and an unmerged write branch, the worktree removed, a refused push, the name cut, the route copy and its hash
- src/branches/dispatch_fire_test.go: the roads of dispatch-fire.test.js over a fake Send
- src/quack/dispatch_test.go: dispatch registers, reaches no node, verbs/dispatch.js stands nowhere, and no .js imports a deleted module

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/branches/dispatch.go, new
- src/branches/dispatch_write.go, new
- src/branches/dispatch_fire.go, new
- src/branches/dispatch_*_test.go, new
- src/quack/dispatch.go, new
- src/quack/dispatch_test.go, new
- src/scripts/dispatch.js, dispatch-write.js, dispatch-fire.js, verbs/dispatch.js, removed
- test/level0/dispatch.test.js, dispatch-fire.test.js, dispatch-fixtures.js, removed
- test/level0/work-stands.test.js, test/contract/verb-programs.test.js, edited

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file named stands opened: dispatch.js, dispatch-write.js, dispatch-fire.js, verbs/dispatch.js, process.js withRoute and processAt, ticket.js cutTo and schemasHere, ticket-ask-lint.js, schema-route.js processHash, src/branches doors.go, stands.go, free.go, group.go, take.go, route.go hashText, src/modules/check mint.go and export.go, src/quack registry.go, branch.go, cloud.go
- the callers list names the road, the node module, the Action, the skill and the two JS tests importing the deleted files
- each done_when line meets a test: the Go cases, dispatch_test.go in src/quack for no node and the verbs folder and the importer search, and ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/dispatch_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/dispatch_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The port and the plan's cases landed in one commit, as the work group's did, so those cases stood green from the start. The red case asserts the four JavaScript files stand nowhere and nothing imports them, and it fails on that assertion while they stand. One surprise: the Go read names a group merged where main carries its ticket closed, and not by git ancestry, so the merged case lands the closed ticket on main the way a merged pull request leaves it. A second: the importer walk met d3-dispatch inside a node_modules folder, so the walk skips node_modules.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a test: the Go cases for the roads, dispatch_test.go in src/quack for no node, the verbs folder and the importer search, and the check
- every door the tests reach stands real or faked: a bare origin and its clone for git, and a fake send door for the network

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

The approach answers the ask. The dispatch ports into src/branches (dispatch.go for the plan, dispatch_write.go for the writes, dispatch_fire.go for the fire). It reads the Go copy the work verbs landed, so the Action and the boxes agree on what is free, and it registers from src/quack/dispatch.go with httpSend as its send door. In src/branches, go test -run Dispatch passes its sixteen plan cases, and they cover every plan road of dispatch.test.js. TestDispatchNamesTheSameReadyGroupsTheFreeReadNames carries the planOf road of work-stands.test.js. src/quack/dispatch_test.go TestDispatchLeavesNode fails on its own assertion: the four modules stand, and three imports reach them. It decides the no-node, verbs-folder and importer lines, and ./RUNME.sh check decides the last. Weighed: the write roads and the fire roads have code but no Go case. The draft names dispatch_write_test.go and dispatch_fire_test.go, and neither file stands. So done_when line 1 stands promised, and no test decides it yet. I accept rather than reject because the draft already names both files and every road they hold, and implement writes them where it stands. A reject sends the same list back for a round. Points for implement, fixed in place, no child:
- write src/branches/dispatch_write_test.go over the dispatch.test.js write roads: one fix group carrying fix: true, one commit on claude/dispatch-<commit> with no push to main, a standing write branch writes nothing, an unmerged write branch stops every write and the plan still names workers, a merged one stops nothing, the person route stays loose, opens of work/<name>, the name cap and the cut keeping the commit, the worktree removed after a push and after a refused push, markOff, a parent's close landing once over two runs, and a fix group per parent
- add to it a case pinning processHash in dispatch_write.go to the hash processHash in src/scripts/lib/schema-route.js gives for one process, so the route copy matches the JS before the JS leaves
- add the Vale case over the minted fix group's ask that the approach names in place of askFaults; no such case stands
- write src/branches/dispatch_fire_test.go over a fake Send, for the nine roads of dispatch-fire.test.js: once per ready group and stuck hand-over, the routine cap, a refused fire exiting 1 with its reason, a rate refusal naming the reset, no issues API, the write branch's pull request on PULL_TOKEN with auto-merge, no second pull request, missing secrets, and --json --fire
- the size and callers lists miss spec/design_output/work.md, whose table rows for opensOf, closesOf and bundlesOf point at src/scripts/dispatch.js and dispatch-write.js; move those pointers to the Go functions
- the importer walk in TestDispatchLeavesNode matches only a double-quoted path; biome writes double quotes, so it holds today, and a single-quoted import passes it unseen

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
