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
step: implement/change
record:
  - step: design/draft
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 1b8e70c6b51ce3bb82a05e2f3e96a68f291bea8f
    hash_after: 1b8e70c6b51ce3bb82a05e2f3e96a68f291bea8f
  - step: design/review
    hand: box b8ae1b45d463 · claude-code-remote · helper-2
    hash_before: 934c928b6451c2af045b98579c3a882101fa30da
    hash_after: 934c928b6451c2af045b98579c3a882101fa30da
  - step: implement/tests-red
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 4eeefda9c0dc18b0027b5907b00353dc9282a832
    hash_after: 4eeefda9c0dc18b0027b5907b00353dc9282a832
    answered:
      - name: tests
        exit: 1
        said: "assertion: the tests fail on their own assertion at 7373a634"
---

# Ask

A count or a copy meets a check before it lands, so each fact keeps one owner. A reader then finds the current value on the first read.

A code header counts its members in a number word and passes. The cloud read, the ticket folders and the port wait stand spelled beside their owners, and a heading over a table counts its rows.

- `src/scripts/pull-push.js` and `src/bridge/stop.js` read the cloud through `cloudHere` in `.claude/skills/level0/lib/cloud.js`. A case in `test/level0/cloud-desk.test.js` holds it
- the `ticket` field description in `.claude/skills/level0/lib/apply.js` builds from the folders `src/engine/named.js` builds from
- a test ties `PANEL` in `src/scripts/cli-served.js` to `pointerPath` in `src/lsp/port.go`. The same test ties `PORT_WAIT` to `settleWait`, and fails where either side of a pair moves
- `spec/config/styles/VoiceVale/CodeHeader.yml` reads any number word, and a case in `test/contract/vale.test.js` holds it over the header of `src/scripts/ephemeral.js`
- `spec/config/styles/VoiceVale/CountedList.yml` reads a heading over a list or a table, and a case in `test/contract/vale.test.js` holds it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Each copy the ask names moves to its owner, or meets a test where a language
wall forces the copy:

| the fact | the change | the owner |
|---|---|---|
| the cloud read | `pushed` in `src/scripts/pull-push.js` and the stop rules in `src/bridge/stop.js` call `cloudHere` in place of `inCloud` over `env` | `cloudHere` in `.claude/skills/level0/lib/cloud.js` |
| the ticket folders | `apply.js` exports `TICKET_WHERE`, built off `TICKETS` and `NOTE_END` in `src/engine/group.js` and `TICKETS` in `folders.js`, and `TICKET` reads it. `named.js` imports it in place of its own `WHERE` | `TICKET_WHERE` in `.claude/skills/level0/lib/apply.js` |
| the pointer path | a test reads the `filepath.Join` inside `pointerPath` off `src/lsp/port.go`, and matches it to `PANEL` | `pointerPath` in `src/lsp/port.go` |
| the port wait | the same test reads `settleWait` as a count of `time.Minute` or `time.Second`, and matches it in milliseconds to `PORT_WAIT` | `settleWait` in `src/lsp/port.go` |

The two Vale rules widen:

- `CodeHeader` refuses a number word from two to twelve standing alone, beside the digit or word before a plural it reads today
- `CountedList` reads a heading line as a candidate, so a heading over a list or a table warns where it counts
- every header the wider `CodeHeader` refuses gets rewritten in the same change, `src/scripts/ephemeral.js` among them, so the check stays green

The import runs one way: `named.js` imports `apply.js`, and `apply.js` imports
`group.js` and `folders.js`, neither of which imports `apply.js`.
`.claude/skills/level0/lib/cloud.js` imports `src/engine/group.js` already, so
the reach from the skill folder into `src/engine` has a precedent.
`cloudHere` reads `cloud` first and `env` after, so a box carrying no `cloud`
flag answers as `inCloud` does today.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/pull-push.js`, `pushed`
- `src/bridge/stop.js`, the `a-person-sits-here` rule and the two readers beside `THE CHAT IS NEW`
- `.claude/skills/level0/lib/apply.js`, `patchSpec` and `replaceSpec`, through `TICKET`
- `src/engine/named.js`, `FIELD_HOW`, `MESSAGE_HOW` and `DESCRIPTION_HOW`, through `WHERE`
- `src/scripts/cli-served.js`, `portFaults`, through `PANEL` and `PORT_WAIT`
- `spec/config/styles/VoiceVale/CodeHeader.yml`, over every tracked `.js` and `.go` header outside `prototype`
- `spec/config/styles/VoiceVale/CountedList.yml`, over every Markdown note

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/cloud-desk.test.js`, "every reader of the cloud asks cloudHere, and a push reads the doors' own flag first"
- `test/level0/cloud-desk.test.js`, "the ticket field and the named faults spell the folders out of one place"
- `test/contract/cli-check-doors.test.js`, "the panel pointer and the port wait match pointerPath and settleWait in port.go"
- `test/contract/vale.test.js`, "a header naming a number word refuses, over the header ephemeral.js carried"
- `test/contract/vale.test.js`, "a heading counting the list or the table under it warns"

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] every file, function and verb the approach names stands opened, and each claim checked there: `cloud.js`, `pull-push.js`, `stop.js`, `apply.js`, `named.js`, `group.js`, `cli-served.js`, `port.go`, both Vale rules and both test files stand read
- [x] the callers list names every caller of what the approach changes: a search for `inCloud`, `WHERE`, `PANEL` and `PORT_WAIT` over `src`, `.claude` and `test` backs it
- [x] every done_when line names the test that decides it: each ask line maps to a row under tests, and the check line to `./RUNME.sh check`

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass

- The plugin import stands answered: `PUBLIC_TICKETS` and `NOTE_END` live in `.claude/skills/level0/lib/folders.js`, `apply.js` imports its sibling alone, and `src/engine/group.js` and `named.js` read the plugin. No cycle forms, and the hook's reach stays inside the plugin.
- `src/scripts/pull-hand-of.js`, `handDoors`, spells `cloud: inCloud(env)`. It is the source of the doors' flag, so it stays, and the cloud-desk case names why it stands off the search. The implement step writes that line.
- The callers list names every header the wider `CodeHeader` refuses, beside `ephemeral.js`: `src/config/config.go`, `src/extension/lib/grid.js`, `src/scripts/log-read.js`, `src/scripts/work-list.js` and the test headers under `test/contract` and `test/level0`. The implement step fixes each in place.
- `one` stays out of `CodeHeader`, because the voice says `one owner` and `one a line` as identity and counts nothing. The rule's comment says so.
- The wider `CountedList` warns on headings in `spec/design_output`, such as `## Three kinds stand apart` in `private.md`. `saysGreen` in `.claude/skills/level0/lib/runs.js` reads a warning as red, so the implement step renames each heading and every link to its anchor in the same commit, and `./RUNME.sh check` decides it.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    .se/scripts/red-at.sh 7373a634 test/level0/cloud-desk.test.js test/contract/cli-check-doors.test.js test/contract/vale.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

- the change landed before this leaf, so `red-at.sh` runs the tests at the tip over the tree of the commit before the change
- there, the source case fails: `pull-push.js` and `stop.js` read `inCloud`, and `named.js` builds its own `WHERE`
- there, `cloud-desk.test.js` stops at its import, because `folders.js` exports no `PUBLIC_TICKETS` yet
- the port pair case passes from the first run, because both pairs match today, and it fails the day one side moves
- the number word case fails over the header `ephemeral.js` carried, and the heading case fails over a heading counting a list and a table
- what surprises the hand: the long header fixture spelled its lines as number words, so it tripped the wider rule and took other words
- what surprises the hand: the plugin imports nothing past its own folder, so the public ticket folder moves into `folders.js`

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] the change touches no file the ask leaves out: past the named files, it touches the headers and headings the wider rules refuse, as the review asks
- [x] every door the change reaches has a fake: the level zero cases read no disk, and the source reads stand in `test/contract`
- [x] a comment names the approach the change implements: each new case and constant carries the pointer at this ticket or its note
- [x] every fact the change adds stands in one place: `folders.js` owns the ticket folder, `cloudHere` the cloud read, and `port.go` the port pair
- [x] every row the design review passes with stands fixed in the change: the plugin import, the headers, the headings and their links

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
