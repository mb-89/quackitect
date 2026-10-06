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
group: code-is-pure-tests-behave
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 37997ca97a74 · claude-code-remote
    hash_before: 3eb72c6a81da690e2f7fd0d1e41b57224835cbb4
    hash_after: 3eb72c6a81da690e2f7fd0d1e41b57224835cbb4
    inputs:
      - name: ask
        hash: 0fce39be9f102ff2
        size: 839
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 37997ca97a74 · claude-code-remote
    hash_before: 929ee5b96ebea85b7e279655aeee472372dae410
    hash_after: 929ee5b96ebea85b7e279655aeee472372dae410
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/imports fails
    inputs:
      - name: design/draft
        hash: ac52c0305a416ff9
        size: 1806
      - name: [[spec/design_output/model]]
        hash: a1cec3f4220df26e
        size: 77706
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/model]]
  - step: design/tests-red
    hand: box 7b5a2726379b · claude-code-remote
    hash_before: a4da2cfacbcc6bcc59075aecfc279556ee17eaba
    hash_after: caaab8a8c686d0d63785cd008310600c4c882ccc
    why: black-box-tests-guard-reports answers this ask
reason: answered
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A script a hand writes becomes a verb or an engine function once. The next hand runs the verb, and nobody writes the script again.

<!-- breaks, as text: what breaks if it is never done -->
Scripts pile up under `.se/scripts`, in heredocs and in tracked folders. Each box writes them again, and no check sees them.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the check names every tracked script, a file ending `.sh`, `.py` or `.bash` or opening on a shebang, outside the engine's homes, unless it carries `level0: HandScript - <why>`, and its test fires on a planted script
- the guard reads a baseline of today's offenders, and `./RUNME.sh check` prints them in report mode and stays green
- the retro's classify step promotes every script under `.se/scripts` and every heredoc script off the transcripts into a verb or an engine function, and `retro classes` names each script under `.se/scripts` standing with no promotion

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
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

[[spec/design_output/model#the-guards-hold-a-baseline]]. A pure function, `HandScripts`, in `src/imports/script.go` names each tracked script outside the engine that carries no marker. A guard entry `script` in `src/imports/guards.go` runs it. In `src/quack/retro_classes.go`, `retroDrainedFolders` gains the collected scripts, so `retro classes` refuses a script with no disposition, as it refuses a note. The classify step in `spec/processes/retro.yaml` and `spec/guidance/retro/classify.md` say a script takes a promotion: a ticket for a verb or an engine function, or done where one stands.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/imports/guards.go` `Guards`, which gains the entry
- `src/quack/retro_classes.go` `retroDrainedOf`, which walks the new folder
- every open ticket whose route carries the retro, which `./RUNME.sh ticket update` moves onto the new classify text

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/imports/script_test.go` `TestATrackedScriptOutsideTheEngineIsNamed`
- `src/imports/script_test.go` `TestTheEngineAndAMarkedScriptAreSpared`
- `src/quack/retro_classes_test.go` `TestRetroClassesHoldEveryNoteAndMemoryAndTheReportListsThemWithTheChecklistAndTheLimits`, which gains a collected script

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/imports/script.go`
- `src/imports/script_test.go`
- `src/imports/guards.go`
- `src/imports/baseline/script.txt`
- `src/quack/retro_classes.go`
- `src/quack/retro_classes_test.go`
- `spec/processes/retro.yaml`
- `spec/guidance/retro/classify.md`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `retroDrainedFolders`, `retroDrainedOf`, the collect step and the classify step stand opened
- the callers line names the registry, the drained walk and the routes the process change moves
- each done_when line meets a case: the guard in the script cases, the classify refusal in the retro classes case

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- `src/imports/script_test.go`
- `src/quack/retro_classes_test.go`

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion. The retro classes case extends the standing one, so it builds no new fixture. A collected script keeps its whole file name, `script:a-loop.sh`, since two scripts may share a stem.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a red case: the guard in the script cases, the classify refusal in the retro classes case
- the guard cases read a map, and the retro case keeps the temp folder it stood on before

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
