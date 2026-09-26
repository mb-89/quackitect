---
kind: [[ticket]]
state: open
group: each-thing-stands-in-place
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
step: implement/tests-green
record:
  - step: design/draft
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 7373a6344bbaeb98f02684ef9593798cc51a2de4
    hash_after: 7373a6344bbaeb98f02684ef9593798cc51a2de4
  - step: design/review
    hand: box b8ae1b45d463 · claude-code-remote · helper-2
    hash_before: 48bcc6dfb1dff923098040f765e71c7467f772a0
    hash_after: 48bcc6dfb1dff923098040f765e71c7467f772a0
  - step: implement/tests-red
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 6bd6c57126db2a6251657a19f993adf168ccc6b9
    hash_after: 6bd6c57126db2a6251657a19f993adf168ccc6b9
    answered:
      - name: tests
        exit: 1
        said: assertion, 8 test(s) fail on their own assertion
  - step: implement/change
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 0f11689da536ffd11f7617138e463c1d1a8a5fb1
    hash_after: c38a7232838817638b81ab8b49c779d969b06498
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/the-small-faults-land.md:184:5: Characters: The character ] stands outside the set a paragraph admits: lett"
---

# Ask

A retro ends on one report the owner reads, then mints every class and promotion as a ticket. Each chapter reader reads its prompts, errors and commands through one verb.

An owner rule a retro promotes waits unbuilt, and the owner repeats it the next day. Each reader writes its own transcript parser, `collect --again` moves the classify generator out of `.se/scripts`, and the pull hands the auditors a checklist item as an object.

- `spec/processes/retro.yaml` carries a report step the owner passes, then a mint step last, and `spec/guidance/retro/check.md` points at them
- `retro mint` in `src/engine/retro/mint.js` mints a ticket for every promotion in `classes.json`. `mintFaults` refuses a promotion carrying no ticket, and a case in `test/level0/retro-mint.test.js` decides it
- `retro collect` in `src/scripts/retro-collect.js` hands the input no transcript line stamped before the last retro's collect. A case in `test/level0/retro-collect.test.js` decides it
- `./RUNME.sh retro read <retro> <chapter>` prints every owner prompt, error and command of the chapter with its file and line. A case under `test/level0` decides it
- `listAt` in `.claude/skills/level0/lib/schema-yaml.js` reads a quoted list item holding a colon as text. The pull then prints the audit checklist of `spec/processes/retro.yaml` whole. A case under `test/level0` decides both
- `retro collect --again` leaves `.se/scripts` in place, and `spec/guidance/retro/collect.md` names that folder beside the dot folders. A case in `test/level0/retro-collect.test.js` decides both
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Each ask line takes one change, over the files the ask names:

| the ask | the change | where |
|---|---|---|
| the route | `check` keeps its reading and closing, and its evidence runs `retro matrix`. A new `report` step follows, `by: person`, with a `verdict` field and `on_fail: check`. A new `mint` step stands last, and its evidence runs `retro mint` | `spec/processes/retro.yaml` |
| the guidance | rules six and seven swap order, so the matrix draws before the owner reads. A rule names the `report` step and the `mint` step, and a rule asks a ticket for every promotion | `spec/guidance/retro/check.md` |
| the promotions | `mintFaults` refuses a promotion carrying no ticket `name`, `gain`, `breaks` or `done_when`, unless its `tickets` names one. `mint` walks `record.promotions` after `record.classes`, and mints each the same way | `mintFaults` and `mint` in `src/engine/retro/mint.js` |
| the window | `copyTree` hands each transcript `.jsonl` through a new `withinWindow`, which drops every line stamped before `since`. A line carrying no stamp takes the stamp before it, as `timedFiles` reads it | `copyTree` in `src/scripts/retro-outside.js` |
| the read verb | a new `readChapter` reads `chapters/<id>.json`, walks each line range, and prints every owner prompt, fault and shell command as `path:line  kind  text` | a new `src/engine/retro/read.js` |
| the dispatch | `retro` sends `read` to `readChapter` with the retro and the chapter, and the usage names it | `retro` in `src/scripts/retro.js` |
| the fault test | `FAULT` gets exported, so `readChapter` marks a fault the way the timeline counts it | `src/engine/retro/timeline.js` |
| the reader guidance | a rule asks each reader to run `./RUNME.sh retro read <retro> <chapter>` in place of a parser of its own | `spec/guidance/retro/read.md` |
| the quoted item | `listAt` pushes a list item as a scalar where it opens and closes on the same quote mark, before `PAIR` reads it as a key | `listAt` in `.claude/skills/level0/lib/schema-yaml.js` |
| the scripts | `movedInto` skips a new `KEPT` name, `scripts`, and `stands` passes it. A first pass copies `.se/scripts` into `input/scripts`, and `--again` copies only what changes since | `movedInto`, `stands` and `collect` in `src/scripts/retro-collect.js` |
| the collect guidance | rule four names `.se/scripts` beside the dot folders, and the `collect` step's evidence says so too | `spec/guidance/retro/collect.md`, `spec/processes/retro.yaml` |

Each claim of the ask stands checked against the code:

- `mint` walks `record.classes` alone, and `recordOf` in `classes.js` reads `promotions` that nothing mints
- `copyTree` skips a file by its modified time, so an old line inside a live transcript rides in whole
- `movedInto` moves every name past a dot, so every collect moves `.se/scripts`, the first as well as `--again`
- `PAIR` matches the quoted audit item, so `readYaml` answers an object, and `workAnswer` prints `[object Object]`
- the retro verbs hold no `read`, and `timedFiles` already reads the stamps `readChapter` needs

The assumptions the approach takes:

- an owner prompt is a transcript line of `"type":"user"` carrying text, outside a `subagents` folder
- a command is a `tool_use` of `Bash`, and a fault is a line `FAULT` in `timeline.js` matches
- a promotion carries the same `ticket` fields a class carries, and `classify.md` stays as it stands
- a first collect still copies `.se/scripts`, so rule seven of `read.md` finds every script a hand writes
- the `report` step carries `to: owner` off `check`, so the owner reads before any ticket mints
- the fix in `listAt` changes the hash of `retro.yaml`, and the closed retro tickets keep theirs


### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/retro.js`, `retro`, through `mint`, `collect` and the new `read`
- `src/scripts/cli.js`, the `retro` entry of the verbs, through `retro`
- `src/engine/retro/mint.js`, `mint`, through `mintFaults`
- `src/scripts/retro-collect.js`, `collect`, through `outsideInto` and `copyTree`
- `src/scripts/retro-collect.js`, `collect`, through `movedInto` and `stands`
- `src/engine/retro/timeline.js`, `timedFiles`, which keeps `FAULT` as it reads it
- `.claude/skills/level0/lib/schema-yaml.js`, `block` and `under`, through `listAt`
- `.claude/skills/level0/lib/schema-yaml.js`, `readYaml`, through `block`
- `.claude/skills/level0/lib/schema-read.js`, `frontOf`, through `readYaml`
- `.claude/skills/level0/lib/schema-route.js`, `processHash`, through `readYaml`
- `.claude/skills/level0/lib/schema.js`, `kindsIn`, `checkData` and `kindsFrom`, through `readYaml`
- `src/scripts/process.js`, `processAt`, through `readYaml` and `processHash`
- `src/scripts/ticket-drift.js`, `baseOf`, through `readYaml`
- `src/scripts/graph.js`, `graphIn`, through `readYaml`
- `src/bridge/prose.js`, `wordsHere` and `schemaOf`, through `readYaml`
- `src/scripts/pull-chapter.js`, `workAnswer`, which prints the checklist `readYaml` reads
- `src/scripts/pull-hand.js`, `handed`, through `workAnswer` in `pull-chapter.js`
- `src/scripts/pull.js`, `handBack`, through `workAnswer` in `pull-chapter.js`
- `spec/tickets/retro-65c3028.md`, the `audit` checklist, which carries the quoted item


### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/retro-mint.test.js`, "a promotion carrying no ticket mints nothing, and the verb names it"
- `test/level0/retro-mint.test.js`, "every promotion mints one ticket with its ask, after the classes"
- `test/level0/retro-mint.test.js`, "the retro route ends on the report the owner passes, then the mint"
- `test/level0/retro-collect.test.js`, "a transcript line stamped before the last collect stays out of the input"
- `test/level0/retro-collect.test.js`, "a second pass leaves .se/scripts in place, and the guidance names it beside the dot folders"
- `test/level0/retro-read.test.js`, "retro read prints every owner prompt, fault and command of the chapter with its file and line"
- `test/level0/retro-read.test.js`, "retro read refuses a chapter the retro holds nowhere"
- `test/level0/schema.test.js`, "a quoted list item holding a colon reads as text, and the pull prints the audit checklist whole"


### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] every file, function and verb the approach names stands opened, and each claim checked there: each file in the table stands read, and `readYaml` over `retro.yaml` answers the object
- [x] the callers list names every caller of what the approach changes: a search for `mintFaults`, `outsideInto`, `listAt`, `readYaml`, `workAnswer` and `retro(` over `src`, `.claude` and `test` backs it
- [x] every done_when line names the test that decides it: each ask line maps to a row under tests, and the check line to `./RUNME.sh check`


## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings

- the-second-collect-keeps-lines: `--again` sets `since` to this retro's own collect, and `copyTree` writes each transcript over the same path under `input/transcripts`, so `withinWindow` there drops every line the first pass takes; the second pass filters at `sinceLast`, or appends past the lines the input holds
- a-promotion-names-its-fault: a promotion carries `what`, `from` and `to` and no `id`, as `faultsOf` in `classes.js` reads it, so `mintFaults` names it by `what` or its place in the list, where the class loop names `one.id`
- a-promotion-ticket-reads-once: `listFaults` in `classes.js` reads a promotion's `what`, `from` and `to` alone, so the `ticket` fields the check step adds stand checked in `mintFaults` alone; `classify.md` and `check.md` name the one step writing them
- the-quoted-pair-stays-paired: the `listAt` fix takes an item as text where it opens and closes on one quote mark, and `"a": "b"` does both; the fix takes an item as text where its closing quote stands last and no colon stands past it
- callers-name-work-answer-home: the callers list places `workAnswer` in `pull-hand.js` and `pull.js`, and it stands in `src/scripts/pull-chapter.js`

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/retro-mint.test.js test/level0/retro-collect.test.js test/level0/retro-read.test.js test/contract/process.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Each case fails on its own assertion:

| the case | what it sees now |
|---|---|
| a promotion mints | `mint` walks the classes alone, so no promotion ticket prints |
| the window | the copy holds the line stamped before the last collect |
| the scripts | a collect moves `.se/scripts` away |
| retro read | `retro` answers the usage for `read` |
| the route | the retro route ends on `check` |
| the collect guidance | `collect.md` names no `.se/scripts` |

What surprises me:

- the children land parts first, so `mintFaults` over promotions and the `listAt` fix stand green already
- the audit checklist case passes today, and it guards the `listAt` fix
- the second-pass case passes today too, and it guards the finding of `the-second-collect-keeps-lines`
- the route and guidance cases read the real files, so they stand under `test/contract`
- the case moving everything past the dot folders now expects `scripts` to stay

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] the change touches no file the ask leaves out: the tests stand beside the files the ask names
- [x] every door the change reaches has a fake: disk and proc run as fakes
- [x] a comment names the approach the change implements: each case points at this ticket
- [x] every fact the change adds stands in one place, and a note points at the file instead of repeating it: yes
- [x] every row the design review passes with stands fixed in the change: the second-pass case guards the collect row

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] the change touches no file the ask leaves out: the rationales and `pull-route.js` follow the guidance and the verb
- [x] every door the change reaches has a fake: disk and proc run as fakes
- [x] a comment names the approach the change implements: each new function points at this ticket
- [x] every fact the change adds stands in one place, and a note points at the file instead of repeating it: yes
- [x] every row the design review passes with stands fixed in the change: each child lands first, and collect windows at `sinceLast`

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
