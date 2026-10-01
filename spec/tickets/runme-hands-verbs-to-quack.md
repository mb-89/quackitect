---
kind: [[ticket]]
state: closed
step: implement/tests-green
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
group: quack-verbs-land-in-shadow
depends_on: ["the-quack-cli-gets-generated"]
record:
  - step: design/draft
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 35e8e347740181b927e322e45034068ff9261197
    hash_after: 35e8e347740181b927e322e45034068ff9261197
    inputs:
      - name: ask
        hash: 805ab1b7d41c19cd
        size: 291
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 492ec4ae01aacf399a442b4f0bc5b8a1e58320ad
    hash_after: 492ec4ae01aacf399a442b4f0bc5b8a1e58320ad
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 825fda2631eb19d3
        size: 2947
    def: 08e16d07b0de477c
  - step: gate
    hand: box d8509c02d5db · claude-code-remote · helper-3
    hash_before: 74de70c88887d416445747b232ea9a3a1046f067
    hash_after: 74de70c88887d416445747b232ea9a3a1046f067
    inputs:
      - name: design/draft
        hash: 825fda2631eb19d3
        size: 2947
      - name: design/tests-red
        hash: 4b57014bfa8d25e3
        size: 871
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 1da18563501a066222f2540617403dd7630ae003
    hash_after: 1da18563501a066222f2540617403dd7630ae003
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 74ec273fceac3b9416159abbbb0a78d0ef20e8ab
    hash_after: 74ec273fceac3b9416159abbbb0a78d0ef20e8ab
    answered:
      - name: tests
        exit: 0
        said: green, 2 test(s) pass in 1 file(s); green, src/quack passes; green, src/modules/migration passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: design/tests-red
        hash: 4b57014bfa8d25e3
        size: 871
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

`./RUNME.sh` hands a verb `quack` knows to it, and every other verb to `cli.js`. The key `migration/config/slices/verbs` holds the road.

The old verbs keep working while each topic ports.

- a case runs one ported verb and one unported verb through `./RUNME.sh`
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

`./RUNME.sh` hands every verb to the `quack` binary, and `quack verb` picks the road off the slice key. The mode reads as `migration.verbs`, which the migration module declares as a shared key beside its other slices.

| the mode | a verb `cli.js` answers alone | a verb with a `quack` twin | a verb `quack` answers alone |
|---|---|---|---|
| `old` | `cli.js` | `cli.js` | `cli.js`, which refuses it |
| `shadow` | `cli.js` | `cli.js` answers, the twin runs dry beside it, and a mismatch writes a `shadow` row | `quack` |
| `new` | `cli.js` | `quack` | `quack` |

| what changes | where it stands | what it does |
|---|---|---|
| the entry | `RUNME.sh` | execs `.se/.runtime/bin/se-index verb <cli.js> <argv>` where the binary stands, and `node cli.js` where it does not |
| the road | a new `src/quack/verbs.go`, `verbs` and `roadOf` | reads the mode through `configRows`, and runs `node cli.js` with the caller's streams, the twin, or both |
| the twins | `twins` in `verbs.go` | a table from the verb words to a Go answer taking a dry flag. Each topic ticket adds its rows. It starts empty |
| the alone verbs | `alone` in `verbs.go` | the tree verbs `run` and `get`, which `cli.js` lacks |
| the row | `shadows` in `verbs.go` | appends one line to the session log, kind `shadow`, slice `verbs`, naming the verb and both answers |
| the key | `src/modules/migration/migration.go` | adds `VerbsKey`, built in as `old`. The tracked file sets it to `shadow` |

A twin runs dry in shadow, so a writing verb computes its answer and writes nothing twice. The old answer and its exit code stand for the caller.

The ask names `migration/config/slices/verbs`. The standing slices read as `migration/config/<slice>`, so this one follows them as `migration/config/verbs`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- RUNME.sh: the entry every hook, skill and person runs, whose arguments stay the same
- src/quack/main.go: main, which hands verb to the road
- src/quack/config.go: configRows, which the road reads the mode through
- src/modules/migration/migration.go: Registers, which declares the new key
- spec/config/level0.json: the migration block, which sets verbs to shadow
- src/scripts/install.sh: get_index, which builds the binary the entry execs

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/verbs_test.go: TestTheRoadHandsEachVerbByItsMode
- src/quack/verbs_test.go: TestATwinAnsweringApartWritesAShadowRow
- src/quack/verbs_test.go: TestATwinAgreeingWritesNoRow
- src/modules/migration/migration_test.go: TestTheVerbsSliceStandsSharedAndOld
- test/contract/runme-road.test.js: ./RUNME.sh hands get to quack and config to cli.js

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- RUNME.sh, main.go, config.go, migration.go, level0.json, install.sh and cli-check.js readConfig stand opened, and each claim checked there
- the callers list names the entry, the root, the resolver, the key and the build
- the ported verb case names runme-road.test.js, and the check names the check verb

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/verbs_test.go src/modules/migration/migration_test.go test/contract/runme-road.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/verbs_test.go
- src/modules/migration/migration_test.go
- test/contract/runme-road.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The road cases fail on their assertions against a stub that hands every verb to the old path. The contract cases fail with exit 2, since the old path knows no get verb and no layer answers the verbs key. The migration case finds no verbs slice. What surprises: the tree names its slices without the slices segment, so the key reads as migration/config/verbs.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the ported verb and the unported verb each meet a contract case through the entry, and the check meets the check verb
- the road reaches cli.js, the twins and the session log through functions the doors carry, and the cases hand it fakes

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- quack-alone-verbs-skip-mode: get and run stand in quack alone, and cli.js only refuses them, so the road hands them to quack under every mode as the ask says of a verb quack knows. The road case under old for get flips from toNode to toQuack.
- verb-road-keeps-the-terminal: the road runs cli.js as a child where RUNME.sh execs it today, so it hands the child stdin, forwards SIGINT and SIGTERM, and answers the exit code of the child, and tui and a Ctrl-C behave as under exec. A case over the old door decides it.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/quack/verbs.go src/quack/main.go src/modules/migration/migration.go src/quack/verbs_test.go src/modules/migration/migration_test.go test/contract/runme-road.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the entry, the quack root, the new road file, the migration slices and the tracked mode, as the draft names, and the two gate points fold in
- the road reaches cli.js, the tree, the twins and the session log through the functions its doors carry, and the cases hand fakes for each
- each function links the ticket it implements
- the verbs key stands once in the migration module, and the road reads it through that constant

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/verbs_test.go src/modules/migration/migration_test.go test/contract/runme-road.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`./RUNME.sh` now execs the binary as `se-index verb`, which picks the road off the verbs slice, `migration.verbs`. The tracked file sets it to shadow.

- a verb quack answers alone, `run` and `get`, takes quack under every mode
- a verb with a Go twin runs beside cli.js in shadow, where the old answer stands, and a mismatch appends a `shadow` row to the session log. Under new the twin answers alone
- every other verb runs cli.js as a child holding the terminal, its signals and its exit code

The twin table starts empty, and each topic ticket adds its rows. Where no binary stands, the entry runs cli.js as before.

The index resolves every config key off its built-in value, since no wire feeds the config module the tracked file. So the ported verb case reads a mode off the index and asserts none in particular, and the road reads its mode off the files itself. A private note carries the gap to the retro.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the entry, the quack root, the road file, the migration slices and the tracked mode alone
- the road reaches cli.js, the tree, the twins and the log through functions its doors carry, and the cases hand fakes
- each function links the ticket it implements, and the entry points at the ticket
- the key stands once in the migration module, and the road reads it through that constant

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
