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
      - name: tests-red-2
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft-2
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
    input: ["design/draft", "design/tests-red", "design/draft-2", "design/tests-red-2"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate", "design/draft-2"]
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
        input: ["design/tests-red", "design/tests-red-2"]
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
  - step: design/draft
    hand: box d889b5fde3d5 · claude-code-remote
    hash_before: 9614cdea0be1af1c3f377c9c1a4117af04bc2fde
    hash_after: 1abc4435616d9d79e7e6b95313425478d01d5998
    inputs:
      - name: ask
        hash: 2e1097fa7d39ff56
        size: 535
      - name: [[spec/rationales/the-cage-refuses-while-down]]
        hash: e54c50d8ed5defb6
        size: 1649
      - name: [[spec/tickets/the-hook-log-loses-lines]]
        hash: 810c4e970082b08d
        size: 2110
    def: 71651f49796eeda4
  - step: design/draft
    hand: the engine
    stale: [[spec/tickets/the-hook-log-loses-lines]]
  - step: design/draft
    hand: box d88b829f8cd8 · claude-code-remote
    hash_before: 34577aa8ab311b777f1fa21d5fede99efcc3ac94
    hash_after: 34577aa8ab311b777f1fa21d5fede99efcc3ac94
    inputs:
      - name: ask
        hash: 2e1097fa7d39ff56
        size: 535
      - name: [[spec/rationales/the-cage-refuses-while-down]]
        hash: e54c50d8ed5defb6
        size: 1649
      - name: [[spec/tickets/the-hook-log-loses-lines]]
        hash: e12c15cf9e654d97
        size: 791
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d88f0683f2d7 · claude-code-remote
    hash_before: 9629736b844117b21ddea962a14ad4ee84f4cb56
    hash_after: 9629736b844117b21ddea962a14ad4ee84f4cb56
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: c6867e111a3b6fba
        size: 2908
    def: 08e16d07b0de477c
  - step: gate
    hand: box d88f0683f2d7 · claude-code-remote
    hash_before: 6e79614d3280ee8feb6516dbbe4b152b43cef2da
    hash_after: 6e79614d3280ee8feb6516dbbe4b152b43cef2da
    returns: 1
    why: "level0.js approach step 1: under new every event goes to POST /hook, and the Go hooks door answers no prompt.context rules, no tool registration and no rows ask-back. The redraft splits the events: the door decides tool.call and classic.Stop, and the bridge keeps the rest, or it names the port that answers them; the result effect maps Text to a deny and Result to the tool result, and the rows effect of holds.go asks back through hook.back. The redraft maps both; session/alarms and index/health stand in the index store alone, and nothing writes them to disk. The redraft names a disk copy and its writer, or the refusal names the key session/alarms and a fixed command; no quack start verb stands. The redraft names the real start argv the hook runs once, and the ./RUNME.sh verb the refusal names; the hook reads migration.cage through configOf in lib/config.js, so a local override reads the same as asksText in the bridge; the callers list adds src/scripts/copilot-shadow.js shadowsHook and src/quack/hook.go copilotPost, and says the Copilot road under new, or scopes it to a fix ticket; register resets saidDown, toldDown, port and cage, or the raced row case stays red after a right append. The redraft names the append argv the test fake reads: node -e with an appendFileSync script, the path, then the text; step 6 adds the Every writer appends list in spec/design_output/log.md; weighed: the red tests decide every done line, and both fail on their own assertion. Step 1 changes who answers every event under new, drops the rules, the tools and the ask-back, and costs dear to undo once the key moves, so the approach takes a redraft"
  - step: design/draft-2
    hand: box d88f0683f2d7 · claude-code-remote
    hash_before: 3cc532c33c5404df8842ce34a6d8487041caa05c
    hash_after: 3cc532c33c5404df8842ce34a6d8487041caa05c
    inputs:
      - name: ask
        hash: 2e1097fa7d39ff56
        size: 535
      - name: [[spec/rationales/the-cage-refuses-while-down]]
        hash: e54c50d8ed5defb6
        size: 1649
      - name: [[spec/tickets/the-hook-log-loses-lines]]
        hash: e12c15cf9e654d97
        size: 791
    def: a3dfd8c60d853590
  - step: design/tests-red-2
    hand: box d88f0683f2d7 · claude-code-remote
    hash_before: 7e733cfc85b9494fbab6f071efb0512f25719856
    hash_after: 7e733cfc85b9494fbab6f071efb0512f25719856
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft-2
        hash: e5eb8e88440a6052
        size: 4805
      - name: [[spec/tickets/the-bridge-server-leaves]]
        hash: f6037bc7affa843e
        size: 247
    def: 9c7cd4dd4a2dadb8
  - step: gate
    hand: box d8901afed4d6 · claude-code-remote
    hash_before: d642f6666cbdde5d91bbf3ede6f756c2ebd2a1a9
    hash_after: d642f6666cbdde5d91bbf3ede6f756c2ebd2a1a9
    inputs:
      - name: design/draft
        hash: c6867e111a3b6fba
        size: 2908
      - name: design/tests-red
        hash: afd47fba06c53205
        size: 1065
      - name: design/draft-2
        hash: e5eb8e88440a6052
        size: 4805
      - name: design/tests-red-2
        hash: eba558812135f39f
        size: 964
      - name: [[spec/tickets/the-bridge-server-leaves]]
        hash: f6037bc7affa843e
        size: 247
    def: 01417e29801ecc2f
  - step: implement/change
    hand: box d8901afed4d6 · claude-code-remote
    hash_before: b33eeff84a4d2c0062edb00761a0dae83e9d70fb
    hash_after: b33eeff84a4d2c0062edb00761a0dae83e9d70fb
    answered:
      - name: lint
        exit: 0
        said: "test/level0/cage-shadow.test.js:44:65: Modal: This register holds the modals can, must, will. Say what is, or name the o"
    def: f150b8c0dc20fe45
  - step: design/draft
    hand: the engine
    stale: [[spec/rationales/the-cage-refuses-while-down]]
  - step: design/draft-2
    hand: the engine
    stale: [[spec/rationales/the-cage-refuses-while-down]]
  - step: design/draft
    hand: box d8901afed4d6 · claude-code-remote
    hash_before: d6b7bee376b412ab661a9636ca24c0c990e8faf4
    hash_after: d6b7bee376b412ab661a9636ca24c0c990e8faf4
    inputs:
      - name: ask
        hash: 2e1097fa7d39ff56
        size: 535
      - name: [[spec/rationales/the-cage-refuses-while-down]]
        hash: 8217a9861c295a70
        size: 1738
      - name: [[spec/tickets/the-hook-log-loses-lines]]
        hash: e12c15cf9e654d97
        size: 791
    def: 71651f49796eeda4
  - step: design/tests-red
    skipped: true
    kept: 6e79614d3280ee8feb6516dbbe4b152b43cef2da
    why: its red tests stand as 6e79614d3 landed them, and a later leaf passed since
  - step: design/tests-red
    hand: the engine
    stale: design/draft
  - step: design/tests-red
    skipped: true
    kept: 6e79614d3280ee8feb6516dbbe4b152b43cef2da
    why: its red tests stand as 6e79614d3 landed them, and a later leaf passed since
  - step: design/draft-2
    hand: box d8901afed4d6 · claude-code-remote
    hash_before: 3e239471dd7db690ee5d75b3acdc1b8a64cea2d0
    hash_after: 3e239471dd7db690ee5d75b3acdc1b8a64cea2d0
    inputs:
      - name: ask
        hash: 2e1097fa7d39ff56
        size: 535
      - name: [[spec/rationales/the-cage-refuses-while-down]]
        hash: 8217a9861c295a70
        size: 1738
      - name: [[spec/tickets/the-hook-log-loses-lines]]
        hash: e12c15cf9e654d97
        size: 791
    def: a3dfd8c60d853590
  - step: design/tests-red-2
    skipped: true
    kept: d74c1b4bda7e08c7a815d7208ab09826b50aeacd
    why: its red tests stand as d74c1b4bd landed them, and a later leaf passed since
  - step: design/tests-red-2
    hand: the engine
    stale: design/draft-2
  - step: design/tests-red-2
    skipped: true
    kept: d74c1b4bda7e08c7a815d7208ab09826b50aeacd
    why: its red tests stand as d74c1b4bd landed them, and a later leaf passed since
  - step: gate
    hand: box d8901afed4d6 · claude-code-remote · helper-20
    hash_before: 727c410e068e99aad8501460690182f5f19f6724
    hash_after: 727c410e068e99aad8501460690182f5f19f6724
    inputs:
      - name: design/draft
        hash: 51464da247eb14a3
        size: 2425
      - name: design/tests-red
        hash: afd47fba06c53205
        size: 1065
      - name: design/draft-2
        hash: 51464da247eb14a3
        size: 2425
      - name: design/tests-red-2
        hash: eba558812135f39f
        size: 964
    def: 01417e29801ecc2f
  - step: implement/change
    hand: box d8901afed4d6 · claude-code-remote
    hash_before: c5a667f54ca19f4ac1d82276d2b1c6d4da587fcd
    hash_after: c5a667f54ca19f4ac1d82276d2b1c6d4da587fcd
    answered:
      - name: lint
        exit: 0
        said: "test/level0/cage-shadow.test.js:44:65: Modal: This register holds the modals can, must, will. Say what is, or name the o"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d8901afed4d6 · claude-code-remote
    hash_before: fea3e0f5dbc79472067f12a56f4de2be362aaa9d
    hash_after: e5e40c6120c5d6e6af5c49687e3deb5b473782cd
    answered:
      - name: tests
        exit: 0
        said: green, 24 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: "test/level0/cage-shadow.test.js:44:65: Modal: This register holds the modals can, must, will. Say what is, or name the o"
    inputs:
      - name: design/tests-red
        hash: afd47fba06c53205
        size: 1065
      - name: design/tests-red-2
        hash: eba558812135f39f
        size: 964
    def: a72af3702416676c
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
group: go-cage-switches-over
depends_on: ["cage-rules-port-before-switch", "cage-write-door-port", "cage-call-holds-port", "cage-hold-drops-port", "cage-commit-guards-port", "cage-stop-rules-port"]
reason: done
---

# Ask

`migration/config/slices/cage` moves to `new`. While the index stands down, the cage refuses, and the refusal names the alarm. [[spec/rationales/the-cage-refuses-while-down]] names the chapters this rewrites.

A fault then shows on the first call, and gets fixed early.

- a case stops the fake index, and reads a refusal naming `session/alarms`
- a case lets the index fall while another writer appends to the session log, and reads every row kept. [[spec/tickets/the-hook-log-loses-lines]] shows the loss
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

The approach of design/draft-2 stands, and implement/change builds it. Under new, .claude/skills/level0/hooks/cage.js sends tool.call and classic.Stop to POST /hook, and the bridge answers every other event.

The gate's point joins it. A rows effect asks back on agent.spoke with the effect's call id, which src/modules/hooks/holds.go reads.

A level zero tool the door passes goes on to the bridge, since the door serves only the tools the index registers as actions.

The rationale changes because the ask rewrites its fifth chapter. That chapter now says what passes under new, and names the chapter in level0.md that holds the road. The input goes stale for that reason alone, and no claim of the approach moves with it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- .claude/skills/level0/hooks/level0.js: seen, which picks the road by event and key through doored
- .claude/skills/level0/hooks/level0.js: register, which resets the fall marks, the port and the cage
- .claude/skills/level0/hooks/level0.js: wrote, called by down, starts, probes and clears
- .claude/skills/level0/hooks/cage.js: doorOf, doored and refusedText
- src/scripts/serve.js: reasonOf and START, which level0.js exports again off start.js
- spec/config/level0.json: migration.cage, read by asksText and configOf

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/bridgehead.test.js: a stopped hooks door refuses a guarded call and names session/alarms
- test/level0/bridgehead.test.js: a row another writer appends while the index falls stays in the session log
- test/level0/bridgehead.test.js: under new a tool call takes the hooks door effects, and a prompt still reaches the bridge
- test/level0/cage.test.js: a held call asks back on agent.spoke with the effect's call id, and the second answer stands
- test/level0/cage.test.js: a local override moves the cage as the tracked key does

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- spoke-answer-reaches-the-door: the rows ask-back posts agent.spoke to the door with the call id, and cage.test.js decides it
- every finding of the first gate: draft-2 answers each, and implement/change builds it

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened cage.js, level0.js seen and register, holds.go held and sessionFor, hooks.go Hook and calls, and the rationale, and each claim holds there
- the callers list names every caller of seen, wrote, register and the moved exports
- the first done line meets the refusal case, the second the raced row case, and the third the check at tests-green

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/bridgehead.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/bridgehead.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The refusal case stands red on its own assertion: today the hook passes every call while no server answers, so the call reaches the harness and no line names session/alarms. The raced row case stands red too. The hook reads the session log, another writer appends, and the hook writes the log back over that row.

The read case and the shadow case pass today, and they hold the edges of the change: a read passes while the door stands down, and the bridge posts no shadow under new.

The surprise: the hook module reads no config today, so the cage key reaches it through spec/config/level0.json on the hand disk, beside the standing file the hooks door writes.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the first done line meets the refusal case, the second the raced row case, and the third the check at tests-green
- the doors the tests reach have fakes: the fake disk, a process fake that appends where the hook runs a node append, and an http fake whose every post falls

## draft-2

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The approach of design/draft-2 stands, and implement/change builds it. Under new, .claude/skills/level0/hooks/cage.js sends tool.call and classic.Stop to POST /hook, and the bridge answers every other event.

The gate's point joins it. A rows effect asks back on agent.spoke with the effect's call id, which src/modules/hooks/holds.go reads.

A level zero tool the door passes goes on to the bridge, since the door serves only the tools the index registers as actions.

The rationale changes because the ask rewrites its fifth chapter. That chapter now says what passes under new, and names the chapter in level0.md that holds the road. The input goes stale for that reason alone, and no claim of the approach moves with it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- .claude/skills/level0/hooks/level0.js: seen, which picks the road by event and key through doored
- .claude/skills/level0/hooks/level0.js: register, which resets the fall marks, the port and the cage
- .claude/skills/level0/hooks/level0.js: wrote, called by down, starts, probes and clears
- .claude/skills/level0/hooks/cage.js: doorOf, doored and refusedText
- src/scripts/serve.js: reasonOf and START, which level0.js exports again off start.js
- spec/config/level0.json: migration.cage, read by asksText and configOf

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/bridgehead.test.js: a stopped hooks door refuses a guarded call and names session/alarms
- test/level0/bridgehead.test.js: a row another writer appends while the index falls stays in the session log
- test/level0/bridgehead.test.js: under new a tool call takes the hooks door effects, and a prompt still reaches the bridge
- test/level0/cage.test.js: a held call asks back on agent.spoke with the effect's call id, and the second answer stands
- test/level0/cage.test.js: a local override moves the cage as the tracked key does

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- spoke-answer-reaches-the-door: the rows ask-back posts agent.spoke to the door with the call id, and cage.test.js decides it
- every finding of the first gate: draft-2 answers each, and implement/change builds it

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened cage.js, level0.js seen and register, holds.go held and sessionFor, hooks.go Hook and calls, and the rationale, and each claim holds there
- the callers list names every caller of seen, wrote, register and the moved exports
- the first done line meets the refusal case, the second the raced row case, and the third the check at tests-green

## tests-red-2

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/bridgehead.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/bridgehead.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Three cases stand red on their own assertion. The refusal case sees the call pass to the harness. The raced row case sees the hook write the log back over a row another writer appends. The split road case sees the tool call go to the bridge, not the hooks door.

The read case and the shadow case pass today, and they hold the edges of the change.

The surprise: in the full file run the raced row case also reads the down flags the case before it leaves set, so the reset in register decides it as much as the append does.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the first done line meets the refusal case, the second the raced row case, and the third the check at tests-green. The split road case holds the answer to the gate
- the doors the tests reach have fakes: the fake disk, a process fake that appends on the node append argv, and an http fake that answers by url

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- cage-key-reads-the-layers: design/draft-2 lists `test/level0/cage.test.js: a local override moves the cage as the tracked key does`, and the tree holds that case nowhere. `caged` in `.claude/skills/level0/hooks/level0.js` reads `migration.cage` through `configOf`, and `CAGED` in `test/level0/bridgehead.test.js` writes the tracked `spec/config/level0.json` alone. Add a case where an override alone reads `new`, and the hook takes the door road
| what the gate weighed | what it found |
|---|---|
| the ask's refusal line | `a stopped hooks door refuses a guarded call and names session/alarms` in `test/level0/bridgehead.test.js` asserts the deny names `session/alarms` and a `./RUNME.sh` command, and `refusedText` in `cage.js` writes both |
| the ask's raced row line | `a row another writer appends while the index falls stays in the session log` asserts every appended row stays, and the fixture's process fake appends on the node argv |
| the ask's check line | it stands for `implement/tests-green`, and the draft names it there |
| the approach | `doors` in `cage.js` names `tool.call` and `classic.Stop`, and `seen` hands every other event to the bridge, so the rules, the tools and the brief stay where they stand |
| the earlier gate's point | `door` posts `agent.spoke` with the effect call id, and `holds.go` answers its rows effect with that call, so `spoke-answer-reaches-the-door` stands built |
| the stale rationale | its What still passes chapter says what passes under `new` and names the chapters the migration rewrites, so the stale input moves no claim of the approach |
| the callers list | it names `doorOf` and `doored`, and `cage.js` exports `doors`; the built road holds, so the drift grades as form and rides to the push |
| the tests list | it names `cage.test.js` for the held call case, which stands in `bridgehead.test.js`; form again |
| the kept red leaves | both kept commits stand in the history, and each answered on its own assertion |
| the round | every fault beside the absent case is prose the builder passes anyway, so a reject buys nothing

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

- the files are the ones the ask names: the hooks, the cage, the config key and their cases
- the doors carry fakes: a fake disk, a fake process and a fetch that falls
- each road points at its chapter or its ticket, and states the approach there
- `refusedText` owns the refusal, and `configOf` owns the key, so each fact stands once

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/caged-door.test.js test/level0/bridgehead.test.js test/level0/cage.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The cage key reads `new`, so every tool call and every turn's end goes to the Go hooks door first, and the bridge keeps the prompt.

Three cases stood red, and each passes now. A guarded call meets a refusal naming `session/alarms` while the door stands down, and the refusal carries the command that clears it. A row another writer appends while the index falls stays in the session log. A tool call under `new` takes the door's effects, and a prompt still reaches the bridge.

The gate's point stands built beside them: a held call asks back on `agent.spoke` carrying the effect's call id, and the second answer stands.

The cases moved file since `tests-red-2` wrote its red list. They stand in `test/level0/caged-door.test.js`, cut off `bridgehead.test.js` when the override case grew it past the file ceiling. The command above names both files.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the files are the ones the ask names: the hook, the cage, the config key and their cases
- the doors carry fakes: a fake disk, a process fake reading the append argv, and a fetch answering by url
- each road points at its chapter or its ticket, and the approach stands there
- `refusedText` owns the refusal and `configOf` owns the key, so each fact stands once

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

**The order.** This ticket waits on [[spec/tickets/cage-rules-port-before-switch]]. Its ask moves the cage key to `new`, and the Go door refuses nothing the bridge refuses until the rules port. The ticket `shadow-evidence-5-6` on the branch `claude/shadow-evidence-5-6` names the refusals the door passes. Weighed: the switch first leaves the cage open, and the port first costs this ticket a wait alone.
