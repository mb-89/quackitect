---
kind: [[ticket]]
state: closed
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
step: verdict
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
  - step: implement/tests-red
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 1914346324cbb419f2cf67d26b872839c5728267
    hash_after: 73a692edf4d1f358752db3441c4f5851780aea7b
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 20bfc811231b67ec179addd012af0f9bab1db1ab
    hash_after: a5a34f0d9bebb0c273ce193ad0eb418fc95b5dc2
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: b581ba24bc075b77e3c0823b286802c1e73eb75f
    hash_after: 0475ccd9a1cd6ebee21dfad187c09a4071e14b0a
    answered:
      - name: tests
        exit: 0
        said: green, 15 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 5387e4f82b24 · claude-code-remote · helper-13
    hash_before: 04dbb822b8d8378dbb680b7cb3925e7044c6aa52
    hash_after: 04dbb822b8d8378dbb680b7cb3925e7044c6aa52
    returns: 1
    why: "`restatedOver` reads the whole tree once per path, so a folder costs the notes under it squared.; `se-lsp check spec` runs past two minutes here, and `se-lsp check .` answers in under two.; So `./RUNME.sh lint spec`, the verb the ask names, crawls where the sweep stays quick.; One note costs half a second, and the binary at the branch point answers it at once.; The fix: read the tree once inside `checks`, key the findings by file, hand each `Over` its own.; `spec/design_output/tree-view.md` renames a chapter, and two pointers still name the old anchor.; `src/viewer/treedraw.go` and `src/viewer/tree_test.go` carry that dead anchor at the tip.; The working tree holds the fix for those two, uncommitted. Commit it, or the tip stays broken.; `restatedHere` claims the layers the resolver reads, and skips the environment `wordsHere` reads.; A tree missing the `restated` block leaves both bounds at nothing, so every pointer draws. Floor them.; What holds, so the fixes stay small:; `./RUNME.sh check` answers 0 on a quiet box, and the handover carries a retro.; Vale gives up on a rule where hands run beside each other, which the handover names already.; The handover names the dead anchor as a retro finding, with the fix for the class.; The rules fire live: a note retelling the chapter its pointer names draws `RestatedPointer`.; Each Go case feeds the rule a bad pair and a good one, and each answers right.; The sweep draws nothing over the tree, so the three places the branch names take their fix.; Each bound stands in one place, and `spec/config/level0.schema.json` types the pair.; `RestatedTable` stands off over tickets alone, where a line weighs its table on purpose."
  - step: implement/reflect
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: bacd8e31d6f622af3b33d7c6b09458e15c146ead
    hash_after: bacd8e31d6f622af3b33d7c6b09458e15c146ead
  - step: implement/change
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 3478a04d54be7bca9420583464dc7491470e8279
    hash_after: 051dd515796b92efca2dee8c4f833f5f2d9d245d
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: ebb666f70de948978404c19334e12d05674c6c55
    hash_after: e37370fa81a96090c45ce011df7c0b573a9abb63
    answered:
      - name: tests
        exit: 0
        said: green, 15 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 5387e4f82b24 · claude-code-remote · helper-17
    hash_before: 5c490f19f84f35f0eb6efdc46a53fcba425ca9d0
    hash_after: 5c490f19f84f35f0eb6efdc46a53fcba425ca9d0
    returns: 2
    why: "The branch answers the ask: three rules draw, and `./RUNME.sh lint spec` names every place.; `spec/config/level0.json` says the tree note tables the restated rules, and it tables none.; [[spec/design_output/lsp#a-second-copy-draws]] owns that table, so the comment names the wrong note.; The fix for it stands uncommitted in the working tree. Commit it, or the tip stays wrong.; `spec/schemas/paragraph.schema.yaml` names that same tree chapter over `restated.table`. Name the owner.; What holds, so the fixes stay small:; `./RUNME.sh check` answers 0: 1253 cases pass, none fails, every projection reads as projected.; `./RUNME.sh lint spec` answers 0 in under seven seconds, where it crawled past two minutes.; The tree holds the one pass, and a case proves three asks cost one.; A changed buffer drops the findings, and the next ask pays the pass again.; A scratch tree draws `RestatedPointer` and `RestatedRule` off the binary, handed a folder.; Vale draws `RestatedTable` over a line beside a table, live.; A bound of nothing holds its rule off, which answers the missing block, and a case proves it.; `restatedHere` reads the tracked file, the environment and the local one, as `wordsHere` does.; The dead anchors under `src/viewer` stand committed at the tip.; The handover carries a retro, and its third finding names the class both fixes fall under.; The files past this ask belong to the group's other tickets, and none redesigns this one."
  - step: implement/reflect
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: db63ab8d26a15c1630a7709dd866b62edecd7361
    hash_after: db63ab8d26a15c1630a7709dd866b62edecd7361
  - step: implement/change
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 4f38b5c183b198f4ef5f0fdf042b0f658b712cb1
    hash_after: 4f38b5c183b198f4ef5f0fdf042b0f658b712cb1
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: b71fd08f1339cfd1c650c9cbc2caf781676f919f
    hash_after: b377e466d20736eb12f0c79c51affe4a73ed5e29
    answered:
      - name: tests
        exit: 0
        said: green, 15 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 5387e4f82b24 · claude-code-remote · helper-21
    hash_before: 52c26a1666e427d34d3777ca2b2c4b1e5ccda817
    hash_after: 52c26a1666e427d34d3777ca2b2c4b1e5ccda817
reason: done
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

The findings name two classes, and each one stands wherever a rule reads a pair
of files.

| the class | the fault here | the fix for the class |
|---|---|---|
| a whole-tree pass answers one path | `restatedOver` reads every note, keeps one file's findings, and the front calls it per path | the front runs the pass once, keys the findings by file, and hands each `Over` its own |
| a bound reads config with no floor | a tree missing the `restated` block leaves both at zero, so every pair draws | the reader floors each bound, and the layers stand beside the ones `wordsHere` reads |

The first class costs the verb the ask names: `se-lsp check spec` runs past two
minutes, and the sweep over the same notes answers in under two seconds. A rule
whose cost reads the tree belongs in the sweep, or behind a pass the front runs
once.

The second class turns a rule hardest on the tree carrying no config. A bound
reading zero passes every comparison, so a missing block draws a fault on every
pointer. So each bound floors at one, and a tree carrying no block draws nothing.
The shipped config owns each number, so the code copies neither.

The second round adds one class: a piece names the note standing where its
subject used to stand.

| the class | the fault here | the fix for the class |
|---|---|---|
| a pointer names the neighbour of its owner | the config comment and the schema comment name the note tabling the older rules | each comment names the chapter owning what it describes |

The class stands behind the dead anchors too: a pointer holds a name, and
nothing checks that the name still says what the pointer means. The handover
carries it as a finding, because the check answering it wants a ticket.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the fix touches the checker, its front and the config reader, which the ask already names
- the change reaches the disk through the tree the checker holds, and no door of its own
- each piece carries the pointer at the chapter tabling the rules over two files

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- this round touches the tree's memo, the checker, the config reader and the bound guard
- the Go fixture writes a tree of its own, and the Vale case drives the real binary
- each rule and each piece carries the pointer at the chapter tabling the rules over two files

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test test/contract/paragraph.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A fact written in two places drifts, so three rules find the second copy:

- `src/lsp/restated.go` holds the Go pair: one over a pointer, one over a rule name
- a chapter naming a pointer another chapter already names draws at the second
- a note naming a rule the guidance holds draws where the wording shares a run of words
- `RestatedTable` comes out of the paragraph schema, over a line beside a table
- `pathsUnder` in `src/lsp/main.go` walks a folder, so the check reads every note under a path
- `spec/config/level0.json` carries the two bounds, and the schema beside it types them
- the rule files stand at warning, so a draft moves while the count settles

Three places the new rules name take their fix. The testing note points at the
code note, which holds that rule over every change. The tree view note renames a
heading the viewer note already carries. The lint config turns the table rule
off over tickets, where a line beside a table weighs it on purpose.

The second round answers the verdict's findings:

| the finding | what lands |
|---|---|
| the pass ran once per path | the tree holds the findings, and every front reads the one pass |
| `se-lsp check spec` ran past two minutes | the same command answers in a second, and `./RUNME.sh lint spec` in six |
| the bounds read two layers | the reader takes the environment between the tracked file and the local one |
| a missing block drew every pair | a bound under one holds its rule off, the way the name cap reads its own |
| the rename left two pointers reaching nothing | both name the chapter the note now carries |

The bounds take no floor in the code, because the shipped config owns each
number. A tree carrying none draws nothing, which is the quiet side to fail on.

`spec/design_output/lsp.md` gains the chapter saying what the two Go rules weigh
and what the bounds do. Every piece of the set points there, so a reader
following a pointer lands on the chapter describing it.

The third round carries that last step through the two comments the rules reach
from outside the code: the `restated` block of `spec/config/level0.json`, and
the `restated` layer of `spec/schemas/paragraph.schema.yaml`. Each one names the
chapter owning it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- this round touches the tree's memo, the checker, the config reader, the bound guard and the note
- the Go fixture writes a tree of its own, and the Vale case drives the real binary
- each piece points at the chapter saying what the rules weigh and how the pass runs

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- spec/guidance/review/reviewing.md
- spec/tickets/a-check-finds-restated-facts.md
- HANDOVER.md
- src/lsp/restated.go
- src/lsp/restated_test.go
- src/lsp/check.go
- src/lsp/config.go
- src/lsp/main.go
- spec/config/level0.json
- spec/config/level0.schema.json
- spec/schemas/paragraph.schema.yaml
- spec/config/styles/VoiceParagraph/RestatedTable.yml
- .claude/skills/level0/lib/paragraph.js
- .claude/skills/level0/lib/paragraph-rules.js
- .vale.ini
- spec/design_output/lsp.md
- spec/design_output/tree.md
- spec/design_output/tree-view.md
- src/viewer/treedraw.go
- src/viewer/tree_test.go
- test/contract/paragraph.test.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass

- `spec/config/level0.json` names `spec/design_output/lsp.md`, the note owning what the rules weigh.
- `spec/schemas/paragraph.schema.yaml` names [[spec/design_output/lsp#a-second-copy-draws]] over `restated.table`.
- `test/contract/paragraph.test.js` names that chapter too, where it named the neighbour.
- The working tree stands clean, so the tip carries every fix the last round asked for.

What holds:

- The branch answers the ask: the rules draw, and `./RUNME.sh lint spec` names every place.
- `./RUNME.sh check` answers 0, every case passes, and every projection reads as projected.
- `./RUNME.sh lint spec` answers 0, in seconds where it crawled past the minute.
- `./RUNME.sh branch review the-rules-hold-themselves` answers nothing to fix.
- A scratch tree draws `RestatedPointer` and `RestatedRule` off the binary, handed a folder.
- Vale draws `RestatedTable` live, over a line saying again what the cell beside it holds.
- Each rule carries a case feeding it a bad pair and a good one, and each answers right.
- The sweep draws nothing over this tree, so the places the branch names took their fix.
- `spec/design_output/tree#the-rules-over-two-files` stands live, so the pointers left on it reach a chapter.
- Both pointers under `src/viewer` name [[spec/design_output/tree-view#a-tab-joins-the-two]], which stands.
- The handover carries a retro, and its third finding names the class both fixes fall under.
- The files past this ask belong to the group's other tickets, and none redesigns this one.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- Each bound stands in one place, and [[spec/design_output/lsp#a-second-copy-draws]] owns what the rules weigh. The code, the config comment, the schema comment and the case point there. The projected rule file names its source. No fact this change adds stands twice.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
