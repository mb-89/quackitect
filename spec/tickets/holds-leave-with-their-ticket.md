---
kind: [[ticket]]
state: open
step: accept
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
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: 22e19c6f6aef1f50ee12c0cd673c94fec2f6451c
    hash_after: 22e19c6f6aef1f50ee12c0cd673c94fec2f6451c
    inputs:
      - name: ask
        hash: 260b59b15e28d7e0
        size: 565
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d6f05e3a585030 · claude-code
    hash_before: 2be1307f1e3eff1b9e49f05a53b7507619990f40
    hash_after: 2be1307f1e3eff1b9e49f05a53b7507619990f40
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 5a2cadb20cc0ce0b
        size: 2807
    def: 08e16d07b0de477c
  - step: gate
    hand: box d6f05e3a585030 · claude-code · helper-4
    hash_before: 8b5abad781707f4d1fe90d44877c539aab43cc4b
    hash_after: 8b5abad781707f4d1fe90d44877c539aab43cc4b
    inputs:
      - name: design/draft
        hash: 5a2cadb20cc0ce0b
        size: 2807
      - name: design/tests-red
        hash: b1d5d7b286e9be5f
        size: 907
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d6f05e3a585030 · claude-code
    hash_before: 035693a5ff2e121b318ba71e0c171312f9359cff
    hash_after: 035693a5ff2e121b318ba71e0c171312f9359cff
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d6f05e3a585030 · claude-code
    hash_before: 3ee99ef0ec43d1d7c95dc4b49efdaed5c6c8487a
    hash_after: 3ee99ef0ec43d1d7c95dc4b49efdaed5c6c8487a
    answered:
      - name: tests
        exit: 0
        said: green, 9 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:245:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: design/tests-red
        hash: b1d5d7b286e9be5f
        size: 907
    def: ec253787263043a7
  - step: accept
    hand: box d6f05e3a585030 · claude-code · helper-7
    hash_before: ea413a7ca1873370ca06782fa2a4ac14298a4585
    hash_after: 0100e8845f3644be3463af7e5f0f9db06deb6c2b
    answered:
      - name: design/tests-red/tests
        exit: 0
        said: green, 9 test(s) pass in 1 file(s)
      - name: implement/change/lint
        exit: 0
        said: The rules pass.
      - name: implement/tests-green/tests
        exit: 0
        said: green, 9 test(s) pass in 1 file(s)
      - name: implement/tests-green/check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:265:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 260b59b15e28d7e0
        size: 565
      - name: implement
        hash: 6ff8893262e81181
        size: 1715
    def: 5050b7ed72b70652
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

A hold leaves when its ticket closes, so a closed ticket never stands in hand. Today a hold outlives the close. The pull then names closed tickets as in hand, and a named pull under that hand refuses.

Without it, a helper that stops without a hand-back blocks its own name for good. A session reads closed tickets as its work, and the write door accepts writes against them.

- `./RUNME.sh test` over a new case: a hold on a ticket that closes through another hand drops at the next pull
- a pull after that close names no closed ticket under `In hand`

none

none

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

The owner rules that a hold is a state of the ticket, so a closed ticket stands in no hand. The ticket's state decides, and the hold file keeps what a ticket carries nowhere: the reads, the refusals, the part of a split hand-out, the ephemeral tickets.

| part | where |
|---|---|
| `holdsIn` answers a hold only where its ticket stands open, and an ephemeral hold, which names no path, stands | `src/scripts/ephemeral.js` |
| `everyHold`, `holdsAnywhere` and `holdOf` read through it | `src/scripts/guidance-hand.js` |
| `inHand` reads through it, so the door names no closed ticket in hand | `src/engine/named.js` |
| `holdStands` reads through it, so a closed ticket holds no turn open | `src/bridge/stop.js` |
| the pull removes each hold file whose ticket stands closed or gone, before it reads the hand | `src/scripts/pull.js` |
| the design says the state decides | `spec/design_output/pull.md`, chapter The hand and the hold |

The readers stay pure, and the pull alone removes a file.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/scripts/pull.js`, `pull`, which reads `holdOf` for the hand
- `src/scripts/work-answer.js`, the held rows, off `holdsIn`
- `src/bridge/handover.js`, the retro holds and the handover reads, off `holdsIn`
- `src/bridge/stop.js`, the checks `ticket-in-hand` and the helper hold, off `holdStands` and `holdsIn`
- `src/engine/named.js`, `ticketFault`, and `src/bridge/bash.js`, the shell door, off `inHand`
- `src/scripts/guidance-hand.js`, `heldTests`, off `everyHold`
- `src/scripts/retro-collect.js`, `src/scripts/pull-landed.js`, `src/scripts/rename.js`, `src/scripts/ticket.js`, `src/scripts/work-test.js`, `src/scripts/guidance-verb.js`, `src/scripts/pull-escalate.js`, off `holdOf`, `everyHold` or `holdsAnywhere`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `test/level0/holds-leave.test.js`, a hold on a ticket another hand closes drops at the next pull
- `test/level0/holds-leave.test.js`, a pull after that close names no closed ticket in hand
- `test/level0/holds-leave.test.js`, the door and the stop read no closed ticket in hand
- `test/level0/holds-leave.test.js`, an ephemeral hold stands, since it names no ticket file

The done lines and the case deciding each:

- the hold drops at the next pull: the first case
- no closed ticket in hand: the second and third cases

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/scripts/ephemeral.js`
- `src/scripts/guidance-hand.js`
- `src/engine/named.js`
- `src/bridge/stop.js`
- `src/scripts/pull.js`
- `test/level0/holds-leave.test.js`
- `spec/design_output/pull.md`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `holdsIn`, `everyHold`, `holdOf`, `inHand` and `holdStands` stand opened, and none reads the ticket's state today
- the callers come off a search for `holdOf(`, `everyHold(`, `holdsAnywhere(`, `holdsIn(` and `inHand(` over `src`
- each done line names the case deciding it

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/holds-leave.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/holds-leave.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every case fails on its own assertion over the tree as it stands:

| the case | the class of fault it guards |
|---|---|
| the readers answer no hold on a closed ticket | a hold file stands over the ticket's own state |
| an ephemeral hold stands | a state read drops a hold that names no ticket file |
| the hold drops at the next pull | a closed ticket blocks every other take by its hand |
| a pull names no closed ticket in hand | the door and the stop read a closed ticket as work |

The ephemeral case reads red because the closed hold stands beside it today.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done line meets a case above that fails: the drop at the next pull, and no closed ticket in hand
- the doors the cases reach stand behind their fakes: the fake disk and the fake git of pull-doors.js

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept: the approach answers the ask, and a red test decides each done line.

- The case where a hold drops at the next pull decides the first done line.
- The case where a pull names no closed ticket in hand decides the second.
- Every case fails on its own assertion over the tree as it stands.

Rows for the implement step to fix in place:

- The pull removes each closed hold before `holdOf` reads the hand, and keeps each ephemeral hold.
- A case pins an ephemeral hold standing after a pull, because the clear runs on it.
- The draft lists a case for the door and the stop, and the file carries none for the stop.
- A case over `holdStands` in `src/bridge/stop.js` closes that gap.
- The callers line for `src/bridge/stop.js` names a helper hold, and its `holdsIn` caller is `stepWaitsOnPerson`.
- `everyHold` reads the older `hold.json` too, and no verb writes that file.
- A drop on a gone ticket reaches past the ask, so a case pins it, or it leaves.
- `lensesOf` in `src/extension/lib/lens.js` reads the holds before the state, so a closed ticket draws a held lens.
- Read the state first there, since the draft misses that reader of the hold folder.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/engine/named.js src/scripts/ephemeral.js src/scripts/guidance-hand.js src/bridge/stop.js src/scripts/pull.js src/scripts/ticket.js src/extension/lib/lens.js spec/design_output/pull.md test/level0/holds-leave.test.js test/level0/ticket-verb.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the files match the draft size, plus the lens and the older hold file readers the gate rows name
- the change reaches the disk door alone, and every case runs over the fake disk
- each changed reader links the hold chapter of `spec/design_output/pull.md`, which says the state decides
- `stillHeld` in `src/engine/named.js` owns the rule, and every hold reader calls it

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/holds-leave.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A hold leaves with its ticket. `stillHeld` in `src/engine/named.js` reads the ticket file a hold names, and a file reading `state: closed` stands in no hand. Every hold reader calls it, the door and the stop among them. The pull removes each closed hold file before it reads the hand. The lens reads the state before the holds. A hold naming no path stands. So does one whose ticket file stands on another branch alone, since a work branch or a mint moves the file. The older `hold.json`, which no verb writes, leaves the readers.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the files match the draft size, plus the lens and the older hold file readers the gate rows name
- the change reaches the disk door alone, and every case runs over the fake disk
- each changed reader links the hold chapter of `spec/design_output/pull.md`, which says the state decides
- `stillHeld` in `src/engine/named.js` owns the rule, and every hold reader calls it

# accept

<!-- reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- editor-reads-skip-closed-holds: `graphOf` in `src/extension/lib/route-host.js` and `personal` in `src/extension/lib/fields.js` read the hold a person keeps on a closed ticket. The page then reads it held, and the fields draw marks, until the next pull. The hold chapter of `spec/design_output/pull.md` says the readers skip it. The lens still reads and watches the older `hold.json`, which the tests-green says leaves the readers.

# view

<!-- reads the change in the view the ask names -->

## seen

<!-- pass where the view shows the ask's number, or fail with what it shows -->

<!-- the form is verdict -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The owner's words, as said:

```text
Hold is a state of the ticket and the ticket can only ever be in one state.
So it's either held or it's closed. When it's closed, it can't be held.
```

So the draft reads a hand's hold off the ticket's record, where held derives already. For details, see [[spec/design_output/work#held-derives-from-the-record]]. The hold file under `.se/.runtime/hold` keeps what a ticket carries nowhere:

- the guidance reads
- the refusals
- the part of a split hand-out
- the ephemeral tickets
