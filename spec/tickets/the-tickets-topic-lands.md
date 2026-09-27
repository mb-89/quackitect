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
step: implement/tests-red
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
group: open-tasks-land-in-shadow
record:
  - step: design/draft
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: 97cf64d82fe5c3d221b61bb2511f50641f372d21
    hash_after: 97cf64d82fe5c3d221b61bb2511f50641f372d21
  - step: design/review
    hand: box d7d70c069f441 · claude-code-remote · helper-2
    hash_before: d59ca81ff3d975bf503d26803866c28fb810546b
    hash_after: d59ca81ff3d975bf503d26803866c28fb810546b
---

# Ask

The `tickets/` module stands, ported from `src/index/ticket.go`, with one reading of the Ask and one held rule.

Three readers of the Ask and three of the held rule disagree today, as [[spec/design_output/migration#the-duplications]] shows.

- - `go test ./...` from the root passes
- a golden file holds the Ask and the standing of every ticket in the tree
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

A new package `src/tickets` holds the one reading of a ticket, as pure functions over a note's text, and registers the topic in `q.Main`.

| the part | the one reading |
|---|---|
| `Of(path, text, changed)` | the fields `src/index/ticket.go` answers today, with the front read through `src/yaml` in place of a line scan |
| `Ask(text)` | the rows of the `# Ask` chapter up to the next heading of any level. A fenced block reads as text, so a `#` inside it closes nothing. Every comment drops, a comment over several rows included. This is the reading of `pull-chapter.js`, and `group.js` alone keeps comments |
| `Held(text)` | the last record item carrying `hash_before` and no `hash_after`, the rule of `group.js`, read off the parsed record |
| `Standing(text)` | `done` where the state reads closed, `held` where `Held` answers, `todo` otherwise |
| `All(tickets)` | every child reads its group's standing |
| `tickets/all` | a given name of type `[]tickets.Ticket`, which the index commits in the same commit as the `files/` rows it reads |

`src/index/ticket.go` keeps the SQL read of the note rows and calls `tickets.Of` and `tickets.All`, so the index's old `tickets` verb and the window answer the one reading. Its own parse, `askLine`, `heldIn` and `topOf` go.

The golden file `src/tickets/testdata/tree.golden.json` holds a row for every ticket under `spec/tickets` at the commit that writes it. A row carries the name, the hash of its text, its Ask and its standing. The test compares each row whose file still carries that hash, and logs a ticket whose text moves on. So a mint or a take leaves `go test ./...` green. `go test ./src/tickets -update` writes the file again, and the owner reads the difference at the merge.

The JavaScript readers stay, and the shadow child [[spec/tickets/open-tasks-run-in-shadow]] compares them against this reading at runtime.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/index/door.go`, the `tickets` case of the verb switch, through `Tickets`
- `src/index/topic.go`, `publishes`, which commits `tickets/all` beside the `files/` rows
- `src/index/ticket_test.go`, every test of the parse there, which moves to `src/tickets`
- `src/tui/work/workitems.go`, `itemsOfTickets`, which reads the rows the index answers

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `src/tickets/tickets_test.go`, `TestAskDropsComments`, a comment over one row and over several
- `src/tickets/tickets_test.go`, `TestAskReadsFencesAsText`, a `#` inside a fence
- `src/tickets/tickets_test.go`, `TestHeldReadsTheLastOpenItem`, the cases `heldIn` holds in `src/index/ticket_test.go` today
- `src/tickets/tickets_test.go`, `TestChildReadsItsGroup`
- `src/tickets/golden_test.go`, `TestTreeGolden`, which decides the golden line of the ask
- `src/index/topic_test.go`, `TestPublishesTickets`, where a ticket row lands under `tickets/all` in the files commit

The done lines and the test deciding each:

- `go test ./...` passes: `./RUNME.sh test src/tickets src/index`
- the golden file: `TestTreeGolden`
- the check: `./RUNME.sh check`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file the approach names stands opened: `src/index/ticket.go`, `src/index/topic.go`, `src/index/door.go`, `src/yaml/yaml.go`, `src/engine/group.js`, `src/scripts/pull-chapter.js` and `schema-read.js`
- the callers list comes off a search for every Go function `src/index/ticket.go` exports or tests
- each done line names its test: `TestTreeGolden` for the golden file, the test verb for `go test`, and the check verb

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings

- tickets-register-in-the-catalog: `tickets/all` registers in `q.Main`, yet `door_test.go` hands `Serve` a `q.New()` catalog, and `Store.Commit` refuses a name its catalog holds no provider of, so the files commit fails. Register it beside `registersFiles`, in the catalog `Serve` takes.
- the-golden-keys-group-hash: a golden row keys on the ticket's own hash, yet a child's standing reads its group. A take moves the group's record and flips the child's standing while the child's hash stands, so `TestTreeGolden` goes red. Key a child's row on its group's hash too.
- ask-reading-names-its-differences: the `Ask` row claims the reading of `pull-chapter.js`, yet `readNote` in `schema-read.js` drops every fenced row and `COMMENT` in `pull-route.js` drops a one-row comment alone. Name each difference, so the shadow compare expects it.
- private-tickets-reach-tickets-all: `contentsOf` reads tracked rows alone, so a `tickets/all` built beside the `files/` rows drops the `.se/tickets` notes the `tickets` verb answers. Build it off the note read `Tickets` runs.
- the-window-held-override-goes: `Placed` in `src/tui/work/workplaces.go` reads held off the queue place whatever the index answers, a held reading the approach leaves standing against the ask's one held rule.
- go-test-names-the-root: the done line reads `go test ./...` from the root, and its test runs two folders. Name `go test ./...` itself.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

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

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
