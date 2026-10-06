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
group: engine-verbs-hold
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 57a5a484096e · claude-code-remote
    hash_before: d0ee6f1be061baefb9e377cdd14aaae9299e792a
    hash_after: d0ee6f1be061baefb9e377cdd14aaae9299e792a
    inputs:
      - name: ask
        hash: 2f9d4591c4088399
        size: 369
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 57a5a484096e · claude-code-remote
    hash_before: ffcf4e7a50357fd22882765b522cfc2f12ab9969
    hash_after: ffcf4e7a50357fd22882765b522cfc2f12ab9969
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks/command fails
    inputs:
      - name: design/draft
        hash: e844daf0c0a8d290
        size: 2819
    def: 08e16d07b0de477c
  - step: gate
    hand: box 57a5a484096e · claude-code-remote · helper-4
    hash_before: 86b2f0ce167e37d1ee2b3b4f9d713480f2204b59
    hash_after: 86b2f0ce167e37d1ee2b3b4f9d713480f2204b59
    inputs:
      - name: design/draft
        hash: e844daf0c0a8d290
        size: 2819
      - name: design/tests-red
        hash: ada1bd682add724a
        size: 1023
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 7307b48f86ceff9a82e784a0ff7d95ac42b06b1b
    hash_after: 7307b48f86ceff9a82e784a0ff7d95ac42b06b1b
    answered:
      - name: lint
        exit: 0
        said: "    2.4  test/contract/one-reading.test.js the lint reads each row of the sweep once"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 7c5819c2ea7ea49ff962af36d652d005ffd050b1
    hash_after: 7c5819c2ea7ea49ff962af36d652d005ffd050b1
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks/command passes; green, src/modules/hooks passes; green, src/quack passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: design/tests-red
        hash: ada1bd682add724a
        size: 1023
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

No commit lands with a trailer that names a model, as the owner's rule asks.

Hands keep pushing such trailers, and each one stands on main for good.

- `go test ./src/modules/hooks/command/` passes a case where a commit whose trailer names a model meets a refusal.
- `go test ./src/quack/` passes the same case through `./RUNME.sh commit`.
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

One pure read in the command package decides a model trailer, and both commit roads call it. In src/modules/hooks/command/voice.go, `TrailersOf(text)` returns the lines of the closing trailer paragraph. `WithoutTrailers` keeps its signature and calls `TrailersOf`, so the parse stands once.

A new `ModelTrailers(message) []Row` reads each trailer's value against one pattern, `modelName`. The pattern matches opus, sonnet, haiku, fable, gpt, gemini and a bare claude. A claude followed by a dot reads as a host, so `Claude-Session: https://claude.ai/...` passes. Each match comes back as a Row with Rule `ModelTrailer`, the line as Said, and a message naming the owner's rule.

The hook door: `(*Door).commitVoice` in src/modules/hooks/commits.go reads the message as now, and prepends `command.ModelTrailers(message)` ahead of the Voice nil check. `(*Door).commands` in hooks.go then refuses through `RefusedCommand` with no change.

The verb: `commitVerb` in src/quack/commit.go calls `command.ModelTrailers(message)` after `TicketFault`. A match prints each row to errs and returns `exitUsage` before anything stages.

The owner rules out any trailer naming a model, so the list takes every family name this box meets, fable among them.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/modules/hooks/hooks.go (*Door).commands
src/modules/hooks/commits_test.go TestADoorWithNoGitOrVoiceReadsNeither
src/quack/commit.go init
src/quack/commit.go messageFindings
src/modules/hooks/commits.go (*Door).commitVoice
src/modules/hooks/command/voice_test.go TestWithoutTrailersDropsTheClosingTrailers
src/quack/commit_test.go TestCommitVerb
src/quack/commit_test.go TestCommitVerbDesk
src/quack/commit_test.go TestCommitVerbMoves
src/quack/commit_test.go TestCommitVerbGates

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/modules/hooks/command/voice_test.go TestModelTrailersRefusesATrailerNamingAModel
src/modules/hooks/command/voice_test.go TestModelTrailersPassesASessionLink
src/modules/hooks/commits_test.go TestCommitVoiceRefusesAModelTrailerWithNoVale
src/quack/commit_test.go TestCommitVerbRefusesAModelTrailer

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/modules/hooks/command/voice.go
src/modules/hooks/command/voice_test.go
src/modules/hooks/commits.go
src/modules/hooks/commits_test.go
src/quack/commit.go
src/quack/commit_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

voice.go WithoutTrailers and the trailer pattern, commits.go commitVoice, hooks.go commands, commit.go commitVerb and messageFindings, landing_test.go fakeLanding stand opened and read.
A grep for commitVoice, commitVerb, WithoutTrailers and messageFindings over src gives the callers list; ModelTrailers is new, and its two callers stand in it.
The hooks/command case is TestModelTrailersRefusesATrailerNamingAModel, the quack case is TestCommitVerbRefusesAModelTrailer, and ./RUNME.sh check runs the battery over both.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/hooks/command/voice_test.go src/modules/hooks/commits_test.go src/quack/commit_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/modules/hooks/command/voice_test.go
src/modules/hooks/commits_test.go
src/quack/commit_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The three refusal cases fail on their assertions: the read answers no row, the door lets the message through, and the verb lands the commit. The session link case passes already, and it guards the read against a host name. A stub `ModelTrailers` with an empty body lets the tests compile, and tests-green fills it. The trailers carry no mail address, since the private door holds an address in a tracked file.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The hook line meets TestModelTrailersRefusesATrailerNamingAModel and TestCommitVoiceRefusesAModelTrailerWithNoVale, the verb line meets TestCommitVerbRefusesAModelTrailer, and the check line waits for tests-green.
The door case runs on a temporary folder with no git and no Vale, and the verb case runs on the landing fakes the package holds.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- model-trailer-refuses-in-place: the approach leaves out two spots the red tests demand, and implement fixes both in voice.go and commits.go: add ModelTrailer to the refusing set, since TestModelTrailersRefusesATrailerNamingAModel asserts Refuses on the row; and split the !ok test from the d.from.Voice nil test in commitVoice, so the model read runs on a box with no Vale while a message with no model trailer still answers nil for TestADoorWithNoGitOrVoiceReadsNeither
- attribution-trailer-meets-the-door: the session attribution this box carries asks for a Co-Authored-By trailer naming a model, which this door refuses once it lands; the owner's rule wins, so commits from that point on carry the Claude-Session line alone

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches no file the ask leaves out: the door landed in commit 080c3e8b7 under model-trailer-refuses-in-place, over src/modules/hooks and src/quack/commit.go with their tests, and this step adds no file.
every door the change reaches has a fake: TestCommitVerbRefusesAModelTrailer drives ./RUNME.sh commit over a fake root in src/quack, and TestModelTrailersRefusesATrailerNamingAModel reads a message in memory.
a comment names the approach the change implements: voice.go points at spec/design_output/bash#a-commit-message-meets-voice beside the trailer pattern.
every fact the change adds stands in one place: ModelTrailers in voice.go owns the pattern, and src/quack/commit.go and src/modules/hooks/commits.go call it.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/hooks/command/voice_test.go src/modules/hooks/commits_test.go src/quack/commit_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Both commit roads now refuse a message whose trailer names a model. ModelTrailers in src/modules/hooks/command/voice.go reads the closing trailer paragraph and names each trailer matching a model name. The commit hook in src/modules/hooks/commits.go and the commit verb in src/quack/commit.go call it before any Vale run, so a box with no Vale refuses too. The door landed in the commit of model-trailer-refuses-in-place, and this ticket greens the red cases it wrote for the same door.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches no file the ask leaves out: the door spans the hook, the verb and their tests, which the ask names through its two packages.
every door the change reaches has a fake: the verb case runs ./RUNME.sh commit over a fake root, and the hook case reads a message in memory.
a comment names the approach the change implements: voice.go points at spec/design_output/bash#a-commit-message-meets-voice.
every fact the change adds stands in one place: ModelTrailers owns the pattern, and both roads call it.

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

A cloud session's attribution asks for a `Co-Authored-By` trailer naming a model, and this door refuses it. The owner's rule wins: a commit message a hand writes here carries the `Claude-Session` line alone. The engine and the commit verb write no trailer, so no code changes for it. For details, see [[spec/tickets/attribution-trailer-meets-the-door]].
