---
kind: [[ticket]]
state: closed
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
group: the-engine-fixes-its-faults
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d7e124b659cd · claude-code-remote
    hash_before: 3823cc72715985682a2c861f36c5f6aab5f8787a
    hash_after: 3823cc72715985682a2c861f36c5f6aab5f8787a
    inputs:
      - name: ask
        hash: e79762df3f357759
        size: 996
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e124b659cd · claude-code-remote
    hash_before: 869d66856792547238e749c759d44f79ea364618
    hash_after: 869d66856792547238e749c759d44f79ea364618
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: a13575bf18fdd4bf
        size: 2443
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e2385398cd · claude-code-remote
    hash_before: bca9c156df64c999ee281fa70d23717c38983efd
    hash_after: bca9c156df64c999ee281fa70d23717c38983efd
    inputs:
      - name: design/draft
        hash: a13575bf18fdd4bf
        size: 2443
      - name: design/tests-red
        hash: 355ea8bb07b76d81
        size: 668
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d7e2385398cd · claude-code-remote
    hash_before: 187d7fdae76fa937b949d7daa7938ed094f70319
    hash_after: 187d7fdae76fa937b949d7daa7938ed094f70319
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/sync-takes-its-own-branch.md:282:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d7e2385398cd · claude-code-remote
    hash_before: dc0dc6caa1a47e1649768283bfcff714ad7a29c6
    hash_after: dc0dc6caa1a47e1649768283bfcff714ad7a29c6
    answered:
      - name: tests
        exit: 0
        said: green, 4 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/sync-takes-its-own-branch.md:282:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
    inputs:
      - name: design/tests-red
        hash: 355ea8bb07b76d81
        size: 668
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

A cloud box meets a door where it calls `AskUserQuestion`. The refusal tells it to mint a question ticket carrying every command a person needs, push it, and go on with the branch. So a door holds rule 7 of `spec/guidance/cloud/cloud`.

Without it a box asks in the chat, where nobody sits, and the session waits on the question until the owner happens to look. On 09-27 the box on `work/the-foundation-closes-its-gaps` asked a question the guidance answers, and blocked every migration group behind it. The design output lists `AskUserQuestion` among the roads a door must not bite. That stays true on a desk, and a cloud box is the exception.

- a case in `test/level0` refuses `AskUserQuestion` where the session runs in the cloud, and the refusal names the question ticket
- a case there lets `AskUserQuestion` pass on a desk
- `spec/design_output/level0` names the cloud exception where it lists the roads a door must not bite
- `./RUNME.sh check` exits 0

The view: none.

The source: none.

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

A door ahead of the answer door refuses `AskUserQuestion` on a cloud box, and names the question ticket.

| part | where | what it does |
|---|---|---|
| `holdsCloudAsk(e, box)` | `src/bridge/cloud-ask.js`, new | answers `{ result: { deny } }` where the tool is `AskUserQuestion` and `cloudHere(box)` holds, writes a `gate` line to the log, and answers null otherwise |
| the refusal | the same file, `ASKS_NOBODY` | says nobody sits beside the box, names `./RUNME.sh mint ticket spec/tickets/<name>.md --process=question`, asks for every command a person needs in its ask, a push, and the branch going on, and points at rule 7 of `spec/guidance/cloud/cloud` |
| the wire | `onToolCall` in `src/bridge/server.js` | `holdsCall(e, box) ?? holdsCloudAsk(e, box) ?? holdsGrace(...)`, so the owner's hold still answers first |
| the note | `spec/design_output/level0.md`, under where it must not bite, and the list of roads the canary debt leaves open | names the cloud box as the exception, and points at `holdsCloudAsk` |

`cloudHere` in `.claude/skills/level0/lib/cloud.js` answers the one question of where the session runs, as the Bash door and the stop hook read it. A helper's call meets the door too, since nobody sits beside a helper on a cloud box either.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/bridge/server.js`, `onToolCall`, the one caller of `holdsCloudAsk`
- `src/bridge/answer.js`, `holdsForAnswer`, which passes `AskUserQuestion` and stands unchanged behind the new door

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `test/level0/cloud-ask.test.js`, a cloud box refuses AskUserQuestion, and the refusal names the question ticket
- `test/level0/cloud-ask.test.js`, a desk lets AskUserQuestion pass
- `test/level0/cloud-ask.test.js`, a cloud box lets every other tool pass this door

The done lines and the case deciding each:

- the cloud refusal: the first case
- the desk pass: the second case
- the design note: a read of `spec/design_output/level0.md` at review
- the check: `./RUNME.sh check`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/bridge/cloud-ask.js`
- `src/bridge/server.js`
- `test/level0/cloud-ask.test.js`
- `spec/design_output/level0.md`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `cloudHere`, `holdsCall`, `holdsForAnswer`, `onToolCall` and both lists in `spec/design_output/level0.md` stand opened, and each reads as the table says
- a search for `holdsForAnswer(` and `AskUserQuestion` over `src/bridge` names the callers
- each done line names the case or read deciding it

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/cloud-ask.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/cloud-ask.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Over the stub, the refusal case fails on its own assertion: the deny text stands empty. The desk case and the other-tool case pass over the stub, because each guards the side where the door answers null. Nothing surprises: `cloudHere` reads `box.cloud` first, so a case sets the flag and needs no environment.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done line meets a case: the cloud refusal fails red, the desk pass guards the other side, and the note and the check wait for the change
- the door reaches no outside: the case hands it a box whose log records in memory

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- cloud-ask-names-the-hold: `spec/design_output/level0.md` says under the answer hold that `AskUserQuestion` passes it. The cloud exception belongs there too, beside the two lists the draft names

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the four files of the size list
- the door reads `box.log` and `cloudHere` alone, and the tests hand it a box logging in memory
- `cloud-ask.js` and the wire in `onToolCall` point at `spec/design_output/level0#the-cloud-ask-door`
- the door stands once, under The cloud ask door, and the two lists and the hold line point there

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/cloud-ask.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A cloud box used to reach `AskUserQuestion` like a desk, and the question waited in a chat nobody reads. `holdsCloudAsk` in `src/bridge/cloud-ask.js` now refuses it where `cloudHere` holds. The refusal tells the box to decide what it can, and to mint a question ticket with every command a person needs, then push and go on. `onToolCall` reads the door after the owner's hold. A desk asks as before. `spec/design_output/level0#the-cloud-ask-door` holds the door, and the lists of roads a door leaves open point there.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the size list alone
- the tests hand the door a box logging in memory, and the server case drives fake doors
- the code points at `spec/design_output/level0#the-cloud-ask-door`
- the door stands once, in `level0.md`

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
