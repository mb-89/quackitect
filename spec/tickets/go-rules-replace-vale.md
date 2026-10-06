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
group: lint-without-vale
step: implement/tests-green
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
  - step: gate
    hand: box 09cf21ad3c5d · claude-code-remote · helper-4
    hash_before: 2bc6c51d9ab2938cbd26886a53931952ccdf3e9b
    hash_after: 2bc6c51d9ab2938cbd26886a53931952ccdf3e9b
    inputs:
      - name: design/draft
        hash: e5e357354b7669b9
        size: 3124
      - name: design/tests-red
        hash: 25b5ae1b04509dbe
        size: 930
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 2fd77f4f7ceb8b4baf732fa9f481adf30f71e1bd
    hash_after: a58a11b6c088a87da84be20a6fdf69ef28a65b59
    answered:
      - name: lint
        exit: 0
        said: "test/level0/work-stands.test.js:16:1: correctness/noUnusedImports: Several of these imports are unused."
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: e7c1548ba27dee4fc7fba3a2b2ce7fc75619f737
    hash_after: e7c1548ba27dee4fc7fba3a2b2ce7fc75619f737
    answered:
      - name: tests
        exit: 0
        said: green, src/rules passes; green, src/modules/lsp passes; green, src/quack passes
      - name: check
        exit: 0
        said: "   77.7  in all"
    inputs:
      - name: design/tests-red
        hash: 25b5ae1b04509dbe
        size: 930
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

accept with points
- go-rules-rename-voicevale: the approach keeps the VoiceVale style under spec/config/styles and its name in src/rules/scope.go, src/rules/testdata and every check id, plus Tools.Vale and ValeRuns in src/modules/lsp, so the done_when grep `git grep -il vale -- src test RUNME.sh .github` cannot answer nothing; rename the style and the fields in the build, or narrow the done_when line
- go-rules-exemption-marker: the `<!-- vale <Check> = NO -->` marker that test/level0/one-reader.test.js, findings.test.js, voice.test.js and the check's ExemptionCarriesAReason read has no place in the approach and no red case under src/rules; name whether Lint honours it (and under what new spelling) and add the case
- go-rules-span-parity: src/rules/testdata/vale.json holds Vale's Line and Span for every fixture, and rules_test.go reads none of it, asserting presence alone; assert each row's Line and Span against it, since the lsp diagnostics and the fix verb place edits by span, or drop the file
- go-rules-design-note: src/rules/scope.go links [[spec/design_output/rules#a-rule-reads-its-paths]], and no such note stands, nor does the draft's size list it; write the note or point the links at the ticket

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

the change touches no file the ask leaves out: src/rules, the quack seams, the lsp tools, lib/vale.js and src/doors/vale.js, and the Vale tests the move retires; the voice verb, the install, the survey, the configs and the projection leave in the removal step once the-check-lint-runs-in-go lands
every door the change reaches has a fake: the lsp case fakes the rules through Tools.Rules, the rules-over case fakes the lint function, lintText meets a fake run, and the quack cases meet the real rules over a seeded temp root in place of a fake binary
a comment names the approach the change implements: every file of src/rules points at spec/design_output/rules or the ticket, and the seams point at the ticket
every fact the change adds stands in one place: the text model, the kinds and the script contract stand in spec/design_output/rules.md, the rule name off a check stands in lsp.RuleOf, and the loaded rules in rulesAt

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/rules/rules_test.go src/modules/lsp/tools_test.go src/quack/rules_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The prose rules run in Go. src/rules loads every rule under spec/config/styles, ports Vale's text model over goldmark and the prose tagger, runs the token kinds and a Go function for each former Tengo script, honours the vale markers, and places each finding where Vale placed it. One run over the whole tree answers 9903 rows against Vale's 9912. The difference is Vale placing a sequence match on the first copy of a word in a block holding code, Vale matching masked code under Passive, and files moving under the run. The write door, the commit voice, the pull, the lsp panel and the lint all read the Go rules, through heardIn, the lsp Tools.Rules field and the rules-over verb that lib/vale.js calls. A project's own style folder adds no rule any more, per the Discussion. Vale itself, its install, its survey entry, its configs and the voice verb's run leave once the-check-lint-runs-in-go lands.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches no file the ask leaves out: the tests turn green with no edit past src/rules, the quack seams, the lsp tools and the JavaScript door
every door the change reaches has a fake: the lsp case fakes Tools.Rules, the verb case fakes the lint, and the quack cases meet the real rules over a seeded root
a comment names the approach the change implements: each file of src/rules points at spec/design_output/rules or the ticket
every fact the change adds stands in one place: the engine's design stands in spec/design_output/rules.md, and the compare's result in the group's retro

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

## The grep narrows to Vale the tool

`go-rules-rename-voicevale` decides the done_when grep, and the style keeps its name. Accept reads these lines in place of the two the ask names:

| the ask's line | accept reads |
|---|---|
| `git grep -il vale -- src test RUNME.sh .github` answers nothing past history notes | `git grep -il -e '\.runtime/bin/vale' -e 'vale-ls' -e 'errata-ai' -e '\.vale\.ini' -- src test RUNME.sh .github` answers nothing |
| `go test ./src/modules/rules/` | `go test ./src/rules/` |

- The marker keeps Vale's spelling, per [[spec/design_output/rules#a-marker-quiets-a-rule]], and the tests carry it, so the bare grep never answers nothing.
- A rename of `VoiceVale` moves every check id and every standing marker, and changes no behaviour.
- The narrowed grep meets the binary, its language server, its Go module and its config: what leaves the box.
- `Tools.Vale` and `ValeRuns` in `src/modules/lsp` read the binary path, so the narrowed grep meets them, and they leave with the door.

## A project carries no rules of its own

The Go rules serve the styles this tree holds, scoped by the Go table, and a work root's own style folder adds no rule. The approach already retires `.vale.ini` and the assembly that joined a project's styles to the method's, so `test/contract/one-config.test.js` leaves with `vale-paths.test.js`.

- The cost: a project carrying its own rule meets none of it. No project this tree drives carries one.
- The road back: a ticket teaching `Load` a work root's token rules, where a project asks for one.
