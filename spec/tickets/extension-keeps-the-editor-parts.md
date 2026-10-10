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
step: design/tests-red
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

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->

<!-- the form is list -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

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
