---
kind: [[ticket]]
state: open
step: design/draft-2
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
      - name: draft-2
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
      - name: tests-red-2
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
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: ba948ebe294b8cf89c015a46bc5192726dd02d8b
    hash_after: ba948ebe294b8cf89c015a46bc5192726dd02d8b
    inputs:
      - name: ask
        hash: 91423e85b718fbc5
        size: 1092
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 5a2557d24d86ab34
        size: 13510
      - name: [[spec/design_output/level0]]
        hash: 22fc99331ec488bc
        size: 87937
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 1a28c1e2ce1b4bc67660ee241c57b41efbf0dd7b
    hash_after: 1a28c1e2ce1b4bc67660ee241c57b41efbf0dd7b
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 339ee683d0a385a5
        size: 2318
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: b0653205decb3411bc2de87b943e57db6942b91e
    hash_after: b0653205decb3411bc2de87b943e57db6942b91e
    returns: 1
    why: The install writes the plugin manifest, which git ignores, and the client scans plugins as a session starts. So the session running the first install holds no level zero, and the draft names no road for it. A probe on a fresh clone decides the order.; The draft says the client reads the trust before any hook runs, and neither a probe nor a note line backs it. Name the probe, and whether an untrusted project runs a project SessionStart hook at all.; The stamp holds the install hash and HEAD, and the cases hold the install hash alone. HEAD in the stamp runs the install again after every commit, against the ask's line on returning at once. Drop HEAD, or add the case holding it.; No case holds a matching stamp with a tool gone, as node_modules, running the install.; The draft picks node because sh stands on no Windows desk, then runs sh from boots. RUNME.ps1 runs RUNME.sh through the sh Git ships, so name that road in boots, or what the hook does on win32.
group: the-cloud-works-its-queue
---

# Ask

A cloud session boots off the repo alone, per [[spec/design_input/the-cloud-runs-itself#the-boot]]. A `SessionStart` hook in `.claude/settings.json` runs `src/scripts/install.sh` under the skip list the setup names today. It returns at once where the tools stand. The setup of [[spec/design_output/level0#the-setup-installs-the-cage]] also writes the trust flag and the auto mode into the box's home. No project file reaches either, so this ticket finds whether a cloud session still needs them. Where it does, those lines stay in the setup.

Without it every new environment needs a setup script a person pastes by hand. A box whose setup drifts from the tree then boots with no cage.

- `.claude/settings.json` carries a `SessionStart` hook running the install
- a case in `test/level0/hooks.test.js` reads the hook there
- a case there finds the hook returning at once on a box where every tool stands
- `spec/design_output/level0.md` names the hook as the road
- that note says which lines of the setup still stand, and why
- `./RUNME.sh check` exits 0

The view: none.

The source: none.

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

A new script src/scripts/boot.js runs as the SessionStart hook, through node, since node stands on a cloud box and on a Windows desk alike, and sh stands on neither Windows desk. Its pure part boots(it) reads a stamp at .se/.runtime/boot.json holding the hash of src/scripts/install.sh and HEAD. Where the stamp matches and the plugin manifest and node_modules stand, it answers at once and runs nothing. Otherwise it runs sh src/scripts/install.sh through the proc door, under SE_INSTALL_SKIP naming the skip list the setup names today, and writes the stamp on a zero exit. It always exits 0, so a failed install holds no session up. .claude/settings.json gains hooks.SessionStart with one command hook: node "$CLAUDE_PROJECT_DIR/src/scripts/boot.js". The skip list stands in boot.js once, and the setup text in spec/design_output/level0.md points at it. The trust flag in ~/.claude.json and the auto mode in ~/.claude/settings.json stay in the setup: the client reads the trust before any hook runs, and it takes defaultMode auto off user settings alone, as the note says under Where the mode stands. The note names the hook as the road for the install, and names those two lines as what the setup still holds.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- .claude/settings.json: hooks.SessionStart calls src/scripts/boot.js
- src/scripts/boot.js: boots calls src/scripts/install.sh through the proc door
- spec/design_output/level0.md: the setup script loses its install line and keeps the trust and the mode

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/hooks.test.js: .claude/settings.json carries a SessionStart hook running src/scripts/boot.js
- test/level0/hooks.test.js: boots runs no install where the stamp matches and every tool stands
- test/level0/hooks.test.js: boots runs the install under the skip list, and writes the stamp, where the stamp is stale

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .claude/settings.json
- src/scripts/boot.js
- test/level0/hooks.test.js
- spec/design_output/level0.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened .claude/settings.json, install.sh and its SE_INSTALL_SKIP loop, and the setup and mode chapters of level0.md, and each claim stands there
- the callers list names the hook, the install call and the setup text
- each done_when line names its case, the two note lines name level0.md, and ./RUNME.sh check decides the last

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/hooks.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/hooks.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Three cases fail on their own assertion against a stub boot that runs nothing, and the settings file carries no SessionStart hook yet. The case where the stamp matches passes on the stub, as a negative case does. The fake proc throws on a command nobody taught it, so each case teaches the install line and nothing else, and a stray run fails loud.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line on the hook meets a case, the note lines meet the review, and ./RUNME.sh check decides the last
- the boot cases reach the disk and the process through fakeDisk and fakeProc alone, and the settings case reads the tracked file the ask names

## draft-2

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

### size

<!-- every file the approach touches, one a line -->

<!-- the form is list -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## tests-red-2

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

reject
- The install writes the plugin manifest, which git ignores, and the client scans plugins as a session starts. So the session running the first install holds no level zero, and the draft names no road for it. A probe on a fresh clone decides the order.
- The draft says the client reads the trust before any hook runs, and neither a probe nor a note line backs it. Name the probe, and whether an untrusted project runs a project SessionStart hook at all.
- The stamp holds the install hash and HEAD, and the cases hold the install hash alone. HEAD in the stamp runs the install again after every commit, against the ask's line on returning at once. Drop HEAD, or add the case holding it.
- No case holds a matching stamp with a tool gone, as node_modules, running the install.
- The draft picks node because sh stands on no Windows desk, then runs sh from boots. RUNME.ps1 runs RUNME.sh through the sh Git ships, so name that road in boots, or what the hook does on win32.

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
