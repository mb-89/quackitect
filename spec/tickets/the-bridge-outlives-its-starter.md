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
group: the-engine-fixes-its-faults
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: bef1e8f201056af701666e600fe8265cd6fd5ad7
    hash_after: 022588768a02426710268c5a3312ae3ca4f45f5d
    inputs:
      - name: ask
        hash: 9e98d07b09f0f5b3
        size: 839
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d6f05e3a585030 · claude-code
    hash_before: 9da988af58b98b5f049c485dcd5b6bb0e9a32ffb
    hash_after: 9da988af58b98b5f049c485dcd5b6bb0e9a32ffb
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 34100fc0dd71b112
        size: 3626
    def: 08e16d07b0de477c
  - step: gate
    hand: box d6f05e3a585030 · claude-code · helper-4
    hash_before: f23575da65e6ed5a4f8cda5b519c43920a71801c
    hash_after: e76311df0e6d5365717cc12165045fc7982590fd
    inputs:
      - name: design/draft
        hash: 34100fc0dd71b112
        size: 3626
      - name: design/tests-red
        hash: 61870ef475e8bd94
        size: 1345
    def: dc4904ab364efa10
---

# Ask

The bridge on a desk dies with whatever started it. The editor spawns it attached in `src/extension/editor-process.js` and kills it when the window goes. `./RUNME.sh serve` holds it as a foreground child in `serveBridge`, so it dies with the shell. Nothing on a desk starts it again, because the bridgehead starts one on a cloud box alone.

The gain is a bridge that stands until someone stops it, so the doors and the hooks answer on every call.

Without it every editor reload and every closed shell drops the bridge. Every level0 tool then answers nothing until the owner presses the sidebar button again.

- a case starts the server the way the editor does, ends the starter, and `/health` still answers
- `./RUNME.sh serve` returns while the server stands, and a second run finds it standing and leaves it
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

The bridge stands until someone stops it. Both desk starts take the detached road that `respawn` in `src/doors/proc.js` already gives a code-move restart, and nothing kills the server with its starter.

| part | where | what changes |
|---|---|---|
| the editor start | `startProcess` in `src/extension/editor-process.js` | imports the proc door the way `settled` imports the vehicle, and starts the server through `respawn`, with `out` at `SERVE_LOG`. It holds the row as adopted, so `stopProcess` stops it over the wire |
| the kill on close | the same file | the `dispose` pushing `child.kill()`, the `exit` watch and `spawn` leave. `adoptsProcess` in `activate` takes the standing server again after a reload |
| the shell start | `serveBridge` in `src/scripts/cli.js` | without `--inspect`, it calls `servesDetached` and returns. With `--inspect` it runs in the foreground as today, because the debugger holds it |
| the desk road | `servesDetached(it)` in `src/scripts/serve.js`, new | probes the port with `probeOf`. A standing server stays, and the line says so. A silent port takes `it.proc.respawn`, and a fall names what `serve.log` holds |
| the note | `The hook button` in `spec/design_output/extension.md`, and `The cloud starts the server` in `spec/design_output/level0.md` | the server outlives the window, and the shell start returns |

The light follows the server already: `rechecks` runs on each write to `serve.log`, and a detached start writes there.

The editor may run inside a Windows job object, and no case reads one. A checkpoint closes the editor with the server standing, then asks `/health`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/extension/sidebar.js`, the hook button, which calls `startProcess` and `stopProcess`
- `src/extension/extension.js`, `activate`, which calls `adoptsProcess`
- `src/scripts/cli.js`, the `serve` verb, which calls `serveBridge`
- `src/bridge/server.js`, `respawned`, which calls `respawn` and stays as it stands
- `src/scripts/serve.js`, `main`, which calls `servesHere` and stays as it stands

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `test/level0/serve.test.js`, a desk serve starts the server detached where nothing answers, and returns
- `test/level0/serve.test.js`, a desk serve finds a standing server and starts nothing
- `test/level0/serve.test.js`, a detached start that falls names what the server wrote
- `test/contract/desk-start.test.js`, a server the proc door starts detached writes its marker after its starter exits
- a checkpoint: the owner closes the editor with the server standing, and `/health` answers on the next open

The done lines and the case deciding each:

- the start the editor makes: the contract case, because `src/extension/editor-process.js` loads under the editor alone, and the checkpoint
- the serve that returns, and the second run that leaves it: the first two serve cases
- the check: `./RUNME.sh check`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first
- the job object the code read names as plausible: the checkpoint settles it

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/extension/editor-process.js`
- `src/scripts/cli.js`
- `src/scripts/serve.js`
- `test/level0/serve.test.js`
- `test/contract/desk-start.test.js`
- `spec/design_output/extension.md`
- `spec/design_output/level0.md`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `startProcess`, `stopProcess`, `adoptsProcess`, `settled`, `rechecks`, `serveBridge`, `probeOf`, `servesHere`, `respawn` and its fake stand opened, and each reads as the approach says
- the callers come off a search for `startProcess`, `stopProcess`, `serveBridge`, `servesHere` and `.respawn(` over `src`
- each done line names its case, and the editor line names the contract case and the checkpoint

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/serve.test.js test/contract/desk-start.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/serve.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Over a `servesDetached` that answers nothing, the three serve cases fail on their own assertion: the detached start, the standing server left alone, and the fall naming the server line.

The contract case passes today, and it guards the road the change takes. `respawn` in `src/doors/proc.js` starts a stub detached, the starter exits, and the stub writes its marker after. So the editor and the shell take a start that already outlives its starter on this Windows box.

| the case | the class of fault it guards |
|---|---|
| a detached start over a silent port | a shell start that holds the server as its child |
| a standing server left alone | a start that takes over a server already standing |
| a fall naming the server line | a start that fails with no reason |
| a stub outliving its starter | a detached start that dies with the process that makes it |

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done line meets a case: the editor start meets the contract case and the checkpoint, the serve lines meet the first two serve cases, and the check comes at tests-green
- the serve cases reach the proc and disk doors through their fakes, and the contract case reaches the real proc door, as the contract folder does

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- serve-probes-the-register-port: `portIn` in `src/scripts/serve.js` reads the pointer, and a vehicle tree carries none, so the probe asks `PORT_BASE`. A server started with no `--port` listens where `registeredPort` in `src/bridge/vehicle.js` says. Where the register hands this vehicle another port, `./RUNME.sh serve` meets another vehicle's bridge and starts nothing, and `servesHere` shares the read. The probe and the listen take one port.
- box-keys-fold-drive-letters: `boxesOf` in `src/bridge/server.js` keys a box on the raw root, and `answersEvent` hands it the root each event carries, so a `C:` root and a `c:` root build two boxes on one server. On this desk the standing bridge runs from a `C:` root, and the register names a `c:` one. The key folds the way `same` in `.claude/skills/level0/lib/vehicle.js` compares two paths.
| the spot | what the builder does in place |
|---|---|
| the third serve case | teaches the fake the server start as a function that appends the error line to `serve.log` on the fake disk, and `servesDetached` names the part the start wrote, the way `respawned` in `src/bridge/server.js` reads it. The case seeds the line before the start, which pins a read naming an earlier run's error |
| `servesDetached` and the editor start | pass `waitMs` to `respawn`, the way `respawned` passes `RESPAWN_WAIT`, because the default settles at once and a fall goes unseen |
| the editor start | makes `.se/.log` before `respawn` opens `serve.log`, the way `respawned` does, because `openSync` throws where the folder stands nowhere |
| `The light follows the server` in `spec/design_output/extension.md` | drops the row on the button's own child, and `RESPAWN_GRACE`, `KILL_AFTER` and the `spawn` import leave with the child |
| the checkpoint | rides no leaf, because the ask names no `view:` and `holdsHere` in `src/scripts/pull-when.js` skips the view leaf without one. The `says` of tests-green asks the owner to close the editor with a server standing and then ask `/health`, and accept reads the answer under Discussion |
| the Windows job | keeps the draft's road. Every editor utility process on this desk, the extension hosts among them, runs inside a job, and the agent's shell stands in a job that lets a child leave and kills nothing on close. The standing bridge outlives its gone parent. No read from outside reaches the extension host's own job flags, so the checkpoint decides the editor road, and a start through WMI, which parents the server outside the editor's job, stands next where it fails, unchecked |

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

The owner's words: the hook, the bridge, dies all the time on this box. Fix that too.

A read of the code found two more faults, graded as read:

- plausible, unchecked: a respawn with `detached` alone stays inside the editor's job object on Windows, so closing the editor may kill it too. Closing the editor while a respawned server stands, then asking `/health`, settles it
- checked in `src/bridge/server.js`: `boxesOf` keys boxes on the raw root, so a `C:` root and a `c:` root build two boxes on one server
