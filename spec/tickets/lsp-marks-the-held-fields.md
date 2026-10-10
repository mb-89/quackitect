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
group: lsp-takes-the-lenses
step: view
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box c729ff43c0cb · claude-code-remote
    hash_before: 288bd7f98dadc7406e3e76cd68072869a4b8de05
    hash_after: 288bd7f98dadc7406e3e76cd68072869a4b8de05
    inputs:
      - name: ask
        hash: ffba78493145a405
        size: 933
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box c729ff43c0cb · claude-code-remote
    hash_before: 7cb3e174668d04b90ebf1bcae31fb6f7bf7c4592
    hash_after: 7cb3e174668d04b90ebf1bcae31fb6f7bf7c4592
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/lsp fails
    inputs:
      - name: design/draft
        hash: db15050ce46efa69
        size: 2286
      - name: [[spec/design_output/lsp]]
        hash: e153b67981b2f041
        size: 24421
    def: 08e16d07b0de477c
  - step: gate
    hand: box c729ff43c0cb · claude-code-remote · helper-4
    hash_before: a47be9d5bb6f9d9db64af39e712b71716e7478cb
    hash_after: a47be9d5bb6f9d9db64af39e712b71716e7478cb
    inputs:
      - name: design/draft
        hash: db15050ce46efa69
        size: 2286
      - name: design/tests-red
        hash: c039c52697b89698
        size: 735
      - name: [[spec/design_output/lsp]]
        hash: e153b67981b2f041
        size: 24421
    def: dc4904ab364efa10
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/lsp]]
  - step: gate
    hand: the engine
    stale: [[spec/design_output/lsp]]
  - step: design/tests-red
    skipped: true
    kept: a47be9d5bb6f9d9db64af39e712b71716e7478cb
    why: its red tests stand as a47be9d5b landed them, and a later leaf passed since
  - step: gate
    hand: box c729ff43c0cb · claude-code-remote · helper-8
    hash_before: f2d22f4856c012450ed8754b41e7f48b19a73b6f
    hash_after: f2d22f4856c012450ed8754b41e7f48b19a73b6f
    inputs:
      - name: design/draft
        hash: db15050ce46efa69
        size: 2286
      - name: design/tests-red
        hash: c039c52697b89698
        size: 735
      - name: [[spec/design_output/lsp]]
        hash: c6a62e22f17c2c6a
        size: 24410
    def: dc4904ab364efa10
  - step: implement/change
    hand: box c729ff43c0cb · claude-code-remote
    hash_before: 0892a5bcadc2a48f0989cb4bee0ff99f2cf344be
    hash_after: 537717a621134f197cb157aa5526f9aabd409f0f
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box c729ff43c0cb · claude-code-remote
    hash_before: 9629341727a33b9bb3cf555cc3f37889f0725d43
    hash_after: 9629341727a33b9bb3cf555cc3f37889f0725d43
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/lsp passes
      - name: check
        exit: 0
        said: "   75.1  in all"
    inputs:
      - name: design/tests-red
        hash: c039c52697b89698
        size: 735
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: every LSP editor marks the fields a person's hold still wants. `se-index lsp` publishes each mark as a hint diagnostic, and answers its hover. A new take moves the cursor to the first mark through `window/showDocument`.

<!-- breaks, as text: what breaks if it is never done -->
breaks: the marks stand in VS Code alone. `src/extension/lib/fields.js` keeps a second reader of `tickets/drawn` and the holds.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- a Go case in `src/modules/lsp` publishes a hint at each unfilled field of the leaf a person holds
- a Go case publishes no field hint on a ticket the person holds no step of
- a Go case meets the hover text `hoverOf` writes today on a marked line
- a Go case meets the term hover on an unmarked line
- a Go case meets `window/showDocument` at the first mark once a commit adds a person's hold
- a Go case meets no `window/showDocument` for a hold standing at the start
- `./RUNME.sh check` exits 0

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
view: none, since a VS Code user sees the same marks

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
from: none

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

The server marks the fields a person's hold still wants, answers their hover, and moves the cursor on a new take. The rules of `src/extension/lib/fields.js` move into Go unchanged. For the shape, see [[spec/design_output/lsp#a-take-marks-the-fields]].

- `src/modules/lsp/marks.go` ports `marksIn` and `hoverOf` as pure functions over the drawing and the hold.
- The `Tickets` port gains `Drawn`, the drawing of a path off `tickets/drawn/<path>`.
- `drawn` in `lsp.go` adds the marks to the rows it publishes, as hints with the code `HeldField`.
- The hover answers the mark's text on a marked line, and the term hover elsewhere.
- `initialize` learns the person's holds, and a commit naming `holds/standing` answers `window/showDocument` for each new take with a mark.
- `lspTickets` in `src/quack/lsp.go` fills `Drawn` off the store.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/modules/lsp/lsp.go` `Handle`, at `initialize` and `hover`
- `src/modules/lsp/lsp.go` `drawn`, which every publish calls
- `src/modules/lsp/lsp.go` `Listen`, whose commit hook sends the cursor moves
- `src/modules/lsp/lenses.go` `Tickets`, which gains `Drawn`
- `src/modules/lsp/lenses_test.go` `heard.tickets`, the fake filling the port
- `src/quack/lsp.go` `lspTickets`, which fills the port

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/modules/lsp/marks_test.go` `TestAHeldLeafMarksItsUnfilledFields`
- `src/modules/lsp/marks_test.go` `TestATicketHeldByNoPersonCarriesNoMark`
- `src/modules/lsp/marks_test.go` `TestAMarkedLineHoversWhatTheFieldAsks`
- `src/modules/lsp/marks_test.go` `TestAnUnmarkedLineHoversTheTerm`
- `src/modules/lsp/marks_test.go` `TestANewTakeShowsTheFirstMark`
- `src/modules/lsp/marks_test.go` `TestAHoldStandingAtTheStartShowsNothing`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/modules/lsp/marks.go`
- `src/modules/lsp/marks_test.go`
- `src/modules/lsp/lsp.go`
- `src/modules/lsp/lenses.go`
- `src/modules/lsp/lenses_test.go`
- `src/quack/lsp.go`
- `spec/design_output/lsp.md`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file the approach names stands opened, and `fields.js`, `drawn.go` and the publish path checked there
- the callers list names every caller of the port, the publish and the hover
- every done_when line meets a case in `marks_test.go`, and the check line meets `./RUNME.sh check`
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/lsp/marks_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- `src/modules/lsp/marks_test.go`

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The mark, the marked hover and the new take fail on their own assertions against the stubs in `marks.go`.

- The term hover, the ticket with no person's hold and the hold standing at the start pass already. They guard what the change keeps, so a change that marks every ticket or shows every hold turns them red.
- The port's `Drawn` and the fake's answer stand in this run, since the cases compile against them.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a case in `marks_test.go`, and the check line meets `./RUNME.sh check`
- the cases reach the drawing and the holds through the fake port in `lenses_test.go`

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- the approach ports marksIn and hoverOf into Go, and both closed points stand answered.
- each done_when line meets a case in src/modules/lsp/marks_test.go, and the check line meets ./RUNME.sh check.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/modules/lsp/marks.go src/modules/lsp/lsp.go src/quack/lsp.go src/quack/lsp_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches marks.go, lsp.go and quack/lsp.go from the size, and quack/lsp_test.go for the case the commit door asks beside the wiring
- the drawing and the holds reach the server through the ticket port, and the fake in lenses_test.go answers both
- the header of marks.go points at the design section `a-take-marks-the-fields`
- the drawing name copies `DrawnPort`, and a quack case holds the copy to it

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/lsp/marks_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`se-index lsp` now marks the fields a person's hold still wants, in every LSP editor. The rules of `src/extension/lib/fields.js` move into `src/modules/lsp/marks.go`.

- Each unfilled field of the held leaf publishes as a hint with the code `HeldField`.
- A hover on a marked line answers the field's ask, and any other line keeps the term hover.
- A commit adding a person's hold sends `window/showDocument` at the first mark of the new take.
- The holds standing at `initialize` move no cursor.
- The client side and the removal of the JS land with extension-keeps-the-editor-parts.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the size names, and the quack case the commit door asks for
- the drawing and the holds reach the server through the ticket port, which the fake answers
- the header of marks.go points at the design section
- the drawing name stands once, as `DrawnPort`, and a case holds the copy in quack to it

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
