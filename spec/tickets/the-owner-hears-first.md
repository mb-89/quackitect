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
group: the-review-lands-overnight
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/draft
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
| the skip floor | the same | `demands` takes `0` skips, and the ask door keeps its grace through `asks(box, GRACE_UPDATE)` |
| the Agent gate | a new `src/bridge/agent.js` | `onAgent` refuses an `Agent` call carrying `run_in_background: false`, and names the background road |
| its wiring | `src/bridge/server.js` | `TOOLS.Agent` names `onAgent`, beside `Read` and `Bash` |
| the question row | `spec/guidance/working.md` | an actionable: each owner question keeps its own row in the answer's opening table until it closes |
| the log line | the same | an actionable: each finished piece takes one `mcp__level0__report` line |
| the design | `spec/design_output/level0.md#the-owners-prompt-comes-first` | the first call meets the gate, and the Agent row stands there |

The cases:

- `answer.test.js`: after an owner prompt, the first `Bash` call answers `needs: reply`, and a helper's call passes
- a new `agent.test.js`: `run_in_background: false` refuses, and an Agent call without it passes

The callers:

- `onToolCall` runs `holdsForAnswer` before the tool's door, so the gate meets every call of the session's own
- `ask.js` calls `demands` with its grace, and keeps it
- `onAgentSpawn` in `guidance.js` reads the spawn after the gate, and keeps its road

The cost: a hand answering a prompt with a tool call first pays one round trip for the reply.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail
- design: two new actionables lift `spec/guidance/working.md` to seventeen rules, past the cap of fifteen.
- design: `VoiceShape.GuidanceCap` then refuses the note, and `./RUNME.sh check` fails.
- design: fold the question row into rule 6 and the log line into rule 4, and the cap holds.
- craft: `Number(skips) || 1` turns 0 into 1, so `demands` needs more than a lower floor.
- craft: `answer-door.test.js` and `note-answer.test.js` assert the first call passes, and the approach leaves both out.
- craft: the chapter "The first call is free" in `spec/design_output/level0.md` needs a rewrite too.
- craft: the stated cost misses the refusal, since a hand calling a tool first sees that call refused.
- craft: the ask door keeps its grace, because `grace.update` stands at 5.
- craft: `onAgent` also meets a helper's own Agent call, so the approach says what a helper gets.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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
