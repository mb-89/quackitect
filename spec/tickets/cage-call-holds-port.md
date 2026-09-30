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
step: gate
depends_on: [cage-command-rules-port]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d889b5fde3d5 · claude-code-remote
    hash_before: 40b9ceea310b2d6ccfd2e8cfe036c80777befbc6
    hash_after: d4dfa4d4fd1b779fd4065a4a5448242bcad73974
    inputs:
      - name: ask
        hash: bc49d4efc513831a
        size: 986
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d88b829f8cd8 · claude-code-remote
    hash_before: 9cc0700ae4904d48c465cb4625a9e59321533bf9
    hash_after: 9cc0700ae4904d48c465cb4625a9e59321533bf9
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: e0c47ca511b0c8fd
        size: 9186
      - name: [[spec/tickets/cage-hold-drops-port]]
        hash: a34b00a52e331586
        size: 749
    def: 08e16d07b0de477c
---

# Ask

The `hooks` IO module holds and refuses every tool call the bridge holds before the tool's own door runs, with the same reason. The holds:

- the owner's stop and finish hold, off `holdsCall` in `src/bridge/stop.js`
- the cloud ask door, which refuses AskUserQuestion on a cloud box
- the grace a session spends
- the owner's prompt answered first, and `agent.spoke`
- the helper's tier and its background run, off `onAgent` in `src/bridge/agent.js`

The holds read state a session builds, so the door reads it off the events under `session/<id>`.

Without it, the cage key moving to `new` lets a session call past the owner's hold. A cloud box asks nobody and stalls.

- each hold meets a recorded log under `test/replay/cage`, and its `.shadow.jsonl` holds no row that hold decides. `go test ./src/modules/hooks/...` decides it
- each hold's text reads as the bridge's text for the same call, in a table case of `src/modules/hooks`
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

The holds port into src/modules/hooks, beside the command door. A new fold in src/modules/session keeps the state each hold reads off the events under session/<id>.

1. The files, one a bridge door:
- src/modules/session/holds.go: the fold HoldsName, <id>/holds, and its step over q.Event. It keeps what the bridge keeps on the box:
  - the finish calls of the turn, off box.finishCalls in holdsCall. A turn.complete resets them, as dropsHold does.
  - the agent's own calls since the plan's last answer, off box.calls in onToolCall. They reset on an mcp__level0__plan call, or on a level0 call carrying a plan field, as planRides and planned do.
  - the grace, off wants and holdsGrace. It opens once the calls reach plan.everyCalls, holds plan.grace calls, and spends one on each call that reaches holdsGrace and is neither ENDS_TURN nor the plan call.
  - the demand, off demands, onPromptSubmit, asksForUpdate, paid, pays, onTurnEnd and freshTexts. It opens on an owner's prompt.submit (origin kind composer or sdk) with its before row, or on the update ask off ask.wanted with grace.update skips. It is paid by a classic.MessageDisplay delta, a report call, a turn.complete answer, or an agent.spoke carrying a fresh text.
  An event naming agentId moves none of it, since every bridge hold skips a helper.
- src/modules/hooks/holds.go: Door.holds, the chain onToolCall runs: holdsCall, holdsCloudAsk, holdsGrace, then holdsForAnswer. It also holds their texts:
  - refusedByHold
  - ASKS_NOBODY
  - refusedByGrace, with the plan ask's why off asksForPlan and plansHere
  - the answer door's SAYS, and the lacks line of onAgentSpoke with head cut at SAID
- src/modules/hooks/agent.go: the Agent door, off onAgent, tiersOf and tiersText.

2. The config words a hold reads are not recorded on the event. So Door.writes stamps them on a tool.call's fields under held: stop.hold, ask.wanted and the cloud flag. The fold then counts the way the box counts:
- a finish call counts where the stamp reads finish, report and stop calls included, as holdsCall counts before its ENDS_TURN test.
- a grace call or a demand skip spends only where no earlier hold answered. The bridge chains the holds with ??, so a finish ride from holdsCall ends the chain before holdsGrace runs.

3. hooks.Settings gains Hold, Ask, Binding, FinishGrace, UpdateGrace, PlanEvery, PlanGrace, PlanMostOpen and Helpers, a tier-to-model map. commandSettings in src/quack/command.go fills them through the src/config reader the command rules use.

4. Door.refuses runs the bridge's order: the holds first, then the tool's own door. That door is onAgent for Agent, and the command door for Bash and PowerShell.
- Each hold answers nothing, a ride, a refusal or a hold.
- A ride ends the chain and lets the tool door run, as held does in onToolCall.
- A refusal answers a result effect carrying its text.
- The answer-first hold answers a rows effect with a call id. Effect gains a Call field for it. NewDecisionOf reads it as hold, as OldDecisionOf reads needs.
- Under engine.binding god, every refusal and hold of Door.refuses passes, as letsThrough does. The command door falls under the same wrapper.
- The after block a ride carries reads as pass on both sides, so it ports with the hook module's switch, as the parent names.

5. Door.Hook answers agent.spoke, the post the bridgehead sends after a needs hold:
- a result effect carrying the lacks text, where the fold holds the demand unpaid after the event.
- pass, where the event paid it.
The spoke post names no session, so the door files it under the session of the newest call it held under that root. The stop child's holdsTurn reads the same demand fold.

6. One case table, test/replay/cage/call-holds-cases.json, holds a tree and, for each case: the config, the cloud flag, the events leading in, the call, the decision and the text. A JS case, test/level0/call-holds-cases.test.js, drives each event through decide on boxOf over fakeDisk. A Go case drives each through Door.Hook over doorOver, with the case's Settings. So the two texts cannot drift apart.

7. A recorded log, test/replay/cage/call-holds.jsonl, stands with an empty golden shadow. Its box is a cloud box with tiers and a short plan grace. Its rows, in order:
- an owner's prompt
- a call held for the reply
- an agent.spoke refused
- a display paying it
- the plan grace riding, then refusing
- AskUserQuestion refused
- an Agent call held in the foreground
- an Agent call naming no tier's model
The finish hold reads config for a whole log, so call-holds-finish.jsonl carries grace.finish's ride and its spent refusal, with an empty golden too. A log's box stands beside it as <name>.box.json, the Settings the replay's door answers. TestReplayLogAnswersEveryRecordedLog reads that file where it exists.

8. The parent's every-refusal.jsonl holds an Agent row, a helper held in the foreground, with run_in_background false. It meets onAgent's first refusal, so it leaves every-refusal.shadow.jsonl once this port lands. The Write row stays there for cage-write-door-port.

What the port decides past the ask:
- The bridge keys this state by the work root, and the fold keys it by session, as the ask says. A root holding two sessions in turn reads apart on the two sides, and the recorded logs name one session each.
- The holds write config at a turn's end, through dropsHold and dropsAsk, and the door writes none. [[spec/tickets/cage-hold-drops-port]] carries the writes.
- The god binding wraps the command door too, since letsThrough wraps every tool door.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/hooks.go: Door.Hook, which gains the holds ahead of the tool doors and the agent.spoke answer
- src/modules/hooks/hooks.go: Door.writes, which stamps the held words on a tool.call
- src/modules/hooks/hooks.go: Door.refuses, which runs the holds, the Agent door and the god binding
- src/modules/hooks/hooks.go: Door.serves and Replay, calling Door.Hook
- src/modules/hooks/cage.go: Door.ReplayLog, calling Door.Hook
- src/quack/main.go: listensHooks, passing commandSettings as Config
- src/quack/main.go: the modules table, loading session.Registers, which gains the holds fold
- src/quack/command.go: commandSettings, which fills the new Settings fields
- src/quack/hooks_test.go: the wiring cases calling hooks.New, Door.Hook and commandSettings
- src/quack/hook_test.go: the wiring case calling hooks.New
- src/modules/hooks/hooks_test.go: doorOver, calling hooks.New with Settings and registering the session folds
- src/modules/hooks/command_test.go and cage_test.go: Door.Hook through doorOver

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/session/holds_test.go: TestTheHoldsFoldCountsAsTheBoxCounts
- src/modules/hooks/holds_test.go: TestTheHoldsAnswerWhatTheBridgeAnswers, over call-holds-cases.json
- src/modules/hooks/holds_test.go: TestAHeldCallAsksBackForRows
- src/modules/hooks/agent_test.go: TestTheAgentDoorReadsTheTiers
- src/quack/hooks_test.go: TestCommandSettingsReadTheHoldKeys
- test/level0/call-holds-cases.test.js: the bridge answers every shared hold case
- test/replay/cage/call-holds.jsonl and its empty shadow, through TestReplayLogAnswersEveryRecordedLog
- test/replay/cage/call-holds-finish.jsonl and its empty shadow, through TestReplayLogAnswersEveryRecordedLog
- test/replay/cage/every-refusal.jsonl: its Agent row, through TestReplayLogAnswersEveryRecordedLog

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/session/holds.go
- src/modules/session/holds_test.go
- src/modules/session/session.go
- src/modules/hooks/holds.go
- src/modules/hooks/holds_test.go
- src/modules/hooks/agent.go
- src/modules/hooks/agent_test.go
- src/modules/hooks/hooks.go
- src/modules/hooks/hooks_test.go
- src/modules/hooks/cage_test.go
- src/quack/command.go
- src/quack/hooks_test.go
- test/replay/cage/call-holds-cases.json
- test/level0/call-holds-cases.test.js
- test/replay/cage/call-holds.jsonl
- test/replay/cage/call-holds.shadow.jsonl
- test/replay/cage/call-holds.box.json
- test/replay/cage/call-holds-finish.jsonl
- test/replay/cage/call-holds-finish.shadow.jsonl
- test/replay/cage/call-holds-finish.box.json
- test/replay/cage/every-refusal.shadow.jsonl

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened server.js onToolCall, letsThrough and DOORS, stop.js holdsCall, refusedByHold and dropsHold, cloud-ask.js holdsCloudAsk, grace.js wants, holdsGrace and refusedByGrace, plan.js asksForPlan, planned and plansHere, answer.js onPromptSubmit, holdsForAnswer, onAgentSpoke, paid and onTurnEnd, ask.js asksForUpdate and dropsAsk, agent.js onAgent, hooks.go Hook, writes and refuses, cage.go, cage_test.go, command_test.go, hooks_test.go doorOver, session.go, store.go Folds and Land, command.go commandSettings, main.go listensHooks, and every-refusal.jsonl, and each claim holds there
- the callers list names every caller of Door.Hook, Door.writes, Door.refuses, hooks.New, hooks.Settings, commandSettings and session.Registers
- done_when line one meets call-holds.jsonl, call-holds-finish.jsonl and every-refusal.jsonl's Agent row, each with an empty golden. Line two meets TestTheHoldsAnswerWhatTheBridgeAnswers over the shared table, with its JS twin. Line three is the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks src/modules/session src/quack

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/cage_test.go
- src/modules/hooks/holds_test.go
- src/modules/session/holds_test.go
- src/quack/hooks_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The shared table test/replay/cage/call-holds-cases.json holds the bridge's own answers: .se/scripts/call-holds-fill.mjs drove each case through decide over test/level0/call-holds-box.js and printed them, and test/level0/call-holds-cases.test.js reads them green. The two recorded logs came off the same box through .se/scripts/call-holds-log.mjs, so each golden shadow stands empty and the replay reads every hold apart until the port lands. The Agent row leaves every-refusal.shadow.jsonl now, so that log reads red too.

What surprised me: Grep under a riding grace reaches the index door, which the fake box lacks, so the plan grace in the log meets Read calls alone. The tests read the new Settings fields through JSON, and the fold through its JSON names finish and calls, so every test builds today and fails on its own assertion.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when line one meets call-holds.jsonl, call-holds-finish.jsonl and the Agent row of every-refusal.jsonl, each red in TestReplayLogAnswersEveryRecordedLog. Line two meets TestTheHoldsAnswerWhatTheBridgeAnswers over the shared table, red, with its JS twin green on the bridge. Line three is the check
- the tests reach the store through qtest and the tree through the temp root doorOver builds, and the JS twin reaches the bridge through the fakes under src/doors/fake

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
