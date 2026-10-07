---
kind: [[ticket]]
state: open
step: design/tests-red
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
group: examples-run-as-tests
depends_on: ["example-coverage-check-reports"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: 16643b85e4a7a1c08affb35ba026f7b478db55f4
    hash_after: bafe536fbb2aefd6e3458e2444987033f03762d3
    inputs:
      - name: ask
        hash: 411852f0b0608d7f
        size: 521
      - name: [[spec/guidance/retro/audit]]
        hash: e47482696963dde5
        size: 1285
    def: c01ae0f2ace0cecb
---

# Ask

Each retro reads two counts off a verb: the features with no example, and the tests asserting again what an example shows. The audit acts on both. [[spec/guidance/retro/audit]]

The audit asks the counts of a hand that counts by eye, and the gaps grow between retros.

- a retro verb prints both counts and names each item, off the coverage guard and the harness
- the audit step of `spec/processes/retro.yaml` names the verb
- the verb's case proves both counts on a planted tree
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

A new verb, `./RUNME.sh retro gaps`, prints both counts the audit asks for, each item one a line, and exits 0: it reports, and the auditor decides.

| count | source | each item |
|---|---|---|
| features with no example | the coverage guard: `check.ExampleCovers`, the rule exported under its own name | `./RUNME.sh <verb>` and the file and line registering it |
| tests beside a shown verb | `check.Shown` names every verb an example shows, and the verb reads the `src/quack` file registering each, then every `Test` function in the `_test.go` file beside it | the test file and the test name |

The second count names candidates. A test standing beside a verb an example shows asserts that verb again, or holds an edge the command line cannot reach. The auditor reads each one and keeps it or cuts it, per [[spec/guidance/code/tests]] rule 1.

The verb stands in `src/quack/retro_gaps.go`, registered as `retro gaps`, over `retroRoot` as `retro audit` is. It reads the tree through `lintTree(root)`, whose paths git lists, since `rootDisk` lists none. `src/modules/check/coverage.go` renames `exampleCovers` to `ExampleCovers` and `shownNames` to `Shown`, so one place owns each count. The audit step in `spec/processes/retro.yaml` adds `retro gaps` under `needs`, and its examples item names the verb. `retro_usage.go` lists the verb.

Assumed: a report at exit 0 serves the audit better than a gate, since a test beside a shown verb is a candidate, and a gate on it refuses every edge test.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/check/checker.go Rules, which lists exampleCovers
- src/modules/check/coverage.go exampleCovers, which calls shownNames
- src/modules/check/example_test.go TestAVerbNoExampleNamesTakesAWarning and TestATabNoExampleNamesTakesAWarning, which call exampleCovers
- src/quack/retro_usage.go retroUsageVerb, which lists the retro verbs
- spec/processes/retro.yaml the audit step

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/retro_gaps_test.go TestRetroGapsNamesEachVerbNoExampleShows
- src/quack/retro_gaps_test.go TestRetroGapsNamesEachTestBesideAShownVerb

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/retro_gaps.go
- src/quack/retro_gaps_test.go
- src/quack/retro_usage.go
- src/modules/check/coverage.go
- src/modules/check/checker.go
- src/modules/check/example_test.go
- spec/processes/retro.yaml

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened: coverage.go, checker.go Rules, retro_audit.go, retro_audit_test.go, retro_home.go retroRoot, verb_lint.go lintTree, writedoor.go rootDisk, the audit step of retro.yaml and audit guidance rule 6
- callers: a grep for shownNames and exampleCovers names each line, and retro_usage.go registers the retro usage
- done_when 1 and 3: the two retro_gaps_test.go cases on a planted temp tree, which hand the verb a Texts tree so no git runs
- done_when 2: the retro.yaml diff, read at accept
- done_when 4: ./RUNME.sh check at tests-green
- config keys: none added

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
