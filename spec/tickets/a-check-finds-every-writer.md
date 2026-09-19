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
step: implement/tests-green
record:
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: d5cad7b0b53bba4c053c4347c98c64a59d2ca992
    hash_after: d5cad7b0b53bba4c053c4347c98c64a59d2ca992
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-2
    hash_before: 77a2321a2621d949a9a8996d54e9f2ecd5ce30b5
    hash_after: 77a2321a2621d949a9a8996d54e9f2ecd5ce30b5
    returns: 1
    why: "| finding | fix |; |---|---|; | The rule excuses a whole file where one line names `folders.js` | Bind the escape to the line beside the copy |; | The approach pins the installer alone, so every other writer keeps the escape | Hold the whole class the ask names |; | The approach adds no rule, so the fault stands in the battery alone | Put the rule in `tree.js`, beside the ones over the same names |; | `tools.js` reads the installer already, for `surveyNamesInstalls` | Pull the loop through a function beside `installedTools` |; | The case reads the installer off disk, so no bad list reaches it | Feed that function a fake installer text |; | The case carries the two apart names by hand, as a third list | Let `folders.js` own the pair, so one list stands |; | The installer holds two more lists of old spellings | Cover the folder rename loop and the log loop |; A probe over `privateFolderOwned` passes a file importing `folders.js` and; spelling `.se/bin`, so a writer the ask names stands green today. Run; `git ls-files '*.js' '*.go' '*.sh' | xargs grep -l folders.js` for the writers; the escape covers."
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 4d3782295a0da08ca888f90cd3028e42eeed41da
    hash_after: 4d3782295a0da08ca888f90cd3028e42eeed41da
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-4
    hash_before: c3756b0376560316d2cb3b172f31d00f6e4b1861
    hash_after: c3756b0376560316d2cb3b172f31d00f6e4b1861
    returns: 2
    why: "| finding | fix |; |---|---|; | The tighter escape refuses copies standing across the tree today | Name each file it catches, and say what each one takes |; | `run`, `runtime` and `log` stand in no list the rule reads | Give each loop its own list in `folders.js`, beside `MOVED` |; | One reader answers the names of three loops that differ | Let the reader answer each loop apart, so each rule reads one list |; | The new rule over the installer carries no name | Name it beside the rules in `tree.js`, and link its note |; The redraft answers the reader, the fake text, and the two names standing apart.; `./RUNME.sh check` answers 0 on this tip, so every copy the tighter escape; catches turns the tree red at the same commit. Run; `git grep -n '\\.se/\\.runtime\\|\\.se/\\.retro' -- src .claude` for the copies, and; read each against the line above it."
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 2b12c0ece0908790066771bd981e593945273ed8
    hash_after: 2b12c0ece0908790066771bd981e593945273ed8
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-6
    hash_before: d584c290b090ead197a2330cf2abbafa8baab789
    hash_after: d584c290b090ead197a2330cf2abbafa8baab789
  - step: implement/tests-red
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: d581e58f06c8b33cbf760e0d7383543de0278888
    hash_after: d581e58f06c8b33cbf760e0d7383543de0278888
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 815be6a10c6df609177142d987fa3a960017fc7b
    hash_after: cf358663ee8257d38219d6c06a04ee208a79918c
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 2715f23703a7370c0aa90d50e41b9b82670a3400
    hash_after: 994cd59ac0f552b82dfd5d7fea59bb5636e03ff5
    answered:
      - name: tests
        exit: 0
        said: green, 25 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 5387e4f82b24 · claude-code-remote · helper-11
    hash_before: 51d669cf35a73d099191cb7b77c37f5e73ec1358
    hash_after: 51d669cf35a73d099191cb7b77c37f5e73ec1358
    returns: 1
    why: "| finding | fix |; |---|---|; | `spec/design_output/tree.md` tables the rules over two files, and the new rule stands outside it | Add its row, and name the two files it weighs |; | `spec/design_output/private.md` carries the older escape, so a reader takes an import as cover | Say the escape binds to the line, and to the comment run above it |; | `loopNames` reads the loop header for the private folder, so a loop of bare names carries no marker and passes | Mark a loop whose names meet a list, whatever its header spells |; | The red case over a loop naming no list moves to a header spelling that folder | Restore the bare case once the rule holds it |; the branch answers both lines of the ask, and the tighter escape catches the seven writers; `./RUNME.sh check` answers 0 on this tip; `./RUNME.sh branch review` says the check passes, and the route hands this ticket to a retro; every file the branch touches stands inside the ask, and the moved cases redesign nothing; each rule carries a case, and my probe refuses a stale spelling standing under an import; my probe adds a loop of bare names to the installer text, and the rule answers nothing"
  - step: implement/reflect
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 7307cc2a649ff414952502faa9014f16bc2ebc3d
    hash_after: 06b712a6c130111ce43f61eb3bab11f0cb9a9113
  - step: implement/change
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 19524f477706382406612ffb018b4e70feaa9112
    hash_after: 19524f477706382406612ffb018b4e70feaa9112
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
---

# Ask

a moved path reaches every writer in one change

runtime files land beside the private folder again after each move

- ./RUNME.sh check refuses a writer naming a path folders.js leaves behind
- a case covers a writer spelling an old runtime name

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The escape covers a whole file today, so a writer importing the owner spells
what it likes. Four pieces answer the ask:

| what changes | where it stands | what it does |
|---|---|---|
| the escape | `privateFolderOwned` in `.claude/skills/level0/lib/tree.js` | a spelling passes where its own line, or the comment run above it, names the owner |
| the rule over the installer | `installerHoldsTheNames` beside it | each loop carries the list its marker names, and each list has its loop |
| the reader | `loopNames(text)` beside `installedTools` in the level zero tools module | it answers each loop under the name its marker gives, out of a text |
| the three lists | `MOVED`, `RENAMED` and `LOGGED` in `.claude/skills/level0/lib/folders.js` | each one holds the names of one loop |

The installer names its own lists:

- a comment above each loop names the list in `folders.js` holding those names
- `MOVED` holds the names the runtime half takes, and `RENAMED` the older folder names
- `LOGGED` holds the older places of the log, which stands outside the half
- `APART` holds `hold.json` and `registry.json`, each with its reason beside it
- a loop carrying no marker comes back refused, so a fourth loop meets the rule too

The tighter escape draws on the copies standing in these writers today:

- `.claude/skills/level0/hooks/level0.js`, the hook a session starts
- `.claude/skills/level0/lib/vehicle.js`, which the pointer stands in
- `src/index/index.go`, `src/lsp/bridge.go`, `src/lsp/serve.go` and `src/lsp/tree.go`, which import no JavaScript
- `src/scripts/install.sh` and `src/stub/RUNME.sh`, which a shell runs

Each one takes the same line: a comment naming `folders.js` as the owner, above
the spelling. So the change adds a line to each writer, and moves no name.

The cases:

- a file importing the owner and spelling a stale path elsewhere comes back refused
- a file naming the owner in the comment above the spelling passes
- a loop missing a name its list holds comes back refused
- a loop holding a name its list lacks comes back refused
- a loop carrying no marker comes back refused

The rule cases stand in `test/contract/tree.test.js`, beside the rules over the
same names. The reader's cases stand in `test/level0/tools.test.js`, beside the
survey it reads with.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

| finding | fix |
|---|---|
| The writer list holds `src/stub/RUNME.sh`, which names the owner already | Drop it, and keep the seven the escape catches |
| The installer takes a comment at each of its spellings | Say the installer takes several, and every other writer one |
| `APART` gives each name a reason, so the rule excuses it both ways | Say which side each name stands apart on |
| The rule over the installer carries no note link | Link its note beside it in `tree.js` |

The approach answers the ask, and names the pieces, the lists, the rule, the
cases and the writers. Each finding above lands inside the implement step.

A probe over the tighter escape reads every tracked `.js`, `.go` and `.sh` file
under `src` and `.claude`. It catches `.claude/skills/level0/hooks/level0.js`,
`.claude/skills/level0/lib/vehicle.js`, `src/index/index.go`,
`src/lsp/bridge.go`, `src/lsp/serve.go`, `src/lsp/tree.go` and
`src/scripts/install.sh`, which the draft names. `./RUNME.sh check` answers 0
on this tip, so each of the seven turns the tree red at the same commit.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/contract/folders.test.js test/level0/tools.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

- the escape passes a spelling under an import today, so the case naming that line fails
- the reader and the installer rule answer nothing yet, so each case fails on its own assertion
- the name rules take a contract file of their own, because `test/contract/tree.test.js` stands at its ceiling
- what surprises the hand: the installer spells the half in several blocks, and each one takes its own line

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the names module, the reader, the rules, the installer, the writers it catches, and the cases
- the disk door and the git door carry the reading, and the fake tree answers both in the cases
- each rule and each list carries the pointer at the note the ask names

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

Two classes stand in the findings:

| the class | the fix |
|---|---|
| a case moves to the code where the two disagree | the code moves, and a case moves only where the approach moves |
| a rule lands, and the note tabling the rules stands unchanged | the change writes the row beside the rule |

The first class carries the hole: the reader asks the loop header for the
private folder, and a loop of bare names answers nothing. So the reader takes
the lists in hand, and a loop whose names meet one reads as marked or refused.
The case over a loop of bare names comes back with it.

The second class carries the two notes: one tables the rules over two files, and
one names the escape. Each takes its line in this change.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the fix touches the reader, its cases, and the two notes naming the rules
- the disk door and the git door carry the reading, and the fake tree answers them
- the reader's comment names the note the lists stand in

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the lists, the reader, the two rules, the installer, the writers the rule names, and the cases
- the disk door and the git door carry every reading, and the fake tree answers both in the cases
- each rule, each list and each copy carries the pointer at the note the ask names

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test test/contract/folders.test.js test/level0/tools.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A moved name reaches every writer, because the escape binds to the line and the
installer answers to the same lists:

| what lands | where |
|---|---|
| the line-bound escape | `privateFolderOwned` in `.claude/skills/level0/lib/tree.js` |
| the rule over the installer | `installerHoldsTheNames` beside it |
| the reader of a marked loop | `loopNames` in the level zero tools module |
| the lists and the names apart | `RENAMED`, `LOGGED` and `APART` in `folders.js` |
| the cases | `test/contract/folders.test.js` and `test/level0/tools.test.js` |

- a spelling passes where its own line, or the comment run above it, names the owner
- a loop reaching the private folder names its list in a comment, and the rule holds the pair
- `APART` names the side each odd name misses, so one list answers both readings
- the installer spells the folder once, in a variable every other line reads

The name rules take a contract file of their own, because the file they stood
in sits at its ceiling. The writers the tighter escape names each take a comment
line, and no name moves.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the lists, the reader, the two rules, the installer, the writers the rule names, and the cases
- the disk door and the git door carry every reading, and the fake tree answers both in the cases
- each rule, each list and each copy carries the pointer at the note the ask names

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- .claude/skills/level0/hooks/level0.js
- .claude/skills/level0/lib/folders.js
- .claude/skills/level0/lib/tools.js
- .claude/skills/level0/lib/tree.js
- .claude/skills/level0/lib/vehicle.js
- spec/tickets/a-check-finds-every-writer.md
- src/index/index.go
- src/lsp/bridge.go
- src/lsp/serve.go
- src/lsp/tree.go
- src/scripts/install.sh
- test/contract/folders.test.js
- test/contract/tree.test.js
- test/level0/tools.test.js
- spec/guidance/review/reviewing.md
- spec/design_output/tree.md
- spec/design_output/private.md
- spec/design_input/the-runtime-files-stand-apart.md
- src/scripts/pull-chapter.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

fail

| finding | fix |
|---|---|
| `spec/design_output/tree.md` tables the rules over two files, and the new rule stands outside it | Add its row, and name the two files it weighs |
| `spec/design_output/private.md` carries the older escape, so a reader takes an import as cover | Say the escape binds to the line, and to the comment run above it |
| `loopNames` reads the loop header for the private folder, so a loop of bare names carries no marker and passes | Mark a loop whose names meet a list, whatever its header spells |
| The red case over a loop naming no list moves to a header spelling that folder | Restore the bare case once the rule holds it |

- the branch answers both lines of the ask, and the tighter escape catches the seven writers
- `./RUNME.sh check` answers 0 on this tip
- `./RUNME.sh branch review` says the check passes, and the route hands this ticket to a retro
- every file the branch touches stands inside the ask, and the moved cases redesign nothing
- each rule carries a case, and my probe refuses a stale spelling standing under an import
- my probe adds a loop of bare names to the installer text, and the rule answers nothing

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the lists stand in `folders.js` alone, and the rule holds the installer copy against them. The notes over the rules carry neither the new rule nor the tighter escape.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
