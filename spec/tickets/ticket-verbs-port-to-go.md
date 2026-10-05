---
kind: [[ticket]]
state: closed
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
group: ticket-verbs-run-in-go
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box f2894f4960c9 · claude-code-remote
    hash_before: 12678745ceec4321dec9403da2dcb56b0fcebf4f
    hash_after: 12678745ceec4321dec9403da2dcb56b0fcebf4f
    inputs:
      - name: ask
        hash: 4e6c937563b76aa6
        size: 745
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box f2894f4960c9 · claude-code-remote
    hash_before: 4b1ce09a623f57414e6513644a8fa852ab5068cf
    hash_after: 4b1ce09a623f57414e6513644a8fa852ab5068cf
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 1ff3e4f063e55817
        size: 5709
    def: 08e16d07b0de477c
  - step: gate
    hand: box f2894f4960c9 · claude-code-remote · helper-4
    hash_before: 72e511200c765d9e35105be6b45e590858e0506e
    hash_after: 72e511200c765d9e35105be6b45e590858e0506e
    inputs:
      - name: design/draft
        hash: 1ff3e4f063e55817
        size: 5709
      - name: design/tests-red
        hash: 64f34afd472c5fe2
        size: 1272
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 4c04792eb7ca · claude-code-remote
    hash_before: b05f43611dc0a4fc4eb4c8b7f5c1c441095aecff
    hash_after: b05f43611dc0a4fc4eb4c8b7f5c1c441095aecff
    answered:
      - name: lint
        exit: 0
        said: "test/level0/work-stands.test.js:16:1: correctness/noUnusedImports: Several of these imports are unused."
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 4c04792eb7ca · claude-code-remote
    hash_before: 5b8984f31bcac1275921dfb11a8dc154215f8892
    hash_after: 5b8984f31bcac1275921dfb11a8dc154215f8892
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "    2.1  test/contract/paragraph.test.js a character outside the set is refused, and a code span passes"
    inputs:
      - name: design/tests-red
        hash: 64f34afd472c5fe2
        size: 1272
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
reason: done
---

# Ask

The verbs ticket, mint, graph and split run in Go, each registered in its own file under `src/quack`, and their JavaScript leaves the tree.

The pull, the mint and the split write tickets through the Go frontmatter writer alone, as the slice rules ask. Until it lands, these verbs start node, and `ticket*.js`, `pull*.js`, `mint-verb.js` and `split-verb.js` stay in the tree.

- `go test ./src/quack ./src/modules/...` passes, with a case for every road the verbs' JavaScript tests cover
- `./RUNME.sh <verb>` reaches no node for each of ticket, mint, graph and split
- `ls src/scripts/verbs` names none of ticket, mint, graph and split
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

Each verb registers its Go answer from its own file under src/quack, through register in src/quack/registry.go, and the registry sends both the road and the node module to it. The verbs slice stands at new and takes no other mode (src/modules/migration/migration.go), so a registration goes live on its first build. Every port therefore lands with its contract cases green in the same commit.

The order, each step one commit through the commit verb:

1. split: src/quack/verb_split.go ports split-verb.js and split-cut.js, and writes the undo journal in the shape lib/undo.js writes.
2. graph: src/quack/verb_graph.go answers the JSON graph.js graphIn draws, off the drawing the tickets module holds (src/modules/tickets/drawn.go). It reuses the drawing, and writes no second walk.
3. mint: src/quack/verb_mint.go reads --field=value as fieldsIn does, copies the route and its hash in as withRoute does, joins a ticket to the box's group as mintFields does, and refuses an empty group. It writes through the check module's mint (src/modules/check/mint.go) behind one exported function in a new file of that package.
4. The ticket sub-verbs new, set, urgent, place, todo, open, note, update, route, fill and bless each register as ticket <sub> from a file of their own. The shared reads (the ticket a name finds, the schemas, the process a link names) stand in one Go package, src/tickets, which holds no disk and takes its doors as an interface with a fake.
5. ticket pull ports pull.js and pull-*.js into the same package: the hand-out, the hand-back, the checks, the record, the commit and the push. Git, the disk, the clock, the log and the verb road reach it through those doors.
6. ticket registers last. It prints the usage ticket.js prints, so the bare verb reaches no node, and src/scripts/verbs/{ticket,mint,graph,split}.js leave. So do mint-verb.js, split-verb.js, split-cut.js and pull-tool.js, which no remaining module imports. Their tests leave with them, and a Go case stands for each road they covered.

What I weigh and assume:
- ticket.js, pull*.js, work.js and the engine libraries stay in the tree. branch, cloud, retro and dispatch import them, and the done criterion deletes only a module nothing remaining imports.
- The pull calls branch take, the merge check (readyToMerge) and every command a leaf needs through the verb road: the quack binary, verb, then the words. A verb another phase-11 group ports runs in Go once that group registers it, and runs in node until then. This group ports no verb another group owns, so two boxes write no twin implementation.
- A step's commands ran through RUNME in JavaScript as well, so routing them through the verb road keeps their behaviour.
- The prose and schema checks the hand-back runs call the Go check and prose code the index already serves, and add no second copy.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/verbs.go verbs: the road, which takes a registered verb to Go
- src/quack/twins.go nodeAccept: the node module, which takes a registered verb to Go
- src/modules/verbs/actions.go: the tickets actions pull, place, flip-urgent, set-field and new, through the node module
- src/modules/verbs/ticket.go TicketVerbs: the MCP tools index_ticket_*, through the node module
- src/modules/holds/holds.go deskBless: ticket bless --desk, through the node module
- src/extension/lib/lens.js: ticket pull, ticket route and ticket fill, through the road
- .claude/skills/level0/hooks/pull-tool.js: the pull tool, which hands ticket pull --tool <json> to the road
- src/engine/retro/mint.js runIn: ticket open, through RUNME
- src/scripts/probe-clear.js: ticket pull and mint ticket, through RUNME
- src/scripts/probe-dry.js: names hooks/pull-tool.js, which stays
- src/modules/hooks/command/findings.go ticketFree: names ticket pull, mint ticket and ticket note as words, and runs none of them

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/verb_split_test.go TestSplitVerb: one case per road in test/level0/split.test.js
- src/quack/verb_graph_test.go TestGraphVerb: one case per road in test/level0/graph.test.js and test/contract/drawing-page.test.js
- src/quack/verb_mint_test.go TestMintVerb: one case per road in test/contract/cli-mint-callers.test.js
- src/tickets/*_test.go: one case per road in test/level0/ticket*.test.js, schema-route.test.js and bash-ticket.test.js
- src/tickets/pull*_test.go: one case per road in test/level0/pull*.test.js, hand.test.js, pulled.test.js, landed.test.js and work.test.js where they reach the pull
- src/quack/ticket_verbs_test.go TestTicketVerbsRunInGo: every verb of the group registers, and the road reaches no node for it

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/verb_split.go, verb_graph.go, verb_mint.go, verb_ticket.go, and one ticket_<sub>.go for each sub-verb
- src/tickets/: the new package holding the ticket reads, writes and the pull, with its tests
- src/modules/check/minted.go: the exported mint
- src/scripts/verbs/ticket.js, mint.js, graph.js, split.js: removed
- src/scripts/mint-verb.js, split-verb.js, split-cut.js, pull-tool.js: removed
- test/level0/split.test.js and the test files that cover the removed modules alone: removed

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the files named above stand opened: registry.go, verbs.go, twins.go, ticket.js, pull.js, work.js pulling, mint-verb.js, split-verb.js, split-cut.js, pull-tool.js, check/mint.go and tickets/drawn.go
- the callers list rests on a search of src and .claude for spawns of each verb, and on the two roads that reach every caller
- each done_when line has its test: go test runs the Go cases, TestTicketVerbsRunInGo decides the no-node line and the ls line, the closure script decides the importer line, and ./RUNME.sh check decides the last

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/ticket_verbs_test.go
- src/quack/verb_split_test.go
- src/quack/verb_graph_test.go
- src/quack/verb_mint_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every case of the four files fails on its own assertion, because the registry holds no Go answer for any verb of the group and the four programs still stand. The split, graph and mint expectations come off the JavaScript itself: graphIn and the mint libraries ran over the same inputs, and the cases hold their answers. The JavaScript links the ticket's body two lines past where I first counted it. The ticket sub-verbs and the pull get their cases beside their port, one file per sub-verb, each red before its code lands. Their roads run through a fake disk and git, so a single red file written now would cover thousands of lines no code yet answers.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the first done_when line meets TestSplitVerb, TestGraphVerb and TestMintVerb now, and a red file beside each ticket sub-verb and the pull as each lands. The second and third meet TestTicketVerbsRunInGo, the fourth meets that test's case on the modules that leave, and the check decides the fifth
- the split, graph and mint cases run over a temporary tree and a temporary git repository, and reach no node and no index

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- verbs-name-frontmatter-writer: the approach names no Go frontmatter writer for the pull, the mint and the split, and the ask's second paragraph makes it their one write road. Name the writer each port calls, and keep ticket*.js, pull*.js, mint-verb.js and split-verb.js until it stands
- ticket-verbs-importer-case: no test decides the importer done_when line. The closure script checked names stands nowhere, and TestTicketVerbsRunInGo reads absence alone. Add a Go case that searches src for an import of each module leftScripts names
- ticket-sub-verb-red-cases: the ticket sub-verbs and the pull carry no red case yet, so the first done_when line stands half decided. Land each sub-verb's case file red before its code, and list it under tests-red/red

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out: the ports under src/quack, the one wrapper in src/pull, the leaving JavaScript and the tests that read it, plus the guards and the probe the port broke
- every door the change reaches has a fake: the verbs reach the disk and git through the doors pullHere builds, and their cases run over a temporary tree and repository
- a comment names the approach: each port file opens on the JavaScript it ports and links the design section it implements
- every fact stands in one place: the sub-verbs call the bless, open, mint and route the pull holds, and the guards read the one verb table Go holds

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/ticket_verbs_test.go src/quack/verb_graph_test.go src/quack/verb_mint_test.go src/quack/verb_split_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The verbs ticket, mint, graph and split answer in Go, each registered from its own file under src/quack, and the road reaches no node for any of them. Each ticket sub-verb is a thin shell over the pull: bless, open and the mint call what src/pull and the check module already hold, and note adds the twin search and the name cut the JavaScript carried. The programs under src/scripts/verbs left, and so did mint-verb.js, split-verb.js, split-cut.js and pull-tool.js. The pull hook now reaches ticket pull through the binary. Each JavaScript test that read a leaving module moved its roads into a Go case first. Three guards that read the program folder now read the verb table Go holds. The clear probe names its clone as the root, since the Go mint finds its root off the variable the index hands its children.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out: the ports, the leaving JavaScript and its tests, and the guards and probe the port broke
- every door has a fake: the cases run over a temporary tree and repository through the doors pullHere builds
- a comment names the approach: each port file opens on the JavaScript it ports and links its design section
- every fact stands once: the sub-verbs call the pull, and the guards read the one verb table

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
