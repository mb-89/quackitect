---
kind: [[ticket]]
state: open
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
  - step: design/tests-red
    hand: box d856f55387d6 · claude-code-remote
    hash_before: 4f9532c8db466c75ebf149fdabb6f69e2fa9b408
    hash_after: 4f9532c8db466c75ebf149fdabb6f69e2fa9b408
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: f3b5d686ac3a0cbe
        size: 3706
    def: 08e16d07b0de477c
  - step: gate
    hand: box d856f55387d6 · claude-code-remote · helper-3
    hash_before: 46e3cb4ccd27f3c23d795f9765bbdca4a0664786
    hash_after: 46e3cb4ccd27f3c23d795f9765bbdca4a0664786
    inputs:
      - name: design/draft
        hash: f3b5d686ac3a0cbe
        size: 3706
      - name: design/tests-red
        hash: bef6251a63abb67c
        size: 538
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d857c176ced7 · claude-code-remote
    hash_before: a68107325611710730f66c8a76c796329bea2d7a
    hash_after: 5d021e20afeff079325ee6bb62cb144b60a8d37a
    answered:
      - name: lint
        exit: 0
        said: "test/level0/cli-read.test.js:8:1: correctness/noUnusedImports: Several of these imports are unused."
    def: f150b8c0dc20fe45
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

./RUNME.sh test test/contract/twins-left.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

test/contract/twins-left.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

All three cases fail on their own assertion: the four twin files stand, the tree imports them, and the enum still lists old and shadow. Nothing surprised me.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a test that fails: twins-left.test.js decides the import line, and the check decides the exit
- every door the tests reach has a fake: the contract test reads the real tree through the disk door, as a contract test does

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- check-twins-leave-phase-seven: the ask names the twins row of the migration note (tree, schema, size, magic, names, paths, private, slug, the Vale and Biome parsers), and the group's done line reads no JavaScript twin of a Go check stands, yet the approach removes the four comparison twins alone. The code backs the scoping: bridge/write.js, bridge/bash.js, precommit.js, cli-check.js and bridge/findings.js import the lib check twins, and every check/ name in src/modules/check/check.go holds an empty list until phase 7. No ticket owns their leave, so this child carries it to phase 7 and moves the group's done line to match.
- topic-fallback-leaves-the-readers: readers-take-the-go-topics hands the old-path fallback to this ticket to remove, and the approach keeps it on the assumption that the quack binary stands everywhere. This child removes the fallback once that holds, and makes a topic answering null a fault.
- twins-leave-misses-some-callers: the builder fixes these in place. test/level0/check-server.test.js holds a case on the log verb's shadow doors. src/modules/hooks/cage.go names src/scripts/log-shadow.js as the owner of the shadow row in two comments. src/scripts/cli-read.js carries the prose shadow's config and log. The help text of the five keys in spec/config/level0.schema.json still names old and shadow. The callers list says pull-hand.js imports processNameOf from guidance-shadow.js, but it already imports it from quack-topic.js.

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

- the change touches no file the ask leaves out: the twins, their tests, their wiring, the schema's five keys and their projection, plus the faults the children name
- every door the change reaches has a fake: the readers run over the fake disk, process and log in topic-readers.test.js
- a comment names the approach: each reader's line points at readers-take-the-go-topics or topic-fallback-leaves-the-readers
- every fact stands in one place: the prose modes live in quack-topic.js, and the readers import them there

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
