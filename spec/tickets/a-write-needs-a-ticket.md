---
kind: [[ticket]]
state: open
step: design/review
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
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
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
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process_hash: 6bfe67ab65bf2e6d
record:
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: 9263e768b3783f2ae879601391c50cf7382f424f
    hash_after: 9263e768b3783f2ae879601391c50cf7382f424f
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Every write in the tree serves the ticket the session holds, and the work tab names that ticket. The owner reads which ask a write answers.

Without it a session edits and mints while the work tab shows nothing in its hand, and the owner finds work no ticket asks for.

- a write refuses where the session holds no ticket and names the pull, and a test drives it
- a ticket mint, a note and the handover pass with no ticket held, and the test drives each
- `./RUNME.sh check` passes

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

A `ticketDoor` joins the checks in `onWrite` in `src/bridge/write.js`, after `holdDoor`. It refuses a write where no ticket stands in hand, and names `./RUNME.sh ticket pull`. It reads the hand the way the `ticket-in-hand` stop check does, through one reader both import.

| the write | what the door does |
|---|---|
| a session holding no ticket | refuses, and names the pull |
| a session holding a ticket, public or private | passes |
| a helper's write, carrying an `agentId` | passes, because the refactoring hand and a helper work beside the session |
| a new ticket under `spec/tickets` or a note under `.se/tickets` | passes, because the mint and the note open the ask |
| `.se/HANDOVER.md` | passes |
| `engine.binding` at `god` | passes, because the owner orders a fix with no ticket there |

The last row is an assumption, and the owner decides it. The god-mode fixes of this session land with no ticket held.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/bridge/write.js`, `onWrite`, which runs the doors
- `src/bridge/stop.js`, `holdStands` and `privateStands`, the hand reader the door shares
- `src/bridge/server.js`, `onToolCall`, which reaches `onWrite` for Write, Edit, the patch and the mint

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first draft

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

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
