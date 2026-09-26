---
kind: [[ticket]]
state: open
group: the-gates-read-the-state
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
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
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/design]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass, pass with findings naming a child a line, or fail with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every row the design review passes with stands fixed in the change"]
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
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
step: design/draft
record:
  - step: design/draft
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: d264095109b8e26e44c1652805ad8d9164f5f190
    hash_after: d264095109b8e26e44c1652805ad8d9164f5f190
  - step: design/review
    hand: box c28a93a32b71 · claude-code-remote · helper-2
    hash_before: 5c34a44db98448bfa52f2e09b2410aec08ee1957
    hash_after: 5c34a44db98448bfa52f2e09b2410aec08ee1957
    returns: 1
    why: "| grade | finding | fix |; |---|---|---|; | design | The third line of the ask rests on `DISPLAY_WAIT`, and the draft says nobody measured the client's display order. The ask itself says the chat shows that text after the door reads. A wait inside the `tool.call` hook sees the display only where the client posts it while the hook holds the call, and nothing shows that it does. A fake-driven test goes green either way, so the build passes while the refusal still stands | run the probe first and write the order it shows. Or name a road that reads the call's own message without the display |; | design | `streams` on `turn.step` already feeds `stepText` to `agent.spoke` as `text`, so it carries the text of the call's own step. The draft leaves that road unnamed. `spec/design_output/level0.md` says the stream carries text for the first step alone | say why `stepText` misses a later step, and whether fixing that road pays the same-message reply without a wait |; | design | The transcript road keys on the last owner row, not on the prompt's time. `What the door reads` says the transcript flushes late, sometimes a turn late. After a restart, a transcript that lacks the new prompt row makes `sinceTheOwner` return the texts after the previous prompt. An older text then pays the new prompt, and the first line of the ask fails | key the transcript texts on `at` as well, or hold the transcript road until the prompt's own row stands in it, and give that case a test |; | craft | The warning rides `after.context` on `prompt.submit`. The draft names no place that shows the harness hands context from `prompt.submit` to the session. The hook already writes context to the prompt through `prompt.context` `blocks`, as it does for the cage | open the event's result shape and name the road that reaches the session |; | craft | `paid`, `pays` and `onTurnEnd` in `src/bridge/answer.js` also write `box.spoken`. The callers list leaves them out, so `box.spokenAt` goes stale there | stamp `spokenAt` wherever `box.spoken` is written, and name each writer |; | craft | `sinceTheOwner` in `.claude/skills/level0/lib/answer.js` has no export | export it, or post the texts off `answerAfter` |"
---

# Ask

An answer written after the owner's prompt alone pays the prompt door. The answer-first line rides the prompt, so the owner's question meets its answer before the next call.

A prompt carries no grace, so the first call after it meets the door. A reply written in the same message as that call meets a refusal too. The chat shows that text after the door reads. After a restart, an older text pays a new prompt.

- `onPromptSubmit` in `src/bridge/answer.js` keys the demand on the prompt's own time. A case in `test/level0/answer-door.test.js` drives a restart that empties `box.spoken`. It shows a text written before the prompt pays nothing
- the prompt's own event hands the session the line `warns` in `.claude/skills/level0/lib/answer.js` writes, and a case in `test/level0/answer.test.js` asserts it
- a text written after the prompt, in the same message as the next call, pays the door. A case in `test/level0/answer-door.test.js` holds it
- `spec/design_output/level0.md` names both under `What the door reads` and `The first call asks`
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The demand a prompt opens keys on the prompt's own time, and three roads read that key.

| the road | the change |
|---|---|
| the demand | `onPromptSubmit` in `src/bridge/answer.js` calls `demands` with `at`, the time the server takes the prompt, and `seen` stays the text before it |
| the display | `onMessageDisplay` stamps `box.spokenAt` beside `box.spoken`. A display pays a prompt's demand where its stamp falls after `at` |
| the transcript | `lastTexts` in `.claude/skills/level0/hooks/level0.js` posts the assistant texts past the last owner row, off `sinceTheOwner` in `.claude/skills/level0/lib/answer.js`. A restart empties `box.spoken`, and a text before the prompt then stands outside the list |
| the same message | `spoke` in the bridgehead asks `agent.spoke` once more after a named wait, `DISPLAY_WAIT`, where the first ask refuses a prompt's demand. A display the client posts for the call's own message lands in that wait and pays |
| the warning | `onPromptSubmit` answers `after.context` carrying `warns("The owner sent a prompt")`, so the answer-first line rides the prompt |

The same-message road rests on the client posting the display before the call runs its tool. This box loaded no function hooks, so nobody measured it here. The review decides whether a probe comes first. `spec/design_output/level0.md` names the key under `What the door reads` and the wait under `The first call asks`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/bridge/server.js` `submitsPrompt`, which calls `onPromptSubmit`
- `src/bridge/server.js` the `classic.MessageDisplay` entry, which calls `onMessageDisplay`
- `src/bridge/server.js` the `agent.spoke` entry, which calls `onAgentSpoke`
- `src/bridge/ask.js` `asksForUpdate` road, which calls `demands` with no `at`, so an ask keeps today's read
- `.claude/skills/level0/hooks/level0.js` `spoke`, which calls `lastTexts` and asks `agent.spoke`
- `src/bridge/report.js`, which calls `pays` unchanged

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/answer-door.test.js` a text written before the prompt pays nothing after a restart empties the spoken text
- `test/level0/answer-door.test.js` a text shown after the prompt, in the message of the next call, pays the door
- `test/level0/answer.test.js` the prompt's own answer carries the warning line

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every file, function and verb the approach names stands opened: `answer.js` in the bridge and the lib, `server.js`, `ask.js`, `report.js` and the bridgehead `spoke` and `lastTexts`. The client's display order stands unmeasured, and the approach says so
- the callers list comes off a grep for each changed function across `src` and the plugin
- each done_when line names its test above, and `./RUNME.sh check` decides the last

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

fail

| grade | finding | fix |
|---|---|---|
| design | The third line of the ask rests on `DISPLAY_WAIT`, and the draft says nobody measured the client's display order. The ask itself says the chat shows that text after the door reads. A wait inside the `tool.call` hook sees the display only where the client posts it while the hook holds the call, and nothing shows that it does. A fake-driven test goes green either way, so the build passes while the refusal still stands | run the probe first and write the order it shows. Or name a road that reads the call's own message without the display |
| design | `streams` on `turn.step` already feeds `stepText` to `agent.spoke` as `text`, so it carries the text of the call's own step. The draft leaves that road unnamed. `spec/design_output/level0.md` says the stream carries text for the first step alone | say why `stepText` misses a later step, and whether fixing that road pays the same-message reply without a wait |
| design | The transcript road keys on the last owner row, not on the prompt's time. `What the door reads` says the transcript flushes late, sometimes a turn late. After a restart, a transcript that lacks the new prompt row makes `sinceTheOwner` return the texts after the previous prompt. An older text then pays the new prompt, and the first line of the ask fails | key the transcript texts on `at` as well, or hold the transcript road until the prompt's own row stands in it, and give that case a test |
| craft | The warning rides `after.context` on `prompt.submit`. The draft names no place that shows the harness hands context from `prompt.submit` to the session. The hook already writes context to the prompt through `prompt.context` `blocks`, as it does for the cage | open the event's result shape and name the road that reaches the session |
| craft | `paid`, `pays` and `onTurnEnd` in `src/bridge/answer.js` also write `box.spoken`. The callers list leaves them out, so `box.spokenAt` goes stale there | stamp `spokenAt` wherever `box.spoken` is written, and name each writer |
| craft | `sinceTheOwner` in `.claude/skills/level0/lib/answer.js` has no export | export it, or post the texts off `answerAfter` |

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

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
