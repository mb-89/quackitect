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
group: go-cage-switches-over
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 3cd847cb11c · claude-code-remote
    hash_before: 734b272f5acb0e20521b32f5772004f33deb7720
    hash_after: 734b272f5acb0e20521b32f5772004f33deb7720
    inputs:
      - name: ask
        hash: 9a713b7a0225ec3a
        size: 663
      - name: [[spec/tickets/the-bridge-server-leaves]]
        hash: f6037bc7affa843e
        size: 247
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 3cd847cb11c · claude-code-remote
    hash_before: 0fa030b5e9eb8435a45157af2c5a745e1c058127
    hash_after: 0fa030b5e9eb8435a45157af2c5a745e1c058127
    answered:
      - name: tests
        exit: 1
        said: assertion, 5 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: a84f8bf83eb50a08
        size: 4588
    def: 08e16d07b0de477c
  - step: gate
    hand: box 3e46c581114 · claude-code-remote
    hash_before: 56761736cd8ab80959714816d6de1d2fcc1d279b
    hash_after: 56761736cd8ab80959714816d6de1d2fcc1d279b
    inputs:
      - name: design/draft
        hash: a84f8bf83eb50a08
        size: 4588
      - name: design/tests-red
        hash: c749736e2298d85e
        size: 960
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 3e46c581114 · claude-code-remote
    hash_before: c0cf3436edccf120f1d17669de518d60dbbb7bb9
    hash_after: c0cf3436edccf120f1d17669de518d60dbbb7bb9
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
---

# Ask

A Copilot session meets the cage a Claude session meets, off the hooks door, and `copilot-runtime.js` leaves the tree.

Copilot decides every hook through `handle` in `copilot-runtime.js`. Under `new` it reaches the Go door nowhere, so the bridge's cage stays alive for it, and [[spec/tickets/the-bridge-server-leaves]] waits.

- a Copilot hook answers off the hooks door, and a guarded call meets a refusal while the door stands down, in a case of `test/level0/copilot.test.js`. `node --test test/level0/copilot.test.js` decides it
- `git ls-files .claude/skills/level0/lib/copilot-runtime.js` answers nothing
- `./RUNME.sh check` exits 0

view: none

from: none

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

Copilot's hook posts each call to the hooks door as the Claude call it stands for, and answers off the door's effects through the cage's own `postOf`, `stepOf`, `guarded` and `refusedText`. `handle` and the shadow leave.

1. `callsOf(event, read)` in .claude/skills/level0/lib/copilot.js turns one Copilot event into the Claude posts it stands for:
   - a shell tool of the runtime's `SHELL` set posts `Bash` with its command
   - an edit tool posts one `Write` a changed file, with the whole text `mutations` in mutations.js answers
   - any other tool posts its own name and arguments
2. The events map: `SessionStart` to `session.start`, `PreToolUse` to `tool.call`, `Stop` to `classic.Stop`, and every other event to `classic.<event>`, as `copilotPost` in src/quack/hook.go names them.
3. A new `src/scripts/copilot-door.js` reads the standing file `hooks.json`, posts each call through `postOf`, and folds the answers through `stepOf`. The first deny stands, and the afters join as context. A door that answers nothing meets `guarded`: a guarded call takes `refusedText` as its deny, and any other event passes.
4. Hook mode in src/scripts/copilot.js calls copilot-door.js in place of `handle` and `shadowsHook`, and keeps `replyOf`, `failureOf` and its log line.
5. These leave the tree:
   - .claude/skills/level0/lib/copilot-runtime.js and test/level0/copilot-runtime.test.js
   - src/scripts/copilot-shadow.js and test/level0/copilot-shadow.test.js
   - the copilot block of test/contract/one-config.test.js
   - `hookVerb` and `copilotPost` in src/quack/hook.go, the `hook` mode in src/quack/main.go, and src/quack/hook_test.go, since the shadow is their one caller

What I weigh: posting Claude's own shapes lets the door's write door, command rules and stop judge Copilot with no Copilot branch in Go. The adapter stays in JavaScript beside `mutations`, which already reads every Copilot edit shape.

I assume: the brief at `session.start` comes off the door once the-brief-leaves-the-bridge lands. Until then a Copilot session starts with no rules, which the copilot setup's own key keeps off.

Risks:
- Copilot-only guards leave with `handle`: the protected paths, the cloud branch rules, the receipt line, and the Stop pass that formats touched files. The ask trades them for the Claude cage. Each one the owner wants back is a ticket of its own.
- an edit touching several files posts several calls, so the door's call count reads more than one a Copilot call
- Copilot's shell call carries no description, so the ticket door may refuse every shell call. A live Copilot host decides it, and a ticket on main carries that trial

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/scripts/copilot.js: hook mode, which calls copilot-door.js
src/scripts/copilot-door.js: answers, new
.claude/skills/level0/lib/copilot.js: eventOf and the new callsOf
.claude/skills/level0/lib/mutations.js: mutations, read unchanged
.claude/skills/level0/hooks/cage.js: postOf, stepOf, guarded and refusedText, read unchanged
src/quack/hook.go: hookVerb and copilotPost, which leave
src/quack/main.go: the hook mode, which leaves
test/contract/one-config.test.js: the copilot block, which leaves

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

test/level0/copilot.test.js: a shell call posts Bash with its command
test/level0/copilot.test.js: an edit call posts one Write a changed file with its whole text
test/level0/copilot.test.js: a Copilot hook answers the door's deny as its reply
test/level0/copilot.test.js: the door's afters answer as the reply's context
test/level0/copilot.test.js: a guarded call meets the refusal while the door stands down
test/level0/copilot.test.js: a session start passes while the door stands down

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

.claude/skills/level0/lib/copilot.js
src/scripts/copilot-door.js, new
src/scripts/copilot.js
.claude/skills/level0/lib/copilot-runtime.js, leaves
src/scripts/copilot-shadow.js, leaves
src/quack/hook.go, leaves
src/quack/hook_test.go, leaves
src/quack/main.go
test/level0/copilot.test.js
test/level0/copilot-runtime.test.js, leaves
test/level0/copilot-shadow.test.js, leaves
test/contract/one-config.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened handle, mutations, eventOf, replyOf, failureOf, the hook mode, shadowsHook, hookVerb, copilotPost, postOf, stepOf, guarded, refusedText and .github/hooks/level0.json, and each claim holds there
the callers list names the hook mode, the adapter, the cage functions it reads, and every reader of what leaves
the first done line meets the door and refusal cases in copilot.test.js, the second the deletes, checked by git ls-files, and the third the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/copilot.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

test/level0/copilot.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every new case fails on its own assertion, against a `callsOf` stub answering no call and an `answers` stub in src/scripts/copilot-door.js answering an empty result. The cases run over a fake standing file and a fake door, which answers the effects a case hands it or falls.

The second done_when line, that `git ls-files` names no runtime file, takes no test: tests-green answers it as a checkpoint, by the command itself.

What surprises me: `refusedText` reads the tool name alone, so the refusal a Copilot write meets names `Write`, the Claude call it stands for, and never the Copilot tool.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the first done_when line meets the door and refusal cases, the second a checkpoint by git ls-files at tests-green, and the third the check
the cases reach a fake standing file and a fake door through the it the adapter takes, and no real door

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- copilot-tool-wait-moves: src/scripts/copilot.js imports `TOOL_WAIT` from copilot-runtime.js beside `handle`, so the wait moves into lib/copilot.js before the runtime leaves

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/scripts/copilot.js src/scripts/copilot-door.js .claude/skills/level0/lib/copilot.js test/contract/one-config.test.js src/quack/main.go src/quack/main_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the files the draft's size names, plus the size golden and main_test.go, whose case hands hook to the index now quack holds no hook mode
the copilot cases run over a fake standing file and a fake door, and the hook script's own fetch is the one real door
the adapter, the door module and the hook road each point at this ticket
`postOf`, `stepOf`, `guarded`, `refusedText` and `HOOKS_FILE` stand in cage.js, and the door module imports them

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

- A research pass for the draft, read only and not yet checked by a gate:
  - A new `src/scripts/copilot-door.js` runs `se-index hook <event>` and maps the door's effects through `stepOf`, `guarded` and `refusedText` in `.claude/skills/level0/hooks/cage.js`, unchanged.
  - A `NAMES` table in `eventOf` in `.claude/skills/level0/lib/copilot.js` maps Copilot's tool names onto Claude's, so the door and `guarded` judge one set of names.
  - `src/scripts/copilot.js` hook mode drops `handle` and `shadowsHook`. `copilotEvents` in `src/quack/hook.go` maps `SessionStart` to `session.start`.
  - `copilot-runtime.js`, `copilot-shadow.js` and their tests leave the tree, with the copilot block of `test/contract/one-config.test.js`.
  - Risk: Copilot's shell call may carry no description the ticket door reads, which refuses every shell call. A live Copilot host decides it.
