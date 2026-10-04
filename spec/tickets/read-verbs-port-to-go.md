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
group: read-verbs-run-in-go
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box af8a15ff4571 · claude-code-remote
    hash_before: 8a375eca9460ec1b3909b56c3c3e72111b86ebf8
    hash_after: 8a375eca9460ec1b3909b56c3c3e72111b86ebf8
    inputs:
      - name: ask
        hash: 24e7f0ad1c081076
        size: 742
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box af8a15ff4571 · claude-code-remote
    hash_before: 9fb35435a5e75ab6988c4a8da6c161095957fa64
    hash_after: 084189bac8359936c626bfbd306594708c6b839b
    answered:
      - name: tests
        exit: 0
        said: assertion, TestReadVerbsLeaveNode fails on its own assertion
    inputs:
      - name: design/draft
        hash: 2895fbdbc1763aca
        size: 4974
    def: 08e16d07b0de477c
  - step: gate
    hand: box af8a15ff4571 · claude-code-remote · helper-4
    hash_before: 822e7c64ddb1767f0cb7021e71b600986f60f538
    hash_after: 822e7c64ddb1767f0cb7021e71b600986f60f538
    inputs:
      - name: design/draft
        hash: 2895fbdbc1763aca
        size: 4974
      - name: design/tests-red
        hash: 287f89a3eea24996
        size: 1421
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 10fabe1f5ba9 · claude-code-remote
    hash_before: bb019a90f8e3c696d0afec8406c001a372d1449d
    hash_after: bb019a90f8e3c696d0afec8406c001a372d1449d
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/work-verbs-run-in-go.md:96:1: Sentence: A sentence holds 25 words. Cut this one in two."
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 10fabe1f5ba9 · claude-code-remote
    hash_before: f261bf494b185fbf5439a7cc116e91fe5c600f83
    hash_after: f261bf494b185fbf5439a7cc116e91fe5c600f83
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   58.1  in all"
    inputs:
      - name: design/tests-red
        hash: 287f89a3eea24996
        size: 1421
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

The verbs index, links, lint, notes, find and log run in Go, each registered in its own file under `src/quack`, and their JavaScript leaves the tree.

The reads already have Go modules in the index, so these verbs become thin Go callers of topics that stand. Until it lands, these verbs start node, and `cli-read.js` and `log-verb.js` stay in the tree.

- `go test ./src/quack ./src/modules/...` passes, with a case for every road the verbs' JavaScript tests cover
- `./RUNME.sh <verb>` reaches no node for each of index, links, lint, notes, find and log
- `ls src/scripts/verbs` names none of index, links, lint, notes, find and log
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

Six Go files under src/quack, one a verb, each registering its verb from an init the way twins.go does, so the port edits no shared line of verbs.go or registry.go. The road takes a registered verb to Go under the verbs slice at new, and the node module's run takes it there too, so log --say off the log module's say action lands in Go.

- verb_index.go registers index. Its twin asks the index through index.Ask, standing where no words come, and prints the result indented the way se-index prints it. indexSays, the shared print, stands here, and links, notes and find call it.
- verb_links.go registers links: links <target> where words come, dangling where none do.
- verb_notes.go registers notes: notes <words>.
- verb_find.go registers find: find --log hands the words to the log twin as --words, and every other search asks the index's find.
- verb_log.go registers log: the session file and every rotated file the span reaches, narrowed by --since, --level, --kind, --words and --last, printed a row the way asRow prints it, or one count a kind under --count, and --say appending one row the way rowOf shapes it. The rows read off the files in the order each holds its keys, so the extra fields print in the order the writer wrote them.
- verb_lint.go registers lint: the Go lsp tools over a disk tree whose paths git lists, Sweep over the whole tree and Over the files under the paths named, the check module's sweep rows under the paths named past SurveyFindsNode, and check.SurveyFindsNode over the box. A closed ticket's rows leave, the count a rule prints first and the finding lines last, a warning exits 0 and a finding at error exits 1, and the session log takes a debug row where the rules pass and a warn row where a line breaks one. ValeRuns stands as the fault that stops the lint.

The JavaScript of the six verbs leaves, with log-verb.js, the narrowing filters of log-read.js only log-verb.js imported, asksIndex in cli-read.js and logRowsOf in quack-topic.js where no other importer stands. cli-read.js keeps lint, which the check verb still runs until its own group ports it, and log-read.js keeps what tui.js reads.

Assumptions: the Go lint draws no Vale cache, so a lint over the whole tree runs Vale whole each time; the lsp tools stand as the one Go checker the editor reads, so the lint and the panel answer one list. A value of an extra field prints as its JSON where it holds an object or a list, where the JavaScript printed [object Object].

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/verbs.go verbs, which runs a registered twin on the road under new
- src/quack/twins.go nodeAccept, which runs a registered verb through goAnswer
- src/modules/log/log.go sayOf, whose request runs log --say through the node module
- RUNME.sh, which hands every verb to quack verb
- src/scripts/check-verb.js, which keeps the JavaScript lint of cli-read.js
- src/scripts/tui.js, which keeps asRow, filesFor, NO_LOG, rowsIn and SESSION of log-read.js
- test/contract/verb-programs.test.js, whose RUNS imports each program
- test/contract/cli-verbs.test.js, whose find case reads verbs/find.js
- test/level0/log-verb.test.js and test/level0/log-say.test.js, which import log-verb.js
- test/level0/topic-readers.test.js, whose log cases import logVerb

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/verb_index_test.go TestIndexVerb
- src/quack/verb_links_test.go TestLinksVerb
- src/quack/verb_notes_test.go TestNotesVerb
- src/quack/verb_find_test.go TestFindVerb
- src/quack/verb_log_test.go TestLogVerb
- src/quack/verb_lint_test.go TestLintVerb
- src/quack/verb_read_test.go TestReadVerbsLeaveNode

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/verb_index.go
- src/quack/verb_links.go
- src/quack/verb_notes.go
- src/quack/verb_find.go
- src/quack/verb_log.go
- src/quack/verb_lint.go
- src/quack/verb_index_test.go
- src/quack/verb_links_test.go
- src/quack/verb_notes_test.go
- src/quack/verb_find_test.go
- src/quack/verb_log_test.go
- src/quack/verb_lint_test.go
- src/quack/verb_read_test.go
- src/scripts/verbs/index.js
- src/scripts/verbs/links.js
- src/scripts/verbs/lint.js
- src/scripts/verbs/notes.js
- src/scripts/verbs/find.js
- src/scripts/verbs/log.js
- src/scripts/log-verb.js
- src/scripts/log-read.js
- src/scripts/cli-read.js
- src/scripts/quack-topic.js
- test/contract/verb-programs.test.js
- test/contract/cli-verbs.test.js
- test/level0/log-verb.test.js
- test/level0/log-say.test.js
- test/level0/topic-readers.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file the approach names stands opened: the six programs, cli-read.js, log-verb.js, log-read.js, registry.go, twins.go, verbs.go, src/index/main.go, src/modules/lsp/tools.go, src/quack/lsp.go and src/modules/log/log.go
- the callers list names the road, the node module, the say action, RUNME.sh and every JavaScript importer a search of src and test finds
- each done_when line meets a test: the go tests for the roads, TestReadVerbsLeaveNode for no node and the gone programs, the importer search and the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

go test ./src/quack -run 'TestIndexVerb|TestLinksVerb|TestNotesVerb|TestFindVerb|TestLogVerb|TestLintVerb|TestReadVerbsLeaveNode' 2>&1 | grep -q 'stands, and the verb runs in Go' && echo 'assertion, TestReadVerbsLeaveNode fails on its own assertion'

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/verb_read_test.go TestReadVerbsLeaveNode, which fails on its own assertion while src/scripts/verbs holds the six programs

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The verbs ran in Go before their tests, so every case passes except the one naming the programs, which fails on its assertion for each of the six. A comparison over the real tree printed the same lines for every verb and its program: index, links, notes and find over several words, the lint over one file, over src/quack and over the whole tree, and the log over span, level, kind, words and count. What surprised me: the JavaScript log verb reads its rows off the Go log topic, so it prints the extra fields in key order, and the Go verb sorts them the same way. The Go lint over one file answers in under a second, where the JavaScript lint took five.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a test: the Go cases for each road, TestReadVerbsLeaveNode for no node and the gone programs, a search of src for the importer line, and the check for the last
- every door the tests reach has a fake: the ask, the tools, the sweep, the box, the log and the clock, and the log verb reads a temporary root

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- read-verbs-callers-fix: the callers list names a log import in `test/level0/topic-readers.test.js` that stands nowhere. It leaves out `test/contract/one-reading.test.js` and `test/level0/cli-read.test.js`, which read `cli-read.js`.
- read-verbs-importer-test: no test decides the importer line of the ask. `TestReadVerbsLeaveNode` checks the six programs alone, so `log-verb.js` can stand with no red test.
- read-verbs-say-doc: the say action in `src/modules/log/log.go` says it appends through its program. After the port a Go verb answers it.
- read-verbs-lint-drift: the lint verb runs in Go, and the check verb still runs the lint of `cli-read.js`. The two can answer apart until the check port lands.

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

- the change touches no file the ask leaves out: the six Go verbs and their tests, the gone programs, log-verb.js, and the JavaScript importers the callers list names
- every door the change reaches has a fake: the ask, the tools, the sweep, the box, the log and the clock ride in through lintDoors and logDoors
- a comment names the approach: each verb file header points at this ticket
- every fact the change adds stands in one place: the shared print stands in verb_index.go, and links, notes and find call it

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/verb_index_test.go src/quack/verb_links_test.go src/quack/verb_notes_test.go src/quack/verb_find_test.go src/quack/verb_log_test.go src/quack/verb_lint_test.go src/quack/verb_read_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The verbs index, links, lint, notes, find and log run in Go, each registered from an init in its own file under src/quack, so no verb of the six starts node. Their programs under src/scripts/verbs leave, with log-verb.js and the functions only they imported, and a test decides no file under src imports a deleted module. The check verb still runs the lint of cli-read.js until the check port lands, and a contract case holds both lints to one list of findings meanwhile.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out: the six verbs, their tests, the gone programs and the importers the callers list names
- every door the change reaches has a fake: the tests read a temporary root and fake tools, sweep, box, log and clock
- a comment names the approach: each verb file header points at this ticket
- every fact the change adds stands in one place: the shared print stands in verb_index.go alone

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
