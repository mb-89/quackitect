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
step: implement/change
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
group: the-foundation-lands-unchanged
record:
  - step: design/draft
    hand: box d7a69cb6601d7 · claude-code-remote
    hash_before: 89ba223a6be4b6180505383d9620867a94b1573c
    hash_after: 89ba223a6be4b6180505383d9620867a94b1573c
  - step: design/review
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 2e2ccb8fb617e7976869e3e568d6c1ae15724aa3
    hash_after: 2e2ccb8fb617e7976869e3e568d6c1ae15724aa3
  - step: implement/tests-red
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: e8f6d94cc0912588c06ecf1dd90e0ddea0afdeb8
    hash_after: e8f6d94cc0912588c06ecf1dd90e0ddea0afdeb8
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
---

# Ask

Go becomes the one writer of frontmatter. One commit rewrites every ticket in its form, and the JavaScript writers call it or leave.

Five parsers and three writers disagree on quoting today. One writer ends the rewrites a mismatch brings.

- - `go test ./...` from the root passes
- a second run of the writer over every ticket leaves `git diff` empty
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

A Go package `src/front` holds the one writer, in the module [[spec/tickets/go-code-shares-one-module]] leaves. A pure Go binary `se-front` hands it to every other language, and the install builds it beside `se-lsp`.

| the op | what it writes |
|---|---|
| `set <key> <value>` | one top-level scalar, added before the fence where it stands nowhere |
| `drop <key>` | one top-level key and the block under it |
| `entry <json>` | one item at the end of `record` |
| `after <hash>` | `hash_after` on the open record item, else on the last |
| `mint <json>` | a whole front off an ordered map, the way the mint writes it |
| `normalise` | the front rewritten in the writer's form, and the body left byte for byte |

The rules the writer holds:

- the binary takes the note in and answers it written, so a caller keeps its own file door
- one quoting rule holds for every scalar, the rule `quotedValue` in the window holds now
- a value holding `: ` or ` #`, opening on a YAML mark, or ending on a space takes double quotes
- keys keep their order, and a comment line stays where it stands
- the JavaScript writers call the binary through one function in `src/engine/group.js`, and their own row builders leave
- the window calls the package in place of its own `WithField`
- where the binary stands nowhere, a write refuses and names `./RUNME.sh` as the fix
- one commit runs `se-front normalise` over every ticket and lands the rewrite alone, before the callers switch

The objection: a box with no Go loses every ticket write, where a write in JavaScript ran before. The answer: the install puts Go on every box that works tickets, since the check already runs the Go tests. The refusal names the fix.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/engine/group.js` the four field writers, `withField` first, which call the binary
- `.claude/skills/level0/lib/schema-mint.js` `mintNote` and `reRouted`, which call the binary
- `.claude/skills/level0/lib/schema-mint.js` `keyRows` and `flatOf`, which leave
- `src/tui/work/workedit.go` `WithField` and `writeTicket`, which call the package
- `src/scripts/ticket.js`, a caller of the group writers and of `reRouted`
- `src/scripts/pull-hand.js`, a caller of the group writers and of `reRouted`
- `src/scripts/ticket-route.js`, a caller of `reRouted`
- `src/scripts/work.js`, a caller of the group writers
- `src/scripts/work-unblock.js`, a caller of the group writers
- `src/scripts/work-merge.js`, a caller of the group writers
- `src/scripts/pull.js`, a caller of the group writers
- `src/scripts/pull-writes.js`, a caller of the group writers
- `src/scripts/pull-chapter.js`, a caller of the group writers
- `src/scripts/install.sh` `get_lsp`, beside which `get_front` builds the binary
- `src/scripts/go-source.js` `BUILDS`, which takes the binary's folder

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `src/front/front_test.go` `TestQuotesWhereYamlNeedsIt`, one case a mark
- `src/front/front_test.go` `TestEachOpKeepsTheBody`, one case an op
- `src/front/front_test.go` `TestNormaliseRunsTwiceAsOnce`, over every ticket of the tree, which decides the second done line
- `test/level0/front-writer.test.js` "a group writer hands the note to the binary and writes its answer"
- `test/level0/front-writer.test.js` "a write refuses and names the install where the binary stands nowhere"
- `go test ./...` from the root, which decides the first done line
- `./RUNME.sh check`, which decides the third

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the three writers stand opened: `workedit.go`, `schema-mint.js` and `group.js`, with their quoting read there
- the callers come off a search for each writer's name over `src` and the plugin library
- each done line names its test in the tests list

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

pass

<!-- the form is verdict -->

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh test src/front/front_test.go test/level0/front-writer.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Every Go case but one fails against stand-ins that hand the note back. `TestNormaliseRunsTwiceAsOnce` passes on the stand-in, since a writer that moves nothing moves nothing twice. The three JavaScript cases fail on their own assertions.

The surprise: the tree's JavaScript reader strips a quote and unescapes nothing. A rewrite between quoted and plain keeps every value it reads.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the new package, the front door and their tests, which the ask names
- the JavaScript case runs over the fake disk and the fake process
- each new file opens on the approach and links this ticket
- the quoting rule stands in `Quote` alone, and the cases read it
- the review passes with no rows

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
