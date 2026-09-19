---
kind: [[ticket]]
state: closed
urgency: now
group: the-person-step-holds
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
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: 271271b79d41303b58ad35b68c77ca31e683bdd2
    hash_after: 271271b79d41303b58ad35b68c77ca31e683bdd2
  - step: design/review
    hand: box ca870d4f20f4 · claude-code-remote · helper-2
    hash_before: 2cdd6affeee3f1eea84d410f9afc99fe69246c07
    hash_after: 2cdd6affeee3f1eea84d410f9afc99fe69246c07
  - step: implement/tests-red
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: a6017d47dba552d7ad0b1509ef721df64a0a14c8
    hash_after: a6017d47dba552d7ad0b1509ef721df64a0a14c8
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: 3fc8e42576fb8130afb5dd490267a7ada656017a
    hash_after: 3fc8e42576fb8130afb5dd490267a7ada656017a
    answered:
      - name: lint
        exit: 0
        said: 87 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: c769e9fea473b0c4f4c1987c5dbede45379ca2b2
    hash_after: c769e9fea473b0c4f4c1987c5dbede45379ca2b2
    answered:
      - name: tests
        exit: 0
        said: green, 50 test(s) pass in 4 file(s)
      - name: check
        exit: 0
        said: 87 stand at warning, which the panel draws and check allows.
  - step: verdict
    hand: box ca870d4f20f4 · claude-code-remote · helper-7
    hash_before: 79e0723394b981f8ea959830435d67509961bf50
    hash_after: 79e0723394b981f8ea959830435d67509961bf50
reason: done
---

# Ask

A box takes a group whose every open step waits for a person, and the pull hands it the retro. The box writes a retro over an empty window, and the next box does the same. The group behind this ticket met that eight times. The owner's words stand in [[spec/design_input/the-agent-pulls-tickets#children-and-private-tickets]]. Done is three things:

- a box with nothing at an agent step leaves the group at `todo` and hands no retro out. It says which person step waits.
- the take says so before the box writes a line, so a cloud box stops at the take
- the judge reads a `command` field as no prose. A one-line command under a retro leaf meets no working rule.

| the piece | where | proves it |
|---|---|---|
| the group leaves | `src/scripts/pull.js` | a box with nothing at an agent step leaves the group at `todo` |
| the judge and a command | the wrapper's judge material under `.claude/skills/level1` | a command field under a retro leaf passes the judge |

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

The pull stops walking a group forward where every open child waits for a person, and the take reads the same answer before it writes.

| the piece | the edit | what a reader sees |
|---|---|---|
| the group leaves | `advanced` returns the wait at a `children` leaf where no open child offers a step a hand can take | the group stands at its `children` step, and no retro leaf comes out |
| the take says so first | `take` reads that same answer over the group's children, and returns before `claimGroup` writes its entry | a cloud box stops at the take, with the group at `todo` |
| the judge and a command | `judgeMaterial` leaves out a field whose form reads `command` | a one-line command under a retro leaf passes the judge |

Today's walk is what writes the empty retro.

| what happens now | what it costs |
|---|---|
| a `children` leaf finds open children and no step a hand can take | the leaf writes a skip |
| the walk moves to the leaf behind it | the retro comes out |
| the guard on that skip reads the hand that wrote the last one | a fresh box skips again |

The wait answer already names the person step. The offer over each child hands one back, and the pull prints it, so the first piece adds no field.

`branch done` already refuses a group whose open steps a hand can take, and leaves one whose steps all wait. The group lands back at `todo`, so the take is the door keeping the next box off it.

The judge reads every field of the chapter today, and the schema calls some of them `command`.

- the leaf names the form of each field it asks for
- the material hands the judge the prose fields alone
- a chapter carrying commands alone hands over nothing, and the hook skips the judge where the evidence stands empty

<!-- the form is text -->

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

pass

- Name the exit code the take answers, and the branch the box stands on after it stops.
- Say whether the take reads the next free branch, or stops on the first one.
- The takeable answer over children stands in `advanced` and `leaves`, so name the one place owning it.
- Say that a children leaf passes where every child closes, so the retro still comes out.
- Say why the form filter lands in the engine, where the leaf names each field's form.

<!-- the form is verdict -->

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

    ./RUNME.sh branch test

<!-- the form is command -->

### seen

Three tests stand red, one a piece of the ask, and each fails on the claim its name makes.

| the test | where | what it meets today |
|---|---|---|
| a group whose open children all wait for a person stands at children | `test/level0/pull-steps.test.js` | the pull answers work at the retro leaf |
| take leaves such a group at todo | `test/level0/work-group.test.js` | the take switches, writes the record, commits and pushes |
| the judge's material leaves a command field out | `test/level0/pull-leaves.test.js` | the evidence carries the command line |

Two things surprise a reader here.

- the wait answer names the person step today, so the first test asserts words the pull already writes
- the group's own record carries the skip, so the first test reads the record as well as the step

The review leaf asks where the takeable answer over children stands. Today `advanced` and `leaves` each work it out. The change step puts it in one place, and both callers read it there.

The same leaf asks why the form filter lands in the engine. The leaf names the form of each field, and the engine is the side reading the leaf.

<!-- the form is text -->

### checked

- the tests reach the pull, the take and the judge's material, which the ask names
- the cases drive the fake doors beside them, so every door the change reaches has a fake
- each test names the claim it makes and points at the ticket owning the reason

<!-- the form is checklist -->

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

    ./RUNME.sh lint

<!-- the form is command -->

### checked

- the change reaches the pull, the take and the judge's material, and the notes owning their facts
- the cases beside the change drive fake doors, and the change adds no door
- each new function carries one line naming this ticket, which holds the approach

<!-- the form is checklist -->

## tests-green

<!-- makes the tests pass -->

### tests

    ./RUNME.sh branch test

<!-- the form is command -->

### check

    ./RUNME.sh check

<!-- the form is command -->

### says

A box with nothing at a step it can take now leaves the group where it stands, and says which person step waits.

| the edit | where | what a reader meets |
|---|---|---|
| a `children` leaf with an open child returns the wait | `advanced` | the group holds its step, and no retro leaf comes out |
| the take reads the group before it writes | `take` | the take answers zero, on the branch, with the group at `todo` |
| the judge's material drops a command field and an empty heading | `judgeMaterial` | a chapter of commands hands the wrapper nothing |

`standsOpen` is the one place answering what a hand can take across a group. The take and `branch done` both read it, so the two verbs answer the same line.

The review leaf asks five things, and each one answers here.

| what it asks | what stands |
|---|---|
| the take's exit code and the branch | zero, and the box stands on the branch it switched to |
| the next free branch, or a stop | a stop, which is the ask's word, so a cloud box halts there |
| the one place owning the takeable answer | `standsOpen` |
| a children leaf where every child closes | it passes by the engine, so the retro still comes out |
| the form filter in the engine | the leaf names each field's form, and the wrapper imports nothing past its own folder |

The walk writes no skip any more. Its guard read the hand writing the last skip, so a fresh box wrote another. The retro then came out over an empty window, box after box.

<!-- the form is text -->

### checked

- the change reaches the pull, the take and the judge's material, and the notes owning their facts
- the cases beside the change drive fake doors, and the change adds no door
- each new function carries one line naming this ticket, which holds the approach

<!-- the form is checklist -->

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

- .claude/commands/se-config-work-failsBeforeWait.md
- .claude/commands/se-config-work-refusalsBeforeFail.md
- .claude/commands/se-config-work-refusalsBeforePerson.md
- .claude/skills/level0/lib/schema.js
- .claude/skills/level1/hooks/level1.js
- spec/config/level0.json
- spec/config/level0.schema.json
- spec/design_output/pull.md
- spec/design_output/work.md
- spec/guidance/review/reviewing.md
- spec/tickets/a-person-reads-the-pull.md
- spec/tickets/escalate-inserts-a-person-step.md
- spec/tickets/person-step-refuses-an-agent.md
- spec/tickets/refusal-cap-inserts-no-person.md
- spec/tickets/the-group-leaves-at-todo.md
- src/scripts/cli-doors.js
- src/scripts/group.js
- src/scripts/pull-chapter.js
- src/scripts/pull-hand.js
- src/scripts/pull-route.js
- src/scripts/pull-writes.js
- src/scripts/pull.js
- src/scripts/work.js
- test/contract/pull-payload.test.js
- test/level0/pull-leaves.test.js
- test/level0/pull-steps.test.js
- test/level0/work-group.test.js

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

pass

- Each of the three pieces the ask names lands, and a test holds its new answer.
- `./RUNME.sh check` answers exit 0, and `./RUNME.sh branch test` runs green.
- Every file the diff touches serves the ask, and each stays inside what it asks.
- `work.js` imports `frontOf` from `group.js` a second time, so fold it into the block above.
- `waitsAt` repeats the current-step line `pull-hand.js` and `unblock.js` carry, and one place owns it.
- A test wants the take claiming a group whose open child carries a step a hand takes.
- `branch review` names one fix: the handback wants the retro the group's last leaf writes.

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

- `standsOpen` and the two notes each own their fact, and the verdict names the line `waitsAt` repeats.

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- this ticket splits off [[spec/tickets/a-step-changes-hands]], whose retro names both lines under improve
