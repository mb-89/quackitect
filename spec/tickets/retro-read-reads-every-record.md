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
group: retro-and-coordinator
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 8c9d6ebe7819 · claude-code-remote
    hash_before: f9b1b51bd0f4784c27a0eccf0d2147ca103f2729
    hash_after: f9b1b51bd0f4784c27a0eccf0d2147ca103f2729
    inputs:
      - name: ask
        hash: bac3852e47980fa2
        size: 485
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 8c9d6ebe7819 · claude-code-remote
    hash_before: 5598aa566d687ac369010442f37d21dfbd55fcd9
    hash_after: 5598aa566d687ac369010442f37d21dfbd55fcd9
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 70a72d6b73857176
        size: 2158
    def: 08e16d07b0de477c
---

# Ask

The retro reads session records, queued prompts and quiet refusals, and finds the classes of the last retro in the tree.

Each retro misses owner prompts and refusals, and every fresh box measures its effect against nothing.

- `go test ./src/quack/` passes a case where `retro read` counts a queued owner prompt and lists a quiet refusal.
- `go test ./src/quack/` passes a case where `retro effect` finds the classes of the last retro in a tracked folder.
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

Read: `retroRowsOf` in `src/quack/retro_read.go` gains two rows. A `queued_command` attachment from a human origin, or one naming no origin and not marked meta, earns a prompt row, and a helper's transcript earns none, as for a typed prompt. The queue's own enqueue line earns none, since the attachment or a user line carries the same prompt. A tool result carrying no error mark whose text opens on the word refused earns a refusal row, with its reason line. The retro read note and the verb's usage name the refusal row.

Effect: `retroLastRetro` and `retroEffectVerb` in `src/quack/retro_effect.go` look for a retro in its private home first, then in the tracked folder `spec/retros/<retro>`. `retroMintVerb` copies the classes, the rates and the collect time into that folder once its writes land, so the commit carries them and a fresh box measures against the last retro.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/quack/retro_read.go retroReadVerb, which calls retroRowsOf
src/quack/retro_read_test.go, the fault case, which calls retroRowsOf
src/quack/retro_effect.go retroEffectVerb, the one caller of retroLastRetro
src/quack/retro_mint.go retroMintVerb
src/quack/retro_usage.go, the usage line naming what read lists

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/quack/retro_read_test.go TestRetroReadCountsAQueuedOwnerPromptAndListsAQuietRefusal
src/quack/retro_effect_test.go TestRetroEffectFindsTheLastRetrosClassesInATrackedFolder
src/quack/retro_mint_test.go TestRetroMintKeepsTheClassesInTheTrackedFolder

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/quack/retro_read.go
src/quack/retro_read_test.go
src/quack/retro_effect.go
src/quack/retro_effect_test.go
src/quack/retro_mint.go
src/quack/retro_mint_test.go
src/quack/retro_usage.go
src/quack/retro_usage_test.go
spec/guidance/retro/read.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

retro_read.go, retro_effect.go and retro_mint.go stand opened, and a live transcript shows the queued attachment and the quiet refusal's shape
the callers come from a grep of retroRowsOf, retroLastRetro and retroMintVerb
the first done_when line meets TestRetroReadCountsAQueuedOwnerPromptAndListsAQuietRefusal, the second TestRetroEffectFindsTheLastRetrosClassesInATrackedFolder

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/retro_read_test.go src/quack/retro_effect_test.go src/quack/retro_mint_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/quack/retro_read_test.go
src/quack/retro_effect_test.go
src/quack/retro_mint_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Read prints nothing for a queued prompt and a quiet refusal, since it reads typed prompts and error-marked results alone. Effect finds no earlier retro where only the tracked folder holds one. Mint leaves the tracked folder empty. The second retro's input moves into one shared variable, so the standing effect case and the new one read the same lines.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the first done_when line meets TestRetroReadCountsAQueuedOwnerPromptAndListsAQuietRefusal, the second TestRetroEffectFindsTheLastRetrosClassesInATrackedFolder, both red on their assertion
the tests reach temp folders the cases seed, and the mint test reaches git through retroMintFake

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
