---
kind: [[ticket]]
state: open
step: gate
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
      - name: draft-2
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
      - name: person-1
        does: answers the question the engine asks
        by: anyone
        to: engine
        asks: "gate rejects 2 times: no red test decides the config line: the beat and dispatch cases set work.progressAfter through the config fake, and the pre-push case reads a fake schema, so nothing fails while spec/config/level0.schema.json and settings.go carry no work.progressAfter default; add a case reading the real schema default through ./RUNME.sh config or config.Default; the person-on-the-next-stall line rests on over: true, which the dispatch case writes into the fixture by hand; no red case shows claimGroup in take.go writing over: true on a take over a standing hold, so the chain the ask names stays undecided; the draft tests list names src/branches/hook_reads_test.go TestHoldStaleReadsALiveBeatPastTwiceTheProgressSpanStale, which stands nowhere; the red case is src/modules/hooks/githooks_test.go TestPrePushLetsATakeMoveAHoldStalledPastTwiceTheProgressSpan, so the list and the red list disagree; the hook done_when line meets TestTheBeatAsksAStalledBoxForAHandoverOnce in src/branches/beat_test.go, through the Stop hook's branch beat in .claude/settings.json; the draft names no done_when line beside its test, so write that mapping into tests"
        evidence:
          - name: answer
            form: text
            says: the answer, which the step behind this one reads
      - name: draft-3
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
      - name: tests-red-3
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft-3
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
    input: ["design/draft", "design/tests-red", "design/draft-2", "design/tests-red-2", "design/draft-3", "design/tests-red-3"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate", "design/draft-2", "design/draft-3"]
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
        input: ["design/tests-red", "design/tests-red-2", "design/tests-red-3"]
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
  - step: design/tests-red
    hand: box b9ccbd72b78d · claude-code-remote
    hash_before: c34f318540fa182ee5b5f6c11e2348e090278654
    hash_after: c34f318540fa182ee5b5f6c11e2348e090278654
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/branches fails
    inputs:
      - name: design/draft
        hash: fef67274ad2a5f8a
        size: 2094
      - name: [[spec/design_output/work]]
        hash: 2905f4996b0af7be
        size: 45994
    def: 08e16d07b0de477c
  - step: gate
    hand: box b9ccbd72b78d · claude-code-remote · helper-5
    hash_before: ce1a006f1efa059f49d88d0a0d48ef16dcf2ebe1
    hash_after: ce1a006f1efa059f49d88d0a0d48ef16dcf2ebe1
    returns: 1
    why: "no red test decides the config line: the beat and dispatch cases set work.progressAfter through the config fake, and the pre-push case reads a fake schema, so nothing fails while spec/config/level0.schema.json and settings.go carry no work.progressAfter default; add a case reading the real schema default through ./RUNME.sh config or config.Default; the person-on-the-next-stall line rests on over: true, which the dispatch case writes into the fixture by hand; no red case shows claimGroup in take.go writing over: true on a take over a standing hold, so the chain the ask names stays undecided; the draft tests list names src/branches/hook_reads_test.go TestHoldStaleReadsALiveBeatPastTwiceTheProgressSpanStale, which stands nowhere; the red case is src/modules/hooks/githooks_test.go TestPrePushLetsATakeMoveAHoldStalledPastTwiceTheProgressSpan, so the list and the red list disagree; the hook done_when line meets TestTheBeatAsksAStalledBoxForAHandoverOnce in src/branches/beat_test.go, through the Stop hook's branch beat in .claude/settings.json; the draft names no done_when line beside its test, so write that mapping into tests"
  - step: design/draft-2
    hand: box b9ccbd72b78d · claude-code-remote
    hash_before: e40961606d6ce8ce5114dd492862e5091edfd661
    hash_after: 5598ddc77f0eb96fcc60ecd97595c3484b3254ad
    inputs:
      - name: ask
        hash: e62a4e6394147d46
        size: 962
    def: 05d09c51410ea2a3
  - step: design/tests-red-2
    hand: box b9ccbd72b78d · claude-code-remote
    hash_before: fa373a55832fcf68718f742babf7529ea9de3769
    hash_after: fa373a55832fcf68718f742babf7529ea9de3769
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/branches fails
    inputs:
      - name: design/draft-2
        hash: 1221b0c21ada3829
        size: 2885
      - name: [[spec/design_output/work]]
        hash: 2905f4996b0af7be
        size: 45994
    def: 9c7cd4dd4a2dadb8
  - step: gate
    hand: box b9ccbd72b78d · claude-code-remote · helper-8
    hash_before: 1f78a76639cc01538c81561f2b6ac79b489d6bda
    hash_after: 1f78a76639cc01538c81561f2b6ac79b489d6bda
    returns: 2
    why: "no red test decides the config line: the beat and dispatch cases set work.progressAfter through the config fake, and the pre-push case reads a fake schema, so nothing fails while spec/config/level0.schema.json and settings.go carry no work.progressAfter default; add a case reading the real schema default through ./RUNME.sh config or config.Default; the person-on-the-next-stall line rests on over: true, which the dispatch case writes into the fixture by hand; no red case shows claimGroup in take.go writing over: true on a take over a standing hold, so the chain the ask names stays undecided; the draft tests list names src/branches/hook_reads_test.go TestHoldStaleReadsALiveBeatPastTwiceTheProgressSpanStale, which stands nowhere; the red case is src/modules/hooks/githooks_test.go TestPrePushLetsATakeMoveAHoldStalledPastTwiceTheProgressSpan, so the list and the red list disagree; the hook done_when line meets TestTheBeatAsksAStalledBoxForAHandoverOnce in src/branches/beat_test.go, through the Stop hook's branch beat in .claude/settings.json; the draft names no done_when line beside its test, so write that mapping into tests"
  - step: design/person-1
    hand: box b9ccbd72b78d · claude-code-remote · answerer
    hash_before: a192cfd7c52bf678789510ed09f41da3b2ba7591
    hash_after: 57d326dc0f3f092011c3403cb4fc0f5165a695c5
    def: 1e1981e5bafc27a0
  - step: design/draft-3
    hand: box b9ccbd72b78d · claude-code-remote · drafter3
    hash_before: 452ac525a5a3caf2051e0bddff7e81e0a800062a
    hash_after: 452ac525a5a3caf2051e0bddff7e81e0a800062a
    inputs:
      - name: ask
        hash: e62a4e6394147d46
        size: 962
    def: 720f39ea2ba7bd6a
  - step: design/tests-red-3
    hand: box cc2a5a1dc9c0 · claude-code-remote
    hash_before: 6ec17f93cf260b2f1c94d62938f01377a4ddfad9
    hash_after: 6ec17f93cf260b2f1c94d62938f01377a4ddfad9
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/branches fails
    inputs:
      - name: design/draft-3
        hash: 6e06d68e2e3a4c6a
        size: 3020
      - name: [[spec/design_output/work]]
        hash: 2905f4996b0af7be
        size: 45994
    def: 0e7553671e6a287d
    frozen:
      - path: src/branches/beat_test.go
        hash: ec6673c6a5e38ad3
      - path: src/branches/dispatch_test.go
        hash: b98ef31ca9d15bed
      - path: src/modules/hooks/githooks_test.go
        hash: 23fa883c720fe893
      - path: src/modules/settings/settings_test.go
        hash: 3eea3fdab323e368
group: red-freezes-and-stalls-show
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

    ./RUNME.sh branch test src/branches/beat_test.go src/branches/dispatch_test.go src/modules/hooks/githooks_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/branches/beat_test.go
- src/branches/dispatch_test.go
- src/modules/hooks/githooks_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion. The list row of a hold beating with no commit for 40m reads live alone. The beat prints nothing. The dispatch plan carries no stalled part and fires nothing past twice the span. The pre-push door names the old hand as the one writer.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a failing case, and the config line meets the default the schema gains
- the cases reach git, the clock and the config through the fake repo, the injected clock and the config fake

## draft-2

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

For details, see [[spec/design_output/work#a-live-hold-stalls]]. The owner's message reads as the dispatch plan, the one place that tells the owner what stands ready, held and stuck. A live hold past the new limit reads stalled, past twice it stale on a first take and a person's on a take over.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/branches/held.go` `pastHold` calls `staleClaim`
- `src/branches/beat.go` `liveHold` calls `staleClaim`
- `src/branches/free.go` `freeIn` and `stuckIn` call `staleClaim`
- `src/branches/list.go` `rowOf` calls `staleClaim`
- `src/branches/dispatch.go` `planned` calls `staleClaim`
- `src/modules/hooks/githooks.go` `staleTip` calls `HoldStale`
- `src/branches/branch.go` runs `beatVerb`, which the Stop hook in `.claude/settings.json` calls
- `src/branches/take.go` `take` and `src/branches/beat.go` `takeOver` call `claimGroup`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- config line: `src/modules/settings/settings_test.go` `TestProgressAfterStandsInTheWorkSettings`
- list line: `src/branches/beat_test.go` `TestAHoldThatBeatsAndMovesNoCommitStalls`
- owner's message line: `src/branches/dispatch_test.go` `TestDispatchFiresAFreshBoxPastTwiceTheProgressSpan`, which reads the plan's stalled part
- hook line: `src/branches/beat_test.go` `TestTheBeatAsksAStalledBoxForAHandoverOnce`, the beat the Stop hook runs
- dispatch line, fresh box: `src/branches/dispatch_test.go` `TestDispatchFiresAFreshBoxPastTwiceTheProgressSpan` and `src/modules/hooks/githooks_test.go` `TestPrePushLetsATakeMoveAHoldStalledPastTwiceTheProgressSpan`
- dispatch line, a person: `src/branches/beat_test.go` `TestATakeOverAStandingHoldWritesOver` and `src/branches/dispatch_test.go` `TestDispatchNamesAPersonWhereATakeOverStallsAgain`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- the config line: `TestProgressAfterStandsInTheWorkSettings` reads the built-in default off the work settings, from which the schema regenerates
- the take over: `TestATakeOverAStandingHoldWritesOver` shows the take writing `over: true`, so the person case rests on a written mark
- the phantom hook-reads case leaves the list, and the pre-push case stands in its place
- each tests row names the done_when line it decides

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

- the files the approach names stand opened, and each claim checked there
- the callers list names every caller of `staleClaim`, `HoldStale`, `beatVerb` and `claimGroup`
- each done_when line names its case in the tests list
- `work.progressAfter` lands in `settings.go`, and its schema and slash command regenerate off it

## tests-red-2

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh branch test src/branches/beat_test.go src/branches/dispatch_test.go src/modules/hooks/githooks_test.go src/modules/settings/settings_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/branches/beat_test.go
- src/branches/dispatch_test.go
- src/modules/hooks/githooks_test.go
- src/modules/settings/settings_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion. The work settings carry no progress-after, a take over writes no over mark, and the pre-push door names the old hand on a stalled hold. The pre-push case now holds a second row: a hold a take over already moved stays with its hand, which the design keeps for a person.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a failing case, and the config line meets the work settings case
- the cases reach git, the clock and the config through the fake repo, the injected clock and the config fake

## person-1

<!-- gate rejects 2 times: no red test decides the config line: the beat and dispatch cases set work.progressAfter through the config fake, and the pre-push case reads a fake schema, so nothing fails while spec/config/level0.schema.json and settings.go carry no work.progressAfter default; add a case reading the real schema default through ./RUNME.sh config or config.Default; the person-on-the-next-stall line rests on over: true, which the dispatch case writes into the fixture by hand; no red case shows claimGroup in take.go writing over: true on a take over a standing hold, so the chain the ask names stays undecided; the draft tests list names src/branches/hook_reads_test.go TestHoldStaleReadsALiveBeatPastTwiceTheProgressSpanStale, which stands nowhere; the red case is src/modules/hooks/githooks_test.go TestPrePushLetsATakeMoveAHoldStalledPastTwiceTheProgressSpan, so the list and the red list disagree; the hook done_when line meets TestTheBeatAsksAStalledBoxForAHandoverOnce in src/branches/beat_test.go, through the Stop hook's branch beat in .claude/settings.json; the draft names no done_when line beside its test, so write that mapping into tests -->

### answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is text -->

The second reject repeats the first word for word, and `tests-red-2` answers each of its findings. The settings case decides the config line, and a take over writes `over: true` in its own case. The tests list names no phantom case, and each row names its done_when line. The second reviewer accepted, and its hand-back read the gate chapter the first round left. So the draft stands as `draft-2` wrote it, and the next round asks a fresh gate.

## draft-3

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

For details, see [[spec/design_output/work#a-live-hold-stalls]]. The owner's message reads as the dispatch plan, the one place that tells the owner what stands ready, held and stuck. A live hold past the new limit reads stalled, past twice it stale on a first take and a person's on a take over.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/branches/held.go` `pastHold` calls `staleClaim`
- `src/branches/beat.go` `liveHold` calls `staleClaim`
- `src/branches/free.go` `freeIn` and `stuckIn` call `staleClaim`
- `src/branches/list.go` `rowOf` calls `staleClaim`
- `src/branches/dispatch.go` `planned` calls `staleClaim`
- `src/modules/hooks/githooks.go` `staleTip` calls `HoldStale`
- `src/branches/branch.go` runs `beatVerb`, which the Stop hook in `.claude/settings.json` calls
- `src/branches/take.go` `take` and `src/branches/beat.go` `takeOver` call `claimGroup`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- config line: `src/modules/settings/settings_test.go` `TestProgressAfterStandsInTheWorkSettings`
- list line: `src/branches/beat_test.go` `TestAHoldThatBeatsAndMovesNoCommitStalls`
- owner's message line: `src/branches/dispatch_test.go` `TestDispatchFiresAFreshBoxPastTwiceTheProgressSpan`, which reads the plan's stalled part
- hook line: `src/branches/beat_test.go` `TestTheBeatAsksAStalledBoxForAHandoverOnce`, the beat the Stop hook runs
- dispatch line, fresh box: `src/branches/dispatch_test.go` `TestDispatchFiresAFreshBoxPastTwiceTheProgressSpan` and `src/modules/hooks/githooks_test.go` `TestPrePushLetsATakeMoveAHoldStalledPastTwiceTheProgressSpan`
- dispatch line, a person: `src/branches/beat_test.go` `TestATakeOverAStandingHoldWritesOver` and `src/branches/dispatch_test.go` `TestDispatchNamesAPersonWhereATakeOverStallsAgain`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- the repeated reject: `person-1` answers that `tests-red-2` holds a case for each finding, and the draft stands as `draft-2` wrote it
- the config line: `TestProgressAfterStandsInTheWorkSettings` reads the built-in default off the work settings, from which the schema regenerates
- the take over: `TestATakeOverAStandingHoldWritesOver` shows the take writing `over: true`, so the person case rests on a written mark
- the phantom hook-reads case leaves the list, and the pre-push case stands in its place
- each tests row names the done_when line it decides

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

- the files the approach names stand opened, and each claim checked there
- the callers list names every caller of `staleClaim`, `HoldStale`, `beatVerb` and `claimGroup`
- each done_when line names its case in the tests list
- `work.progressAfter` lands in `settings.go`, and its schema and slash command regenerate off it

## tests-red-3

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh branch test src/branches/beat_test.go src/branches/dispatch_test.go src/modules/hooks/githooks_test.go src/modules/settings/settings_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/branches/beat_test.go
- src/branches/dispatch_test.go
- src/modules/hooks/githooks_test.go
- src/modules/settings/settings_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every case the draft-3 tests list names fails on its own assertion. The settings case reads progress-after off the real work settings and finds none, so the config line stands undecided until settings.go carries the default, and the schema regenerates off it. The take-over case finds no over mark on the ticket after take --over. The list row names a hold beating with no commit for 40m live, not stalled. The beat on a stalled hold asks for no handover. The dispatch plan carries no stalled part and fires no fresh box. The pre-push door names the old hand on a hold stalled past twice the span. What surprises: the two gate rejects repeat word for word, and each finding they name already meets a case here.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a failing case: config in settings_test, list in TestAHoldThatBeatsAndMovesNoCommitStalls, owner's message and fresh box in the dispatch cases and the pre-push case, hook in TestTheBeatAsksAStalledBoxForAHandoverOnce, a person in TestATakeOverAStandingHoldWritesOver and TestDispatchNamesAPersonWhereATakeOverStallsAgain
- the cases reach git, the clock and the config through the fake repo, the injected clock and the config fake, and the settings case reads the real work settings by design

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

reject
- no red test decides the config line: the beat and dispatch cases set work.progressAfter through the config fake, and the pre-push case reads a fake schema, so nothing fails while spec/config/level0.schema.json and settings.go carry no work.progressAfter default; add a case reading the real schema default through ./RUNME.sh config or config.Default
- the person-on-the-next-stall line rests on over: true, which the dispatch case writes into the fixture by hand; no red case shows claimGroup in take.go writing over: true on a take over a standing hold, so the chain the ask names stays undecided
- the draft tests list names src/branches/hook_reads_test.go TestHoldStaleReadsALiveBeatPastTwiceTheProgressSpanStale, which stands nowhere; the red case is src/modules/hooks/githooks_test.go TestPrePushLetsATakeMoveAHoldStalledPastTwiceTheProgressSpan, so the list and the red list disagree
- the hook done_when line meets TestTheBeatAsksAStalledBoxForAHandoverOnce in src/branches/beat_test.go, through the Stop hook's branch beat in .claude/settings.json; the draft names no done_when line beside its test, so write that mapping into tests

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
