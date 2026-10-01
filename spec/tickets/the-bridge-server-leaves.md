---
kind: [[ticket]]
state: closed
step: implement/tests-green
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
group: go-cage-switches-over
depends_on: ["a-down-index-refuses-calls", "cage-stop-marks-port", "copilot-answers-off-the-door", "level0-tools-leave-the-bridge", "the-brief-leaves-the-bridge", "start-road-starts-the-index"]
record:
  - step: design/draft
    hand: box d891eb165fd6 · claude-code-remote
    hash_before: 5c160bbf01e4d9155fcfb7b696d25696eae9a850
    hash_after: c9ba833e5c8477ef3ca65a6bd3255a4e3f96d99a
    inputs:
      - name: ask
        hash: f6037bc7affa843e
        size: 247
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box 424e8436113 · claude-code-remote
    hash_before: 48ece2cc7de935dafe3db46741c28874c676f478
    hash_after: 48ece2cc7de935dafe3db46741c28874c676f478
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: c5e802135594045d
        size: 2682
    def: 08e16d07b0de477c
  - step: gate
    hand: box 424e8436113 · claude-code-remote
    hash_before: 18f45e3bd700827a7fe4ece9b204b86aa18be00b
    hash_after: 18f45e3bd700827a7fe4ece9b204b86aa18be00b
    inputs:
      - name: design/draft
        hash: c5e802135594045d
        size: 2682
      - name: design/tests-red
        hash: 03ab3ddbe2e00eb8
        size: 657
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 424e8436113 · claude-code-remote
    hash_before: e8115c72fe7e73f296e2b0de77162c3b08f64717
    hash_after: e8115c72fe7e73f296e2b0de77162c3b08f64717
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/the-bridge-server-leaves.md:366:58: Sentence: A sentence holds 25 words. Cut this one in two."
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 424e8436113 · claude-code-remote
    hash_before: 3f848e7b18bd62a3501bb9a31dd738a31d4bdc7b
    hash_after: 1e7ebd952fc3a52c53958d95a811c50c44bbe260
    answered:
      - name: tests
        exit: 0
        said: green, 1 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-bridge-server-leaves.md:380:58: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: design/tests-red
        hash: 03ab3ddbe2e00eb8
        size: 657
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

`src/bridge`'s server and `copilot-runtime.js` leave the tree, with their cases.

A second cage drifts from the first.

- `git ls-files src/bridge/server.js .claude/skills/level0/lib/copilot-runtime.js` answers nothing
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

The server leaves last, once four ports move its live duties to the Go side. Today pid 3210 on this box runs src/bridge/server.js, and it serves every level zero tool, the brief and every event outside DOORED in cage.js. So a delete now leaves a session with no rule and no tool.

1. copilot-answers-off-the-door moves Copilot's hooks to the hooks door, and copilot-runtime.js leaves with its case.
2. the-level0-tools-leave-the-bridge moves every tool of the TOOLS table to the Go side.
3. the-brief-leaves-the-bridge moves the brief, the canary debt and every event of the DOORS table to the hooks door.
4. the-start-road-starts-the-index repoints every start road, the stub, the serve verb, the extension and the reload watcher at the index.
5. This ticket then deletes src/bridge/server.js and src/doors/fake/bridgehead.js, whose fake nothing calls. It deletes the cases whose subject is the server, and trims the design notes naming it.

What I weigh: one ticket carrying all five buries each port in one review, and a port landing alone stands testable. I assume each port keeps the bridge serving until the port lands, so the tree works at every commit.

The files this ticket touches:

- src/bridge/server.js, deleted
- src/doors/fake/bridgehead.js, deleted
- test/contract/server-loads.test.js, wire.test.js, stop-dry-run.test.js and stop-cases.test.js, deleted
- test/level0/server-crash, restart-box, reload, serve, cli-serve, box-keys, awake-box and cage-shadow tests, deleted
- test/contract/bridge-server-leaves.test.js, new
- src/modules/hooks/stops.go and cage.go, comments
- spec/design_output/level0.md, migration.md and copilot.md
- src/quack/testdata/tree.golden.json

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/bridge/server.js: the whole module, which leaves
- src/doors/fake/bridgehead.js: fakeBridgehead, which leaves
- src/modules/hooks/stops.go: the header comment naming server.js
- src/modules/hooks/cage.go: the comments naming server.js
- spec/design_output/level0.md, migration.md and copilot.md: the sections naming the server
- src/quack/testdata/tree.golden.json: the tree golden, regenerated

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/contract/bridge-server-leaves.test.js: git ls-files names neither the bridge server nor the copilot runtime
- test/contract/bridge-server-leaves.test.js: no start road, stub or verb names src/bridge/server.js

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the helper opened server.js, cage.js, level0.js, start.js, copilot.js and each caller, and I checked the live process and doors myself
- the callers list names what this ticket touches, and the four children carry the rest
- the first done line meets the ls-files case, and the second the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/contract/bridge-server-leaves.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/contract/bridge-server-leaves.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The case fails on its own assertion, because `git ls-files` still names the bridge server. The Copilot runtime has already left with an earlier child. The draft names a second case for the start roads. The start road child landed it as `test/contract/no-road-names-server.test.js`, which stands green, so no copy is written.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The first done line meets the new case, which stands red. The check line waits for the green leaf.
- The case runs git over the real tree as a contract test, and needs no fake.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept. The approach answers the ask. A cold probe over a clone carrying the deletion of `src/bridge/server.js` passes the hook, server, rules and tools rows, so a fresh session reads its rules and every level0 tool off the hooks door. The new case decides the first done line and stands red. The check decides the second at the green leaf. This live session routes calls to the bridge only because its plugin loaded before the flip.

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

- The change deletes the server, its fake and the modules only it reached, with their cases. The door also reads spread call arguments, which the deletion leaves no other reader of.
- The kept cases run over the fakes they ran over before, and the new cases run over the fake store and the fake call.
- Each edited function names this ticket beside it.
- The cage event list stands in `cage.js` alone, and the spread read stands in `tool.Args` alone.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/contract/bridge-server-leaves.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The bridge server leaves the tree, with its fake, the modules only it reached and every case whose subject it is. The hooks door now answers every event and every level zero tool. Its read of a call took arguments nested under the input alone, and the host spreads them on the event, so a write tool met no edits once the bridge stopped. `tool.Args` now reads both forms. A cold probe over a clone without the server reads its rules and every tool.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The green commit carries the deletions, which the change commit left unstaged.
- The contract case runs git over the real tree, and the Go cases run over their fakes.
- Each changed case names this ticket.
- The spread read stands in one function, and the door calls it.

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

The hooks door answers every harness write, and `onWrite` in `src/bridge/write.js` still answers a patch call inside the tool. These rules move with the patch tool's port, since no hook reaches them:

- the bless file
- the conflict markers and the open ticket door
- the fields the engine owns, and a projection's owner
- the private rule

For details, see [[spec/tickets/cage-write-door-port]].

The draft names two children by their names at the mint. They stand as [[spec/tickets/level0-tools-leave-the-bridge]] and [[spec/tickets/start-road-starts-the-index]] now, since a ticket name holds five words.

The cage hands the bridge no call since [[spec/tickets/level0-tools-leave-the-bridge]]. The server still holds these, and the cases driving them through `decide`, so they leave with it:

- the `TOOLS` table and `toolNames` in `src/bridge/server.js`
- the `register` answer, from `decide` and `opensSession`
- the tool dispatch in `onToolCall`
- the `DOORS` table and its handlers in `server.js` and `guidance.js`, which no event reaches since [[spec/tickets/the-brief-leaves-the-bridge]]

`box.specs` stays while the bridge's brief lists the tools, until [[spec/tickets/the-brief-leaves-the-bridge]] lands.
