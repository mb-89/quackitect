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
depends_on: ["lsp-draws-the-ticket-lenses", "lsp-marks-the-held-fields"]
step: view
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box c729ff43c0cb · claude-code-remote
    hash_before: 5b6f46d49c18911b7181fb6531f8ad3029c1112e
    hash_after: 5b6f46d49c18911b7181fb6531f8ad3029c1112e
    inputs:
      - name: ask
        hash: 04f8ac725844fe5e
        size: 1012
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box c729ff43c0cb · claude-code-remote
    hash_before: 1bc980aecfa44e95fc1cf404284aeac884e9a2d9
    hash_after: 1bc980aecfa44e95fc1cf404284aeac884e9a2d9
    answered:
      - name: tests
        exit: 1
        said: assertion, 7 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 012f4c47a0167a16
        size: 3909
      - name: [[spec/design_output/lsp]]
        hash: c6a62e22f17c2c6a
        size: 24410
    def: 08e16d07b0de477c
  - step: gate
    hand: box c729ff43c0cb · claude-code-remote · helper-4
    hash_before: 59af2d7838f005ea850c9c4fade8b40fa1e80ee9
    hash_after: 59af2d7838f005ea850c9c4fade8b40fa1e80ee9
    inputs:
      - name: design/draft
        hash: 012f4c47a0167a16
        size: 3909
      - name: design/tests-red
        hash: f52be5635d5f5eac
        size: 992
      - name: [[spec/design_output/lsp]]
        hash: c6a62e22f17c2c6a
        size: 24410
    def: dc4904ab364efa10
  - step: implement/change
    hand: box c729ff43c0cb · claude-code-remote
    hash_before: f73906688ea60c74a0cc32fc15a3cbaa80a70a40
    hash_after: 909511bd432440e00cd0773c01465b9830d6bf90
    answered:
      - name: lint
        exit: 0
        said: "src/quack/voice_verb.go:27:1 ExampleCovers: ./RUNME.sh voice stands in no example's interface. Write an example under sp"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box c729ff43c0cb · claude-code-remote
    hash_before: e262f76c48abf1bbdb0f282c5e2f58a7ef24fc3b
    hash_after: e262f76c48abf1bbdb0f282c5e2f58a7ef24fc3b
    answered:
      - name: tests
        exit: 0
        said: green, 34 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: "   76.5  in all"
    inputs:
      - name: design/tests-red
        hash: f52be5635d5f5eac
        size: 992
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: the extension starts the language client, and keeps the parts LSP holds no word for. Those are the route inset, the sidebar, the status bar and the client's middleware. The JavaScript the server now covers leaves, with its tests.

<!-- breaks, as text: what breaks if it is never done -->
breaks: two copies of the lens and the marks stand. The editor draws each button twice, and the two copies drift.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `git grep -n 'registerCodeLensProvider' src/extension` names the route flip's lens alone
- `src/extension/lib/fields.js` and `src/extension/editor-fields.js` stand deleted
- a case in `test/level0` meets the middleware asking the reason before a fail reaches the server
- a case in `test/level0` meets the middleware saving the ticket before a hand-back
- a case in `test/level0` meets a field hint drawn as the underline, with no Problems row
- the sidebar's take runs through the server's `quackitect.ticket` command, and its case passes
- `./RUNME.sh check` exits 0

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
view: none, since a VS Code user sees the same buttons and marks

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

The extension starts the language client and keeps the parts LSP holds no word for. The server draws the buttons and the marks, so their JavaScript leaves. For the server's side, see [[spec/design_output/lsp#a-ticket-carries-its-buttons]] and [[spec/design_output/lsp#a-take-marks-the-fields]].

- `lib/lsp.js` gains `middlewareOf(door)`, pure over the door, which `clientOf` hands the client.
- Its `executeCommand` asks the reason of a fail with no fourth argument, and an empty reason sends nothing.
- It saves the ticket before a pass, a fail or a back reaches the server.
- Its `handleDiagnostics` draws each `HeldField` hint through `door.marksFields` as the underline, and hands the other rows on.
- The client registers `quackitect.ticket` off the server's capability, so `extension.js` registers no command of that name.
- The sidebar's take and the route host's take and hand-back run `door.runs(COMMAND, ...)`, the editor's executeCommand.
- The lens provider in `editor-lens.js` draws the route flip alone, and the save hook leaves, since the server fills on didSave.
- `marksFields` moves from `editor-fields.js` into `editor-lens.js`, and its hover leaves, since the server answers it.
- `lib/fields.js` and `editor-fields.js` go, and `drawnAt` moves into `route-host.js`.
- `lib/lens.js` keeps what the route host and the sidebar read, and drops `lensesOf`, `argvOf`, `fillArgvOf` and `ticketLensOf`.
- `spec/design_output/extension.md` points its two sections at the lsp note.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/extension/extension.js` `activate`, which drops the ticket lens, the fields and the save hook
- `src/extension/editor.js` `editorDoor`, `startsServer`, which hands the middleware, and the door's `runs`
- `src/extension/editor-lens.js` `lensDoor`, which gains `marksFields` and loses `onSave`, `tells` and `picks` stay
- `src/extension/lib/lsp.js` `clientOf`
- `src/extension/lib/route-host.js` `routeHostOf`, `took` and `handsBack`
- `src/extension/sidebar.js` `pullsNext`
- `src/extension/lib/lens.js`, whose exports shrink
- `test/level0/lens.test.js`, `test/level0/route-host.test.js`, `test/level0/sidebar.test.js`, `test/level0/extension-load.test.js`, `test/level0/fields-to-fill.test.js`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `test/level0/lsp.test.js` `the middleware asks the reason before a fail reaches the server, and an empty reason sends nothing`
- `test/level0/lsp.test.js` `the middleware saves the ticket before a hand-back, and a take saves nothing`
- `test/level0/lsp.test.js` `a field hint draws as the underline, and leaves the Problems rows`
- `test/level0/sidebar.test.js` `pull for me runs the server's ticket command, and opens the ticket`
- `test/level0/route-host.test.js` `the page's take and hand-back run the server's ticket command`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- `the-client-drops-fields-js`: this ticket deletes `fields.js` and `editor-fields.js`, and the middleware draws the `HeldField` hint

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/extension/extension.js`
- `src/extension/editor.js`
- `src/extension/editor-lens.js`
- `src/extension/editor-fields.js`, deleted
- `src/extension/lib/fields.js`, deleted
- `src/extension/lib/lens.js`
- `src/extension/lib/lsp.js`
- `src/extension/lib/route-host.js`
- `src/extension/sidebar.js`
- `test/level0/lsp.test.js`
- `test/level0/lens.test.js`
- `test/level0/route-host.test.js`
- `test/level0/sidebar.test.js`
- `test/level0/extension-load.test.js`
- `test/level0/fields-to-fill.test.js`, deleted
- `spec/design_output/extension.md`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file the approach names stands opened, and `extension.js`, `editor.js`, `editor-lens.js`, `lsp.js`, `route-host.js` and `sidebar.js` checked there
- the callers list names every user of `lens.js`, `fields.js` and the two editor doors, off a grep of src and test
- every done_when line meets a case above, the grep over `registerCodeLensProvider`, the deletion, or the check
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/lsp.test.js test/level0/route-host.test.js test/level0/sidebar.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- `test/level0/lsp.test.js`
- `test/level0/route-host.test.js`
- `test/level0/sidebar.test.js`

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Seven cases fail on their own assertion, and every standing case passes.

- The three middleware cases fail against the pass-through stub in `lib/lsp.js`.
- The take, the hand-back and pull for me fail, since the host and the sidebar still post the pull.
- The start case fails, since the start still registers the ticket command and the save hook.
- The fake doors gain `executes`, the editor's executeCommand, which records the command and its arguments.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the three middleware lines and the sidebar take line meet the cases above, the grep and the deletion meet commands at the change, and the check line meets `./RUNME.sh check`
- the cases reach the editor through the fake doors alone, and `executes` stands in each fake door they read

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- The approach answers the ask, and a red case or a command decides every done_when line: the three middleware cases in lsp.test.js, the take in sidebar.test.js, the grep, the deletion and the check.
- The builder fixes in place: the approach names `door.runs` for the editor's executeCommand, but `runs(line)` already stands in `src/extension/editor-files.js`, and the fakes name it `executes`. Build `executes` in `editor.js`, as the tests read.
- The builder fixes in place: `handleDiagnostics` calls `marksFields` on every publish, an empty one included, so a dropped take clears the underline. The case covers one mark alone.
- The builder fixes in place: `marksFields` takes a uri and lines counted from nought now, where `editor-fields.js` takes a path and lines counted from one.
- The builder fixes in place the callers the list misses: `test/level0/route-fixture.test.js` imports `stepsIn`, which stays, and the pointers in `src/modules/tickets/drawn.go` at `headingLines` in `lib/fields.js`, in `src/modules/holds/holds.go` at `personHolds` and in `src/quack/twins.go` at `HARNESS` in `lib/lens.js` go stale where those names leave.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the draft's size names, plus three Go pointer comments in src/modules/lsp/lenses.go, src/modules/holds/holds.go and src/modules/tickets/drawn.go, which the gate's verdict names as stale callers
- the change reaches the editor through door.executes and door.marksFields, and the fake doors under test/level0 carry both
- lib/lsp.js points middlewareOf at spec/design_output/lsp, the note owning the approach
- spec/design_output/extension.md points its two sections at the lsp note and restates neither

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/lsp.test.js test/level0/route-host.test.js test/level0/sidebar.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The Go language server now draws the ticket buttons and the held-field marks, so the VS Code extension keeps only what LSP holds no word for: the language client, its middleware, the route inset, the sidebar and the status bar. The client's middleware asks the reason before a fail reaches the server, saves the ticket before a hand-back, and draws each HeldField hint as the underline instead of a Problems row. The sidebar and the route host run the server's quackitect.ticket command through door.executes. lib/fields.js, editor-fields.js and the lens draw code leave with their tests, so one copy of the buttons and marks stands, in the server.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the draft's files and three Go pointer comments the gate named
- door.executes and door.marksFields stand in each fake door the tests read
- lib/lsp.js points the middleware at spec/design_output/lsp
- spec/design_output/extension.md points at the lsp note and restates nothing

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
