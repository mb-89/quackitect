---
kind: [[ticket]]
state: open
step: implement/tests-green
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: person-1
        does: answers the question the engine asks
        by: anyone
        to: engine
        asks: "design/review fails back 2 times: The warning road misses the second line of the ask. `prompt.context` fires once a conversation, and again after a compaction or a `/clear`, and a second prompt fires none. For details, see [[spec/design_output/level0#the-guidance-stays-put]]. So a `level0-answer` block in `onPromptContext` reaches the first prompt alone. At that first prompt nothing shows that `prompt.context` fires after `prompt.submit` opens the demand. The ask names the prompt's own event, and `prompt.context` is not that event. Fix: name a road on `prompt.submit` itself, such as a rewritten event through `answer.event` the way `agent.spawn` prepends its line, and prove the session reads it with the probe; The cage block is no precedent for a per-prompt line. It rides the first `prompt.context` a session reads, the same once-a-conversation road; The probe table's transcript row stands against a measured fact. At `tool.call`, `$.session.messages()` carries no text from the response in flight, per [[spec/design_output/level0#a-step-arrives-late]]. With `turn.step` firing after the first call, the `tool.call` event is the one road left open. Name that, so the third row, where the owner decides, reads as the likely outcome; The transcript key matches the prompt's row by its text. Two prompts with the same text, such as `go on`, make a transcript flushed a turn late hand the older prompt's text, so it pays the new one. Key the row on its position past the last owner row seen, or on an id or time where the row carries one, and give that case a test"
        evidence:
          - name: answer
            form: text
            says: the answer, which the step behind this one reads
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
  - step: design/draft
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: 4af97b5f3191adcad9785cf6d811eadc2019197b
    hash_after: 4af97b5f3191adcad9785cf6d811eadc2019197b
  - step: design/review
    hand: box c28a93a32b71 · claude-code-remote · helper-4
    hash_before: 50f9686d2ef125b6aeb5e6e9d288543292f12ee0
    hash_after: 50f9686d2ef125b6aeb5e6e9d288543292f12ee0
    returns: 2
    why: "The warning road misses the second line of the ask. `prompt.context` fires once a conversation, and again after a compaction or a `/clear`, and a second prompt fires none. For details, see [[spec/design_output/level0#the-guidance-stays-put]]. So a `level0-answer` block in `onPromptContext` reaches the first prompt alone. At that first prompt nothing shows that `prompt.context` fires after `prompt.submit` opens the demand. The ask names the prompt's own event, and `prompt.context` is not that event. Fix: name a road on `prompt.submit` itself, such as a rewritten event through `answer.event` the way `agent.spawn` prepends its line, and prove the session reads it with the probe; The cage block is no precedent for a per-prompt line. It rides the first `prompt.context` a session reads, the same once-a-conversation road; The probe table's transcript row stands against a measured fact. At `tool.call`, `$.session.messages()` carries no text from the response in flight, per [[spec/design_output/level0#a-step-arrives-late]]. With `turn.step` firing after the first call, the `tool.call` event is the one road left open. Name that, so the third row, where the owner decides, reads as the likely outcome; The transcript key matches the prompt's row by its text. Two prompts with the same text, such as `go on`, make a transcript flushed a turn late hand the older prompt's text, so it pays the new one. Key the row on its position past the last owner row seen, or on an id or time where the row carries one, and give that case a test"
  - step: design/person-1
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: fe0c78daa6dc8f9a43105fa551959f583e019e54
    hash_after: fe0c78daa6dc8f9a43105fa551959f583e019e54
  - step: design/draft
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: 58e39e1db337198f71aaec2200c5f53c73bae71e
    hash_after: 58e39e1db337198f71aaec2200c5f53c73bae71e
  - step: design/review
    hand: box c28a93a32b71 · claude-code-remote · helper-7
    hash_before: da4610cb528712829797990339b5ff4c79b96724
    hash_after: da4610cb528712829797990339b5ff4c79b96724
  - step: implement/tests-red
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: 6a2350af6079047cda98eb57b4d249c8f6bb64c2
    hash_after: 6a2350af6079047cda98eb57b4d249c8f6bb64c2
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
  - step: implement/change
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: b15b6cfce1bd89b72bad4af5734d985c6aee8138
    hash_after: b15b6cfce1bd89b72bad4af5734d985c6aee8138
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
group: the-gates-read-the-state
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

## person-1

<!-- design/review fails back 2 times: The warning road misses the second line of the ask. `prompt.context` fires once a conversation, and again after a compaction or a `/clear`, and a second prompt fires none. For details, see [[spec/design_output/level0#the-guidance-stays-put]]. So a `level0-answer` block in `onPromptContext` reaches the first prompt alone. At that first prompt nothing shows that `prompt.context` fires after `prompt.submit` opens the demand. The ask names the prompt's own event, and `prompt.context` is not that event. Fix: name a road on `prompt.submit` itself, such as a rewritten event through `answer.event` the way `agent.spawn` prepends its line, and prove the session reads it with the probe; The cage block is no precedent for a per-prompt line. It rides the first `prompt.context` a session reads, the same once-a-conversation road; The probe table's transcript row stands against a measured fact. At `tool.call`, `$.session.messages()` carries no text from the response in flight, per [[spec/design_output/level0#a-step-arrives-late]]. With `turn.step` firing after the first call, the `tool.call` event is the one road left open. Name that, so the third row, where the owner decides, reads as the likely outcome; The transcript key matches the prompt's row by its text. Two prompts with the same text, such as `go on`, make a transcript flushed a turn late hand the older prompt's text, so it pays the new one. Key the row on its position past the last owner row seen, or on an id or time where the row carries one, and give that case a test -->

### answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

The findings stand, and the next draft takes each:

- the warning rides `prompt.submit` itself: the door answers `answer.event` with the prompt text opening on the `warns` line, the way `agent.spawn` prepends its line. The probe shows the session reads it
- the cage block drops out as a precedent
- the `tool.call` event stands as the one open road for the same-message text. The probe reads it first, and the owner decides where it carries nothing
- the transcript row keys on an id where the row carries one. Otherwise it keys on the count of owner rows the bridgehead reads at `prompt.submit`, and a text counts past the next owner row alone. A session past the transcript's window reads the display road alone

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The demand a prompt opens keys on the prompt itself, and every road that pays it reads that key. The same-message road rests on the `tool.call` event, and a probe proves it first.

| the road | the change |
|---|---|
| the demand | `onPromptSubmit` in `src/bridge/answer.js` stores `at`, the server's time at the prompt, and `owners`, the owner rows the bridgehead counts at `prompt.submit` |
| the warning | `onPromptSubmit` answers `event`, the prompt with its text opening on the `warns` line. The bridgehead's `seen` hands it on through `answer.event`, the way `agent.spawn` prepends its line |
| the spoken text | one writer, `speaks(box, text)`, sets `box.spoken` and `box.spokenAt`. `onMessageDisplay`, `pays`, `paid` and `onTurnEnd` call it |
| the display | a display pays a prompt's demand where its `spokenAt` falls after `at` |
| the transcript | `lastTexts` posts `rows`, each with its role, its text and its id where it carries one. `onAgentSpoke` counts an assistant text past the prompt's own row alone |
| the same message | `holdsForAnswer` pays off the text the `tool.call` event carries for its own message, on the field the probe names |

The transcript finds the prompt's row this way:

- by its id, where the row carries one the bridgehead read at `prompt.submit`
- otherwise, as the owner row past `owners`. Two prompts with the same text then read apart
- a transcript still short of that row pays nothing
- a session past the transcript's window reads the display road alone, because a count there shifts

The implement step opens on `./RUNME.sh probe reply`, a mode beside `probe compact`. It logs three things at the first call after a prompt whose message holds text and a call: the `tool.call` event's fields, the rewritten prompt the session reads, and whether a transcript row carries an id. `$.session.messages()` carries no text from the response in flight, per [[spec/design_output/level0#a-step-arrives-late]], and `turn.step` fires after the first call. So the `tool.call` event stands as the one open road.

| what the probe finds | what the change does |
|---|---|
| the text on the `tool.call` event | `holdsForAnswer` pays off that field |
| the text on no field | the ask's third line goes back to the owner, with the probe's log |

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/bridge/server.js` `submitsPrompt`, which calls `onPromptSubmit` and now passes its `event` on
- `.claude/skills/level0/hooks/level0.js` `seen`, which hands `answer.event` on for `prompt.submit`, and gains the owner-row count there
- `src/bridge/server.js` the `classic.MessageDisplay` and `agent.spoke` entries, which call `onMessageDisplay` and `onAgentSpoke`
- `src/bridge/server.js` the `tool.call` road, which calls `holdsForAnswer`
- `src/bridge/report.js`, which calls `pays`
- `src/bridge/answer.js` `onTurnEnd`, `paid` and `pays`, which write `box.spoken` through `speaks`
- `src/bridge/ask.js` `asksForUpdate`, which calls `demands` with no `at`, so an ask keeps today's read
- `.claude/skills/level0/hooks/level0.js` `spoke`, which calls `lastTexts`
- `src/scripts/probe.js`, which gains the `reply` mode

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/answer-door.test.js` after a restart, a transcript short of the prompt's row pays nothing
- `test/level0/answer-door.test.js` two prompts with the same text, and a transcript a turn late, pay nothing off the older one
- `test/level0/answer-door.test.js` a display stamped before the prompt pays nothing
- `test/level0/answer-door.test.js` a text on the `tool.call` event, in the message of that call, pays the door
- `test/level0/answer.test.js` the prompt's answer rewrites its text to open on the warning line

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- the warning rides `prompt.context`: it rides `prompt.submit` through `answer.event` now, and the probe shows the session reads it
- the cage block as a precedent: dropped
- the probe's transcript row: dropped. The `tool.call` event stands as the one open road, and the owner decides where it carries nothing
- the transcript key by text: it keys on a row id, or on the owner row past the count taken at `prompt.submit`. A test drives two prompts with the same text
- the display order stands unmeasured: the probe opens implement
- `stepText` stands unnamed: named, with `turn.step` firing after the first call
- `box.spoken` has four writers: `speaks` owns the write
- `sinceTheOwner` has no export: the server reads the prompt's row itself, and `sinceTheOwner` stays

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- `onPromptSubmit`, `onMessageDisplay`, `onAgentSpoke`, `pays`, `paid`, `onTurnEnd`, `onPromptContext`, `lastTexts`, `streams` and `spoke` stand opened. The probe verb's modes stand unread, and the implement step reads `src/scripts/probe.js` first
- the callers list comes off a grep for each changed function and for every write of `box.spoken`
- each done_when line names its test above. The same-message line names the probe too, and `./RUNME.sh check` decides the last

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings

- a-late-count-pays-nothing: The owner-row count `owners` taken at `prompt.submit` comes off a transcript that flushes a turn late, per [[spec/design_output/level0#what-the-door-reads]]. There it misses the previous prompt's row, so "the owner row past `owners`" names that older prompt, and its replies pay the new one, the fault the ask's first line names. Where no row id stands, the transcript road stands down and the display road, the report and the `tool.call` event pay, the way the draft already treats a session past the window. A test in `test/level0/answer-door.test.js` drives a transcript a turn late at `prompt.submit`
- the-warning-has-fallback: The probe decides whether the session reads a `prompt.submit` event rewritten through `answer.event`, and the probe table names the owner's fallback for the same-message road alone. Add the row for the rewritten prompt reaching no session: the ask's second line goes back to the owner with the probe's log
- the-warning-keeps-readers: The rewritten prompt carries the `warns` line into the owner's row the transcript and `$.session.messages()` hand back. Name every reader of an owner row's text, `sinceTheOwner` and `answerAfter` in `.claude/skills/level0/lib/answer.js` among them, and show each reads the same with the line in front

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh test test/level0/answer-door.test.js test/level0/answer.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Three cases fail on their own assertion: the restart with a row id, the restart with none, and the warning on the prompt's event. The case for a text past the prompt's row passes today, because an empty `box.spoken` hands every text over, and it holds the new road green. The same-message line waits on `./RUNME.sh probe reply`. This box loads no function hooks, so the probe cannot run here, and no case asserts a field nobody measured.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the files the ask names: `src/bridge/answer.js`, the bridgehead's `lastTexts` and prompt read, and the two test files
- every door the change reaches has a fake: the cases drive a fake box, a fake clock and a fake log
- each new case opens on a comment naming this ticket
- the row id key stands in `onAgentSpoke` alone, and the cases point at it
- the review's three findings stand as their own tickets, and this change holds the first: no id stands the transcript road down

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

./RUNME.sh lint src/bridge/answer.js .claude/skills/level0/hooks/level0.js test/level0/answer-door.test.js test/level0/answer.test.js test/level0/read-tools.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the answer door, the bridgehead's transcript read, and the three test files holding their cases
- every door the change reaches has a fake: the stamp reads the box's clock door, and the cases hand a fake one
- `freshTexts`, `pastRow`, `speaks`, `rowOf` and `beforeOf` each open on a comment naming this ticket
- the row key stands in `pastRow` alone, and the bridgehead's `ROWS` names how far back it reads
- the review's first finding holds: a transcript carrying no row ids stands the road down

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
