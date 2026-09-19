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
