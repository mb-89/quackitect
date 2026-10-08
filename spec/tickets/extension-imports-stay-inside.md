---
kind: [[ticket]]
state: closed
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
process_hash: 22b42ea1501e8967
group: javascript-leaves
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: 21e2fa1702189c9d4904ed24661a8abc5bba438f
    hash_after: 21e2fa1702189c9d4904ed24661a8abc5bba438f
    inputs:
      - name: ask
        hash: df5766ae1b46f46d
        size: 455
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: ca9021a78c6cdba6a7a665f1ff307d9b4002fd52
    hash_after: ca9021a78c6cdba6a7a665f1ff307d9b4002fd52
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 9d1f32ff4065dbb1
        size: 2867
    def: 08e16d07b0de477c
  - step: gate
    hand: box fb4ccb7cacc7 · claude-code-remote · helper-4
    hash_before: fe01f57a728b2d1ef546ca13d6f4df39a285623b
    hash_after: fe01f57a728b2d1ef546ca13d6f4df39a285623b
    inputs:
      - name: design/draft
        hash: 9d1f32ff4065dbb1
        size: 2867
      - name: design/tests-red
        hash: 9df8337c88a371ff
        size: 656
    def: dc4904ab364efa10
  - step: implement/change
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: 8faf0ae262d2344b2f5df5acbf838ad5e32b4871
    hash_after: 0a2d725eed89fda7ad443faa993c605fc1d923fa
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: 361ec5fd7b1a85f05fb5a7898288e111a05b9103
    hash_after: 361ec5fd7b1a85f05fb5a7898288e111a05b9103
    answered:
      - name: tests
        exit: 0
        said: green, 19 test(s) pass in 3 file(s); green, src/quack passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: design/tests-red
        hash: 9df8337c88a371ff
        size: 656
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

The extension imports nothing outside `src/extension`, so the doors, the bridge vehicle and the level zero log library can leave.

The extension's runtime imports pin the disk, process and clock doors, `src/bridge/vehicle.js` and `lib/log.js` in the tree.

- `git grep -nE "src/doors|src/bridge|src/scripts|skills/level0/lib" -- src/extension` answers nothing
- `./RUNME.sh test test/level0/logbook.test.js` passes
- `./RUNME.sh check` exits 0

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

The extension stops loading files of the tree at runtime, and reaches Go through the index binary alone. (1) editor-process.js: the hook button runs the binary itself through execFile from node:child_process, inside this file, which stands as the extension's process door. A start runs `<method>/.se/.runtime/bin/se-index standing` in the work root, which starts the hooks door detached where none answers and returns, and a non-zero exit reads as the fall. A stop runs `se-index stop` the same way. So procDoor and the import of src/doors/proc.js leave, and the START_WAIT window with them. The watcher follows the hooks door's standing file, which the door writes on each start, in place of serve.log, which no Go writes. (2) settled(): the method root comes off a new word of the Go vehicle verb, `se-index verb . vehicle settle`, run from the extension's home binary with SE_WORK_ROOT set to the work root. The word runs vehicle.Settles, the Go twin of settles in src/bridge/vehicle.js, and prints `method <root>`. So the imports of src/bridge/vehicle.js, src/doors/disk.js and src/doors/clock.js leave. (3) lib/logbook.js: the Go log verb's say already shapes the row (sayLine in src/quack/verb_log.go), so the logbook keeps the level filter alone, over the ladder src/modules/log names, and drops the import of lib/log.js. (4) The comments naming owners outside the folder name the Go owner instead, so the done grep answers nothing.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/extension/editor.js activate, which builds processDoor and hands it to the sidebar's hook button
- src/extension/lib/sidebar.js and lib/work.js, which call startProcess, stopProcess and adoptsProcess through the editor
- src/extension/editor.js, which builds logbookOf and calls say
- src/quack/vehicle_verb.go vehicleTwin, which gains the settle word

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/vehicle_verb_test.go TestVehicleSettleNamesThePointedMethod
- src/quack/vehicle_verb_test.go TestVehicleSettleMakesABareWorkAProject
- test/level0/logbook.test.js a line below the level now posts nothing

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/extension/editor-process.js
- src/extension/lib/logbook.js
- src/extension/editor-index.js
- src/extension/editor-inset.js
- src/extension/lib/lens.js
- src/extension/lib/lsp.js
- src/extension/lib/values.js
- src/extension/lib/widgets.js
- src/extension/lib/work.js
- src/quack/vehicle_verb.go
- src/quack/vehicle_verb_test.go
- test/level0/logbook.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- editor-process.js, logbook.js, src/bridge/vehicle.js settles, src/vehicle/bridge.go Settles, src/quack/vehicle_verb.go, src/quack/serve_verb.go and src/quack/verb_log.go sayLine stand opened, and each claim checked there
- git grep finds no test of processDoor, and editor.js alone builds it and the logbook
- each done_when line names its command: the git grep, the logbook test, and the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/quack/vehicle_settle_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/vehicle_settle_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both settle cases fail on their assertion: the verb takes the word for here and prints the roots. The logbook case passes already, as a guard the change must keep, and the grep in the ask decides the import itself.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the grep and the check are checkpoints the hand runs at tests-green, the settle cases fail red, and the logbook case guards the filter
- the Go cases reach the disk through the vehicle package's own temp method, the pattern this package holds, and the logbook case runs on the fake disk and the fake index

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass with findings
- logbook-test-leaves-level0-lib: test/level0/logbook.test.js imports SESSION from .claude/skills/level0/lib/log.js and fakeDisk from src/doors/fake/disk.js, so the done test itself pins the log library and the doors the ask means to free. The done grep reads src/extension alone and misses it. Give the test its own session path and fake, or name the Go owner, so both files can leave.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/extension

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the files the size field names, plus lsp.test.js, whose watch case pins the install pattern, and work-strings.test.js, which the commit door asks beside work.js
the extension reaches Go through execFile inside editor-process.js, which stands as its process door, and the settle word runs vehicle.Settles over the fakes vehicle_settle_test.go holds
editor-process.js and logbook.js each name spec/tickets/extension-imports-stay-inside beside the approach they implement
each copied name points at its Go owner: serveIndexBin, StandingFile, standingPath, cloudMark, Local, BuiltIn and Ladder, and names folders.js where PrivateFolderOwned asks

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test src/quack/vehicle_settle_test.go test/level0/logbook.test.js test/level0/work-strings.test.js test/level0/lsp.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The VS Code extension no longer loads files of the tree at runtime. The hook button runs the index binary through execFile: se-index standing starts the hooks door where none answers, and se-index stop stops it. The light follows the hooks door standing file in place of serve.log, which no Go writes. The method root comes off a new settle word of the Go vehicle verb, which runs vehicle.Settles and prints the method. The logbook keeps the level filter alone, since the Go log verb shapes the row. Every comment naming an owner outside the folder now names the Go owner, so the doors, src/bridge/vehicle.js and lib/log.js lose the extension as a caller.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the files the size field names, plus the two tests the commit door and the watch case ask for
the extension process door is editor-process.js itself, and the settle word runs over the fakes its Go cases hold
the two changed modules point at spec/tickets/extension-imports-stay-inside
each copied name points at its Go owner

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

- gate, for the builder to fix in place: `src/extension/lib/lsp.js` WATCHES carries the pattern `**/src/scripts/install.sh`, a document selector and no comment, so step (4) of the approach leaves it and the done grep still answers it. Rewrite the pattern so the selector still finds `install.sh`.
- gate, for the builder: the draft's tests field names `src/quack/vehicle_verb_test.go`, and the red cases stand in `src/quack/vehicle_settle_test.go`. The red field rules.
