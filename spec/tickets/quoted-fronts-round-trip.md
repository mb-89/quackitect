---
kind: [[ticket]]
state: open
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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it", "every config key the approach adds names each default file it lands in"]
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
          - name: size
            form: list
            says: every file the approach touches, one a line
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
process_hash: c671f20a6ae2a4a6
group: tickets-keep-their-chapters
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: d131762ab50f91b60cbd4f88170f5f9e0e10451d
    hash_after: d131762ab50f91b60cbd4f88170f5f9e0e10451d
    inputs:
      - name: ask
        hash: 56dc466b70fefe10
        size: 625
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: b107a430d9580e59c6d80806d77a989c9fbbf409
    hash_after: b107a430d9580e59c6d80806d77a989c9fbbf409
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/yaml fails
    inputs:
      - name: design/draft
        hash: f659931c04d059b7
        size: 1258
    def: 08e16d07b0de477c
  - step: gate
    hand: box 1ad094d8843c · claude-code-remote · helper-4
    hash_before: 1b9fba7c02683bafc2b17a58e09199a4205082a8
    hash_after: 1b9fba7c02683bafc2b17a58e09199a4205082a8
    inputs:
      - name: design/draft
        hash: f659931c04d059b7
        size: 1258
      - name: design/tests-red
        hash: 76cf9dbe4344220b
        size: 561
    def: dc4904ab364efa10
---

# Ask

A front value carrying a quote, a backslash or a newline reads back as written, so a read-modify-write keeps it unchanged, because yaml.unquote decodes what front.Quote encodes.

Every rewrite of such a value doubles its backslashes, so a title, an ask line, a record message or a Windows path grows corrupt with each ticket set or edit.

- go test ./src/yaml passes cases decoding double-quoted escapes and single-quoted doubled quotes
- go test ./src/front passes a round-trip case, front.Set then note.Read, over values with quotes, backslashes, colon-space, space-hash and newlines
- ./RUNME.sh check is green

none

none

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

`unquote` in `src/yaml/yaml.go` decodes what `front.Quote` encodes. A value that `QuotedWhole` reads as one double-quoted string decodes the escapes `\\`, `\"`, `\n`, `\r` and `\t`, and keeps any other backslash pair as written. A value `QuotedWhole` reads as one single-quoted string turns each doubled quote into one. A value opening and closing on a quote that `QuotedWhole` refuses keeps today's strip of its two ends, so no reader past the front changes.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/yaml/yaml.go` `scalar`, which `block`, `listAt` and the item reads call
- `src/note/note.go` `Read` through `yaml.ReadLines`
- `src/front/front.go` `Set` through `Quote`, whose output the round trip reads back

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/yaml/yaml_test.go` `TestAQuotedScalarDecodesItsEscapes`
- `src/front/front_test.go` `TestASetValueReadsBackAsWritten`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/yaml/yaml.go`
- `src/yaml/yaml_test.go`
- `src/front/front_test.go`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `unquote`, `scalar`, `QuotedWhole`, `flowItems`, `front.Quote`, `front.Set` and `note.Read` stand opened, and each claim checked there
- the callers list names `scalar`, the note read and the front write
- each done_when line names its case under tests
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/yaml src/front

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/yaml/yaml_test.go
- src/front/front_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The scalar read strips the quotes and keeps every escape, so a backslash doubles and an escaped quote keeps its backslash. A single-quoted doubled quote reads as two. A value that `Quote` leaves plain round-trips today, so the front case carries values that force quotes.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets its failing case in the two test files
- the tests reach no door, since the yaml read and the front writer run over text alone

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- one-quote-decoder-for-fronts: src/front/mint.go unescaped already decodes the four escapes Quote writes; the new decode in yaml.unquote restates that fact, and adds \t, which unescaped refuses. Keep one decoder (yaml exports it, mint calls it) and add src/front/mint.go to size.
- flow-items-skip-escaped-quotes: scalar runs unquote over each flow item, but flowItems ends a quote at a backslash-escaped quote, so an item holding \" followed by a comma splits apart. QuotedWhole skips escapes and flowItems should too, with a yaml_test case.
- yaml-readers-past-the-front: the callers list names only scalar, note.Read and front.Set, but every yaml.Read and ReadLines caller (tickets.go, sync.go, check/schema.go, drawn.go, guidance.go and the others) now gets decoded values. The one quoted backslash value in spec today is the why of a record in spec/tickets/a-check-finds-every-writer.md, which now reads correctly. Name these callers. scalar is called from mapAt and listAt, not from block.

# implement

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
