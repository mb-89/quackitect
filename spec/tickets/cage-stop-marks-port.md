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
    hand: box d8901afed4d6 · claude-code-remote
    hash_before: 85a30ba6c16a2b755a47bcaf4b252b961e05a847
    hash_after: b75b39f6c3bc12ee253a3a2caf150c947bbf8c6c
    inputs:
      - name: ask
        hash: 7b1c2142fd07b98e
        size: 1081
      - name: [[spec/tickets/cage-stop-rules-port]]
        hash: 29ccd1d3cec3f09e
        size: 761
      - name: [[spec/tickets/the-bridge-server-leaves]]
        hash: f6037bc7affa843e
        size: 247
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d8901afed4d6 · claude-code-remote
    hash_before: 4d84db27f03ced768ce1e6ff9e1a4ef5dc731b0e
    hash_after: 4d84db27f03ced768ce1e6ff9e1a4ef5dc731b0e
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: 7907f0e68e795da1
        size: 3154
    def: 08e16d07b0de477c
  - step: gate
    hand: box d8901afed4d6 · claude-code-remote · helper-4
    hash_before: 0ff7d960a8181c589205634a452909c946be42c4
    hash_after: 0ff7d960a8181c589205634a452909c946be42c4
    inputs:
      - name: design/draft
        hash: 7907f0e68e795da1
        size: 3154
      - name: design/tests-red
        hash: 2fc62139bc9e88c2
        size: 1090
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d891eb165fd6 · claude-code-remote
    hash_before: ccfb3c17310e2be24d1d20206923c144f6869984
    hash_after: 38b9366ccdbc4fdfb2459f9233092391cff7a641
    answered:
      - name: lint
        exit: 0
        said: "test/level0/cage-shadow.test.js:44:65: Modal: This register holds the modals can, must, will. Say what is, or name the o"
    def: f150b8c0dc20fe45
---

# Ask

The `hooks` IO module writes the handover marks the bridge writes, and reads a retro hold as the bridge reads it. The parts:

- the due mark, off `marksDue` and `dropsDue` in `src/scripts/ephemeral.js`, which `src/bridge/handover.js` calls at a measure and at a turn's end
- the clear mark, off `dropsClear` in `src/bridge/handover.js`
- the retro in hand, off `retroInHand`, which reads the hold's hand against `handOf` in `src/scripts/pull-hand-of.js`

The stop rules port in [[spec/tickets/cage-stop-rules-port]] blocks a turn's end on the handover alike, and writes none of these marks.

Without it, the pull hands no handover once [[spec/tickets/the-bridge-server-leaves]] lands, since no side writes the due mark. A helper's retro hold keeps a due session from clearing too.

- a measure past the fill writes the due mark, and a clear drops it, in a case of `src/modules/hooks`. `go test ./src/modules/hooks/...` decides it
- a retro hold of another hand leaves the session's handover due, in a case of `src/modules/hooks`
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

The stops fold decides the marks on each event, and the door writes them, the way the holds fold decides its drops and `drops` in holds.go writes them.

1. `Said` in src/modules/hooks/stops.go gains `Marks`: a due mark carrying the tokens and the key, a due drop, and a clear drop. `measures` sets the due mark where it puts the session in finish, as `marksDue` in handover.js does. It sets the due drop where the queue no longer clears, as `measures` there drops it.
2. The turn's end sets the clear drop where a clear stands held and the queue no longer clears, as `dropsClear` does. It sets the due drop where the asks pass the cap.
3. `Outside` gains `Mark func(root string, marks Marks) error`. `Door.marks` runs after `drops` in `Door.Hook`, reads the said of the newest event, and hands the marks over.
4. src/quack/main.go wires `Mark`. It writes and removes the due file that `DUE` in lib/folders.js names, and removes each clear hold under the holds folder.
5. `heldFile` in stopfacts.go reads the hold's `hand`. `Outside` gains `Hand func(root string) string`, a port of `handOf` in pull-hand-of.js: the box id, the session file's id and harness, and the harness the environment names.
6. `stoppedOf` counts a retro hold as the session's own alone where its hand matches `Hand`. A door with no `Hand` reads every retro as its own, as today.

What I weigh: the fold stays pure, and one IO function per outside write holds the fake at the module's edge. I assume the index process shares the session's environment on a box, since the bridge starts it from inside the session.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/hooks.go: Door.Hook, which calls marks after drops
- src/modules/hooks/hooks.go: Outside, which gains Mark and Hand
- src/modules/hooks/stops.go: Stops fold, measures and the turn's end
- src/modules/hooks/stopfacts.go: stoppedOf, holdsIn and heldFile
- src/quack/main.go: the hooks Outside literal, which wires Mark and Hand
- src/modules/hooks/hooks_test.go: the test Outside

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/marks_test.go: a measure past the fill writes the due mark, and a clear drops it
- src/modules/hooks/marks_test.go: a retro hold of another hand leaves the session's handover due
- src/modules/hooks/marks_test.go: a retro hold of the session's own hand keeps the conversation
- src/quack/hand_test.go: the hand reads the box, the session and the harness, as handOf reads them

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/hooks/stops.go
- src/modules/hooks/stopfacts.go
- src/modules/hooks/hooks.go
- src/modules/hooks/marks.go, new
- src/modules/hooks/marks_test.go, new
- src/quack/main.go
- src/quack/hand.go, new
- src/quack/hand_test.go, new

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened handover.js measures, clearsHere, retroInHand, holdsForHandover and dropsClear, ephemeral.js marksDue and dropsDue, pull-hand-of.js handOf, stops.go measures, stopfacts.go stoppedOf and isRetro, holds.go drops and main.go, and each claim holds there
- the callers list names Door.Hook, both Outside literals, the fold and the facts
- the first done line meets the due mark case, the second the retro hand case, and the third the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/marks_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Two cases stand red on their own assertion. A measure past the fill writes no due mark, since the fold decides the handover and nothing writes it. A retro hold of another hand keeps the session from going due, since isRetro reads every retro as the session's own.

The own hand case passes today, and it holds the edge: the session's own retro keeps its conversation.

The departure: the cases read the marks off the disk under a temp root, so they compile against today's module. So the module writes the marks through its own disk, as it reads the holds, and Outside gains no Mark. The hand reads the box file, the session file and the environment inside the module too, so Outside gains no Hand, and src/quack/main.go stays as it stands.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the first done line meets the due mark case, the second the retro hand case, and the third the check at tests-green
- the doors the tests reach have fakes: a temp root the module reads and writes, and the environment set per case

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

The approach answers the ask, and a red case decides every done_when line no command answers.

| the done_when line | what decides it | where it stands |
|---|---|---|
| a measure past the fill writes the due mark, and a clear drops it | `TestAMeasurePastTheFillWritesTheDueMarkAndADroppedClearDropsIt` in marks_test.go | red on `a measure past the fill writes no due mark` |
| a retro hold of another hand leaves the session's handover due | `TestARetroHoldOfAnotherHandLeavesTheSessionsHandoverDue` in marks_test.go | red on `a helper's retro hold keeps the session from going due` |
| `./RUNME.sh check` exits 0 | the check at implement/tests-green | open |

I ran `go test ./src/modules/hooks/...` over the cases marks_test.go holds: each of the two above fails on its own assertion, and `TestARetroHoldOfTheSessionsOwnHandKeepsTheConversation` passes.

The departure, weighed:

| what I weigh | what I find |
|---|---|
| the module writes the marks through its own disk | `stoppedOf`, `holdsIn` and `isRetro` in stopfacts.go already read the tree through `disk{root}`, and hooks.go imports `os` as an IO module may, so the write lands at a seam the module already holds |
| `Outside` gains no `Mark`, so the write stands beside `drops`, which goes out through `Outside.Drop` | one door then holds two seams for two writes. The case decides the behaviour over a temp root either way, and keeping the write in one function in marks.go leaves a later port swap one spot to touch |
| `Outside` gains no `Hand`, so the module reads the environment itself | the drafted port reads the same process environment, so the departure carries the draft's own assumption and adds no risk to it. It gives up the hand a case could hand in, and `t.Setenv` stands in its place |
| `src/quack/main.go` stays as it stands | the ask names the module, and a port nothing wires buys nothing |
| the cases spell the due mark and the holds folder again | `holdsFolder` in stopfacts.go spells a folder again under a pointer at lib/folders.js, so the departure follows the practice the package holds |

The departure keeps what the draft argued for: the fold decides the marks and the door writes them, so the fold stays pure.

What the build fixes within its own diff:

| where | what to fix |
|---|---|
| the draft's approach, its first point | `Said` stands in fold.go, not stops.go. `Said.Drops` there serves the holds fold alone, so `Marks` on the same type follows the standing shape |
| the draft's `size`, `callers` and `tests` | each still names `src/quack/main.go`, `src/quack/hand.go`, `src/quack/hand_test.go` and the test `Outside`, which the departure drops. Write the lists as the change stands, since the implement checklist reads them |
| marks.go | name the due mark's path once, under a pointer at `DUE` in lib/folders.js, and read it in the case off the module |
| marks.go | write nothing where the root reads empty, so a post naming no root writes under no working folder |
| `isRetro` and `stoppedOf` | a hand reading empty counts every retro as the session's own, as today, so a box naming no hand keeps what it has |
| implement/tests-green | `TestARetroHoldOfTheSessionsOwnHandKeepsTheConversation` passes today because nothing writes a due mark at all. Say under `says` what turns it red, so the case decides the hand match |

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the hooks module alone. The size golden takes the final length of a closed ticket, since the check reds on it
- the disk under a temp root and the environment per case stand as the doors the cases reach
- each new function points at this ticket or at the section it ports
- each runtime path stands once in marks.go, beside a comment naming its owner

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
