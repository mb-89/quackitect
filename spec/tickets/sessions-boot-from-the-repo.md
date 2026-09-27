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
  - step: design/draft-2
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: ffc8f1d096ef70bf5994b7be009b24d017cda837
    hash_after: 35ef1406a4a252f1704d96777cc4f1ec296d25c7
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
    def: 2fcb4abe3d77d8a2
  - step: design/tests-red-2
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: 2cbf1fed704e447b09efb481309f4dff26d597d9
    hash_after: 2cbf1fed704e447b09efb481309f4dff26d597d9
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 339ee683d0a385a5
        size: 2318
    def: 897ac034247c0bca
  - step: design/draft
    hand: the engine
    stale: [[spec/design_input/the-cloud-runs-itself]]
  - step: design/draft-2
    hand: the engine
    stale: [[spec/design_input/the-cloud-runs-itself]]
  - step: design/draft
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: 3c10717a5e0479c3f16671a73c1322d9b22739ce
    hash_after: 3c10717a5e0479c3f16671a73c1322d9b22739ce
    inputs:
      - name: ask
        hash: 91423e85b718fbc5
        size: 1092
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 591680bf2c6fc6d6
        size: 13376
      - name: [[spec/design_output/level0]]
        hash: 22fc99331ec488bc
        size: 87937
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: 34397260a34420ecf5eafd1817e7f7a8814787d0
    hash_after: 34397260a34420ecf5eafd1817e7f7a8814787d0
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 0dbbf5047a23c593
        size: 3078
    def: 08e16d07b0de477c
  - step: design/draft-2
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: e4bc60a0613a0db4e4610eda1aeb09c352be5420
    hash_after: e4bc60a0613a0db4e4610eda1aeb09c352be5420
    inputs:
      - name: ask
        hash: 91423e85b718fbc5
        size: 1092
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 591680bf2c6fc6d6
        size: 13376
      - name: [[spec/design_output/level0]]
        hash: 22fc99331ec488bc
        size: 87937
    def: 2fcb4abe3d77d8a2
  - step: design/tests-red-2
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: d8d01a46a05fdb7fb8d8f2b9f1ce45a9e51cf016
    hash_after: d8d01a46a05fdb7fb8d8f2b9f1ce45a9e51cf016
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 0dbbf5047a23c593
        size: 3078
    def: 897ac034247c0bca
  - step: design/draft
    hand: the engine
    stale: [[spec/design_output/level0]]
  - step: design/draft-2
    hand: the engine
    stale: [[spec/design_output/level0]]
  - step: design/draft
    hand: box d7e3869061cf · claude-code-remote
    hash_before: 460a6ec360c4e4e892b528f8e86ce08bcc6c1174
    hash_after: 460a6ec360c4e4e892b528f8e86ce08bcc6c1174
    inputs:
      - name: ask
        hash: 91423e85b718fbc5
        size: 1092
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 591680bf2c6fc6d6
        size: 13376
      - name: [[spec/design_output/level0]]
        hash: 6f01f3b4488cf7dc
        size: 88120
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e3869061cf · claude-code-remote
    hash_before: 99b67ed685fd54c5ced80260e9f8dcf62364f05c
    hash_after: 99b67ed685fd54c5ced80260e9f8dcf62364f05c
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 805f822e49c509fa
        size: 3263
    def: 08e16d07b0de477c
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

The level zero plugin loads off a manifest git ignores, and its bridgehead installs what a cloud box lacks once it loads. So the boot hook holds one job: it brings the manifest and the modules for the next session on a box where either stands nowhere.
The approach takes this as unmeasured: the client reads the plugins before any SessionStart hook runs, because a plugin registers SessionStart hooks of its own. So the session running the first install holds no level zero, and the setup keeps its install line, its trust flag and its auto mode. The note says so, and names the probe that retires the install line.
`src/scripts/boot.js` runs as the hook, through node. Its pure part `boots(it)` runs nothing off a cloud box, under the guard the bridgehead reads: `CLAUDE_CODE_REMOTE` or `SE_CLOUD`. Where the manifest and `node_modules` both stand, it runs nothing. Otherwise it runs `sh src/scripts/install.sh` through the proc door, under `SE_INSTALL_SKIP` set to `INSTALL_SKIP` from the hooks module. It answers 0 always, so a failed install holds no session up. The stub `stampOf` in `boot.js` goes, because no stamp stands and nothing calls it.
`.claude/settings.json` gains `hooks.SessionStart` with one command hook running node over `boot.js`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

`.claude/settings.json`: `hooks.SessionStart` runs `src/scripts/boot.js`,`src/scripts/boot.js`: `boots` runs `src/scripts/install.sh` through the proc door,`src/scripts/boot.js`: `boots` reads `INSTALL_SKIP` from `.claude/skills/level0/hooks/level0.js`,`src/scripts/boot.js`: `stampOf` goes, and a search finds no caller of it,`spec/design_output/level0.md`: the setup chapter names the hook, and says why every setup line stays

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

`test/level0/hooks.test.js`: the project settings carry a SessionStart hook running `src/scripts/boot.js`,`test/level0/hooks.test.js`: boot runs no install where the manifest and the modules stand,`test/level0/hooks.test.js`: boot runs the install under the skip list where the manifest stands nowhere,`test/level0/hooks.test.js`: boot runs the install where the modules stand nowhere,`test/level0/hooks.test.js`: boot runs nothing off a cloud box,`test/level0/hooks.test.js`: boot answers 0 where the install fails

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

the first session: the setup keeps its install line, and the note names the probe that retires it,the trust claim: the approach drops it, and the setup keeps the trust flag and the mode,the stamp and HEAD: no stamp stands, the manifest and the modules decide, and the stub `stampOf` goes,a tool gone under a matching stamp: a case holds the modules gone,the Windows road: boot runs off a cloud box nowhere, so a desk keeps `RUNME`,the restale off main: the level zero note gains the branch sync free-verb line alone, which the boot leaves untouched

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

`.claude/settings.json`,`src/scripts/boot.js`,`test/level0/hooks.test.js`,`spec/design_output/level0.md`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened the bridgehead guard at `level0.js`, `INSTALL_SKIP`, the manifest lines in `.gitignore`, `boot.js` and its cases, and every `stampOf` caller
the callers list names the hook, the install call, the skip list, the stub going and the setup text
each `done_when` line meets a case or the note, and the check decides the last

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/hooks.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

test/level0/hooks.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Four cases fail on their own assertion against the stub boot, and the settings file carries no SessionStart hook yet. The case where everything stands and the case off a cloud box pass on the stub, as negative cases do. The run after the merge of main reads the same four.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line on the hook meets a case, the note lines meet the review, and ./RUNME.sh check decides the last
the boot cases reach the disk and the process through fakeDisk and fakeProc alone

## draft-2

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The level zero plugin loads off a manifest git ignores, and its bridgehead installs what a cloud box lacks once it loads. So the boot hook holds one job: it brings the manifest and the modules for the next session on a box where either stands nowhere.
The approach takes this as unmeasured: the client reads the plugins before any SessionStart hook runs, because a plugin registers SessionStart hooks of its own. So the session running the first install holds no level zero, and the setup keeps its install line, its trust flag and its auto mode. The note says so, and names the probe that retires the install line.
`src/scripts/boot.js` runs as the hook, through node. Its pure part `boots(it)` runs nothing off a cloud box, under the guard the bridgehead reads: `CLAUDE_CODE_REMOTE` or `SE_CLOUD`. Where the manifest and `node_modules` both stand, it runs nothing. Otherwise it runs `sh src/scripts/install.sh` through the proc door, under `SE_INSTALL_SKIP` set to `INSTALL_SKIP` from the hooks module. It answers 0 always, so a failed install holds no session up.
`.claude/settings.json` gains `hooks.SessionStart` with one command hook running node over `boot.js`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `.claude/settings.json`: `hooks.SessionStart` runs `src/scripts/boot.js`
- `src/scripts/boot.js`: `boots` runs `src/scripts/install.sh` through the proc door
- `src/scripts/boot.js`: `boots` reads `INSTALL_SKIP` from `.claude/skills/level0/hooks/level0.js`
- `spec/design_output/level0.md`: the setup chapter names the hook, and says why every setup line stays

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `test/level0/hooks.test.js`: the project settings carry a SessionStart hook running `src/scripts/boot.js`
- `test/level0/hooks.test.js`: boot runs no install where the manifest and the modules stand
- `test/level0/hooks.test.js`: boot runs the install under the skip list where the manifest stands nowhere
- `test/level0/hooks.test.js`: boot runs the install where the modules stand nowhere
- `test/level0/hooks.test.js`: boot runs nothing off a cloud box
- `test/level0/hooks.test.js`: boot answers 0 where the install fails

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- the first session: the setup keeps its install line, and the note names the probe that retires it
- the trust claim: the approach drops it, and the setup keeps the trust flag and the mode
- the stamp and HEAD: no stamp stands, and the manifest and the modules decide
- a tool gone under a matching stamp: a case holds the modules gone
- the Windows road: boot runs off a cloud box nowhere, so a desk keeps `RUNME`
- the restale: the design input drops its funnel line alone, and the boot section stands as draft-2 reads it

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `.claude/settings.json`
- `src/scripts/boot.js`
- `test/level0/hooks.test.js`
- `spec/design_output/level0.md`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened the bridgehead `START` and `starts`, `INSTALL_SKIP`, the manifest line in `.gitignore`, and the setup and mode chapters
- the callers list names the hook, the install call, the skip list and the setup text
- each `done_when` line meets a case or the note, and the check decides the last

## tests-red-2

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

Four cases fail on their own assertion against the stub boot, and the settings file carries no SessionStart hook yet. The case where everything stands and the case off a cloud box pass on the stub, as negative cases do. The run after the restale reads the same four.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line on the hook meets a case, the note lines meet the review, and ./RUNME.sh check decides the last
- the boot cases reach the disk and the process through fakeDisk and fakeProc alone

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
