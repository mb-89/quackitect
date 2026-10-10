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
group: red-freezes-and-stalls-show
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b9ccbd72b78d · claude-code-remote
    hash_before: e5ddcd0a2929bbadc11bfa89b57d657a60fdf6b9
    hash_after: e5ddcd0a2929bbadc11bfa89b57d657a60fdf6b9
    inputs:
      - name: ask
        hash: e62a4e6394147d46
        size: 962
    def: c01ae0f2ace0cecb
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

The engine tells activity from progress. A box that beats but moves no commit shows up within a set limit, gets asked for a handover, and loses its hold to a fresh box past twice the limit, then to a person. The owner reads a stuck branch in `branch list` and in the owner's message, in place of a hold that reads live.

A beating but stuck box keeps its claim live forever. One box held `work/hooks-v1-hold-the-line` with beats and no commit for an hour, and no hand took the branch over.

- `./RUNME.sh config` reads a `work.progressAfter` setting with a default
- a branch test with an injected clock names a branch beating with no tip move past `work.progressAfter` in `branch list`
- a branch test names that branch in the owner's message
- a hook test shows the Stop hook of that box asking for a handover
- a dispatch test with an injected clock fires a fresh box on a hold past twice `work.progressAfter`, and names a person on the next stall

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

For details, see [[spec/design_output/work#a-live-hold-stalls]]. The owner's message reads as the dispatch plan, the one place that tells the owner what stands ready, held and stuck. A live hold past the new limit reads stalled, past twice it stale on a first take and a person's on a take over.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/branches/held.go pastHold calls staleClaim
- src/branches/beat.go liveHold calls staleClaim
- src/branches/free.go freeIn calls staleClaim
- src/branches/free.go stuckIn calls staleClaim
- src/branches/list.go rowOf calls staleClaim
- src/branches/dispatch.go planned calls staleClaim
- src/modules/hooks/githooks.go staleTip calls HoldStale
- src/branches/branch.go verb table runs beatVerb, which the Stop hook in .claude/settings.json calls
- src/branches/take.go take and src/branches/beat.go takeOver call claimGroup
- src/quack/hook_verb.go hookVerb fills hooks.Push

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/branches/beat_test.go TestAHoldThatBeatsAndMovesNoCommitStalls
- src/branches/beat_test.go TestTheBeatAsksAStalledBoxForAHandoverOnce
- src/branches/dispatch_test.go TestDispatchFiresAFreshBoxPastTwiceTheProgressSpan
- src/branches/dispatch_test.go TestDispatchNamesAPersonWhereATakeOverStallsAgain
- src/branches/hook_reads_test.go TestHoldStaleReadsALiveBeatPastTwiceTheProgressSpanStale

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/settings/settings.go
- spec/config/level0.schema.json
- .claude/commands/se-config-work-progressAfter.md
- spec/schemas/ticket.schema.yaml
- src/branches/beat.go
- src/branches/free.go
- src/branches/group.go
- src/branches/take.go
- src/branches/list.go
- src/branches/dispatch.go
- src/modules/hooks/githooks.go
- src/quack/hook_verb.go
- spec/design_output/work.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- beat.go, free.go, take.go, dispatch.go, githooks.go and hook_verb.go stand opened, and each claim checked there
- the callers list names every caller of staleClaim, HoldStale, beatVerb and claimGroup
- each done_when line names a case in the tests list
- work.progressAfter lands in settings.go, and its schema and slash command regenerate off it

## tests-red

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
