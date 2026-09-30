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
group: read-topics-land-in-shadow
record:
  - step: design/draft
    hand: box d81edba2a3d5 · claude-code-remote
    hash_before: 490e7f6afd139b70b96a067206d75f874d53d1f1
    hash_after: a368a2e53e9252534bb3f74613595fdbaff6dca5
    inputs:
      - name: ask
        hash: a2d542f562e78107
        size: 342
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d81edba2a3d5 · claude-code-remote
    hash_before: 0bda4a0d5127edd36888ce4b82bde37701c9c691
    hash_after: 0bda4a0d5127edd36888ce4b82bde37701c9c691
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 9b19e9c0eab11f4a
        size: 3582
    def: 08e16d07b0de477c
  - step: gate
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 86c7458f5e03e324a8de5e2a4eb751ad8f28e8ef
    hash_after: 86c7458f5e03e324a8de5e2a4eb751ad8f28e8ef
    inputs:
      - name: design/draft
        hash: 9b19e9c0eab11f4a
        size: 3582
      - name: design/tests-red
        hash: 2016b703e694ec8c
        size: 840
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 6c08ba3af49679877ac4816c74e6e072652f33e8
    hash_after: 6c08ba3af49679877ac4816c74e6e072652f33e8
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: bf60006c68136a36a8984687675158a14a498fb3
    hash_after: bf60006c68136a36a8984687675158a14a498fb3
    answered:
      - name: tests
        exit: 0
        said: green, 10 test(s) pass in 2 file(s); green, src/prose passes
      - name: check
        exit: 0
        said: "src/scripts/guidance-shadow.js:12:1: CodeComment: Code carries no comment here. Write a header of at most five lines at "
    inputs:
      - name: design/tests-red
        hash: 2016b703e694ec8c
        size: 840
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

The prose checks run in Go: the tagger, an exception list and the domain words, with wink as the reference. A mismatch writes a `shadow` row.

The prose checks are the last reason Node runs at runtime.

- `go test ./...` from the root passes
- `./RUNME.sh log --kind shadow` names each finding the two disagree on
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

A Go package src/prose holds the three vetoes src/bridge/prose.js and src/engine/tense.js run on wink, per the golem row of spec/design_output/migration.md. (1) The past veto: a word reads past unless it is its own lemma, its -s, -es, -ies or -ing form, the rule isPast in src/engine/tense.js holds. (2) The length veto: the longest sentence of a span, with a code span and a link blanked to one word each, counting every token carrying a letter or a digit, the way longest counts every tag outside PUNCT, SYM and SPACE. (3) The outside veto: a Vocabulary finding falls where the word's lemma stands in the domain words. The lemma comes from github.com/aaaton/golem/v4 with its English dictionary, and an exception list embedded beside the package, src/prose/lemmas.yml, names the forms where golem and wink part and wink reads right. The domain words come off the paragraph schema's core, terms and swaps paths, read with src/yaml the way wordsOf in .claude/skills/level0/lib/vocabulary.js reads them. A new verb quack prose reads one JSON request on stdin, a list of documents each with its text, its Vale findings and a mode (all, or past for the check's tense-only road), and prints the findings it keeps. The Node side stays the answer. Where migration.prose reads shadow, a new src/bridge/prose-shadow.js runs quack prose once a call, and writes one shadow row per finding the two keep apart, naming the file, the line, the rule, the word and which side keeps it, the way shadowRun in src/scripts/config-shadow.js does for the config slice. readsProse calls it once a draft, and readThrough in src/bridge/findings.js calls it once over every finding of a check run, so the check pays one process. A missing binary or an answer no reader takes writes nothing. Assumed, and decided here: golem over a ported tagger, because the design output names golem and the three vetoes need a lemma and a token count, no part of speech.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/bridge/prose.js readsProse, which gains the shadow call,src/bridge/write.js proseFaults, through readsProse,src/bridge/bash.js the commit message read, through readsProse,src/bridge/answer-read.js the answer read, through readsProse,src/bridge/findings.js readThrough, which gains the shadow call,src/bridge/findings.js findingsOver, through readThrough,src/quack/main.go the verb dispatch, which gains prose,go.mod, which gains golem and its English dictionary

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/prose/prose_test.go TestPastReadsTheTenseTable,src/prose/prose_test.go TestLongestCountsCodeAndLinkAsOneWord,src/prose/prose_test.go TestOutsideFallsOnAListedLemma,src/prose/prose_test.go TestExceptionListOverridesGolem,src/quack/prose_test.go TestProseKeepsWhatTheVetoesLeave,test/level0/prose-shadow.test.js a finding the two keep apart writes one shadow row,test/level0/prose-shadow.test.js the slice at old runs no quack,test/level0/prose-shadow.test.js a missing binary writes nothing

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first draft, no earlier review

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every file, function and verb the approach names stands opened: tense.js isPast and withoutFalsePast, prose.js readsProse, longest, withoutFalseOutside and wordsHere, findings.js readThrough, config-shadow.js shadowRun, migration.go ProseKey, shadow.go Write, quack main.go, and golem v4 reachable through the Go proxy
the callers list names every caller a grep finds of readsProse, withoutFalsePast and readThrough outside the tests
go test ./... passes: the src/prose and src/quack tests; log --kind shadow names each finding apart: prose-shadow.test.js; check exits 0: ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/prose-shadow.test.js src/prose src/quack

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/prose/prose_test.go,src/quack/prose_test.go,test/level0/prose-shadow.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The stubs compile, so every Go case and both JS rows fail on an assertion and none on a build. The guards for a slice at old and a missing binary pass on the stub already, since the stub writes nothing, and they hold the implementation to that. The captured tool outputs under src/modules/check/testdata ended in .txt, so Vale linted them and the push refused. They now end in .out.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line meets a test: go test over src/prose and src/quack, the shadow rows in prose-shadow.test.js, and the check at tests-green
the one door the tests reach, the quack process, has a fake in doorsOf, beside the settings, the files and the log

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- prose-shadow-hooks-reads-text: findingsOver in src/bridge/findings.js reads each walked file through readsText, and readThrough reads only the rows the walk passes over, so a shadow hooked on readThrough misses most findings of a check run; hook it once over what findingsOver and voiceOver read
- prose-shadow-wiring-gets-tests: the rows test shadowProse alone, so an unwired shadow passes every test while log --kind shadow stays empty; add a case per caller that reads the shadow row off the fake log
- lsp-past-veto-reads-go: pastReads in src/lsp/outside.go runs node with tenseScript for the past veto, a node use the ask covers, and the approach and its callers leave it out; name it as the reader that drops node when the slice reads new

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/prose src/quack/prose.go src/bridge/prose-shadow.js src/bridge/findings.js src/bridge/prose.js src/scripts/cli-read.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches the prose package, quack prose, the shadow and its callers the draft and the gate points name, and go.mod for golem.
The shadow cases and the wiring cases run over fake settings, proc and log, and the Go vetoes read text alone.
The headers of src/prose/prose.go, src/prose/lemma.go and src/bridge/prose-shadow.js name the approach.
The exception list stands once, in src/prose/lemmas.yml, and the domain words stand in the vocabulary lists.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/prose-shadow.test.js test/level0/prose-shadow-wiring.test.js src/prose

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The prose checks now run in Go beside wink. src/prose holds the past, length and outside vetoes, with golem and an embedded exception list for the lemma, and quack prose answers a request of documents with the findings the vetoes keep. Where migration.prose reads shadow, readsProse, findingsOver and voiceOver run quack prose once each and write one shadow row a finding the two sides keep apart, which ./RUNME.sh log --kind shadow names. The first live run shows PastTense rows alone, on participles such as detached and retired. TestProseKeepsWhatTheVetoesLeave in src/quack passes under go test -run Prose, while that folder also holds the sibling tickets red tests.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches the prose package, quack prose, the shadow and its callers, and go.mod.
The shadow and wiring cases meet fake settings, proc and log.
The prose package headers name the approach.
The exception list stands once, in src/prose/lemmas.yml.

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

The callers leave out one node road: `pastReads` in src/lsp/outside.go runs node with `tenseScript` for the past veto. It reads the same `readsAsPast` the shadow compares, so this phase leaves it standing. When the prose slice reads new, `pastReads` calls the Go past veto in src/prose, and the LSP runs node for prose no more.
