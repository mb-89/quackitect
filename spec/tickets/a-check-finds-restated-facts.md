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
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/reviewing]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: design/draft
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements"]
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
      - name: reflect
        does: names the class of error in the findings, and the fix for the class
        when: returned
        input: verdict
        evidence:
          - name: class
            form: text
            says: the class of error the findings describe, and the fix for the class
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
  - name: verdict
    does: reads every hunk against the ask and the approach
    not: implement
    on_fail: implement/reflect
    reads: [[spec/guidance/review/reviewing]]
    input: ["diff", "implement"]
    to: retro
    checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
group: the-rules-hold-themselves
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: implement/tests-red
record:
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: e2e77e89159f57d7cf228ad1a44cbd910c6959ea
    hash_after: e2e77e89159f57d7cf228ad1a44cbd910c6959ea
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-2
    hash_before: 6a13ae8d7f28100b1d965bdbe2a123cb63564677
    hash_after: 6a13ae8d7f28100b1d965bdbe2a123cb63564677
    returns: 1
    why: "The call site sits where a named path skips it. [[spec/design_output/tree#when-the-sweep-runs]]; `./RUNME.sh lint spec` runs Vale alone, and the ask wants that verb to name every place.; Name the file holding `restatedFaults`, because `tree.js` stands near the ceiling `code.fileLines` sets.; Name each bound's key, and its entry in `spec/config/level0.schema.json`, which every control takes.; The script rule blanks inside the projection, so name the JavaScript this rule blanks with.; Say which reading Vale keeps, because a paragraph against its own table reads one buffer."
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 48ee2a38e214aa067dd910d91e9302fcccf09095
    hash_after: 48ee2a38e214aa067dd910d91e9302fcccf09095
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-4
    hash_before: 28fdafe3de7d68163d1f9e4d439ee1768431ca0f
    hash_after: 28fdafe3de7d68163d1f9e4d439ee1768431ca0f
    returns: 2
    why: A named path asks the checker under `src/lsp`, and the module stands outside that road.; Say which checker holds each rule, because the editor and the check read the one under `src/lsp`.; Name the JavaScript the module blanks with, because `blanked` stands inside the projection.; Say the scope `RestatedTable` reads, and the rule file it lands in.; Name the level `RestatedTable` lands at, because the projection writes a level into every rule file.
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 63ba308a28025da183a21964d0bd1ca9a2a61a04
    hash_after: 63ba308a28025da183a21964d0bd1ca9a2a61a04
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-6
    hash_before: a1d0cfac1a84465ae895ca917c94e045df39f3c1
    hash_after: a1d0cfac1a84465ae895ca917c94e045df39f3c1
    returns: 3
    why: "`./RUNME.sh lint spec` hands the checker a folder, and `Over` reads one path.; Say how a folder path reaches `RestatedPointer` and `RestatedRule`, because the ask names that verb.; Name the JavaScript writing `RestatedTable`, because the projection writes every rule file.; Name the `rules` entry carrying warning, because the projection writes the level from that map."
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: ec2576e45e1c08e43a87cea00bfbfad6d2ec29ac
    hash_after: ec2576e45e1c08e43a87cea00bfbfad6d2ec29ac
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-8
    hash_before: 39ae88961368b782dd9e3d5cfd72a2c00b8943e7
    hash_after: 39ae88961368b782dd9e3d5cfd72a2c00b8943e7
---

# Ask

One place owns each fact, so a reader follows the pointer and finds it current.

A sentence counts its own table, a header retells its pointer, and the copies drift apart.

- A check finds a sentence restating the table under it.
- The check finds a header retelling the note its pointer names.
- The check finds a rule standing in two guidance notes.
- `./RUNME.sh lint spec` names every place the check finds today.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

One measure answers the three: the longest run of words two places share. The
checker under `src/lsp` answers a named path, so the two rules reading a pair of
notes land there:

| the finding | where it lands | what it reads |
|---|---|---|
| `RestatedTable` | `spec/config/styles/VoiceParagraph/RestatedTable.yml`, which the paragraph schema projects | one buffer, under `scope: raw`, at `level: warning` |
| `RestatedPointer` | `restatedFaults` in `src/lsp/restated.go` | a heading, and the heading its pointer names in another note |
| `RestatedRule` | the same file | a rule line, against every rule line of another guidance note |

Why each home:

- `Checker.Over` answers a named path, and `Checker.Sweep` answers the tree
- a paragraph and the table touching it stand in one buffer, which is what Vale hands a rule
- the rules in JavaScript weigh two files for the write door, and a named path asks none of them

The pieces in Go:

- `sharedRun(a, b)` answers the longest run of words two texts share
- the reading blanks a fence with `fenceAt`, and a code span and a link each with its own pattern
- `sectionsOf` answers the headings, and the slug turns one into the anchor a pointer names
- the slug reads its cases from the source [[spec/design_output/vocabulary#the-slug-reads-one-source]] names
- `Over` reads the note in hand against the notes its pointers name, and `Sweep` reads every note

Each bound stands where its rule reads it:

| the bound | where it stands |
|---|---|
| the run a paragraph shares with its table | the paragraph schema, beside the caps it projects |
| `restated.pointer` | `spec/config/level0.json`, with its entry in `spec/config/level0.schema.json` |
| `restated.rule` | the same pair |

A folder reaches the pair through the front:

- `checks` in `src/lsp/main.go` hands each argument to `Over`, and `Over` reads one path
- so `checks` walks a folder into the notes under it, off `Tree.Paths`, and hands each one over
- `rulesFrom` in `.claude/skills/level0/lib/paragraph.js` writes the Vale rule off the schema
- `sideOf` there reads the level out of the schema's `rules` map, which gains `RestatedTable: warning`

The cases: the Go pair stands in `src/lsp/restated_test.go`, over the tree its
fixture writes. The Vale rule takes a case in `test/contract/paragraph.test.js`,
beside the rules the same schema projects. A case over `checks` hands it a
folder, and reads a finding of a note under it.

Each rule lands at warning, and the implement step lists what it names over the
tree. The ticket cleaning those places turns them to error. So this one leaves
no fault standing behind a green check.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- `Over` in `src/lsp/check.go` reads one path, and the draft walks a folder off `Tree.Paths`.
- `Tree.Paths` stands in `src/lsp/tree.go`, so `checks` reaches each note under `spec`.
- `rulesFrom` in `.claude/skills/level0/lib/paragraph.js` writes the rule file the draft names.
- `sideOf` there reads the level from the `rules` map, which admits warning.
- Each rule carries its home, its reading, its bound, its level and its cases.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/contract/paragraph.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

- the Vale case asks for `RestatedTable`, which the projection writes nowhere yet
- the Go cases stand beside it, and `go test ./...` under `src/lsp` fails three of them
- the stubs answer nothing, so each case reads an empty list where it wants a finding
- what surprises the hand: the Go front holds a fixture, so a case writes its own tree

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the checker, its front, the schema, the config pair, and the cases
- the Go fixture writes a tree of its own, and the Vale case drives the real binary
- each rule carries the pointer at the chapter tabling the rules over two files

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
