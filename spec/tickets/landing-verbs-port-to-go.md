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
group: landing-verbs-run-in-go
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box a2b0848f196c · claude-code-remote
    hash_before: 51ec96064d9ef72ce89ee2b8434fa403795faf0c
    hash_after: 51ec96064d9ef72ce89ee2b8434fa403795faf0c
    inputs:
      - name: ask
        hash: b0c7bf2381eb0d52
        size: 721
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box a2b0848f196c · claude-code-remote
    hash_before: 999dcb43ef4c892da831cd7c10c36ed6e10cc906
    hash_after: 999dcb43ef4c892da831cd7c10c36ed6e10cc906
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 438327f0da15dddd
        size: 4084
    def: 08e16d07b0de477c
  - step: gate
    hand: box a2b0848f196c · claude-code-remote · helper-4
    hash_before: d6de627241f22d1bc933d8b289b95d114d967034
    hash_after: a0044908a94bce5d71e9517f0ee5783ed349dd9f
    inputs:
      - name: design/draft
        hash: 438327f0da15dddd
        size: 4084
      - name: design/tests-red
        hash: af4f299ca9d851e9
        size: 1109
    def: dc4904ab364efa10
  - step: implement/change
    hand: box a2b0848f196c · claude-code-remote
    hash_before: 897dab2e29990db3c2be775f9b752cde9b3c2c92
    hash_after: 897dab2e29990db3c2be775f9b752cde9b3c2c92
    answered:
      - name: lint
        exit: 0
        said: ""
    def: f150b8c0dc20fe45
---

# Ask

The verbs commit, push and rename run in Go, each registered in its own file under `src/quack`, and their JavaScript leaves the tree.

Every commit and push runs one Go road, so the check before a push and the rename it carries read one implementation. Until it lands, these verbs start node, and `commit-verb.js`, `push-verb.js` and `rename.js` stay in the tree.

- `go test ./src/quack ./src/modules/...` passes, with a case for every road the verbs' JavaScript tests cover
- `./RUNME.sh <verb>` reaches no node for each of commit, push and rename
- `ls src/scripts/verbs` names none of commit, push and rename
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

Three files under src/quack, each registering its verb from an init, as the registry asks: commit.go, push.go and rename.go. No shared line changes in verbs.go or registry.go.

- push.go reads the check stamp, judges it with command.Battery against HEAD, and pushes the branch with git. The texts stay those push-verb.js prints.
- rename.go ports rename.js and verbs/rename.js whole: the walk past .git, node_modules, .se, .claude-plugin and bin, the text sniff, the edged rewrite of both forms of a note's name in one pass, the closed ticket left alone, the git add, and the undo journal entry carrying moved. Go regexp holds no lookbehind, so the edged rewrite scans the text by hand, longest name first. The ticket the entry names reads off command.InHand, one ticket or none.
- commit.go ports commit-verb.js over the Go pieces that stand already: command.TicketOf and TicketFault for the ticket, heardOver for Vale with command.Refuses splitting refusal from form, command.DeskRefusal over commandSettings' cloud flag, check.MarkerLines and command.AddedIn for the markers, and the session log through appendsRow. The test and check gates run as verbs through the quack road, so the Go verb starts no node itself.

The cold probe stays the box group's verb. I weigh three roads: a flag on probe.js handing it the staged delta, a port of probe-cold.js, or a commit that lands first and runs `probe cold` on the clone of HEAD. I take the third: the probe already clones HEAD, so the verb hands it no delta and touches no file of the box group. A FAIL takes the commit back with a soft reset, puts MERGE_HEAD back on a merge, and unstages, so nothing lands and nothing pushes. The cold path list stays owned by probe-cold.js, and commit.go spells it again with a pointer, as the hooks module does for its runtime folders.

The JavaScript leaves: commit-verb.js, push-verb.js, rename.js, verbs/commit.js, verbs/push.js, verbs/rename.js, commitDoors in cli-check.js, and their tests. verb-programs.test.js loads each program the verbs folder holds, so every later port deletes a file and edits no line of that test.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- RUNME.sh: hands every verb to quack verb
- src/quack/verbs.go: verbRoad and verbs, which take a registered verb to Go
- src/quack/twins.go: nodeAccept, which answers a registered verb through goAnswer for the MCP actions
- src/modules/verbs/tree.go: the Commands table naming commit, push and rename
- test/contract/verb-programs.test.js: loads every program
- test/contract/cli-check-doors.test.js: reads commitDoors
- test/level0/named.test.js: runs commitVerb

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/commit_test.go: TestCommitVerb, a case per road commit-verb.test.js and named.test.js cover
- src/quack/push_test.go: TestPushVerb, a green stamp pushes, no stamp or a stale stamp pushes nothing
- src/quack/rename_test.go: TestRenameVerb, a case per road rename.test.js covers
- src/quack/landing_test.go: TestLandingVerbsRegister, the registry holds commit, push and rename, and the road under new reaches no node for each

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/commit.go
- src/quack/push.go
- src/quack/rename.go
- src/quack/commit_test.go
- src/quack/push_test.go
- src/quack/rename_test.go
- src/quack/landing_test.go
- src/scripts/cli-check.js
- src/scripts/commit-verb.js, push-verb.js, rename.js, verbs/commit.js, verbs/push.js, verbs/rename.js, deleted
- test/level0/commit-verb.test.js, push-verb.test.js, rename.test.js, deleted
- test/level0/named.test.js
- test/contract/cli-check-doors.test.js
- test/contract/verb-programs.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I opened every file, function and verb the approach names, and checked each claim there: command.Battery, TicketFault, InHand, DeskRefusal, RefusesIn, AddedIn, check.MarkerLines, heardOver, appendsRow and edits.Entry
- the callers list names the road, the node module, the table and every JS importer a search of src and test finds
- each done_when line meets a test: go test for the roads, landing_test.go for no node and the registry, a search for the importers, and the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/landing_test.go src/quack/commit_test.go src/quack/push_test.go src/quack/rename_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/landing_test.go
- src/quack/commit_test.go
- src/quack/push_test.go
- src/quack/rename_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every case fails on its own assertion against stubs that answer -1. The verbs run over real git in a temporary repository with a bare origin. The verbs the road runs, Vale, the log and the clock are fakes. The undo journal module already holds the entry shape, so the rename entry embeds edits.Entry and adds the move. The surprise: the cold path list names src/quack/, so every commit of this group runs the cold probe on this box.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a red test: the roads in commit_test.go, push_test.go and rename_test.go, no node and no program in landing_test.go, the importer search in landing_test.go; the check is the checkpoint the implement step answers
- the verbs the road runs, Vale, the log and the clock have fakes in fakeLanding; git runs real against a temporary repository, the way split_test.go runs it

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- The approach answers the ask: three Go files register the verbs, and the JavaScript leaves with its importers.
- A red test decides each done_when line but the check, which stays the checkpoint tests-green answers.
- Fixed here: the merge fixture in `commit_test.go` runs git itself, and stands on no stub.
- Fixed here: `commit_test.go` gains the staging git refuses, a road the JavaScript tests held.
- Fixed here: `rename_test.go` gains the anchored link, the quoted path and the undo of a move.
- Every case fails on its own assertion against the stubs.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

go vet ./src/quack ./src/modules/hooks/command

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the draft names, plus test/contract/cli-leaves.test.js and two design notes that named the deleted files, and the exported state reader in its own file
- the verbs the road runs, Vale, the log and the clock come through landingDoors, and the tests fake each one
- each file header names the approach and points at this ticket or the design note it ports
- the cold path list and the stamp path stay owned by probe-cold.js and folders.js, and each Go copy names its owner in a comment

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
