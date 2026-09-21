---
kind: [[ticket]]
state: open
group: misc
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
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: implement/tests-green
record:
  - step: design/draft
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: b00b3c099e8bc72da1316dd0274ad8f51d935506
    hash_after: b00b3c099e8bc72da1316dd0274ad8f51d935506
  - step: design/review
    hand: box d40a1b367f4d · claude-code-remote · helper-15
    hash_before: afa7b4ea74759bc13095e252ff5c007e4e5bdf3c
    hash_after: afa7b4ea74759bc13095e252ff5c007e4e5bdf3c
  - step: implement/tests-red
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: f10c071997dd7e05fca4b92294ef2a38e04adc90
    hash_after: f10c071997dd7e05fca4b92294ef2a38e04adc90
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 77d37a4d517dc74d99a711bbf96163466cf9a6fa
    hash_after: 77d37a4d517dc74d99a711bbf96163466cf9a6fa
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
---

# Ask

The door rule names three reads, and three more stand outside it. A rule
reaching part of a class leaves a reader guessing where the line runs.

A module reading the pid, the node version or the exec path in place takes the
box it runs on into every case of it.

- The door rule refuses `process.pid`, `process.version` and the exec path.
- Each root the pass list holds keeps its read, and each module past one takes the value off the hand.
- A contract case drives Vale over a module's path and over a root's.
- `./RUNME.sh lint src` exits 0.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The door rule grows the three reads, and the two modules past a root that hold one take the value off the hand.

| piece | where | what changes |
|---|---|---|
| the rule | `spec/config/styles/VoiceVale/OutsideInDoors.yml` | the list of reads grows `process.pid`, `process.version` and `process.execPath` |
| the roots | `.vale.ini` | none: every section standing off the rule keeps its read, and the contract test's pass list says which they are |
| the identity | `src/scripts/vehicle.js` | `identityHere` takes the pid as an argument, and the root behind each verb hands it `process.pid` off the hand it builds. A case hands a pid of its own, so an identity replays |
| the review | `src/bridge/review.js` | the helper's spawn takes the node path off the box, which the server root puts there as `node`, the way the command root already does |
| the doors | `src/doors/awake.js`, `src/doors/session.js`, `src/doors/wire.js` | none: a door reads the outside, and the sections say so already |
| the case | `test/contract/outside-in-doors.test.js` | feeds each of the three reads at a module's path and asserts the rule refuses it, then at every root of the pass list and asserts it passes |

The table at [[spec/design_output/doors#a-door-reads-the-outside]] takes three rows, one a read, so the rule and the note say the same list.


## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
The rule file holds the list of reads the draft grows, so the first bullet takes a concrete change.
The pid read in `src/scripts/vehicle.js` and the exec path read in `src/bridge/review.js` are the only reads of the three past a root, and the draft moves both.
The command root builds `node` off the exec path, and `boxOf` in `src/bridge/server.js` reads the environment in one place, so the review's change lands beside it.
`identityHere` calls `idOf` in `src/scripts/vehicle.js`, and each caller reaches back to a root that builds a hand.
Every other read of the three stands under a section the pass list holds, so the lint bullet follows from the two moves.
The contract case feeds each read at a module's path and asserts a refusal, then at every root of the pass list and asserts a pass, so the rule carries a test that fires.
The doors and their fakes keep their reads under the sections standing, and the note's table grows one row a read.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh branch test test/contract/outside-in-doors.test.js


### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

- the case feeds the rule each of the three reads at a module's path, and the rule passes all three, because its list names the environment, the arguments and the platform alone
- the case over every root and every door passes already
- what surprises the hand: nothing, because the rule reads a fixed list and the three stand outside it


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the cases stand in the Vale contract test alone, and the change reaches the rule and the two modules
- the cases drive the real Vale, and the two modules take the value off the hand, which a case fakes
- each case's comment names the door note, and the two modules' comments name the same


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

./RUNME.sh lint src


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the rule, the two modules, the two roots that hand the value in, the stub's entry, the note's table and the cases
- the identity and the review take the value off the hand or the box, which every case fakes
- each changed read carries a comment naming the door note


## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test test/contract/outside-in-doors.test.js


### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check


### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The door rule's list grows the pid, the node version and the exec path, so a module past a root reading one of them meets the rule. Two modules held such a read. The identity in the vehicle module now takes the pid as an argument, and the command root hands it in off the hand it builds, so a case hands a pid of its own and the identity replays. The review door takes the node path off the box, which the server root puts there as `node`, the way the command root already does. Every door and every root keeps its read under the section standing for it, and the note's table names each of the three reads beside what a module takes instead.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the rule, the two modules, the two roots, the stub's entry, the note's table and the cases
- the identity's case hands a pid of its own, and the Vale case drives the real binary
- each changed read carries a comment naming the door note


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
