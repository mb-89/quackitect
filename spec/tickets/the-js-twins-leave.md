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
group: read-topics-switch-over
depends_on: ["readers-take-the-go-topics"]
record:
  - step: design/draft
    hand: box d856f55387d6 · claude-code-remote
    hash_before: 3ccde63fd25bd8305e34835de15f380d756ccb28
    hash_after: 3ccde63fd25bd8305e34835de15f380d756ccb28
    inputs:
      - name: ask
        hash: 9ccacd0d11dbb476
        size: 292
      - name: [[spec/design_output/migration]]
        hash: cea2b1b9bf4bfda7
        size: 14154
    def: 71651f49796eeda4
---

# Ask

The JavaScript twins leave the tree, with their cases, as the twins row of [[spec/design_output/migration#what-goes-with-no-successor]] lists them.

A twin left standing drifts from its Go copy again.

- `./RUNME.sh check` names no module importing a removed twin
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

The comparison twins leave: src/scripts/config-shadow.js, src/scripts/log-shadow.js, src/scripts/guidance-shadow.js and src/bridge/prose-shadow.js, with the seven test files beside them (config-shadow, log-shadow, log-shadow-wiring, guidance-shadow, guidance-shadow-wiring, prose-shadow and prose-shadow-wiring under test/level0). Their wiring leaves the readers: configShadow and its import in cli-check.js, shadowLog in log-verb.js, shadowLeaf in guidance-verb.js and pull-hand.js, shadowDraft and shadowOver with their imports in bridge/prose.js and bridge/findings.js. The two names the twins owned that a reader still uses move to the file that keeps them: ALL and PAST go to src/scripts/quack-topic.js, and quackAt and processNameOf already stand there, so the re-exports go. shadowDoorsOf in findings.js stays, since needs-shadow.js of the verbs slice reads it. The five keys drop old and shadow from their enum in spec/config/level0.schema.json, as phase 2 did for opentasks, and the projected se-config-migration commands for those values follow through ./RUNME.sh project. A contract test, test/contract/twins-left.test.js, decides the done line: no removed file stands, and no source under src, test or .claude imports one. Weighed: the old-path readers (settings.all in the config verb, rowsIn in the log verb, readsFor in guidance, the wink vetoes in engine/tense.js and the check twins in lib) stay for now. Each still serves a caller outside this slice: the hooks and the cage (phase 5), the verbs (phase 4) and the LSP's check verb (phase 7), and the check module's names hold empty lists until phase 7 moves the rules in. Removing them would break callers no test here fakes. So the group's done line reads over the comparison twins, and the old-path readers leave with the last caller of each, recorded in the retro as the improve line. Assumed: the quack binary stands wherever a reader runs, so a topic answering null is a fault, and the fallback carries it until then.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/cli-check.js: readConfig calls configShadow, which calls shadowRun of config-shadow.js
- src/scripts/log-verb.js: logVerb calls shadowLog of log-shadow.js
- src/scripts/guidance-verb.js: stepNotes calls shadowLeaf of guidance-shadow.js
- src/scripts/pull-hand.js: handed calls shadowLeaf, and imports processNameOf from guidance-shadow.js
- src/bridge/prose.js: readsProse calls shadowDraft, which calls shadowProse and quackAt of prose-shadow.js
- src/bridge/findings.js: findingsOver and voiceOver call shadowOver, which calls shadowProse of prose-shadow.js
- src/scripts/needs-shadow.js: shadowNeeds calls shadowDoorsOf of findings.js, which calls quackAt
- src/scripts/quack-topic.js: quackAt and processNameOf, which the twins re-export
- spec/config/level0.schema.json: the enum of each of the five keys
- test/contract/cli-check-doors.test.js: the case reading configShadow in readConfig

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/contract/twins-left.test.js: no removed twin file stands
- test/contract/twins-left.test.js: no file under src, test or .claude imports a removed twin
- test/contract/twins-left.test.js: the five keys take new alone in the schema enum

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened: the four twins, cli-check.js readConfig, log-verb.js logVerb, guidance-verb.js stepNotes, pull-hand.js handed, prose.js readsProse, findings.js shadowOver and shadowDoorsOf, needs-shadow.js
- the callers list names every caller, from a search for each twin's file name and each exported name
- every done_when line names its test: twins-left.test.js decides the import line, and ./RUNME.sh check decides the exit

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
