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
step: implement/tests-green
record:
  - step: design/draft
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: fcc032c28d64b0263dd942ee8dbd2961b95f037d
    hash_after: fcc032c28d64b0263dd942ee8dbd2961b95f037d
  - step: design/review
    hand: box c28a93a32b71 · claude-code-remote · helper-2
    hash_before: 24f65f3fab16d000972816f74b552298c05ab3f1
    hash_after: 24f65f3fab16d000972816f74b552298c05ab3f1
    returns: 1
    why: "| grade | finding | fix |; |---|---|---|; | design | `paid` reads both the step and the turn's answer. The bridgehead posts the last step's text as `turn.said`, so `onTurnSaid` pays on it, then `onTurnComplete` hands `paid` the same answer with `session.paid` already true. The repeat check then writes `HEARD.again` on every turn that pays the debt, which misses the second done_when line | put the repeat check in `onTurnSaid` alone, so `onTurnComplete` reads the answer for the debt and draws no repeat, and add a case in `test/level0/canary-debt.test.js` where a step pays and the answer at the turn's end carries the same text, with no repeat finding |; | craft | the existing case \"an answer comes out of a transcript, and a helper stays behind\" in `test/level0/verbs.test.js` puts the long text and the short one in one turn. Under last-text-alone the short one stands last, so the case breaks, and the approach names neither the case nor whether `SHORTEST` drops before or after the pick | name the order (pick the last text, then drop it where it runs short, as the ask reads), and name the case the change rewrites |; | craft | `sinceTheOwner` reads bridge rows (`role`, `toolResults`), and a transcript row carries `type` and `message.content` with `tool_result` blocks | name the transcript test for an owner row: `type: \"user\"` with no `tool_result` block in `message.content` |"
  - step: design/draft
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: 064555ec7f07f8e47a06eef8238bef276301ac1f
    hash_after: 064555ec7f07f8e47a06eef8238bef276301ac1f
  - step: design/review
    hand: box c28a93a32b71 · claude-code-remote · helper-4
    hash_before: 6b2cbd7745c19007386b4fa10d5a4eb253f28a5b
    hash_after: 6b2cbd7745c19007386b4fa10d5a4eb253f28a5b
  - step: implement/tests-red
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: 50df0e512c3ae03fb9314ed11e65f26d1a077769
    hash_after: 50df0e512c3ae03fb9314ed11e65f26d1a077769
    answered:
      - name: tests
        exit: 1
        said: assertion, 5 test(s) fail on their own assertion
  - step: implement/change
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: fe93129a130e85107d09eac0c95fee44b78ea337
    hash_after: fe93129a130e85107d09eac0c95fee44b78ea337
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
---

# Ask

`voice measure` scores the answers the owner reads, so its figure reads against the gate's ceiling, and the canary line opens a context once.

`answersIn` takes every text block of a turn as an answer, so progress lines push the measure far past the ceiling. A session repeats the canary in one context, and no check names the repeat.

- `answersIn` in `.claude/skills/level0/lib/voice.js` takes the last text of each turn alone. A case in `test/level0/verbs.test.js` feeds a turn holding a progress line and an answer. It gets the answer back alone
- a text opening on the canary draws a finding where the debt stands paid in that same context. The finding names the repeat, and a case in `test/level0/canary-debt.test.js` drives it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Two changes, one a file.

| the file | the change |
|---|---|
| `.claude/skills/level0/lib/voice.js` | `answersIn` cuts the transcript into turns at each owner row, then keeps the last `answerOf` text of each turn. `SHORTEST` drops that last text where it runs short |
| `src/bridge/guidance.js` | `onTurnSaid` reads a step opening on the canary where `session.paid` already stands. It writes a `warn` row of kind `level0` with a new `HEARD.again`, and leaves the mark as it stands |

An owner row in the transcript form is a row of `type: user` whose `message.content` carries no `tool_result` block. A string content counts as an owner row too. A sidechain row and a helper's row stand outside every turn, as `answerOf` drops them today.

The repeat check stands in `onTurnSaid` alone. `onTurnComplete` hands `paid` the turn's last text, which the last step already carried, so a check there fires on every turn that pays. `session.paidBy` holds the step text that paid, and a later step carrying the same text draws nothing.

`HEARD.again` lands in `.claude/skills/level0/lib/guidance.js` beside the other three. A compaction sets `session.paid` false, so a line after it pays and draws nothing. `spec/design_output/level0.md` adds a row to the table under `The line lands once`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/voice.js` `measure`, which calls `answersIn` on each transcript
- `src/bridge/guidance.js` `onTurnSaid`, which gains the repeat check, and `paid`, which marks `paidBy`
- `src/bridge/server.js` the `turn.said` entry, which calls `onTurnSaid`
- `test/level0/verbs.test.js` the case an answer comes out of a transcript, and a helper stays behind. Its long text stands first and its short one last in one turn, so the case moves the long text last

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/verbs.test.js` a turn holding a progress line and an answer gives the answer back alone
- `test/level0/verbs.test.js` a tool result row opens no turn
- `test/level0/canary-debt.test.js` a second step opening on the canary in one context draws the repeat finding
- `test/level0/canary-debt.test.js` a step that pays, then the turn's end carrying the same text, draws no finding
- `test/level0/canary-debt.test.js` a line after a compaction pays and draws no finding

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- the check in `paid` fires on every paying turn: it stands in `onTurnSaid` alone, and a case drives a paying step followed by the turn's end
- the existing transcript case breaks: named in the callers, and its long text moves last. `SHORTEST` runs after the last text is picked
- the owner row reads a different shape: the transcript form stands named, a `user` row carrying no `tool_result` block

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- `answersIn`, `answerOf`, `paid`, `onTurnSaid`, `onTurnComplete`, `onSessionCompact` and `canaryIn` stand opened, and the compaction reset stands checked there
- the callers list comes off a grep for `answersIn` and `paid` across `src` and the plugin
- each done_when line names its test above, and `./RUNME.sh check` decides the last

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings

- canary-repeat-ignores-paid-text: `session.paidBy` lets a later step carrying the paying step's text draw nothing, so a step writing the canary line alone twice in one context draws no repeat finding, against the second done_when line. `streams` in `.claude/skills/level0/hooks/level0.js` posts each step once, so drop `paidBy` and let every step opening on the canary after the pay draw `HEARD.again`
- callers-name-both-readers: the callers list misses `readsCompaction` in `src/scripts/probe.js`, which reads `Object.values(HEARD)` and so takes `HEARD.again`, and the case "an owner row opening on the warning line reads as the same owner row" in `test/level0/answer.test.js`, which calls `answersIn`. Both hold under the change, and the builder names them
- meta-rows-open-no-turn: a transcript `user` row with `isMeta` or `isCompactSummary` carries no `tool_result` block, so the approach reads it as an owner row and cuts a turn there, scoring a progress line before it as an answer. Take an owner row as one carrying neither mark, and add a case in `test/level0/verbs.test.js`

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh test test/level0/verbs.test.js test/level0/canary-debt.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Five cases fail on their own assertion: the repeat twice, and the three transcript cases. Two pass today and hold the new road green: a paying step with the turn's end, and a line after a compaction. The existing transcript case put its long text first. It now puts it last, because the last text of a turn stands as its answer.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the two files and two test files the ask names
- every door the change reaches has a fake: the fake disk, the fake log and transcript fixtures
- each new case opens on a comment naming this ticket
- the repeat rule stands in `level0.md` once, and the cases point at the ticket
- the review's three rows stand in the cases: no `paidBy`, a meta row opens no turn, and the callers name both readers

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

./RUNME.sh lint .claude/skills/level0/lib/voice.js .claude/skills/level0/lib/guidance.js src/bridge/guidance.js test/level0/verbs.test.js test/level0/canary-debt.test.js spec/design_output/level0.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the two libraries, the bridge's guidance door, their tests and the design output
- every door the change reaches has a fake: the fake disk and a capturing log
- `answersIn`, `opensTurn` and `repeats` each open on a comment naming this ticket
- `HEARD.again` stands in `lib/guidance.js` once, and the design output's table names the row
- the review's rows stand fixed: no `paidBy`, a meta row opens no turn, and `readsCompaction` reads the new saying unchanged

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
