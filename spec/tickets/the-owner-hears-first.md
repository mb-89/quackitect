---
kind: [[ticket]]
state: closed
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
group: the-review-lands-overnight
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: verdict
record:
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 952caab3791e7cd0658ee91ec1c163b27251778c
    hash_after: 952caab3791e7cd0658ee91ec1c163b27251778c
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-2
    hash_before: 714c9943736ffc1a60218acef5732ddb2fbb0624
    hash_after: 714c9943736ffc1a60218acef5732ddb2fbb0624
    returns: 1
    why: "design: two new actionables lift `spec/guidance/working.md` to seventeen rules, past the cap of fifteen.; design: `VoiceShape.GuidanceCap` then refuses the note, and `./RUNME.sh check` fails.; design: fold the question row into rule 6 and the log line into rule 4, and the cap holds.; craft: `Number(skips) || 1` turns 0 into 1, so `demands` needs more than a lower floor.; craft: `answer-door.test.js` and `note-answer.test.js` assert the first call passes, and the approach leaves both out.; craft: the chapter \"The first call is free\" in `spec/design_output/level0.md` needs a rewrite too.; craft: the stated cost misses the refusal, since a hand calling a tool first sees that call refused.; craft: the ask door keeps its grace, because `grace.update` stands at 5.; craft: `onAgent` also meets a helper's own Agent call, so the approach says what a helper gets."
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 2db4e444b176510a03e2ee752d1e9832e917a0cc
    hash_after: 2db4e444b176510a03e2ee752d1e9832e917a0cc
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-4
    hash_before: a99c8debed32dbef9e0ee6f1792518ba9d6caeab
    hash_after: a99c8debed32dbef9e0ee6f1792518ba9d6caeab
  - step: implement/tests-red
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 4b7f7070cf930edbe5367475513626fc207d6546
    hash_after: 4b7f7070cf930edbe5367475513626fc207d6546
    answered:
      - name: tests
        exit: 1
        said: assertion, 7 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box dcd73916add7 · claude-code-remote
    hash_before: c1b755eac29ca4cde7ee6c1d49764a8cc76d1ee4
    hash_after: c1b755eac29ca4cde7ee6c1d49764a8cc76d1ee4
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box dcd73916add7 · claude-code-remote
    hash_before: a731762ec556920120cbe555ce19864becb46dcd
    hash_after: a731762ec556920120cbe555ce19864becb46dcd
    answered:
      - name: tests
        exit: 0
        said: green, 56 test(s) pass in 5 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box dcd73916add7 · claude-code-remote · helper-9
    hash_before: 0d19aefd0840f557a33f06362dbceaac426f6a07
    hash_after: 0d19aefd0840f557a33f06362dbceaac426f6a07
reason: done
---

# Ask

The owner reads an answer to each prompt before the hand's next call, and each question keeps its row until it closes. The log carries a line for each finished piece, so the owner follows the work.

A mid-turn prompt waits behind tool calls or a helper the turn waits on, and the owner asks twice. An owner question drops out of the answer, and the log shows little of the hand's own work.

- the answer gate refuses the first tool call after an unanswered prompt
- the Agent gate refuses `run_in_background: false`
- `spec/guidance/working.md` gives each owner question its own row until it closes
- `spec/guidance/working.md` asks one log line for each finished piece
- a case under `test/level0` covers both gates
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Two gates in the server, and two actionables in the working guidance.

| part | the file | what changes |
|---|---|---|
| the prompt gate | `src/bridge/answer.js` | `onPromptSubmit` opens its demand with no skip, so the first call after a prompt asks for the reply |
| the skip floor | the same | `demands` reads `skips` as a number with a floor of `0`, so a `0` stays `0` |
| the ask door | `src/bridge/ask.js` | keeps its grace through `asks(box, GRACE_UPDATE)`, which reads `1` at least |
| the Agent gate | a new `src/bridge/agent.js` | `onAgent` refuses an `Agent` call carrying `run_in_background: false`, and names the background road |
| a helper's call | the same | a call carrying an `agentId` meets the same gate, because a helper waiting on its own helper blocks the same way |
| its wiring | `src/bridge/server.js` | `TOOLS.Agent` names `onAgent`, beside `Read` and `Bash` |
| the question row | `spec/guidance/working.md` | rule 2 gains a sentence: each owner question keeps its own row in the opening table until it closes |
| the log line | the same | rule 4 gains a sentence: each finished piece takes one `mcp__level0__report` line |
| the cap | the same | the note stays at the rules `VoiceShape.GuidanceCap` admits |
| the design | `spec/design_output/level0.md#the-owners-prompt-comes-first` | the Agent row stands there |
| the free call | `level0.md`, the chapter on the first call | says the first call meets the gate |

The cases:

- `answer.test.js`: after an owner prompt, the first `Bash` call answers `needs: reply`, and a helper's call passes
- `answer-door.test.js` and `note-answer.test.js`: the cases that read the first call as free now read the gate
- a new `agent.test.js`: `run_in_background: false` refuses, and an Agent call without it passes

The callers:

- `onToolCall` runs `holdsForAnswer` before the tool's door, so the gate meets every call of the session's own
- `ask.js` calls `demands` with its grace, and keeps it
- `onAgentSpawn` in `guidance.js` reads the spawn after the gate, and keeps its road

The answers to the earlier review:

- the cap on the guidance: both lines fold into rules 2 and 4
- `Number(skips) || 1`: the read keeps a `0`
- the cases reading the first call as free: they change with the gate
- the chapter on the free call: it changes
- the ask door at a grace of `0`: its floor stays `1`
- a helper's Agent call: it meets the gate

The cost: a hand calling a tool before it writes the reply meets a refusal, writes the reply, and calls again.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
- design: rules 2 and 4 take the two lines, so the note keeps fifteen rules and the cap holds.
- design: the prompt demand opens with no skip, so the first call asks the bridgehead for the reply.
- design: `onAgent` in `TOOLS` meets the call after `holdsForAnswer`, so both gates stand.
- craft: `ask.js` passes the raw config read, so the approach names where the floor of 1 stands.
- craft: `asksForUpdate` runs first and can replace an open prompt demand with the grace of 5.
- craft: the chapter "A helper ends no turn" says a helper gets no gate, and the Agent gate changes that.
- craft: the approach names the field `onAgent` reads, and a flat `e?.run_in_background` fits `bash.js`.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/answer.test.js test/level0/answer-door.test.js test/level0/note-answer.test.js test/level0/grace-asks.test.js test/level0/agent.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Seven cases fail on their own assertion. The case on the ask floor passes today, and it guards the floor once `demands` reads a zero.

- `answer.test.js`: the first `Bash` call after a prompt passes today, and the case asks for the reply.
- `answer-door.test.js` and `note-answer.test.js`: the first call reads the gate now.
- `grace-asks.test.js`: `demands` reads a zero as one today.
- `grace-asks.test.js`: an update ask replaces the open prompt demand, and the first call passes.
- `agent.test.js`: a stub `onAgent` passes every call, so both refusal cases fail.
- The stub stands so the case loads, since a missing module reads as a build failure.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The cases touch the answer door, the ask door and a new Agent door, and the ask names each.
- Each case reads a fake box, and the ask door reads a fake disk.
- Each case carries a pointer to the design chapter it holds.

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

    ./RUNME.sh lint src/bridge/answer.js src/bridge/ask.js src/bridge/agent.js src/bridge/server.js spec/guidance/working.md spec/design_output/level0.md .claude/skills/level0/lib/answer.js test/level0/agent.test.js test/level0/grace-asks.test.js test/level0/answer.test.js test/level0/answer-door.test.js test/level0/note-answer.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The change touches three doors, the server wiring, the working note and the design note, and the ask names each.
- The Agent door reads the event and the log, and each case hands it a fake log.
- Each door carries a pointer to its chapter in `spec/design_output/level0.md`.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/answer.test.js test/level0/answer-door.test.js test/level0/note-answer.test.js test/level0/grace-asks.test.js test/level0/agent.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The owner's prompt now meets the next call, and a helper the turn waits on meets a refusal.

- `demands` reads a grace with a floor of zero, and a prompt opens its demand with none.
- The first call after a prompt asks the bridgehead for the reply.
- `ask.js` keeps the update grace at one at least, and waits behind an unpaid prompt.
- `onAgent` in `src/bridge/agent.js` refuses `run_in_background: false`, and a helper's call meets it too.
- `spec/guidance/working.md` asks a row for each owner question, and a log line for each finished piece.
- `spec/design_output/level0.md` holds the chapters "The first call asks" and "An Agent call runs behind".

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The diff touches the answer door, the ask door, the Agent door, the server wiring and two notes.
- The cases read fake boxes, and the server case reads the fake disk, clock, log and process.
- Each door points at its chapter in `spec/design_output/level0.md`.

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- spec/tickets/the-owner-hears-first.md
- .claude/skills/level0/lib/answer.js
- spec/design_output/level0.md
- spec/design_output/stop.md
- spec/guidance/working.md
- src/bridge/agent.js
- src/bridge/answer.js
- src/bridge/ask.js
- src/bridge/server.js
- src/bridge/guidance.js
- test/level0/agent.test.js
- test/level0/answer-door.test.js
- test/level0/answer.test.js
- test/level0/grace-asks.test.js
- test/level0/note-answer.test.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass
- The prompt demand opens with a grace of zero, so the first call asks for the reply.
- `onAgent` refuses `run_in_background: false`, and `TOOLS.Agent` wires it after the answer gate.
- Rule 2 gives each owner question a row, and rule 4 asks a report line a piece.
- `agent.test.js` and `answer.test.js` cover both gates, and each feeds a bad call.
- `./RUNME.sh check` exits 0.
- The handback carries no retro.
- craft: the canary chapter now points at `stop#the-grace`, and that chapter says nothing of a warning.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- `level0.md` holds the Agent door in one chapter, and the helper chapter points at it.
- The floor of the update grace stands in the chapter "The first call asks" alone.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
