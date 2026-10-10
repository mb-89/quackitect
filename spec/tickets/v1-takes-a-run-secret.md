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
group: hooks-v1-hold-the-line
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box f9a277082525 · claude-code-remote
    hash_before: 5e456c3ab73a09d0f186aeab61003599f05b28f9
    hash_after: 5e456c3ab73a09d0f186aeab61003599f05b28f9
    inputs:
      - name: ask
        hash: a1a49db99274ebf0
        size: 955
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box f9a277082525 · claude-code-remote
    hash_before: bd9051c2752fe56122667870344787db072c2a82
    hash_after: bd9051c2752fe56122667870344787db072c2a82
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 1ff232507d954dbf
        size: 2979
    def: 08e16d07b0de477c
---

# Ask

The person mark rides a secret the agent's calls lack. A verb runs as a person where its caller presents that secret alone, so the environment decides who blesses again.

An agent posts `bless/set` with `person: true` to the open `/v1` port, or calls the same action over MCP. The verb then runs with the harness variables dropped, and the agent blesses its own gate. See `src/index/v1.go:33`, `src/modules/verbs/verbs.go:29` and `src/index/door.go:495`, findings 2, 5 and 6.

- `./RUNME.sh test src/index` refuses a `/v1` and a legacy post that lack the run's secret
- the same test serves a post carrying it
- `./RUNME.sh test` keeps the harness variables on a `person: true` call over MCP or the hook door
- `./RUNME.sh test` refuses the secret's file to the agent's `Read` and `Bash` doors
- the standing file and the secret's file stand at mode 0600
- `./RUNME.sh check` passes, and the sidebar and the lens keep running verbs as a person

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

The index mints a run secret as it opens its doors, and writes it into `.se/.runtime/person.json` at mode 0600. `stands` in `src/index/door.go` writes `index.json` at 0600 too, since it carries the bus token.

A post marks a person only where it carries the secret:

- `/v1`: `acts` in `src/index/actions.go` refuses a body holding `person: true` with 403 where the header `X-Quack-Person` lacks the secret, and serves it where it matches
- the legacy port: `took` in `src/index/door.go` reads the same header, and refuses a call whose params hold `person: true` without it
- the hook door and the MCP server: `tool.Input` in `src/q/tool/tool.go` drops the person field, so an agent's call keeps the harness variables
- the lens: `lspTickets` runs in process behind its token line, and keeps the mark

The sidebar and the lens of the extension read the secret through `indexDoor` in `src/extension/editor-index.js`, and send the header on each post. The agent's doors refuse the file: `BlessGuard` in `src/modules/hooks/command/guards.go` takes `person.json` beside `bless.json`, and `refuses` in `src/modules/hooks/hooks.go` refuses a `Read` naming it. A post without the mark still runs as it runs today, so the TUI and the CLI stand.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/index/actions.go` `acts`, called by `servesActions`
- `src/index/door.go` `took`, the legacy port's handler, and `stands`, called by `opensOn`
- `src/q/tool/tool.go` `Input`, called by `calls` in `src/modules/hooks/hooks.go` and `calls` in `src/modules/mcp/mcp.go`
- `src/extension/editor-index.js` `indexDoor`, called by `src/extension/sidebar.js` and `src/extension/lib/lens.js` `actsOn`
- `src/modules/hooks/command/guards.go` `BlessGuard`, called by `commands` in `src/modules/hooks/hooks.go`
- `src/modules/hooks/hooks.go` `refuses`, called by `Hook`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/index/actions_test.go` `TestAPersonPostWithoutTheRunSecretMeetsARefusal`
- `src/index/door_test.go` `TestTheLegacyPortRefusesAPersonCallWithoutTheRunSecret`
- `src/q/tool/tool_test.go` `TestAnAgentsCallDropsThePersonMark`
- `src/modules/hooks/command/guards_test.go` `TestTheBlessGuardRefusesTheRunSecret`
- `src/modules/hooks/hooks_test.go` `TestTheDoorRefusesAReadOfTheRunSecret`
- `src/index/door_test.go` `TestTheStandingAndTheSecretStandAtOwnerMode`
- `test/extension` the index door sends the secret header on a person post

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/index/actions.go`
- `src/index/door.go`
- `src/index/secret.go`
- `src/q/tool/tool.go`
- `src/modules/hooks/hooks.go`
- `src/modules/hooks/command/guards.go`
- `src/extension/editor-index.js`
- and the test file beside each

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file the approach names stands opened, off a search of the person mark through the index, the doors and the extension
- the callers list names the caller of each changed function
- each done line names its test above, and the sidebar and the lens line names the extension test
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh test src/index src/q/tool src/modules/hooks test/level0/editor-doors.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/index/secret_test.go
- src/q/tool/tool_test.go
- src/modules/hooks/command/findings_test.go
- src/modules/hooks/hooks_test.go
- test/level0/editor-doors.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each test fails on its own assertion. A person post with no secret answers 200 over `/v1`, and the legacy port answers its `files` call to a caller holding no secret. The standing file stands at 644, and no secret file stands. The tool input keeps `person: true` past the agent's call. The bless guard passes a `cat` of the secret's path, and the door passes a Read of it. The index door sends no secret header. One surprise: the legacy port answers whole file listings to any local caller, so the secret gates every legacy call, as the ask says.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done line meets a test above that fails on its own assertion
- the index tests run on the fake network and the fake manager, the tool test on a fresh catalog, the hook tests on `holdDoor`, and the extension test on the fake disk and the fake http

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
