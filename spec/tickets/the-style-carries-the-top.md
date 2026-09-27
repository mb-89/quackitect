---
kind: [[ticket]]
state: open
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
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
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/design]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass, pass with findings naming a child a line, or fail with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every row the design review passes with stands fixed in the change"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
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
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
group: guidance-rides-each-step
step: implement/change
record:
  - step: design/draft
    hand: box d7d8cca5d3cd · claude-code-remote
    hash_before: 946f720fba4dae3be85f3897102af0696733ceac
    hash_after: 946f720fba4dae3be85f3897102af0696733ceac
  - step: design/review
    hand: box d7d9cc78d3ce · claude-code-remote
    hash_before: ac4e5372d7cb31e9ca0410f436ee4c4ad7fcff91
    hash_after: ac4e5372d7cb31e9ca0410f436ee4c4ad7fcff91
  - step: implement/tests-red
    hand: box d7d9cc78d3ce · claude-code-remote
    hash_before: fb343665d930d3a79b9c8b8bc788139e3bcfd94d
    hash_after: fb343665d930d3a79b9c8b8bc788139e3bcfd94d
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
---

# Ask

Every note at the top of `spec/guidance` reaches every request, and the client reminds the model of it. [[spec/design_input/level-two]] asks it in its chapter Guidance.

Today working, tickets and guidance arrive once in the standing layer, and a long conversation buries them.

- the projection writes every note at the top of `spec/guidance` into `.claude/output-styles/level0.md`. A case under `test/level0` decides it
- the standing layer carries the canary and the handover alone. A case under `test/level0` decides it
- `spec/guidance/cloud.md` moves under a subfolder and keeps its `env`. `./RUNME.sh check` reads the move
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

- `styleFrom` in `.claude/skills/level0/lib/projection.js` writes every note at the top of `spec/guidance` into `.claude/output-styles/level0.md`, in place of the notes marked `style`. The `style` key leaves `spec/schemas/guidance.schema.yaml` and the notes.
- `guidanceHere` in `src/bridge/guidance.js` hands the session no top note, since the style carries them. `blocksOf` writes the canary with no rules block, and the handover block rides as before.
- The canary counts the rules and the notes of the style, so its line says what level zero loaded.
- The tools block and the index line stay as they stand. They carry the box and its verbs, and no rule.
- `./RUNME.sh rename spec/guidance/cloud spec/guidance/cloud/cloud` moves the note with its `env`, and rewrites every link reaching it. The group process's cloud steps carry the `cloud` tag, so the resolver of guidance-resolves-by-tags hands the note on a cloud box.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/bridge/guidance.js layerOf and layerRides, which read guidanceHere and blocksOf,src/scripts/cli-check.js project and projectionsHold, which run the projection,src/scripts/cli-check.js standing, which prints the standing layer,src/scripts/probe-cold.js, which looks for level0-rules beside level0-canary

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

test/level0/style-top.test.js the projection writes every note at the top of spec/guidance into the output style,test/level0/style-top.test.js the standing layer carries the canary and the handover alone

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened: styleFrom, styled, guidanceHere, blocksOf, the rename verb, both schemas
- the callers list names every reader of guidanceHere, blocksOf and the projection, found by a search
- each done_when line names a case in test/level0/style-top.test.js, and the check reads the move

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->
<!-- the form is verdict -->

pass with findings
- cloud-note-reaches-every-step: once spec/guidance/cloud.md moves under a subfolder, the tag resolver hands it only at steps tagged cloud, so on a cloud box its session-wide rules (pull first on main, commit and push each finished thing, branch done last) reach no standard-process leaf and no moment before the first pull; hand the note on every leaf where its env binds, or tag every process leaf cloud

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/style-top.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both cases fail on their own assertion: the style leaves out a note carrying no style key, and the layer hands a level0-rules block before the canary. The surprise: blocksOf writes the canary only where the standing text stands, so an empty session layer drops the canary too, and the change moves the canary off that guard. src/bridge/review.js reads the standing text for its reader, a caller the draft misses, and it takes the helper text instead.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the tests touch one new file, the one the ask names
- the fakes are the fake disk and the fake proc from src/doors/fake
- the file header names the ticket the tests hold
- each assertion names a claim once, in its own test
- the review rows (the tests asserting level0-rules, the helper layer keeping the top notes) ride the change step

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

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
