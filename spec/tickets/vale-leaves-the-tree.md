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
group: lint-without-vale
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: e3b8ae9465e15a2209197dccdd9905cb62b9b006
    hash_after: e3b8ae9465e15a2209197dccdd9905cb62b9b006
    inputs:
      - name: ask
        hash: 4ed0dfbcf1eb4026
        size: 528
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 4fca338d9f4141a63bb191bb54f03c5f2928d13a
    hash_after: 4fca338d9f4141a63bb191bb54f03c5f2928d13a
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 413cfeb6b012b800
        size: 5070
    def: 08e16d07b0de477c
  - step: gate
    hand: box 09cf21ad3c5d · claude-code-remote · helper-4
    hash_before: f00fc7aab70f4dd78af8954c3580a7216073ed00
    hash_after: f00fc7aab70f4dd78af8954c3580a7216073ed00
    inputs:
      - name: design/draft
        hash: 413cfeb6b012b800
        size: 5070
      - name: design/tests-red
        hash: 2ca6d5ec6b7e972b
        size: 1255
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: d216e837464cdd1c26b2401f2a231f4490fb25a7
    hash_after: 86c58fd54e0504b81eea501d3f300c3c96aa313e
    answered:
      - name: lint
        exit: 0
        said: "test/level0/work-stands.test.js:16:1: correctness/noUnusedImports: Several of these imports are unused."
    def: f150b8c0dc20fe45
---

# Ask

One program owns every prose rule, so a box installs no Vale binary and an editor reads the same Go rules the commit reads.

Vale, its install, its configs and the voice verb's Vale run stand beside the Go rules. Every rule change meets two engines, and every box downloads a tool nothing needs.

- `git grep -il -e '\.runtime/bin/vale' -e 'vale-ls' -e 'errata-ai' -e '\.vale\.ini' -- src test RUNME.sh .github` answers nothing.
- `go test ./src/quack/ ./src/voice/` passes.
- `./RUNME.sh check` exits 0.

view: none

from: none

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

Vale leaves in six moves. Each replaces a Vale road with the Go rules, or drops a road nothing needs.

1. The install and the lists. `src/scripts/install.sh` downloads neither Vale nor vale-ls. The survey, `Wanted` in `src/modules/check/tree.go`, the brief's tool rows, the tools verb and the CI cache keys drop both names.
2. The editor. The Go lsp draws the rules already. So the Vale extension's offer, the `vale.valeCLI` settings, the check's settings rules over that extension, `valeLevel`, and their twins in `lib/tree.js` and `lib/servers.js` leave. The extension's watch on `.vale.ini` leaves too.
3. The voice verb. `measure` in `src/voice/voice.go` reads `rulesAt(root)` and `Set.Lint` per file, as `lspRules` does. `valeAt`, `voiceRunsVale` and the JSON parsers leave.
4. The fix verb. A new `Apply` in `src/rules` rewrites a text by each finding's replace action. `calm` reads the Capitalization rows of the Go rules. `fix` runs both with no binary.
5. The lsp module. The Vale branch of `src/modules/lsp/tools.go` and `valeBuilt` in `door.go` leave. `ValeRuns` becomes `RulesLoad`, since it names a rules load that fails.
6. The JavaScript readers. `askFaults` and `pull-chapter.js` read through `src/doors/vale.js`, which asks the rules-over verb. `it.vale`, `voiceOver`, `valeArgvOf`, `configOf`, `findingsOver`, `vale-rows.js`, `lintedBy`, `styles.js` and the check's Vale twin leave. So do the exports the note `js-lint-leftovers-stand-dead` names.

Then `.vale.ini` and `spec/config/editor.vale.ini` leave. The projection writes no Tengo body, since the Go scripts dispatch by name. A case shows a YAML file under `spec/vocabulary` still meets its rules, which the ini's formats block held.

The done_when grep excludes `testdata`. Those goldens snapshot ticket names such as `vale-ls-on-windows`, and run nothing.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/install.sh: the vale and vale-ls installs
- src/quack/survey.go: the survey list
- src/modules/check/tree.go: Wanted, the settings rules
- src/modules/check/install.go: valeLevel
- src/modules/hooks/brief/brief.go: the tool rows
- src/quack/setup_verb.go: the editor's extension offer
- .claude/skills/level0/lib/tree.js, servers.js, tools.js
- src/quack/command.go: valeAt
- src/quack/voice_verb.go: voiceRunsVale
- src/voice/voice.go: measure and the row parsers
- src/quack/verb_fix.go: fixVerb, calm
- src/modules/lsp/tools.go: the Vale branch, ValeRuns
- src/modules/lsp/door.go: valeBuilt
- src/quack/rules.go and verb_lint.go: ValeRuns
- src/scripts/cli-doors.js: it.vale
- src/bridge/findings.js: voiceOver, valeArgvOf, configOf, findingsOver
- src/scripts/ticket-ask-lint.js: askFaults
- src/scripts/pull-chapter.js: the chapter lint
- src/scripts/prepush.js: lintedBy
- src/scripts/styles.js: assemble
- src/scripts/check-twins.js and src/quack/check.go: the vale twin
- src/projection: the Tengo bodies
- src/extension/lib/lsp.js: the ini watch
- .github/workflows/check.yml and dispatch.yml: the cache keys

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/rules/apply_test.go TestApply: a replace action rewrites its match, and a finding with no action leaves the text
- src/voice/voice_test.go: measure reads the Go rules over a seeded root, and runs no binary
- src/quack/verb_fix_test.go: fix applies the Go rules' swaps and calms a shout, with no Vale
- src/modules/lsp/tools_test.go: the tools draw the rules, and a failed load names RulesLoad
- src/rules/load_test.go: a YAML file under spec/vocabulary meets its rules
- test/level0/ask-lint.test.js: the ask lint reads the rules-over verb
- test/contract/install.test.js: the install names no Vale

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/scripts/install.sh
- src/quack/survey.go
- src/modules/check/tree.go
- src/modules/check/install.go
- src/modules/hooks/brief/brief.go
- src/quack/setup_verb.go
- .vscode/extensions.json
- .vscode/settings.json
- .claude/skills/level0/lib/tree.js
- .claude/skills/level0/lib/servers.js
- .claude/skills/level0/lib/tools.js
- .claude/skills/level0/lib/vale.js
- src/quack/command.go
- src/quack/voice_verb.go
- src/voice/voice.go
- src/quack/verb_fix.go
- src/rules/apply.go
- src/modules/lsp/tools.go
- src/modules/lsp/door.go
- src/quack/rules.go
- src/quack/verb_lint.go
- src/scripts/cli-doors.js
- src/bridge/findings.js
- src/bridge/vale-rows.js
- src/scripts/ticket-ask-lint.js
- src/scripts/pull-chapter.js
- src/scripts/prepush.js
- src/scripts/styles.js
- src/scripts/quack-topic.js
- src/scripts/check-twins.js
- src/quack/check.go
- src/projection
- src/extension/lib/lsp.js
- .github/workflows/check.yml
- .github/workflows/dispatch.yml
- .vale.ini
- spec/config/editor.vale.ini
- the tests and goldens naming Vale, under src and test

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file the approach names stands opened by the survey helper, and each claim was checked there: `src/rules` loads `spec/config/styles`, and reads no ini
- the callers list names each caller the survey found, by file and function
- the size list names every file the approach touches, and the tests list holds a case for each move that changes code

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/rules/apply_test.go src/voice/voice_test.go src/quack/verb_fix_test.go src/quack/rules_test.go test/contract/install.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/rules/apply_test.go
- src/voice/voice_test.go
- src/quack/verb_fix_test.go
- src/quack/rules_test.go
- test/contract/install.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion. `Apply` answers the text unchanged, `measure` and `fix` stop on Vale is missing, the failed load names `ValeRuns`, and the install still fetches Vale. The stubs are `Apply` in `src/rules/apply.go`, the `Lint` door on `voice.Doors` and the `RulesLoad` name in the lsp module. The ask lint's cases build a fake Vale, so they move with the change in place of a red case of their own. The YAML case under `spec/vocabulary` lands with the change as a guard, since the formats block leaves there. A surprise: `src/rules` already loads `spec/config/styles` and reads no ini, so the ini leaves with no rule moving.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a red case: the install case for the grep, the voice and quack cases for the go test line, and the check runs them all
- every door the cases reach has its fake: the voice fake disk with its Lint door, the fix runner, and a seeded rules root

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- done-when-grep-meets-testdata: the ask's grep holds no testdata exclusion, while the approach says it does. Four goldens answer it today: src/modules/check/testdata/vale.golden.json and vale.out, src/modules/queue/testdata/queue.golden.json and src/quack/testdata/tree.golden.json. The check's pair leaves with the Vale twin. The queue and tree goldens snapshot ticket names and asks, so the done_when line gains a `:!*testdata*` pathspec, or it stays red.
- vale-size-misses-files: the grep names files the size list leaves out. These are src/rules/scope.go (a comment naming .vale.ini), src/branches/dispatch_write_test.go (it runs the real Vale over .vale.ini), src/vehicle/vehicle_test.go, test/contract/fetching.js and ruled.js. The draft puts the RulesLoad case in src/modules/lsp/tools_test.go, while the red case stands in src/quack/rules_test.go, and tools_test.go still names vale-ls. The builder fixes these in place.

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

the change touches the files the size list and the Discussion name, and departs on these: the JavaScript projection twins and lib/helpers.js, since the JavaScript projection rewrites the same rule files and would put the Tengo back; the size golden and the projected VoiceParagraph rules, which the projection writes; the voice split into answers.go, scores.go, refusals.go and js.go, which the check's file ceiling asked; and the new tests the commit door asks beside each changed file
every door the change reaches has a fake: the voice verb's Lint door takes a fake in the voice tests, the rules-over door meets fakeProc through teachRules, and the fix verb runs over a seeded rules root
a comment names the approach: each new file's header and each new case's pointer names vale-leaves-the-tree or the design section it serves
every fact stands in one place: the replace action has one name, rules.ActionReplace, the voice door reuses lspRules, and the size additions stand once under the Discussion

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

The first done_when line reads with a pathspec that skips the goldens, and the change step decides it so:

- `git grep -il -e '\.runtime/bin/vale' -e 'vale-ls' -e 'errata-ai' -e '\.vale\.ini' -- src test RUNME.sh .github ':!*testdata*'` answers nothing.

The queue and tree goldens snapshot ticket names such as `vale-ls-on-windows`, and run nothing. The door holds the ask, so the line stands here. For details, see [[spec/tickets/done-when-grep-meets-testdata]].

The size list also takes these files, which the grep names and the change moves with the Vale run:

- `src/branches/dispatch_write_test.go`: its case runs the real Vale over `.vale.ini`
- `src/modules/lsp/tools_test.go`: its `ValeIni`, `Vale` and `Config` fields, and its sweep case over `.vale.ini`
- `test/contract/fetching.js`: its `vale-ls` entry
- `test/contract/ruled.js`: its `.vale.ini` config

The RulesLoad case stands in `src/quack/rules_test.go`, and `tools_test.go` keeps no RulesLoad case. For details, see [[spec/tickets/vale-size-misses-files]].
