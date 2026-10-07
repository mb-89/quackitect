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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it", "every config key the approach adds names each default file it lands in"]
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
process_hash: c671f20a6ae2a4a6
group: javascript-leaves
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: f2e9af6945ce0ee8503241c40e24dea5849248b8
    hash_after: f2e9af6945ce0ee8503241c40e24dea5849248b8
    inputs:
      - name: ask
        hash: 0121eb48e90b7349
        size: 395
    def: c01ae0f2ace0cecb
---

# Ask

The guidance parser leaves the plugin library with its tests, so the Go brief reads every guidance note alone.

The guidance contract tests run a parser no hook runs, and a guidance rule changes in two languages.

- `git ls-files .claude/skills/level0/lib/guidance.js` answers nothing
- `go test ./src/modules/hooks/... ./src/modules/guidance/...` passes
- `./RUNME.sh check` exits 0

none

none

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

1. lib/guidance.js leaves. No hook, library, extension file, RUNME.sh, package.json or workflow imports it.
2. Its three importers leave whole: test/contract/guidance-rules.test.js, guidance-tags.test.js and question-grades.test.js.
3. Go owns every live rule in src/modules/hooks/brief: actionables, RulesOf, LayerFor, ForHelper, Canary, CanaryText, Owes and CanaryIn.
4. The guidance module owns the tag read through frontOf and words in src/modules/guidance/guidance.go.
5. brief/rules_test.go gains a code-span star row, which ports the guidance-rules case.
6. guidance/guidance_test.go gains a quoted-tag case, which ports the listOf case of guidance-tags.test.js.
7. The schema sweep in src/modules/check holds the tags-admitted case, since testing.md and every standard ticket carry tags.
8. question-grades.test.js leaves with no port, since it pins the wording of shipped notes and tests no behavior.
9. brief/brief.go exports HeardSame, HeardOther, HeardNone and HeardAgain, which spell HEARD once in Go.
10. hooks/brief.go builds its heard map off those constants and keeps the map name, so brief_test.go stays.
11. quack/probe_verb.go sets heardSame, heardOther, heardNone and heardAgain to the brief constants, so its readers stay.
12. hooks/probe.go exports ReplySays beside ReplyMarker. probe_reply.go and probe_test.go read it and drop their own copies.
13. probe_cold.go drops the guidance.js entry from coldPath, as the parent names.
14. TestAPathElsewhereSitsOffTheColdPath gains a guidance.js row, which stays red until the entry leaves.
15. Each Go comment naming guidance.js, HEARD, OWES, REPLY_PROBE or PROBE names its Go owner instead.
16. Those comments stand in brief.go, brief/brief.go, brief/layer.go, probe.go, probe_test.go, style.go, probe_verb.go, probe_reply.go and guidance.go.
17. level0.md lines 646, 717, 1129, 1178, 1196 and 1277 name replyOpens, HeardAgain, RulesOf, Canary, CanaryIn and ForHelper.
18. Line 1129 also names rulesOf in src/projection/style.go, since the style keeps its own reader.
19. src/quack/guidance_lib_test.go globs guidance.js and the three tests through globbedIn, with no exec, and stays red until they leave.
Weighed: a Go port of question-grades over the shipped notes. It pins wording and the tree content, which tests.md rule 5 keeps out.
Weighed: the projection reading through brief.RulesOf. That moves the style projection past the ask, so a private note carries it.
Weighed: one frontmatter reader for brief and the guidance module. The nomodule rule refuses guidance importing hooks/brief.
Weighed: keeping the HEARD and replySays copies with pointers at each other. That keeps two spellings of one fact in Go.
Weighed: rewriting the src/bridge/guidance.js pointers in level0.md. They name another gone file, so a private note carries them.
Assumed: carried, layersOf, PROBE.asks and OWES.denies run nowhere, since no file imports guidance.js, so they leave with no port.
Assumed: globbedIn in src/quack/engine_doors_test.go stays after engine-and-doors-leave closes.
Assumed: the headers in src/quack/guidance_test.go and src/branches/port_f_guidance_test.go name history and stay.
Assumed: the brief.go comment at line 92 naming inherits belongs to config-libs-leave, since layer.js owns inherits.
Assumed: schema-libs-leave loses one schema.js importer here and needs no edit for it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- test/contract/guidance-rules.test.js: the star case, reading actionables
- test/contract/guidance-tags.test.js: the schema tags case, reading checkNote and readYaml, and the quoted tag case, reading listOf
- test/contract/question-grades.test.js: every case, reading actionables through rulesIn
- src/quack/probe_cold.go: coldPath, read by coldIn
- src/quack/commit.go: the commit verb, which calls coldIn over the staged paths
- src/quack/probe_cold.go: canaryOnce, reading heardSame and heardAgain
- src/quack/probe_dry.go: canaryHeard, reading heardSame
- src/quack/probe_verb.go: readsCompaction, reading heardOther, heardNone and heardAgain
- src/quack/probe_reply.go: replyOpens and readsReply, reading replySays
- src/quack/probe_reply_test.go: every case reading replySays
- src/modules/hooks/brief.go: stepBrief, reading heardTwice, and repeats, reading heard
- src/modules/hooks/brief_test.go: warningsIn and TestTheCanaryRowsSayWhatTheStepHeard, reading heard and heardTwice
- src/modules/hooks/probe_test.go: TestTheFirstCallAfterAMarkedPromptWritesTheReplyProbeRow and TestAPromptWithNoMarkerAndAHelpersCallWriteNoProbeRow, reading replySays
- src/modules/hooks/brief/brief.go: the header and the comments over Same, the patterns, Owes, kindsOf, bindsHere and isInlineKey
- src/modules/hooks/brief/layer.go: the header naming layersOf, standingLayer and forHelper
- src/modules/hooks/probe.go: the comment over ReplyMarker naming REPLY_PROBE
- src/projection/style.go: the header naming guidance.js
- src/quack/probe_verb.go: the comments over the heard and compact constants
- src/modules/guidance/guidance.go: the comment over frontAt naming the level0 lib reader
- spec/design_output/level0.md: lines naming REPLY_PROBE.opens, HEARD.again, rulesOf, canary, canaryIn and forHelper

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/guidance_lib_test.go: TestTheGuidanceParserStandsNowhere
- src/quack/probe_cold_test.go: TestAPathElsewhereSitsOffTheColdPath, gaining the guidance.js row
- src/modules/hooks/brief/rules_test.go: TestTheRulesReadNumberedWithTheirExamples, gaining the code-span star row
- src/modules/guidance/guidance_test.go: TestAQuotedTagReachesTheLeafItsBareWordReaches

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first: no review has read this draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .claude/skills/level0/lib/guidance.js
- test/contract/guidance-rules.test.js
- test/contract/guidance-tags.test.js
- test/contract/question-grades.test.js
- src/quack/guidance_lib_test.go
- src/quack/probe_cold.go
- src/quack/probe_cold_test.go
- src/quack/probe_verb.go
- src/quack/probe_reply.go
- src/modules/hooks/brief.go
- src/modules/hooks/brief/brief.go
- src/modules/hooks/brief/layer.go
- src/modules/hooks/brief/rules_test.go
- src/modules/hooks/probe.go
- src/modules/hooks/probe_test.go
- src/modules/guidance/guidance.go
- src/modules/guidance/guidance_test.go
- src/projection/style.go
- spec/design_output/level0.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every named file and function stands opened: guidance.js, the three tests, brief, layer, rules, probe, probe_verb, probe_reply, probe_cold, style, guidance.go, imports.go and level0.md
- the callers come from git grep on guidance.js, its exports and the copied constants over hooks, lib, src, test, RUNME.sh, package.json, .github and notes
- TestTheGuidanceParserStandsNowhere decides line 1, the brief and guidance rows decide line 2, and the check at tests-green decides line 3
- the approach adds no config key, so no default file changes

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
