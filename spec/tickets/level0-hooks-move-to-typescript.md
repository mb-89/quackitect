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
group: level-zero-becomes-a-typed-mod
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 5090e9523847 · claude-code-remote · the owner says so
    hash_before: 9d9c1d3e57117f88eb8a3acc9fe35f8ffd553eb3
    hash_after: 9d9c1d3e57117f88eb8a3acc9fe35f8ffd553eb3
    inputs:
      - name: ask
        hash: f98b8097d2cddb4b
        size: 1084
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 5090e9523847 · claude-code-remote
    hash_before: af8428d3eff8468f195dd50ababcbaa48c3fdce6
    hash_after: af8428d3eff8468f195dd50ababcbaa48c3fdce6
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 15f1e97e971aae3f
        size: 1820
    def: 08e16d07b0de477c
  - step: gate
    hand: box 5090e9523847 · claude-code-remote
    hash_before: 86af6b65e745fd8a408e658dee628b9f91b7a00c
    hash_after: 86af6b65e745fd8a408e658dee628b9f91b7a00c
    inputs:
      - name: design/draft
        hash: 15f1e97e971aae3f
        size: 1820
      - name: design/tests-red
        hash: e67ae0eb78415dd4
        size: 657
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 5090e9523847 · claude-code-remote
    hash_before: 6fe169e6045bcc8ebcde91dba692f351d60791e9
    hash_after: 010e826fed476ed63fc75d240f6e77e980a33920
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 5090e9523847 · claude-code-remote
    hash_before: 81571cd647f1c4b744c7df6203b339b43f004e74
    hash_after: 81571cd647f1c4b744c7df6203b339b43f004e74
    answered:
      - name: tests
        exit: 0
        said: green, 2 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "  103.9  in all"
    inputs:
      - name: design/tests-red
        hash: e67ae0eb78415dd4
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

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

gain: The hooks module type-checks against the types Claude Code writes for the build under `.claude-plugin/types/`, so a changed engine call or event shape fails the check before a session meets it. Each hook stays thin and hands its work to Go, through the bridge server, an MCP tool, or `$.process.run` of a verb, and holds no rule of its own.

breaks: The hooks module stays untyped JavaScript, so a renamed engine call surfaces only inside a live session, and rule logic keeps living in two languages.

done_when:
- the hooks module and its glue are `.ts` files, and `hooks/hooks.json` points at them; `claude plugin validate .claude/skills/level0` passes
- `tsc -p` over the plugin's tsconfig runs inside `./RUNME.sh check` and exits 0
- every hook hands its work to Go and holds no rule; the plugin tests through the hooks' interface pass
- `./RUNME.sh check` exits 0

view: none

from: none

The javascript-leaves group, on another box, ports the plugin's `lib/` logic to Go. This ticket takes the hooks module and its glue alone, and merges `main` in often to meet that work.

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

The hooks module and its glue stand as .ts files under .claude/skills/level0/hooks, and hooks/hooks.json names ./pull-tool.ts. The plugin tsconfig extends the types claude lays under .claude-plugin/types. The check runs two parts in src/quack/check.go: plugin runs claude plugin validate over the plugin, and types lays the engine types through claude --plugin-dir and then runs tsc -p over the plugin. A box with no claude or no tsc says so and carries on. The rule logic the hooks still hold moves to Go under level0-hooks-hold-no-rule.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- .claude/skills/level0/hooks/hooks.json modules
- .claude/skills/level0/hooks/pull-tool.ts register
- src/scripts/probe-dry.js MODULE and session
- src/quack/check.go partsOf, pluginHolds and typesHold
- test/level0/hooks.test.js imports of level0.ts
- src/vehicle vehicle ModulesOf, which reads the module list

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/check_test.go the types part lays the engine types, then runs tsc over the plugin
- src/quack/check_test.go the types part fails where tsc refuses the hooks
- src/quack/check_test.go the plugin part runs claude plugin validate

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .claude/skills/level0/hooks/*.ts
- .claude/skills/level0/hooks/hooks.json
- .claude/skills/level0/tsconfig.json
- src/quack/check.go
- src/quack/check_test.go
- src/scripts/probe-dry.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

hooks.json, tsconfig.json, typesHold and pluginHolds in src/quack/check.go stand opened, and tsc -p and claude plugin validate both pass on this box
the callers list names the manifest, the dry probe, the check and the tests importing level0.ts
line one is decided by claude plugin validate in the plugin part, line two by tsc in the types part, line three by level0-hooks-hold-no-rule, line four by ./RUNME.sh check
the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/stub-typed.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/stub-typed.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The vehicle hooks, the plugin part and the types part landed before the route, and TestCheckParts in src/quack/check_test.go covers them. The stub still carries its hook as bridgehead.js, outside what tsc reads, so the glue stands untyped. These two cases decide that gap.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the stub cases decide the glue half of the first done_when line, TestCheckParts decides the validate and tsc halves, level0-hooks-hold-no-rule decides the third line, and the check decides the fourth
the cases read the tree files alone, and reach no door

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept. The approach answers the ask, TestCheckParts decides the validate and tsc parts, and the stub cases decide the glue. The points the implement step takes stand under Discussion.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/stub/.claude/skills/level0/hooks/bridgehead.ts test/level0/stub-typed.test.js test/level0/bridgehead.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the stub bridgehead, its manifest, the plugin tsconfig, the vale section over it and the tests naming it, all glue the ask names
the port reaches the engine through $ alone, and test/level0/bridgehead.test.js fakes every call
the header of bridgehead.ts names the approach and links this ticket
the include list in the plugin tsconfig holds the stub path once, and the test reads it there

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/stub-typed.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The vehicle hooks already stood as TypeScript, with claude plugin validate and tsc as parts of the check. The stub carried the last hook still in JavaScript, so it moves to bridgehead.ts, typed against the engine, and the plugin tsconfig reaches it. Validate found the old file reaching $.ui through optional chaining, which the engine refuses, so the port spells the call whole.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the stub hook, its manifest, the tsconfig, the vale section and the tests naming the hook, and nothing past the glue the ask names
the hook reaches the engine through $ alone, and the bridgehead tests fake it
the header of bridgehead.ts names the approach and links this ticket
the stub path stands once, in the include list, and the test reads it there

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

The gate's points, which the implement step takes:

- the stub port reaches these callers: `test/level0/bridgehead.test.js`, `src/vehicle/stub_test.go`, `test/contract/outside-in-doors.test.js` and `.vale.ini`
- the `.vale.ini` section over the stub hooks moves from `*.js` to `*.ts`
- the case in `test/level0/tested.test.js` keeps a `.js` path under `src/stub`, because `lib/tested.js` reads JavaScript alone as source
- the CI Linux job decides that `tsc` exits 0, because `TestCheckParts` fakes `tsc`
- the rules the stub bridgehead holds go to [[spec/tickets/level0-hooks-hold-no-rule]]
