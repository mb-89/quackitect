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
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 112331987b9f393147e0e77832ed177a7ba15ce5
    hash_after: 112331987b9f393147e0e77832ed177a7ba15ce5
    inputs:
      - name: ask
        hash: 87e003b9fd2e4022
        size: 944
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 9aeb0e9b590183ba4a581092e23827a1e4d89667
    hash_after: 9aeb0e9b590183ba4a581092e23827a1e4d89667
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/rules fails
    inputs:
      - name: design/draft
        hash: e5e357354b7669b9
        size: 3124
    def: 08e16d07b0de477c
---

# Ask

The prose rules run in our own Go engine over a parsed markdown tree. No box needs Vale, and a rule reads its scope and its path in our code.

Every box installs Vale and its language server, and a rule meets Vale's scopes and Tengo scripts, which our code neither tests nor shapes.

- `go test ./src/modules/rules/` passes a case for each rule under `spec/config/styles`, each refusing its fixture and passing its plain twin.
- `go test ./src/modules/rules/` passes a case where a rule scoped to a path reads the files under it and none outside.
- The retro names what one run of the Go rules and Vale over the whole tree answer differently.
- `git grep -il vale -- src test RUNME.sh .github` answers nothing past history notes, and `test/contract/vale-paths.test.js` stands gone.
- `go test ./src/modules/lsp/` passes a case where the editor's diagnostics carry a finding of the Go rules.
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

A pure Go package src/rules owns every rule. Load takes the texts it reads, the paragraph schema and the vocabulary lists, and Lint takes a path and a text and answers findings in the shape Vale answered. The package parses markdown through goldmark into blocks: paragraphs, headings, list items and table cells, with code spans, code blocks and front matter masked. A code file reads its comments, and a yml or shell file reads as markdown, as the formats section did. The token rules run in Go over those blocks: existence, substitution, occurrence, and the sequence rules through the tagger github.com/jdkato/prose. Each script rule becomes a Go function over the raw text. The paragraph rules read their numbers off spec/schemas/paragraph.schema.yaml, so the projection to VoiceParagraph leaves. A Go table scopes each rule by path, in place of .vale.ini. heardIn in src/quack/command.go and the vale call in src/modules/lsp/tools.go call Lint. A quack verb rules answers Vale's JSON over stdin, and lib/vale.js calls it, so every JavaScript caller stands as it is. A script under .se/scripts runs both engines over the whole tree once, and the retro names what differs. Then Vale, its install, its survey entry, its door, its configs and the vale-paths test leave. The removal waits on the-check-lint-runs-in-go, since cli-read.js reads the Vale door.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/command.go heardIn, valeAt
- src/modules/lsp/tools.go Tools.vale, Sweep, Over
- src/modules/lsp/door.go toolAt
- src/quack/verb_lint.go lintReading
- src/quack/writedoor.go writeProse
- src/quack/drafts.go draftsLint
- src/voice/voice.go
- src/modules/check/textfaults.go
- src/modules/hooks/command/findings.go
- .claude/skills/level0/lib/vale.js lintText
- src/scripts/install.sh
- spec/config/projections.json the paragraph rules
- .github/workflows/check.yml

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/rules/rules_test.go: each rule refuses its fixture and passes its plain twin, ported off test/contract/vale.test.js
- src/rules/scope_test.go: a rule scoped to a path reads the files under it and none outside
- src/rules/markdown_test.go: code spans, code blocks and front matter carry no finding
- src/modules/lsp/tools_test.go: the diagnostics carry a finding of the Go rules
- src/quack/rules_test.go: the rules verb answers Vale's JSON over stdin

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/rules/ (new package)
- src/quack/command.go
- src/quack/rules.go
- src/modules/lsp/tools.go
- src/modules/lsp/door.go
- .claude/skills/level0/lib/vale.js
- src/scripts/install.sh
- .vale.ini
- spec/config/editor.vale.ini
- spec/config/styles/
- spec/config/projections.json
- .claude/skills/level0/lib/paragraph.js
- test/contract/vale.test.js
- test/contract/vale-paths.test.js
- test/contract/vale-fix.test.js
- .github/workflows/check.yml
- spec/design_output/lsp.md
- go.mod

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- heardIn, the lsp tools, lib/vale.js, the projection and the scoping stand opened
- the callers list names every importer of the Vale door git grep finds
- each done_when line meets a test under src/rules or src/modules/lsp, and the compare meets the retro

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/rules/rules_test.go src/modules/lsp/tools_test.go src/quack/rules_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/rules/rules_test.go
- src/modules/lsp/tools_test.go
- src/quack/rules_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every rule fails its fixture on its own assertion, the lsp case draws no row under the source rules, and the verb answers no JSON. Vale lints front matter for its token rules, and a front matter line above its closing fence reads as a setext heading, so a paragraph rule passes it. Paragraph scope skips list items. An occurrence rule reports its first token. Spans count from 1 and hold both ends.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a red case: the per-rule corpus, the scope case, the lsp case, and the verb case; the compare and the removal meet the retro and a grep at accept
- the lsp case fakes the rules through the Rules field, and the rules tests read the tree texts through the Read argument

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
