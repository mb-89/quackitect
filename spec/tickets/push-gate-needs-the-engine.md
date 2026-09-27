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
      - name: person-1
        does: answers the question the engine asks
        by: person
        to: engine
        asks: Which signal reads as the engine running for the push gate? The bridge answering on its port leaves a push unguarded while the bridge stands down.
        evidence:
          - name: answer
            form: choice
            says: the answer, which the step behind this one reads
            options: ["the bridge answers on its port", "the level0 hooks load in the session"]
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
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/person-1
    hand: box d6f05e3a585030 · claude-code · the owner says so
    hash_before: 3752d7c680606a3bf24f5a66b8f935b937abe177
    hash_after: 3752d7c680606a3bf24f5a66b8f935b937abe177
    def: 010b0c27b3192cab
  - step: design/draft
    hand: box d7e124b659cd · claude-code-remote
    hash_before: 5dc02c39354d13d46e6e2a09417f3bea2d46a10b
    hash_after: 5dc02c39354d13d46e6e2a09417f3bea2d46a10b
    inputs:
      - name: ask
        hash: 4028c18b8dc89090
        size: 716
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e124b659cd · claude-code-remote
    hash_before: e87299baa39c87ba620f28205687ee8b7b2fbcc4
    hash_after: e87299baa39c87ba620f28205687ee8b7b2fbcc4
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 06a30175056ddca0
        size: 2916
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e2385398cd · claude-code-remote
    hash_before: 908c43fcccb4e6358343990790ed5f44356daf02
    hash_after: 908c43fcccb4e6358343990790ed5f44356daf02
    inputs:
      - name: design/draft
        hash: 06a30175056ddca0
        size: 2916
      - name: design/tests-red
        hash: a22f7e8ffed41ca9
        size: 826
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d7e2385398cd · claude-code-remote
    hash_before: b3d5ba05ed6cf2ec2838b5320c00cecccb180d79
    hash_after: b3d5ba05ed6cf2ec2838b5320c00cecccb180d79
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/sync-takes-its-own-branch.md:282:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d7e2385398cd · claude-code-remote
    hash_before: 3784ee3fcaba17e956624a65583d888146dbb787
    hash_after: 3784ee3fcaba17e956624a65583d888146dbb787
    answered:
      - name: tests
        exit: 0
        said: green, 24 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/sync-takes-its-own-branch.md:282:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
    inputs:
      - name: design/tests-red
        hash: a22f7e8ffed41ca9
        size: 826
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

The pre-push hook gates a push only while the engine runs. The owner opens this folder, starts an agent and starts no engine, and the agent pushes with no check stamp asked.

The gain is a desk that lands the owner's own commits on `origin` at once, while a box running the engine keeps the gate it holds now.

Without it every push from a desk waits on a green `./RUNME.sh check`. A test red on one platform alone then holds the owner's commits off `origin`, as a Windows desk met it.

- a case in `test/level0/prepush.test.js` pushes with no engine running and a stale stamp, and the push lands
- a case pushes with the engine running and a stale stamp, and the push comes back refused
- `./RUNME.sh check` exits 0

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->

<!-- the form is verdict -->

## person-1

<!-- Which signal reads as the engine running for the push gate? The bridge answering on its port leaves a push unguarded while the bridge stands down. -->

### answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is choice -->

the level0 hooks load in the session

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The session's Bash door marks a push it lets through, and the push door gates the battery on that mark alone. The owner's answer names the level0 hooks loading in the session as the signal, and the mark rides only a command those hooks saw.

| part | where | what it does |
|---|---|---|
| the mark | `ENGINE` in `.claude/skills/level0/lib/runs.js`, beside `STAMP` | names the variable, `SE_ENGINE` |
| the rewrite | `markedPush(command, e)` in `src/bridge/bash.js`, the last step of `onBash` | where the command pushes, through `touchesGit(command).pushes`, or runs `./RUNME.sh`, answers `{ event: { ...e, command: "export SE_ENGINE=1; <command>" } }`, so every git the command starts carries the mark |
| the gate | `holds(refs, stampText, carried, cloud, heldBy, box, engine)` in `src/scripts/prepush.js` | reads the battery on a push to `main` only where `engine` holds |
| the read | `main` in `prepush.js` | passes `process.env.SE_ENGINE === "1"` |

The bridgehead hands a rewritten event on through `next(answer.event)` for every event, as the helper prompt rewrite does. The version, to-do, cloud and hold rules stand with no engine, because none of them waits on a check. A person pushing from a terminal with no session carries no mark, so the owner's own commits land at once, as the ask asks.

Unchecked, and nothing on this box backs it: the client runs the rewritten Bash input. A cloud box loads no function hooks, so the owner's desk decides it, and the gate case in the door's own test holds the rewrite itself.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/scripts/prepush.js`, `main`, the one caller of `holds` in `src`
- `src/bridge/server.js`, `onToolCall`, which runs `onBash` and hands a non-pass answer through `layerRides`
- `.claude/skills/level0/hooks/level0.js`, `seen`, which runs `next(answer.event)`
- `test/level0/prepush.test.js`, which calls `holds` with no engine argument today, so its trunk cases pass `engine` true

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `test/level0/prepush.test.js`, a push with no engine running and a stale stamp lands
- `test/level0/prepush.test.js`, a push with the engine running and a stale stamp comes back refused
- `test/level0/bash-engine.test.js`, the Bash door marks a push and a verb with the engine variable, and leaves every other command as written

The done lines and the case deciding each:

- the push with no engine: the first case
- the push with the engine: the second case
- the check: `./RUNME.sh check`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `.claude/skills/level0/lib/runs.js`
- `src/bridge/bash.js`
- `src/scripts/prepush.js`
- `test/level0/prepush.test.js`
- `test/level0/bash-engine.test.js`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `holds`, `main`, `onBash`, `touchesGit`, `onToolCall` and the hook's `answer.event` road stand opened, and each reads as the table says
- a search for `holds(` and `onBash(` over `src` and `test` names the callers
- each done line names the case deciding it

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/prepush.test.js test/level0/bash-engine.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/prepush.test.js
- test/level0/bash-engine.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Two cases fail on their own assertion over the stubs: the push with no engine lands nowhere yet, and the Bash door marks nothing. The engine case passes, because the gate refuses a stale stamp today, and it guards that side. The older trunk cases call `holds` with no engine argument, so the gate reads `engine` true by default and they stand as they are.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done line meets a case: the push with no engine fails red, the push with the engine guards the gate, and the check waits for the change
- the gate takes the engine as an argument, and the Bash door's rewrite is a pure function, so no case reaches the environment or git

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

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

- the change touches `bash.js` and `prepush.js` of the size list. The `holds` gate landed with cloud-boxes-leave-trunk-alone under prepush-reds-land-together
- `markedPush` reads the command alone, and `main` reads the variable once
- `markedPush` and the gate point at this ticket
- the variable's name stands once, as `ENGINE` in `runs.js`

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/bash-engine.test.js test/level0/prepush.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Every push from a desk waited on a green check, so a test red on one platform held the owner's commits off origin. The Bash door now marks a push, and every `./RUNME.sh` verb, with `export SE_ENGINE=1`, through `markedPush` in `src/bridge/bash.js`. The push door reads the battery on `main` only where that mark stands. A terminal push with no session carries no mark and lands at once. The version, to-do, cloud and hold rules hold with or without it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the size list alone
- the cases hand the door commands and flags alone
- the code points at this ticket
- the variable's name stands once

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

The owner's words: the hook stays off where the owner starts an agent here and has not started the hooks. The design step settles which signal reads as the engine running.
