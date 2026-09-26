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
step: implement/tests-red
record:
  - step: design/draft
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: dca9ecda9c149e96bb41fb38cab08cb656b52e60
    hash_after: dca9ecda9c149e96bb41fb38cab08cb656b52e60
  - step: design/review
    hand: box c28a93a32b71 · claude-code-remote · helper-2
    hash_before: 0cb281c6992cc2de6f32de6f89ba84c914ccfd74
    hash_after: 0cb281c6992cc2de6f32de6f89ba84c914ccfd74
---

# Ask

A todo binds the agent as a held ticket does. The doors take it by name, and the pull answers it while it stands in hand.

The write door takes any open ticket name as a pass and refuses a todo title. The pull hands out other work while a todo stands in hand.

- `ticketFault` in `src/engine/named.js` passes the ticket the hold names and the plan's `working` todo alone. Cases in `test/level0/named.test.js` and `test/level0/bash-ticket.test.js` drive each road and a stranger ticket
- the refusal names the ticket in hand and the working todo, where each stands
- a Bash description opening on the working todo's title and a colon passes `ticketDoor` in `src/bridge/bash.js`
- `./RUNME.sh ticket pull` with a `working` todo in `.se/.runtime/plan.json` answers that todo and hands out nothing else. A case under `test/level0` drives it
- `spec/design_output/level0.md#a-write-names-its-ticket` names the new rule
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The doors and the pull read one answer for what stands in hand: the hold, then the plan's `working` todo.

| the change | where | what it does |
|---|---|---|
| one reader of the hand | `inHand` in `src/engine/named.js` | answers `{ ticket, todo }` off `holdsIn` in `src/scripts/ephemeral.js` and `PLANS` in `lib/runs.js` |
| the name check | `ticketFault` in `src/engine/named.js` | passes the held ticket or the working todo's title, and refuses any other name. The refusal names both where each stands |
| the shell door | `ticketDoor` in `src/bridge/bash.js` | passes a description opening on the working todo's title and a colon, before `ticketOf` cuts at the first space |
| the pull | `pull` in `src/scripts/pull.js` | answers the working todo and hands out nothing, where no ticket stands held |

Where neither a hold nor a working todo stands, `ticketFault` keeps today's read, and any open ticket passes. The commit verb runs from a hand with nothing held, and the strict read there refuses every commit. The review decides that road. `spec/design_output/level0.md` names the rule under `A write names its ticket`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/bridge/apply.js` the patch and replace door, which calls `ticketFault` with the `ticket` field
- `src/bridge/bash.js` `ticketDoor`, called from the Bash and PowerShell doors
- `src/scripts/commit-verb.js` the commit verb, which calls `ticketFault` on the message head
- `src/bridge/write.js` `ticketFaults`, which reads the write's ticket beside the door
- `src/scripts/pull.js` `pull`, which gains the todo road before `handsOut`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/named.test.js` the held ticket passes and a stranger open ticket fails while a hold stands
- `test/level0/named.test.js` the working todo's title passes, and the refusal names the hold and the todo
- `test/level0/bash-ticket.test.js` a description opening on the working todo's title and a colon passes
- `test/level0/pull-todo.test.js` a working todo answers the pull, and the pull hands out nothing else

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- `ticketFault`, `ticketOf`, `ticketDoor`, `holdsIn`, `plansHere` and `pull` stand opened. `ticketFaults` in `write.js` stands unread, and the implement step reads it first
- the callers list comes off a grep for `ticketFault` and `ticketOf`
- each done_when line names its test above, and `./RUNME.sh check` decides the last

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings
- the-door-picks-a-hold: `holdsIn` answers every hold on the box, one a hand, and the door carries no hand, so `inHand` names which hold passes, such as any hold on the box, and a case in `test/level0/named.test.js` drives two holds
- the-door-passes-ephemeral-holds: an ephemeral ticket stands in the hold alone with no file, so `ticketFault` passes the held name before it reads the folders, and a case drives it
- the-hand-reads-plans-here: `plansHere` in `src/bridge/plan.js` reads the plan already, and `PLANS` stands in `.claude/skills/level0/lib/runs.js`, so `inHand` calls `plansHere` and reads no second copy
- the-callers-drop-ticket-faults: `ticketFaults` in `src/bridge/write.js` comes from `.claude/skills/level0/lib/ticket.js` and checks the ticket fields, so the callers list drops it
- the-todo-road-stands-first: the todo road in `pull` stands above the road asking for a named ticket as well as above `handsOut`, so a named pull hands out nothing while a todo stands in hand, and the pull case drives a named pull
- the-open-road-stays-named: where neither a hold nor a working todo stands, any open ticket passes, so the commit verb keeps working, and the rule in `spec/design_output/level0.md` and a case in `test/level0/named.test.js` name that road

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
