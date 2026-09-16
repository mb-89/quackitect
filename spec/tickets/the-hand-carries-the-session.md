---
kind: [[ticket]]
state: open
urgency: soon
group: the-hand-carries-a-step
step: verdict
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
    needs: ["work test"]
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
process: [[standard]]
process_hash: d1fd9cd113889f29
record:
  - step: design/draft
    hand: box ee33ce836a4d
    hash_before: 9dd9db35e66080faace6466f0132146d0b6188c4
    hash_after: 9dd9db35e66080faace6466f0132146d0b6188c4
  - step: design/review
    hand: box ee33ce836a4d · helper-2
    hash_before: f4fcb63fca048701dadc93921f9a783e0759cb70
    hash_after: f4fcb63fca048701dadc93921f9a783e0759cb70
    returns: 1
    why: The approach chapter runs four paragraphs in a row, and the check answers 1.; Carry the approach as a table, the way the ask's table of pieces reads.; The ask puts the spawn hook under level zero, and the wrapper stands at level one.; Name the one folder holding the spawn hook, so the implement step writes in one place.; The five things the ask calls done stand in the approach, each with the design output behind it.; The check's other findings stand outside the brief, and this ticket leaves them alone.
  - step: design/draft
    hand: box ee33ce836a4d
    hash_before: dd88b814f704835d13c6238f0a2aebe8bd7863da
    hash_after: dd88b814f704835d13c6238f0a2aebe8bd7863da
  - step: design/review
    hand: box ee33ce836a4d · helper-4
    hash_before: 374576ff3443046325122c431a556bcc0f5aed8a
    hash_after: 374576ff3443046325122c431a556bcc0f5aed8a
  - step: implement/tests-red
    hand: box ee33ce836a4d
    hash_before: cd90ca7eeb6d28f8a3642e2b52d2e8790ae2fa27
    hash_after: cd90ca7eeb6d28f8a3642e2b52d2e8790ae2fa27
    answered:
      - name: tests
        exit: 1
        said: assertion, 6 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box ee33ce836a4d
    hash_before: 5cd9ab37961fc75318ddd3d4ca9d6d23961e08ba
    hash_after: 5cd9ab37961fc75318ddd3d4ca9d6d23961e08ba
    answered:
      - name: lint
        exit: 0
        said: 42 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box ee33ce836a4d
    hash_before: 866dc5197348c5e2d173799b79656fa4ea2991ba
    hash_after: 866dc5197348c5e2d173799b79656fa4ea2991ba
    answered:
      - name: tests
        exit: 0
        said: green, 83 test(s) pass in 5 file(s)
      - name: check
        exit: 0
        said: 66 stand at warning, which the panel draws and check allows.
---

# Ask

The pull learns who holds a step, and the first piece is the hand id. Today a hand is the box alone. Two sessions on one box read as one hand, and a helper the session spawns reads as a stranger. The approach stands in [[spec/design_output/pull#the-hand-and-the-hold]] and [[spec/design_output/pull#a-hand-of-its-own]]. The owner's words stand in [[spec/design_input/the-agent-pulls-tickets#hands]]. A person reads the design phase here, because the group behind it waited on one. Done is five things:

- the wrapper writes `.se/session.json` at `session.start`, with the session id and the harness name
- the pull reads the box file and the session file into one hand
- a record entry names the box, the session and the agent. The hold slugs that hand into its file name.
- `--as <name>` appends the helper to the hand, with a hold of its own
- the `agent.spawn` hook puts one line at the head of a helper's prompt. So the helper carries the session's hand, and `not <step>` holds against it.

| the piece | where | proves it |
|---|---|---|
| the hand id | `src/scripts/pull.js` | the box, the session and the agent stand in the record |
| the session file | the plugin wrapper under `.claude/skills/level1` | `session.start` writes it, and a test reads it back |
| the helper's tag | the spawn hook under `.claude/skills/level0` | a helper the session spawns carries the session's hand |

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

| the piece | where it lands | the design output |
|---|---|---|
| the session file at `session.start`, with the session id and the harness name | `.claude/skills/level1/hooks` | [[spec/design_output/pull#the-hand-and-the-hold]] |
| the box file and the session file, read into one hand | `src/scripts/pull.js` | [[spec/design_output/pull#the-hand-and-the-hold]] |
| the record entry naming the box, the session and the agent, and the hold slugging it into a file name | `src/scripts/pull.js` | [[spec/design_output/pull#the-hand-and-the-hold]] |
| `--as <name>`, appending the helper with a hold of its own | `src/scripts/pull.js` | [[spec/design_output/pull#a-hand-of-its-own]] |
| the `agent.spawn` hook, one line at the head of a helper's prompt | `.claude/skills/level0/hooks` | [[spec/design_output/pull#a-hand-of-its-own]] |

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

pass

- The table names every thing the ask calls done, each with its landing and its design output.
- The spawn hook stands under level zero, and the wrapper under level one, as the ask reads.
- One folder holds the spawn hook, so the implement step writes in one place.
- `./RUNME.sh check` answers 0, and the one warning stands outside the brief.
- Every finding of the last round lands.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test test/level0/hand.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Six tests fail on their own assertion, and one passes: the hold already slugs a helper into a file name of its own. The surprise is that the hand stops at the box today, so every shape the design output names reads the same. For details, see [[spec/design_output/pull#the-hand-and-the-hold]].

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the tests touch `src/scripts/pull.js`, the wrapper's lib and the level zero hook, and the ask names all three.
- the hand reaches the disk and git, and the test takes a fake for each.
- the file header names the hand and the hold, and each new test points at its design output.

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

./RUNME.sh lint src test .claude

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches `src/scripts` and the two plugin folders, which the ask's table names.
- the hand reaches the disk and git, and `test/level0/hand.test.js` takes a fake for each.
- each new function points at the design output section the approach names.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The hand now names the box, the session on it and the agent inside it. Off a harness it names the person, by their git author name. The pull reads `.se/session.json` beside the box file, and the wrapper writes it at `session.start`. A spawn hook under level zero puts one line at the head of a helper's prompt. The hand stands in `src/scripts/hand.js`, because the write door refuses a write growing `src/scripts/pull.js` past its ceiling. Two work tests name a harness, because the hand off a harness is a person now.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches `src/scripts`, the two plugin folders and their tests, which the ask names.
- the hand reaches the disk and git, and every new test takes a fake for each.
- each new function points at the design output section the approach names.

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

- this ticket splits off [[spec/tickets/step-changes-hands]], which waited at a person step. The branch behind it closes, and the branches waiting on it move.
- the parent's design review asked whether the heading, the Scope line and the table under The five answers agree. They do on the design output as it stands.
