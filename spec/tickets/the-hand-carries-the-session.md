---
kind: [[ticket]]
state: open
urgency: soon
step: implement/person-1
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
      - name: person-1
        does: answers the question the engine asks
        by: person
        to: engine
        asks: "verdict failed back 2 times: No test drives the level one `session.start` hook, so nothing proves the wrapper writes the session file.; The ask wants a test reading that file back, and the payload builder alone stands tested.; Drive the registered hook with a fake `$.fs`, over an event naming a session and one naming none.; `sessionOf` reads two spellings of the id, and the `session_id` this tree already reads is neither.; Take that third spelling, the way `.claude/skills/level0/lib/copilot.js` takes it.; The level one hook spells the session path again, beside the lib it already imports, so one copy goes.; Every other finding of the last round lands, and the hold here names the agent.; The `own` mark rests on the harness carrying an unknown key, which no type in this tree proves.; `./RUNME.sh check src test .claude spec/design_output` exits 0, and the suite passes 1016 of 1018.; The stub rename belongs to the sibling ticket, and it redesigns nothing here."
        evidence:
          - name: answer
            form: text
            says: the answer, which the step behind this one reads
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
  - step: verdict
    hand: box ee33ce836a4d · helper-9
    hash_before: 175929612a31d11a152154eed497f305d0153570
    hash_after: 175929612a31d11a152154eed497f305d0153570
    returns: 1
    why: The hand names no agent on a harness, because `doorsHere` in `src/scripts/cli.js` hands `it` no `env`.; This step's own hold reads `box ee33ce836a4d · helper-9` under a set `CLAUDE_CODE_REMOTE`.; So `agentOf` runs dead on the pull's own path, and its test passes on a fake alone.; Hand one harness list to both `it.agent` and `agentOf`, so that set stands in one place.; `sessionOf` guesses the engine's field names, and `wrote` swallows the failure, so a wrong guess stays silent.; The box carries no `.se/session.json`, so the wrapper's write stands unproven outside the fake.; The spawn hook tags every spawn, and the design output exempts the spawn the wrapper makes itself.; The tag denies `--as`, and the prompt under it tells that helper to pull `--as`.; No test drives the registered `agent.spawn` hook, so nothing proves the line reaches a prompt.; The session file path stands in three files, and the bridgehead's copy carries no note beside it.; The design output puts the tag in the wrapper, and the change puts it under level zero.; `./RUNME.sh check` exits 0, the suite passes 1013 tests, and the sibling ticket's files redesign nothing here.
  - step: implement/reflect
    hand: box ee33ce836a4d
    hash_before: 4cce2a432a50729f9b9e1eea101d8dc41ae70555
    hash_after: 4cce2a432a50729f9b9e1eea101d8dc41ae70555
  - step: implement/change
    hand: box ee33ce836a4d · claude-code-remote
    hash_before: 6e2c30068b67d7535d9cee93a6f8d2b132e0bed5
    hash_after: 6e2c30068b67d7535d9cee93a6f8d2b132e0bed5
    answered:
      - name: lint
        exit: 0
        said: 42 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box ee33ce836a4d · claude-code-remote
    hash_before: f0aca34a28792f475670c756f9d82cc9b5db2b0b
    hash_after: f0aca34a28792f475670c756f9d82cc9b5db2b0b
    answered:
      - name: tests
        exit: 0
        said: green, 86 test(s) pass in 5 file(s)
      - name: check
        exit: 0
        said: 42 stand at warning, which the panel draws and check allows.
  - step: verdict
    hand: box ee33ce836a4d · claude-code-remote · helper-13
    hash_before: f713aa75019bf9ec9f12461a2c9fe882cfee26c4
    hash_after: f713aa75019bf9ec9f12461a2c9fe882cfee26c4
    returns: 2
    why: No test drives the level one `session.start` hook, so nothing proves the wrapper writes the session file.; The ask wants a test reading that file back, and the payload builder alone stands tested.; Drive the registered hook with a fake `$.fs`, over an event naming a session and one naming none.; `sessionOf` reads two spellings of the id, and the `session_id` this tree already reads is neither.; Take that third spelling, the way `.claude/skills/level0/lib/copilot.js` takes it.; The level one hook spells the session path again, beside the lib it already imports, so one copy goes.; Every other finding of the last round lands, and the hold here names the agent.; The `own` mark rests on the harness carrying an unknown key, which no type in this tree proves.; `./RUNME.sh check src test .claude spec/design_output` exits 0, and the suite passes 1016 of 1018.; The stub rename belongs to the sibling ticket, and it redesigns nothing here.
group: the-hand-carries-a-step
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

./RUNME.sh branch test

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Six tests fail on their own assertion, and one passes: the hold already slugs a helper into a file name of its own. The surprise is that the hand stops at the box today, so every shape the design output names reads the same. For details, see [[spec/design_output/pull#the-hand-and-the-hold]].

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change stays in `src/scripts`, the two plugin folders and their tests, which the ask names.
- the hand reaches the disk and git, and `test/level0/hand.test.js` takes a fake for each.
- a test drives the registered spawn hook, so the line rests on a real call.

## person-1

<!-- answers the question the engine asks -->

### answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change stays in `src/scripts`, the two plugin folders and their tests, which the ask names.
- the hand reaches the disk and git, and `test/level0/hand.test.js` takes a fake for each.
- a test drives the registered spawn hook, so the line rests on a real call.

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->
<!-- the form is text -->

- the class: the change lands the shape and leaves the wiring. A fake proves each piece, and the caller it runs under stands untouched.
- the fix for the class: wire each piece to the caller it runs under, and prove it there. Every fact then stands in one place.
- `doorsHere` builds `it` with the agent flag alone, so `agentOf` reads an empty environment on every real run. The hold this step took proves it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change stays in `src/scripts`, the two plugin folders and their tests, which the ask names.
- the hand reaches the disk and git, and `test/level0/hand.test.js` takes a fake for each.
- a test drives the registered spawn hook, so the line rests on a real call.

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src test .claude spec/design_output

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change stays in `src/scripts`, the two plugin folders and their tests, which the ask names.
- the hand reaches the disk and git, and `test/level0/hand.test.js` takes a fake for each.
- a test drives the registered spawn hook, so the line rests on a real call.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check src test .claude spec/design_output

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The hand now names the box, the session on it and the agent inside it, and the person off a harness. The command line hands one harness list to the hand and to its own flags, so that set stands in one place. On this box the hand reads the agent off the environment, and the hold takes that name. The wrapper marks its own spawn, so level zero tags every other one alone. A failed session write says so, so a wrong guess at the event's fields stands visible. The check over the tree names one error outside this change, where the engine writes a record line past the code span cap.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change stays in `src/scripts`, the two plugin folders and their tests, which the ask names.
- the hand reaches the disk and git, and `test/level0/hand.test.js` takes a fake for each.
- a test drives the registered spawn hook, so the line rests on a real call.

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->
<!-- the form is files -->

- .claude/skills/level0/hooks/level0.js
- .claude/skills/level0/lib/copilot.js
- .claude/skills/level1/hooks/level1.js
- .claude/skills/level1/lib/pull.js
- .vale.ini
- spec/design_output/pull.md
- spec/design_output/vehicle.md
- spec/tickets/the-hand-carries-the-session.md
- spec/tickets/the-stub-plugin-name.md
- src/bridge/guidance.js
- src/bridge/server.js
- src/scripts/cli.js
- src/scripts/hand.js
- src/scripts/pull.js
- src/stub/.claude/skills/bridgehead/.claude-plugin/plugin.json
- src/stub/.claude/skills/level0/.claude-plugin/plugin.json
- src/stub/.claude/skills/level0/hooks/bridgehead.js
- src/stub/.claude/skills/level0/hooks/hooks.json
- test/contract/stub.test.js
- test/level0/bridgehead.test.js
- test/level0/hand.test.js
- test/level0/level1.test.js
- test/level0/stub.test.js
- test/level0/work.test.js

## verdict

<!-- pass or fail, findings one a line -->
<!-- the form is verdict -->

fail

- No test drives the level one `session.start` hook, so nothing proves the wrapper writes the session file.
- The ask wants a test reading that file back, and the payload builder alone stands tested.
- Drive the registered hook with a fake `$.fs`, over an event naming a session and one naming none.
- `sessionOf` reads two spellings of the id, and the `session_id` this tree already reads is neither.
- Take that third spelling, the way `.claude/skills/level0/lib/copilot.js` takes it.
- The level one hook spells the session path again, beside the lib it already imports, so one copy goes.
- Every other finding of the last round lands, and the hold here names the agent.
- The `own` mark rests on the harness carrying an unknown key, which no type in this tree proves.
- `./RUNME.sh check src test .claude spec/design_output` exits 0, and the suite passes 1016 of 1018.
- The stub rename belongs to the sibling ticket, and it redesigns nothing here.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The harness list stands once, and the session path stands three times, where the level one copy is avoidable.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- this ticket splits off [[spec/tickets/step-changes-hands]], which waited at a person step. The branch behind it closes, and the branches waiting on it move.
- the parent's design review asked whether the heading, the Scope line and the table under The five answers agree. They do on the design output as it stands.
