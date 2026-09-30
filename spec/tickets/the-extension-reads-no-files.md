---
kind: [[ticket]]
state: open
step: gate
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
group: sidebar-switches-over
depends_on: [config-answers-keys-and-overrides, the-sidebar-reads-v1, the-sidebar-writes-through-actions, the-lens-calls-actions, the-lens-reads-v1]
record:
  - step: design/draft
    hand: box d88dc33717d8 · claude-code-remote
    hash_before: 7785112c7df1266da35ec5571878aebaf8603688
    hash_after: 4b7a5477937f4ca9eda80e0d809d9ce60d8a9481
    inputs:
      - name: ask
        hash: 8ec0fc4f549a34ae
        size: 416
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d8901b0331d5 · claude-code-remote
    hash_before: c8a2ba5b0c5c20c810fd739d70e4f29a45243a7b
    hash_after: 21833859d946b721c7dbec2719b7e5f45d03288f
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 7365711ecc8738d9
        size: 4323
      - name: [[spec/tickets/config-answers-keys-and-overrides]]
        hash: 024425bb053a8083
        size: 20286
      - name: [[spec/tickets/the-sidebar-reads-v1]]
        hash: 9feaf3494c9e4c93
        size: 23517
      - name: [[spec/tickets/the-sidebar-writes-through-actions]]
        hash: d569e1d8c0e26cf0
        size: 22109
      - name: [[spec/tickets/the-lens-calls-actions]]
        hash: bb26ad094b752a9d
        size: 21775
      - name: [[spec/tickets/the-lens-reads-v1]]
        hash: b20a6afe64383a9d
        size: 24078
      - name: [[spec/tickets/go-cage-switches-over]]
        hash: 3a226fd3193528d2
        size: 6086
      - name: [[spec/tickets/lsp-door-switches-over]]
        hash: 67bd0f62c86a8558
        size: 6048
    def: 08e16d07b0de477c
---

# Ask

`migration/config/slices/sidebar` moves to `new`. The extension spawns no verb and reads no file itself. A new window sets its values as overrides, and wipes the local file no more.

The extension then shows what the index holds, and computes nothing.

- `git grep -n 'spawn(' src/extension` names no verb spawn
- a case opens a new window over a local file, and reads the file unchanged
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

The ask splits into six pieces, each small enough to read whole, and this ticket takes the last one. The five before it are children of this group, open, and this ticket waits on them under `depends_on`.

- [[spec/tickets/config-answers-keys-and-overrides]]: the config module answers `config/keys`, and takes `config/set`, `config/override` and `config/opened` over `/v1/actions`. No route posts to `config/held` today, so every other piece waits on this one.
- [[spec/tickets/the-sidebar-reads-v1]]: `sidebar.js` and `extension.js` read the config, the slice, the bless value, the badge and the parsed bases off `/v1`. The index door gains a `/v1/watch` client, and the file watches leave.
- [[spec/tickets/the-sidebar-writes-through-actions]]: every sidebar write posts an action. A new window posts `config/opened` and leaves the local file whole, which answers the second done_when line.
- [[spec/tickets/the-lens-calls-actions]]: the ticket buttons post `ticket/pull`, `ticket/fill` and `ticket/route`. The node spawn in `editor-lens.js` leaves, which answers the first done_when line.
- [[spec/tickets/the-lens-reads-v1]]: the lens, the field marks and the route drawing read the holds, the marks and the graph off `/v1`, and import nothing out of the tree.

This ticket lands once the five close. `migration.sidebar` in `spec/config/level0.json` reads `new`. The compare leaves with the mode that runs it: `src/extension/lib/views-shadow.js`, its test, and `tells`, `told` and `SLICE` in `sidebar.js`. The views section draws the work badge and the pull button, so the grid's copies leave. `work.editor` in `spec/config/draws.json` loses `counts`, and `work.pull` loses its help and icon, which the `work/pull` row carries. `./RUNME.sh project` writes the schema again from both.

Weighed: one ticket over the whole cutover spares five reviews. Its diff would reach the config module, the index door, the sidebar and the lens, which nobody reads whole. The window's switch took the same split.

Assumed, and left outside this group:
- the hook button starts the bridge server through `editor-process.js`. That process, its register read and `serve.log` leave with the bridge server in [[spec/tickets/go-cage-switches-over]]
- the LSP client start in `editor.js` and its binary lookup leave with the LSP's own server in [[spec/tickets/lsp-door-switches-over]]
- the index door keeps one read, `.se/.runtime/index.json`, since it names the port the extension reaches `/v1` on
- the terminal lines `./RUNME.sh tui` and `tui work` stay, since the owner runs the window in that terminal

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- spec/config/level0.json migration.sidebar, which the index and the sidebar read
- src/extension/sidebar.js html, which reads the slice and calls tells over apartOf
- src/extension/sidebar.js counted, which runs the counts line the work.editor entry carries
- src/extension/lib/views-shadow.js apartOf, which leaves
- test/level0/views-shadow.test.js, which reads apartOf
- test/level0/sidebar-views.test.js, whose shadow case reads the rows tells writes
- spec/config/draws.json work.editor and work.pull, which the schema projects
- spec/config/level0.schema.json work.editor and work.pull, which ./RUNME.sh project writes
- src/modules/migration/migration.go SidebarKey, whose declaration stays with its built-in old

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/sidebar-views.test.js the sidebar under new writes no shadow row: the tracked file reads new, and a pair apart writes nothing
- test/level0/sidebar-views.test.js the grid draws no badge the views section draws: the work group carries no count
- test/level0/extension-reads-no-files.test.js no verb spawn stands in the extension: git grep for spawn( over src/extension names none

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file named stands opened on this branch: sidebar.js, extension.js, editor-process.js, editor-index.js, editor-lens.js, views-shadow.js, draws.json, level0.schema.json, level0.json, migration.go and config.go
- the callers list names every hit git grep finds for apartOf, views-shadow, migration.sidebar and the counts line
- the spawn line meets extension-reads-no-files.test.js and the child the-lens-calls-actions, the new window line meets the child the-sidebar-writes-through-actions, and the check line meets ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/sidebar-views.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/sidebar-views.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both new cases fail on their own assertion, and the six older cases in the file pass.

What surprised me:
- The spawn line needs no new case. `test/contract/extension-spawns-no-verb.test.js` greps `\bspawn\(` over src/extension, and passes today.
- A literal grep for `spawn(` meets `respawn(` in `editor-process.js`, which the draft leaves to go-cage-switches-over.
- The draft's `extension-reads-no-files.test.js` falls away for both reasons.
- The ask names `migration/config/slices/sidebar`, and the sidebar reads `migration/config/sidebar`.
- The build drops the older shadow case, which reads a shadow row under shadow.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the spawn line meets test/contract/extension-spawns-no-verb.test.js, green since the-lens-calls-actions. The new window line meets the case in test/level0/sidebar-writes.test.js. The check line waits on the check
- the index door has its fake in test/level0/v1-index.js, and the grid case seeds it

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
