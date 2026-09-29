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
