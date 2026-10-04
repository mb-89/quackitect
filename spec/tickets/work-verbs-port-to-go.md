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
group: work-verbs-run-in-go
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 51947abab2e8 · claude-code-remote
    hash_before: 3738effb9d5798139377aa809ad4eed241129d47
    hash_after: 3738effb9d5798139377aa809ad4eed241129d47
    inputs:
      - name: ask
        hash: 336fe34fc9021c30
        size: 698
    def: 7883b3d10633c780
---

# Ask

The verbs branch and cloud run in Go, each registered in its own file under `src/quack`, and their JavaScript leaves the tree.

The branch verbs run in Go beside `branch list --queue`, the twin that already stands, so one copy of the waits and the claim holds. Until it lands, these verbs start node, and `work.js` and every `work-*.js` stay in the tree.

- `go test ./src/quack ./src/modules/...` passes, with a case for every road the verbs' JavaScript tests cover
- `./RUNME.sh <verb>` reaches no node for each of branch and cloud
- `ls src/scripts/verbs` names none of branch and cloud
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

A new Go package src/branches carries the port of src/scripts/work.js and every work-*.js module it reads, with the pull pieces the branch verbs lean on (the route walk, the hand rule, takeable, the hold read, the retro leaves). It reaches the outside through one Doors struct: git run in the work root, the disk, the Go front writer in src/front, the clock, the env, the config resolver in src/config, a process runner and the session log. Two files register the verbs, each from its own file as the registry asks: src/quack/branch.go registers branch, and src/quack/cloud.go registers cloud. The twin branch list --queue stays registered, and twinOf reads it first since it reads the most words first, so one copy of the queue holds. branch escalate writes the person step, lands and pushes it, then hands onward through ./RUNME.sh ticket pull, the verb owning the hand-out, which the ticket group ports. branch merge and branch review run the check through ./RUNME.sh check, so they reach whatever the check verb runs on. The JavaScript work.js and the work-*.js modules stay, because pull-route.js, pull-writes.js, dispatch-write.js, dispatch.js, check-verb.js, mint-verb.js, prepush.js, ticket-yours.js, ticket-edit.js and src/bridge/plan.js import them, and those belong to other groups. The verb shims src/scripts/verbs/branch.js and cloud.js leave, since nothing imports them. Every name in src/branches lives in its own package, so no line the parallel groups touch in src/quack changes.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/verbs.go verbs: runs a registered verb, now branch and cloud
- src/quack/twins.go nodeAccept: hands an index action naming branch or cloud to the Go verb through goAnswer
- RUNME.sh: ./RUNME.sh branch and ./RUNME.sh cloud reach quack verb
- .claude/skills/work/SKILL.md and the dispatch Action: run branch take, branch done, cloud trigger
- the pull engine needs: branch sync and branch test, named under needs, which ticket pull runs

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/branches/group_test.go: the front reads and spans
- src/branches/stands_test.go: waits, standing, frees, the batch framing
- src/branches/list_test.go: the listing rows, --done, --all
- src/branches/take_test.go: take on a desk, a dirty tree, nothing free, a claim
- src/branches/done_test.go: done refuses behind trunk, an unclean stamp, an open child, an unwritten retro, then leaves
- src/branches/merge_test.go: merge refuses off trunk, not done, in a pull request; close keeps unmerged
- src/branches/cloud_test.go: cloud trigger names the routine and the free branches
- src/branches/unblock_test.go, test_test.go, guidance_test.go, review_test.go: each verb's refusals and its happy road
- src/quack/branch_test.go: branch and cloud stand registered, and reach no node

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/branches/*.go, new
- src/quack/branch.go, new
- src/quack/cloud.go, new
- src/quack/branch_test.go, new
- src/scripts/verbs/branch.js, removed
- src/scripts/verbs/cloud.js, removed

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb named stands opened: work.js, work-*.js, pull-route.js, pull-hand.js, pull-hand-of.js, pull-when.js, pull-escalate.js, pull-landed.js, guidance-verb.js, engine/group.js, src/quack/registry.go, verbs.go, twins.go
- the callers list names the road, the node module, the skills and the pull's needs
- each done_when line meets a test: the Go tests, branch_test.go for no node, an ls in the check of the ask, a search of src, and the check

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
