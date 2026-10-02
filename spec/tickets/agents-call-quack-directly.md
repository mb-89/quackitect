---
kind: [[ticket]]
state: closed
step: implement/tests-green
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
group: quack-verbs-switch-over
record:
  - step: design/draft
    hand: box d85989c4d4d5 · claude-code-remote
    hash_before: 4898286ace12ab97bef4868bdc833843e77ac98c
    hash_after: 4898286ace12ab97bef4868bdc833843e77ac98c
    inputs:
      - name: ask
        hash: c1e32399db246db7
        size: 273
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d85989c4d4d5 · claude-code-remote
    hash_before: 04b92b7ea39f9eca5278e95e7ca2de9cf0a43e5e
    hash_after: 04b92b7ea39f9eca5278e95e7ca2de9cf0a43e5e
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 24b00f762b44efa4
        size: 3548
    def: 08e16d07b0de477c
  - step: gate
    hand: box d85989c4d4d5 · claude-code-remote · helper-3
    hash_before: 1d48fbba6454933daf4cec3eae13cbc4b6ad5135
    hash_after: 87ebcadc1711d6672f1b1a98ffc5ba565302c8af
    inputs:
      - name: design/draft
        hash: 24b00f762b44efa4
        size: 3548
      - name: design/tests-red
        hash: 54b3812c97580c07
        size: 892
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d85989c4d4d5 · claude-code-remote
    hash_before: 2bd99cb8010ff6756a87f9794c57a028b5ec682e
    hash_after: 2bd99cb8010ff6756a87f9794c57a028b5ec682e
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d85989c4d4d5 · claude-code-remote
    hash_before: 7698f081db4046b9f274d0836be4311e1cea489d
    hash_after: 7698f081db4046b9f274d0836be4311e1cea489d
    answered:
      - name: tests
        exit: 0
        said: green, 131 test(s) pass in 11 file(s); green, src/modules/migration passes; green, src/modules/verbs passes; green, src/
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: design/tests-red
        hash: 54b3812c97580c07
        size: 892
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

`migration/config/slices/verbs` moves to `new`. Agents call the index's tools, and shell out to no `./RUNME.sh` verb.

A call then costs one round trip and no parse.

- a case reads the tools a session registers, and finds every verb among them
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

Four moves, all inside the verbs slice.

1. The key moves to new. `spec/config/level0.json` sets `migration.verbs` to `new`, and the slice's built-in mode in `src/modules/migration/migration.go` reads `new`, as the open-tasks slice does. The verb road in `src/quack/verbs.go` already runs each twin alone under `new`.
2. Every top-level verb stands as a tool. A `verb` topic in `src/modules/verbs/tree.go` lists every verb `cli.js` answers outside a topic, `check` through `rename`, each an action `verb/<name>` handing `[<name>, ...args]` to the node module, as `Topic` hands `[topic, verb, ...args]`. `spec/wiring.yaml` loads it as instance `verb`, and `src/quack/main.go` registers the module type. The hook module's `registersIndexTools` then lists `index_verb_<name>` beside the topic tools it lists already, with no change of its own.
3. The session names the tools. `verbsText` in `src/bridge/guidance.js` reads `se-index tools` in place of `cli.js help`, and writes each tool as `mcp__level0__index_...` with its description. `verbLine` in `.claude/skills/level0/lib/bash.js` names the tools standing for check, branch, tui and doctor, and says to reach for the tool before the shell. A box whose binary answers no list keeps the `./RUNME.sh` line, since the hook registers no tool there and the verb still answers until cli-js-leaves.
4. The shadow leaves. `src/scripts/needs-shadow.js`, its call in `pull-hand.js` and its two test files go, since it runs in shadow alone. The road's shadow branch in `verbs.go` stays for cli-js-leaves, which rewrites that road whole.

Assumed: the shadow ran clean, since the owner set `phase4switch` true on main after reading it, and this box's log holds no verbs row. Weighed and refused: a Go port of every verb here. That is the cli-js-leaves child's work, and the group's split mints its ports.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/verbs.go: modeOf and roadOf, which read migration.verbs
- src/scripts/needs-shadow.js: needsShadow, which reads migration.verbs, called by shadowNeeds in src/scripts/pull-hand.js
- src/modules/migration/migration.go: Registers, which declares the slice's built-in mode
- src/quack/main.go: the module types table, which gains verb
- spec/wiring.yaml: instances, which gains verb
- .claude/skills/level0/lib/index-tools.js: registersIndexTools, which lists the new tools unchanged
- src/bridge/guidance.js: toolsText and verbsText
- src/bridge/bash.js: onDescribe, the one caller of verbLine
- .claude/skills/level0/lib/bash.js: verbLine

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/verb_tools_test.go: TestEveryVerbStandsAmongTheTools, which lists the tools over the real wiring and finds every verb cli.js's table and each topic's list name
- src/modules/verbs/tree_test.go: TestATreeVerbHandsItsWordsBare
- src/modules/migration/migration_test.go: the verbs slice's built-in mode reads new
- test/level0/tools-door.test.js: the verbs part lists the index tools off se-index tools
- test/level0/bash.test.js: the Bash description names the tools where the list answers, and the verbs where it answers nothing

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file and function named stands opened: verbs.go, migration.go, verbs module, wiring, main.go, index-tools.js, guidance.js verbsText, bash.js verbLine and onDescribe, needs-shadow.js and pull-hand.js
- the callers come off a grep for migration.verbs, verbLine, verbsText and the module types table
- each done_when line names its decider: TestEveryVerbStandsAmongTheTools for the tools, and ./RUNME.sh check for the rest

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/verbs/tree_test.go
- src/modules/migration/migration_test.go
- src/quack/verb_tools_test.go
- test/level0/tools-door.test.js
- test/level0/bash.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every new test fails on its own assertion: the tree verb hands verb lint in place of lint, the tree verbs list nothing, the verbs slice reads old, and the tool list lacks every top-level verb from check to rename. Surprise: branch test reports the JavaScript reds and none of the Go ones, so the Go reds come off go test run by hand over the verbs, migration and quack packages.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a red test: TestEveryVerbStandsAmongTheTools decides the tools, and ./RUNME.sh check decides the rest once green
- the tests reach the node module through q.Catalog with no outside, and the process door through fakeProc, so each door has its fake

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass with findings
- verbline-spares-blocking-verbs: verbLine sends the agent to index_verb_tui, but tui opens a window and serve never returns, and nodeAccept in src/quack/twins.go runs cli.js through CombinedOutput with no terminal; the line names check, branch and doctor, and keeps tui and serve off the tools it recommends
- runme-road-reads-verbs-new: test/contract/runme-road.test.js asserts migration.verbs reads shadow in spec/config/level0.json, a caller the draft misses; it breaks ./RUNME.sh check once the key moves to new, and the builder fixes it in place
- cage-comments-drop-needs-shadow: src/modules/hooks/cage.go names src/scripts/needs-shadow.js in two comments as the owner of the shadow row's fields; the pointer dangles once the file goes, so it points at cage.go's own row or the log note
- describe-reaches-the-tool-list: onDescribe in src/bridge/bash.js takes the event alone, and verbLine(tools) needs the tool list; the draft names no road from the list registersIndexTools reads to the bridge
- verb-outputs-name-index-tools: the hand-back lines and refusals under src/scripts, pull-chapter.js and ephemeral.js among them, still tell the agent to run ./RUNME.sh; the approach steers the two description surfaces alone, so the ask's shell out to no ./RUNME.sh verb stands half met

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

- the change touches the files the draft names, plus findings.js, whose shadowDoorsOf lost its last reader with needs-shadow.js
- the node module stands behind q.Request, so the change reaches no door past the catalog
- each new file opens with a comment naming this ticket
- the verb docs stand in tree.go, copied off the cli.js help once; cli-js-leaves takes the cli.js copy away

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The verbs slice stands at new. Every verb the command line answers now stands as an index tool: the topics as before, and every other verb under the new verb topic, which spec/wiring.yaml loads. The session reads those tools in its standing text and in the Bash description, and the pull hands its next call as a tool. The needs shadow left with the slice, and its doors in findings.js with it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the drafted files, plus the gate findings each as its own ticket in the group
- every door stands behind q.Request or fakeProc in the tests
- each new file opens with a comment naming its ticket
- each fact stands once: the tool prefix in lib/index-tools.js, the verb docs in tree.go

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
