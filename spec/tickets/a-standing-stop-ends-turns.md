---
kind: [[ticket]]
state: open
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/reviewing]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: design/draft
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: reflect
        does: names the class of error in the findings, and the fix for the class
        when: returned
        input: verdict
        evidence:
          - name: class
            form: text
            says: the class of error the findings describe, and the fix for the class
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
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
  - name: verdict
    does: reads every hunk against the ask and the approach
    not: implement
    on_fail: implement/reflect
    reads: [[spec/guidance/review/reviewing]]
    input: ["diff", "implement"]
    to: retro
    checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
group: the-bridge-keeps-transport
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: implement/tests-green
record:
  - step: design/draft
    hand: box fa49097ce66c · claude-code-remote
    hash_before: ceeca8c80a8f205e61c7a4b6ecb98423be92406d
    hash_after: ceeca8c80a8f205e61c7a4b6ecb98423be92406d
  - step: design/review
    hand: box fa49097ce66c · claude-code-remote · helper-2
    hash_before: f972da3163683c379b9ee4ff74d44613060a0318
    hash_after: f972da3163683c379b9ee4ff74d44613060a0318
  - step: implement/tests-red
    hand: box fa49097ce66c · claude-code-remote
    hash_before: b7fe463450e8349d3d00baa742b3a2b067355dd2
    hash_after: 5e6cae67261ab664ac0c1007bd890ea764f0be7f
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 0dc06f1e06eeba71b84efb84be3341495d7a6412
    hash_after: e9c9211abbdb5697d6451eea9282377df9531a46
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
---

# Ask

a turn that ends stays ended, and the agent stops paying for each close

the stop hook reopens the turn again and again while work waits

- a session ending its turn under a standing hold gets no second prompt
- test/level0/stop-door.test.js covers a hold meeting a standing stop

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

- one change in the stop door
- one case in the file the ask names

**What stands.** The hold lives in the config. `holdsCall` reads it at every
call, and `dropsHold` writes it back to `off` at the turn's end. `onStop` reads
that same key to vote.

| the door | when it runs | what it does with the hold |
|---|---|---|
| `holdsCall` | every tool call | reads it, and marks the box |
| `dropsHold` | `turn.complete` | writes `off` |
| `onStop` | `classic.Stop` | reads it, and votes |

**The fault.** The two rules ending a turn for the owner read the hold `onStop`
sees. A `turn.complete` reaching the server first leaves that read at `off`.
Both rules lose there, `work-waiting` wins, and the turn reopens over the
standing work. `box.held` carries the same value, and the same handler clears
it, so it helps nothing.

**The change.** A hold standing anywhere in a turn ends that turn, whatever
order the two events arrive in.

| what changes | where |
|---|---|
| `dropsHold` leaves a mark naming the hold it drops | `src/bridge/stop.js` |
| `sawPrompt` clears that mark, because a prompt opens a turn | the same file |
| `onStop` reads the config, then the mark | the same file |

The mark is one field on the box, beside `box.held` and `box.claim`. It lives
as long as the counts the tooth holds, and a restart drops it the same way.

**The case.** `test/level0/stop-door.test.js` drives `onStop` over a fake box
already. The new case drops the hold first, the way the turn's end does, and
reads the turn ending with nothing after it.

| the case | what it reads |
|---|---|
| a hold at `stop`, dropped before the stop | the turn ends, and no block prompts |
| a hold at `stop`, and the stop first | the turn ends, as it does today |
| no hold, and work waiting | the turn holds, as it does today |

**What this leaves.** The order the two events arrive in stands unmeasured
here. This box logs neither one, because its turns run long and its server
stands down at the session start. The change makes that order stop mattering,
so the measurement costs nothing to skip.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
- The fault reads true: `dropsHold` fires at `turn.complete`, and the vote runs later at `classic.Stop`.
- The rules at 85 and 84 read the hold `onStop` reads, and `work-still-stands` at 80 wins under `off`.
- The mark on the box matches the tooth's lifetime, so one reload drops both together.
- The approach holds to the two files the ask names, and each of its three cases reads one thing.
- `dropsHold` skips the `agentId` guard its neighbours carry, so a helper's turn end marks the box.
- Say whether the mark guards on `agentId`, and settle it in the change.
- Say how the case reaches a standing hold, because the fixture in `stop-door.test.js` pins `hold` to `off`.
- The hold cases live in `stop-hold.test.js`, whose fixture drives `dropsHold` and `sawPrompt` today.
- Add a line for the mark to the chapter The hold, under [[spec/design_output/stop#the-hold]].
- `./RUNME.sh check` answers 1 here, over a Vale timeout on a style file.
- `./RUNME.sh branch review` answers 0, reads check passing, and names a retro as the one fix standing.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Four cases stand in `test/level0/stop-door.test.js`, and two of them fail on
their own assertion.

| the case | what it reads |
|---|---|
| a hold standing at the stop | the turn ends, which holds today |
| a hold the turn's end drops | the turn ends, and it holds open instead |
| a hold at finish the turn's end drops | the same, at the weaker strength |
| a prompt after the drop | the turn holds open, which holds today |

The first and the last pass green, so they guard the fix from reaching past
what the ask names. The two in the middle carry the fault.

**What surprises.** The fixture of that file pins the hold at `off`, and its
rules name no owner rule. So the two rules the hold fires stand nowhere in it,
and a case over a hold needs both written in. A reader taking the fixture as
the whole stop door reads a door with no owner in it.

The turn holding open reads `the last line names no stop reason` at 50. The
queue rule at 80 stands quiet, because the fake tree carries no free ticket.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the cases stand in the one file the ask names, and nothing else changes
- the box reaches its disk and its process through the fakes the fixture holds
- a comment over each case points at this ticket, which carries the approach

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change reaches the stop door and the chapter owning the hold, and the ask names both
- the cases drive the door over the fake disk and the fake process the fixture holds
- each case and each new line points at the ticket or the chapter carrying the approach

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

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
