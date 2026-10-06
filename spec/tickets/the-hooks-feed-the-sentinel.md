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
group: failures-stand-registered
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 7fa3340f46d52f58b440fa8dc2ce458589236066
    hash_after: 7fa3340f46d52f58b440fa8dc2ce458589236066
    inputs:
      - name: ask
        hash: 63e9e156266d562d
        size: 658
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 7d04e8a322f77acadf6488fe0be57bb67802cbe7
    hash_after: 7d04e8a322f77acadf6488fe0be57bb67802cbe7
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: 1052dcc7a5584885
        size: 1931
    def: 08e16d07b0de477c
  - step: gate
    hand: box 83c32b2b4d58 · claude-code-remote · helper-4
    hash_before: 4e6da9d7216d6220424e99701b98d8304cb84618
    hash_after: 4e6da9d7216d6220424e99701b98d8304cb84618
    inputs:
      - name: design/draft
        hash: 1052dcc7a5584885
        size: 1931
      - name: design/tests-red
        hash: 2826846c8851c458
        size: 789
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: e5f353334531b6668dc7d636565726c2603fc90b
    hash_after: cda41d1102bcee6690aa74816d025ccac3b0ebe7
    answered:
      - name: lint
        exit: 0
        said: green
    def: f150b8c0dc20fe45
---

# Ask

A watch in the failure registry fires in the running index, so a failure a watch names reaches the log without a hand raising it.

`failure.NewSentinel` runs in tests alone, and no code calls `Hear`. Every watch the registry holds stays deaf, and `sentinel-fires-watches` closed without this wiring among its lines.

- the hooks door builds one sentinel over the registry, the clock door and the process door. It hands the sentinel each post the bridge sends
- a fired failure writes its row through the log
- a test under `src/modules/hooks` posts an event a watch matches, over the fakes, and reads the row in the log
- ./RUNME.sh check exits 0

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

The hooks door stays pure: hooks.Outside gains Hear, a hand taking failure.Event, and None hears nothing. Hook in src/modules/hooks/hooks.go hands each post to Hear before it answers, as Event{Kind: the post's event as the door names it, such as tool.call, Text: the event payload as compact JSON}, so a watch matches a tool's command inside it. The wiring builds the sentinel: sentinelOver in a new src/quack/sentinel.go takes the root, a failure.Timer, a failure.Runner and a row writer, loads failure.Load(failure.Dir{Root: root}), and answers Hear. A fired failure writes raised.Row, stamped through the clock door at logStamp, through the writer. listens in src/quack/main.go builds it over clock.New(), failure.Shell{Root: root} and hooks.ShadowTo over the session log, and hands its Hear to the door. The design note's watch example names event tool, which no post carries, so it reads tool.call.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/main.go: listens, which builds hooks.Outside
- src/modules/hooks/hooks.go: Hook, which hands each post on
- src/modules/hooks tests building hooks.Outside, which leave Hear unset and hear nothing

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/hooks_test.go: TestHookHandsEachPostToHear
- src/quack/sentinel_test.go: TestSentinelOverWritesTheFiredRow

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/hooks/hooks.go
- src/modules/hooks/hooks_test.go
- src/quack/sentinel.go
- src/quack/sentinel_test.go
- src/quack/main.go
- spec/design_output/failures.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every name the approach uses stands opened: NewSentinel, Hear, Event, Load, Dir, Shell, Raised.Row, Hook, New, Outside, ShadowTo, listens and the clock's After
the callers list names listens, the one builder of hooks.Outside in the wiring, and Hook, the one entry of a post
each done_when line meets a test: the door's case hands a post on, the wiring's case reads the fired row over the fakes, and the check decides the last line

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/hooks/hooks_test.go src/quack/sentinel_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/hooks_test.go
- src/quack/sentinel_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both fail on their own assertion: the door hears nothing, and the wiring writes no row. Go reads a missing name as a build fault, so the Hear field and a sentinelOver hearing nothing stand as stubs beside the tests. No node under spec/failures declares a watch yet, so the wiring case brings its own node through the fake folder.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the done_when lines meet the door's case, the wiring's case and the check, and both cases fail today
the cases reach the clock, the process door and the folder through their fakes: FakeClock, FakeRunner and FakeDir, and the log writer through a hand the case holds

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- hooks-test-reads-fired-row: src/modules/hooks/hooks_test.go, the done_when line asks for a test under src/modules/hooks that posts a matched event over the fakes and reads the row in the log, and TestHookHandsEachPostToHear reads only the heard event while the row lands in src/quack/sentinel_test.go. Add a case to hooks_test.go that sets Hear to failure.NewSentinel over FakeDir, FakeClock and FakeRunner, firing through a say the case holds, posts tool.call with the watched command, and reads the row.
- wiring-names-listens-hooks: src/quack/main.go, the callers list names listens, and the hooks.Outside builder is listensHooks. Wire Hear there, and fix the callers line in place.
- sentinel-say-error-lands: src/quack/sentinel.go, sentinelOver drops the error say returns, since the fire hand returns nothing. Raise or log a failed write so a lost row shows.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches hooks.go and the design note the size names, with sentinel.go and main.go landed by the fix children
- the door reaches Hear alone, which the cases fill with a recording hand and with a sentinel over FakeDir and FakeRunner
- a comment over hears names the approach by its ticket
- the event kind reads the post's own event name, and the watch example in spec/design_output/failures.md now names tool.call

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

The draft's approach and callers name `listens` in `src/quack/main.go`. The builder of `hooks.Outside` is `listensHooks`, which now hands `Hear` through `sentinelHere` in `src/quack/sentinel.go`. The draft's chapter stays as the engine wrote it.
