---
kind: [[ticket]]
state: open
step: gate
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
      - name: draft-2
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
      - name: tests-red-2
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft-2
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
    input: ["design/draft", "design/tests-red", "design/draft-2", "design/tests-red-2"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate", "design/draft-2"]
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
        input: ["design/tests-red", "design/tests-red-2"]
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
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d8922c5f7ed7 · claude-code-remote
    hash_before: b8f95455fc69d25995f0570515a254ca5ac2f7c1
    hash_after: b8f95455fc69d25995f0570515a254ca5ac2f7c1
    inputs:
      - name: ask
        hash: ae606a0a840ebba9
        size: 590
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d8922c5f7ed7 · claude-code-remote
    hash_before: 5fa0b1c71fc0696f28dc63cdf53ef1dff05e71e6
    hash_after: 5fa0b1c71fc0696f28dc63cdf53ef1dff05e71e6
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/lsp fails
    inputs:
      - name: design/draft
        hash: a3ccd4fce1d597b2
        size: 2489
    def: 08e16d07b0de477c
  - step: gate
    hand: box d8932514a610d · claude-code-remote
    hash_before: 50b811b3c1adefeff55a62f28b24b25be54c1add
    hash_after: 50b811b3c1adefeff55a62f28b24b25be54c1add
    returns: 1
    why: "the approach moves hover, complete, links and fold into src/modules/lsp over a check.Tree, and the nomodule import rule refuses a module importing another, so TestTheTreeHoldsTheImportRules turns the check red; the four features call some twenty check helpers through the src/lsp aliases, so a copy into lsp makes a second owner of each; the redraft: the four reads move into src/modules/check as exported functions over its Tree, and lsp takes them through the Check ports lsp-module-draws-the-tools lands, which lspChecks in src/quack/lsp.go fills"
  - step: design/draft-2
    hand: box d8932514a610d · claude-code-remote
    hash_before: 40f85d60a6184bbc4a2f0e0209903c41bd29077f
    hash_after: 40f85d60a6184bbc4a2f0e0209903c41bd29077f
    inputs:
      - name: ask
        hash: ae606a0a840ebba9
        size: 590
    def: 2fcb4abe3d77d8a2
  - step: design/tests-red-2
    hand: box d8932514a610d · claude-code-remote
    hash_before: c76439cc0440379bfb55085e7b0824319ce4f031
    hash_after: c76439cc0440379bfb55085e7b0824319ce4f031
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/lsp fails
    inputs:
      - name: design/draft-2
        hash: bd465c04b5a9243c
        size: 3451
    def: 9c7cd4dd4a2dadb8
group: lsp-door-switches-over
---

# Ask

The `lsp` IO module answers four asks off the files the index holds:

- the hover over a term
- the completion the schema allows
- the pointer that opens
- the fold over the frontmatter

So the editor keeps all four once it starts `quack lsp` in place of `se-lsp`.

The switch drops four features the owner reads in every note, and the old server stays for them alone.

- `go test ./src/modules/lsp` answers each method below off a fake store
  - `textDocument/hover`
  - `textDocument/completion`
  - `textDocument/documentLink`
  - `textDocument/foldingRange`
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

The four features move from `src/lsp` into the module, and read a `check.Tree` built off the store.

| what | the change |
|---|---|
| the files | `hover.go`, `complete.go`, `links.go` and `fold.go` move into `src/modules/lsp`, with the cases beside each |
| the tree | `Server.tree` builds a `check.Tree` off `Outside.Files` and lays each open buffer over its file, so a hover reads the text the editor holds |
| the methods | `Handle` answers `textDocument/hover`, `textDocument/completion`, `textDocument/documentLink` and `textDocument/foldingRange` |
| the announce | `initialize` answers `capabilitiesOf`, the capabilities the old server announces |
| the recording | `test/replay/lsp/one-session.jsonl` takes the new initialize answer |
| the wiring | `listensLSP` in `src/quack/main.go` hands `Files` off the store's `files/` names, past every file git tracks nowhere |

The tools child shares `Server.tree` and `Outside.Files`, so whichever lands first adds them. Weighed: a port of each feature against a call into `src/lsp`. The package leaves in the server's child, so a call into it dies with it. Assumed: `src/yaml` stays, since the migration note keeps yaml.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/main.go listensLSP
- src/modules/lsp/lsp.go Handle, New
- test/replay/lsp/one-session.jsonl, which TestTheReplayAnswersTheRecordedSession replays
- src/lsp/lsp.go took, whose four cases leave with the package

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/lsp/features_test.go TestInitializeAnnouncesTheFeatures
- src/modules/lsp/features_test.go TestAHoverOverATermAnswersItsLine
- src/modules/lsp/features_test.go TestACompletionAfterKindOffersTheKinds
- src/modules/lsp/features_test.go TestAPointerAnswersAsALink
- src/modules/lsp/features_test.go TestTheFrontmatterFolds
- src/modules/lsp/hover_test.go, complete_test.go, links_test.go and fold_test.go, moved from src/lsp

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/lsp/hover.go
- src/modules/lsp/complete.go
- src/modules/lsp/links.go
- src/modules/lsp/fold.go
- src/modules/lsp/features.go
- src/modules/lsp/lsp.go
- src/modules/lsp/features_test.go
- test/replay/lsp/one-session.jsonl
- src/quack/main.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the four feature files, took and capabilitiesOf in src/lsp/lsp.go, and the module's Handle stand opened
- the callers list names every caller of Handle and New off a git grep, and the recording the replay reads
- each method line meets its case in features_test.go, and the check line meets ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/lsp/features_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/lsp/features_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion: initialize announces text sync alone, and every feature request answers an error with no result. The cases compile against the Files field the tools child stubs, so both children share that shape.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each method line meets its case in features_test.go, and the check line meets ./RUNME.sh check at the build
- the cases reach no door: the files come in through Files, and the store is the qtest fake

## draft-2

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The four reads move into the check module, and the `lsp` module answers the protocol through ports the quack main wires, the shape the tools child lands.

| what | the change |
|---|---|
| the reads | `hoverAt`, `offers`, `linksIn` and `foldsOf`, with the helpers only they call, move from `src/lsp` into `src/modules/check/features.go` as `HoverAt`, `Offers`, `LinksIn` and `FoldsOf`. They call the check helpers by their own names, past the aliases |
| the ports | `Check` in `src/modules/lsp/tools.go` moves onto `Outside.Check` and takes `Hover`, `Complete`, `Links` and `Folds`, each over the port `Tree`, a path and a position, answering a value the reply marshals whole |
| the tree | `Server.tree` builds off `Outside.Check.Tree`, and `ToolsAt` takes the same `Check` off the wiring |
| the methods | `Handle` answers `textDocument/hover`, `textDocument/completion`, `textDocument/documentLink` and `textDocument/foldingRange` through the ports, and `initialize` answers the capabilities the old server announces |
| the wiring | `lspChecks` in `src/quack/lsp.go` fills the four ports off the check module |
| the recording | `test/replay/lsp/one-session.jsonl` takes the new initialize answer |

Weighed: the four reads inside the check module, against a copy inside `lsp`. A copy makes a second owner of some twenty helpers, and one module imports no other. Assumed: the reads stay pure over the tree, so the check module holds them with no door.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/lsp.go listensLSP, lspChecks
- src/modules/lsp/lsp.go Handle, New, capabilities
- src/modules/lsp/runs.go tree
- src/modules/lsp/door.go ToolsAt
- src/modules/lsp/tools_test.go toolsOver, fakeCheck
- src/lsp/hover.go hovers, src/lsp/complete.go completes, src/lsp/links.go links, src/lsp/fold.go folds, which call the moved reads until the-lsp-server-leaves takes the package
- test/replay/lsp/one-session.jsonl, which TestTheReplayAnswersTheRecordedSession replays

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/lsp/features_test.go TestInitializeAnnouncesTheFeatures
- src/modules/lsp/features_test.go TestAHoverOverATermAnswersItsLine
- src/modules/lsp/features_test.go TestACompletionAfterKindOffersTheKinds
- src/modules/lsp/features_test.go TestAPointerAnswersAsALink
- src/modules/lsp/features_test.go TestTheFrontmatterFolds
- src/modules/check/features_test.go, the hover, complete, links and fold cases moved from src/lsp
- src/quack/lsp_test.go TestTheFeaturePortsAnswerTheCheckModulesReads

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- the gate rejects a copy of the features into lsp over a check tree: the reads move into the check module, and lsp takes them through the Check ports

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/check/features.go
- src/modules/check/features_test.go
- src/modules/check/export.go
- src/lsp/hover.go
- src/lsp/complete.go
- src/lsp/links.go
- src/lsp/fold.go
- src/lsp/rules.go
- src/modules/lsp/lsp.go
- src/modules/lsp/tools.go
- src/modules/lsp/runs.go
- src/modules/lsp/door.go
- src/modules/lsp/features_test.go
- src/modules/lsp/tools_test.go
- src/quack/lsp.go
- src/quack/lsp_test.go
- test/replay/lsp/one-session.jsonl

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- hover.go, complete.go, links.go, fold.go and their cases in src/lsp, the Check ports in tools.go, lspChecks and the import rule stand opened
- the callers list names the old handlers, the tree, the door and the wiring off a git grep
- each method line meets its case in features_test.go, and the check line meets ./RUNME.sh check

## tests-red-2

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/lsp/features_test.go src/modules/check/features_test.go src/quack/lsp_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/lsp/features_test.go
- src/modules/check/features_test.go
- src/quack/lsp_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion. The lsp cases see no capability and an empty answer from every port, since the handler routes no method yet. The check cases see the stubbed reads answer nothing. The ports case in quack stops on its guard, since the stubs draw no answer to compare. The fold case over a note with no frontmatter wants an empty list, not nil, so the reply marshals it as brackets.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each method line meets its lsp case, the moved reads meet the check cases, and the wiring meets the quack ports case
- the one door the lsp cases reach, the check rules, takes the fake tree and fake reads in the lsp tests

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

reject
- the approach moves hover, complete, links and fold into src/modules/lsp over a check.Tree, and the nomodule import rule refuses a module importing another, so TestTheTreeHoldsTheImportRules turns the check red
- the four features call some twenty check helpers through the src/lsp aliases, so a copy into lsp makes a second owner of each
- the redraft: the four reads move into src/modules/check as exported functions over its Tree, and lsp takes them through the Check ports lsp-module-draws-the-tools lands, which lspChecks in src/quack/lsp.go fills

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
