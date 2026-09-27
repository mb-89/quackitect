---
kind: [[ticket]]
state: closed
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
step: implement/tests-red
record:
  - step: design/draft
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: 02898de055b9b9198e0fc35a3fafc7dc89b38a07
    hash_after: 02898de055b9b9198e0fc35a3fafc7dc89b38a07
  - step: design/review
    hand: box c28a93a32b71 · claude-code-remote · helper-2
    hash_before: 13cde42f0cb12920b8f5a6963381269dfef06864
    hash_after: 13cde42f0cb12920b8f5a6963381269dfef06864
  - step: implement/tests-red
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: 69cf007d1aba486a21db0e2a2f105c13c25cb08b
    hash_after: 69cf007d1aba486a21db0e2a2f105c13c25cb08b
    why: helper-mark-drops-at-stop answers this ask
reason: answered
---

# Ask

Every stop reason the agent claims matches the state the engine reads. A turn waiting on the owner's step ends on a reason naming that step.

A turn ends on `the-owner-asks-to-talk` where the owner asks no talk, and `your-helpers-still-run` falls at the stop call while helpers run. A turn waiting on the owner's step finds no reason and loops.

- `spec/config/stop/level0.yml` holds no rule `the-owner-asks-to-talk`, and `test/contract/stop-rules.test.js` asserts it
- `spec/config/stop/level0.yml` holds a rule under `waits: owner`. Its check answers true where the ticket in hand or its group stands at a leaf `by: person`. A case in `test/level0/stop-door.test.js` drives it both ways
- `helpersRun` in `src/bridge/stop.js` answers true at the stop call while a background helper runs. A case in `test/level0/stop-helper.test.js` drives the stop call with no `background_tasks`
- `queue-waits` in `src/bridge/stop.js` answers false over an urgent group whose `work/<group>` branch stands, and a case under `test/level0` drives it
- `spec/design_output/stop.md` names each new rule, and its `helpers-running` row matches the code
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Four changes, each over one check the stop vote reads.

| the change | where | what it does |
|---|---|---|
| the talk rule goes | `spec/config/stop/level0.yml` | drops `the-owner-asks-to-talk`. The `a-report-stands` check stays for the report row |
| a rule waits on the owner's step | the same file, and `CHECKS` in `src/bridge/stop.js` | adds `the-owner-holds-the-step`, side stop, `waits: owner`, running `step-waits-on-person` |
| the helper check reads the box | `helpersRun` in `src/bridge/stop.js` | answers true off `background_tasks` or off `box.helpers` |
| the queue skips a taken group | `queueWaits` in `src/bridge/stop.js` | passes the texts on to `queueHolds` without an urgent group whose branch stands |

The detail under each:

- `step-waits-on-person` reads the holds under `holdsIn`. It answers true where the held ticket, or the group it names, stands at a leaf carrying `by: person`. It reads the leaf the way `queueHolds` in `lib/ticket.js` does
- `box.helpers` fills at `agent.spawn` for a spawn running in the background, keyed by its id. It empties at that helper's turn end. `claims` passes `box` to `ranHere`, so the stop call reads it with no `background_tasks`
- `queueWaits` reads the `work/<group>` refs once with `git for-each-ref`, the way `branchOf` runs git

`spec/design_output/stop.md` names the new rule and check, and its `helpers-running` row drops the binding clause the code never read.

The strongest objection: dropping the talk rule leaves a discussion with no stop of its own. The ask names the drop. `the-chat-is-new` and `a-wrong-answer-leaves-the-box` stand for a desk, and the review decides whether that suffices.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/bridge/stop.js` `decide` through `ranHere`, and `claims` through `claimFalls`, which read `CHECKS`
- `src/bridge/stop.js` `helpersRun`, called from the `helpers-running` entry alone
- `src/bridge/stop.js` `queueWaits`, called from the `queue-waits` entry alone
- `src/bridge/guidance.js` `onAgentSpawn`, which gains the mark on `box.helpers`
- `src/bridge/answer.js` `onTurnEnd` for a helper, which drops the mark
- `test/level0/context-handover.test.js`, `test/level0/handover-wiring.test.js`, `test/level0/stop.test.js` and `test/level0/stop-door.test.js`, which name the dropped rule and move to another reason

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/contract/stop-rules.test.js` no rule carries the id the-owner-asks-to-talk
- `test/level0/stop-door.test.js` a ticket in hand at a person's leaf stands the owner-step claim
- `test/level0/stop-door.test.js` a ticket in hand at an agent's leaf refuses the owner-step claim
- `test/level0/stop-helper.test.js` the stop call with no background_tasks stands while a spawned helper runs
- `test/level0/stop.test.js` an urgent group whose work branch stands leaves the queue with no wait

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- `CHECKS`, `claims`, `helpersRun`, `queueWaits`, `branchOf`, `queueHolds`, `onAgentSpawn` and the rules file stand opened. The spawn event's background field stands unread, and the implement step reads it off a logged spawn
- the callers list comes off a grep for each changed check and for the dropped rule id
- each done_when line names its test above, and `./RUNME.sh check` decides the last

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings
- step-rule-names-its-rank: the draft gives `the-owner-holds-the-step` no `decides` and no `priority`, so nothing says it outranks `work-still-stands` (80) and `the-last-line-names-no-stop` (50), the rules that make the waiting turn loop. Name both in the rules file and in `spec/design_output/stop.md`
- helper-mark-drops-at-stop: a helper's end reaches the server as `classic.Stop` carrying `agentId`, which `helperReports` in `src/bridge/wait.js` reads. `onTurnEnd` in `src/bridge/answer.js` returns at `agentId` before it does anything. Drop the `box.helpers` mark where the helper's end lands, keyed on an id that the spawn event and that end both carry
- the-talk-prose-leaves-stop: `spec/design_output/stop.md` names `the-owner-asks-to-talk` in the claimed-over-checks passage, in "A talk follows a report" and in the example rules block. The draft only updates the new rule and the `helpers-running` row, so rewrite or drop those passages along with the rule

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

The queue handed the children `helper-mark-drops-at-stop` and `step-rule-names-its-rank` ahead of this ticket's implement step, and the whole change landed under the first one's hand-back. Before it, the cases for the dropped talk rule, the owner's step, the stop call's helper mark and the taken group each failed on their own assertion. After it, `./RUNME.sh check` exits 0. So this ticket closes as answered by that child.
