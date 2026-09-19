---
kind: [[ticket]]
state: open
urgency: soon
group: the-person-step-holds
step: implement/change
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
depends_on: ["the-hand-carries-the-session"]
record:
  - step: design/draft
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: 1bbe6425e3ec1e220543c75c1b4f98d7b954c541
    hash_after: 1bbe6425e3ec1e220543c75c1b4f98d7b954c541
  - step: design/review
    hand: box ca870d4f20f4 · claude-code-remote · helper-2
    hash_before: 003a26300982a422dc0386133689d824f5667990
    hash_after: 003a26300982a422dc0386133689d824f5667990
  - step: implement/tests-red
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: 513c776461ea73093e2d823dd7f8ca3ffc3165b1
    hash_after: 513c776461ea73093e2d823dd7f8ca3ffc3165b1
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: 28479a0da6406e15c59d4b9c600a9d1c5d03ba86
    hash_after: 28479a0da6406e15c59d4b9c600a9d1c5d03ba86
    answered:
      - name: lint
        exit: 0
        said: 87 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: 618c76742cda61122552b3b33bf5701d37af3134
    hash_after: 618c76742cda61122552b3b33bf5701d37af3134
    answered:
      - name: tests
        exit: 0
        said: green, 70 test(s) pass in 7 file(s)
      - name: check
        exit: 0
        said: 87 stand at warning, which the panel draws and check allows.
  - step: verdict
    hand: box ca870d4f20f4 · claude-code-remote · helper-7
    hash_before: 4b66a69fdb7666c9d4c08dc90ff8524648914ffb
    hash_after: 4b66a69fdb7666c9d4c08dc90ff8524648914ffb
    returns: 1
    why: "`takeBack` weighs the record's role against the named hand, so a person's `--back` comes back refused; the fix stands in `src/scripts/pull.js`, where the hand-back check wants `roleOf(who.hand)`; the write one line under that check already takes `roleOf`, so the read alone trails it; the suite drives `--back` on a box hand alone, and runs green over this break; the three pieces of the ask otherwise land: the refusal, the git author name, the signing door; `signFaults` names the tip and takes `G` and `U`, which the hand-rule chapter owns; `signFaults` lets a private ticket by, and the tests drive the tracked path alone; `excludes` reads a hand as its role, which keeps the `not` rule on the record's words; the two generated command files follow the config key, and the schema carries its help line; the files past this ask come from the sibling tickets on this branch, and each stands under its own; `./RUNME.sh check` exits green on this tip"
  - step: implement/reflect
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: 039fa8b84ef95bcc0dc6c9c064756c65a8c68c61
    hash_after: 039fa8b84ef95bcc0dc6c9c064756c65a8c68c61
---

# Ask

A step whose `by` is `person` waits for a person. Today nothing stops an agent from handing it back. The approach stands in [[spec/design_output/pull#the-hand-rule]]. The owner's words stand in [[spec/design_input/the-agent-pulls-tickets#hands]]. A person reads the design phase here, because the group behind it waited on one. Done is three things:

- the pull refuses a hand-back on a `by: person` step where the environment names an agent's harness. The refusal names the step.
- a person's hand reads as their git author name off a harness, and the record names it so
- `work.personSigns` switched on makes a person's hand-back on a tracked ticket meet a signed tip. An unsigned tip refuses the hand-back, and the refusal names the tip.

| the piece | where | proves it |
|---|---|---|
| the person's hand | `src/scripts/pull.js` | the verb refuses `by: person` where the environment names an agent's harness |
| `work.personSigns` | the config and `src/scripts/pull.js` | switched on, a person's hand-back needs a signed commit |

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

The design output carries the approach, and this change adds the signing door. For details, see [[spec/design_output/pull#the-hand-rule]].

| the piece | where it stands |
|---|---|
| the refusal on a `by: person` step where the environment names a harness | `handFaults`, standing |
| the hand a box off a harness reads | `handOf`, standing, and it answers the role alone |
| `work.personSigns` | this change, in the config and the hand-back |

The signing door reads the tip through the git door.

- the key reads false where nothing names it, so a tree keeps the door it has
- switched on, a person's hand-back on a tracked ticket reads the tip's signature
- `good` and `untrusted-good` pass, and another word comes back refused, naming the tip
- an agent's hand-back reads no signature, and a private ticket reads none

The second piece of the ask wants a person's git author name in the hand. The hand-rule chapter says both, and the two halves land in different places.

| where the name can stand | what the rule says |
|---|---|
| the hold, which git ignores | the chapter writes the name there |
| the record, which git tracks | the chapter writes the role alone, and the voice rule holds a tracked file to it |

So the hold takes the name and the record takes the role. The review leaf reads whether that answers the ask, because a person owns the call.

<!-- the form is text -->

## review

<!-- reads the approach against the ask -->

### verdict

pass

- the split answers the ask: the hold, which git ignores, takes the name, and the record takes the role
- the voice rule and the hand-rule chapter decide that already, so the call needs no person
- `handOf` feeds the hold's file name and the record's hand alike, so name where the name enters
- the ask names `src/scripts/pull.js`, and the refusal stands in `handFaults` under `src/scripts/pull-chapter.js`
- the `work` group in the config schema carries the other counts alone, so add `personSigns` with its help line
- the git door answers `lastAuthor`, so add the signature read beside it and let a fake process fake it
- the refusal on a `by: person` step stands today, so the first bullet asks for a test
- a person's name in the hand changes the hold's file name, so say what a standing hold does

<!-- the form is verdict -->

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

    ./RUNME.sh branch test

<!-- the form is command -->

### seen

Four tests stand in `test/level0/pull-person.test.js`, and two of them run red.

| the test | where it stands |
|---|---|
| an agent hand-back on a person's step names the step | green, because `handFaults` already refuses it |
| a hand off a harness carries the git author name | red, because `handOf` answers the role alone |
| `work.personSigns` refuses an unsigned tip | red, because no key and no signature read stand |
| a signed tip passes, and an agent reads no signature | green, and it turns real once the door lands |

The first bullet of the ask surprises a reader, and the review leaf names it.

- the refusal stands today, so this leaf writes its test and the change writes no code for it
- the hand-out stops an agent before the hand-back, so the test drives `handFaults` where the pull reaches it nowhere
- the refusal sits in `handFaults` under `pull-chapter.js`, and the ask's table names `pull.js`

A person's name enters through `handOf`, which feeds the hold's file name and the record's hand alike. So the change splits the two, and the record takes a role the name comes off.

<!-- the form is text -->

### checked

- the ask names one file, and the refusal and the signature read stand where the review leaf says
- the cases drive the fake git beside them, and the signature read lands on that door
- each test names the claim it makes, and the file points at the hand-rule chapter

<!-- the form is checklist -->

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

The change narrowed what a record holds, and a reader of that field trails behind.

| the field | what it held | what it holds now |
|---|---|---|
| a record entry's `hand` | the whole hand, name and all | the role, which `roleOf` takes off the hand |

Two readers weigh that field against a live hand. `excludes` takes the role already, and `takeBack` weighs the whole hand, so a person's `--back` comes back refused. The fix for the class is one rule: a reader of `hand` reads a live hand as its role first.

- `takeBack` takes `roleOf(who.hand)`, and its refusal and its commit name the role
- the hold keeps the whole hand, because git ignores it and `asOf` reads the name off it
- a test drives `--back` off a harness, which is the road the suite left open

<!-- the form is text -->

### checked

- the fix reaches the reader the finding names, and the ticket's own files beside it
- the case drives the fake git the other cases drive, and the change adds no door
- the reader carries one line pointing at the hand-rule chapter, which owns the split

<!-- the form is checklist -->

## change

<!-- makes the change -->

### lint

    ./RUNME.sh lint

<!-- the form is command -->

### checked

- the change reaches the hand, the hand-back and the config, which the ask and the review leaf name
- the git door grows two reads, and the fake process beside it answers both
- each new function carries one line pointing at the hand-rule chapter

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

A person's hand carries who, and the record carries the role. A config key puts a signed tip in front of a person's hand-back.

| the piece | where it lands |
|---|---|
| the hand off a harness | `handOf` reads the git author through the door, and answers `person <name>` |
| the record | `roleOf` takes the name off, so every record write and the take's commit hold the role |
| the `not` rule | it reads a hand as its role, because the record holds roles |
| the signing door | `signFaults` reads the tip's signature where `work.personSigns` switches it on |

The git door grows two reads, `authorName` and `signatureOf`, and the fake process answers both.

- a box naming no author answers the role alone, so a tree with no git name keeps what it has
- `G` and `U` pass, which is a good signature and a good one under a key nobody trusts
- an agent's hand-back reads no signature, and a private ticket reads none

The review leaf asks two things the change answers. The name enters at `handOf` and stops at `roleOf`, so the hold alone carries it. A hold standing from before carries the old file name, and the next pull writes one under the new name.

<!-- the form is text -->

### checked

- the change reaches the hand, the hand-back and the config, which the ask and the review leaf name
- the git door grows two reads, and the fake process beside it answers both
- each new function carries one line pointing at the hand-rule chapter

<!-- the form is checklist -->

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

- .claude/commands/se-config-work-personSigns-false.md
- .claude/commands/se-config-work-personSigns-true.md
- spec/config/level0.json
- spec/config/level0.schema.json
- spec/tickets/person-step-refuses-an-agent.md
- src/doors/git.js
- src/scripts/cli-doors.js
- src/scripts/hand.js
- src/scripts/pull-chapter.js
- src/scripts/pull-hand.js
- src/scripts/pull-route.js
- src/scripts/pull-writes.js
- src/scripts/pull.js
- src/scripts/work.js
- test/level0/hand.test.js
- test/level0/pull-person.test.js
- .claude/commands/se-config-work-failsBeforeWait.md
- .claude/commands/se-config-work-refusalsBeforeFail.md
- .claude/commands/se-config-work-refusalsBeforePerson.md
- spec/config/styles/VoiceParagraph/Vocabulary.yml
- spec/design_output/work.md
- spec/tickets/escalate-inserts-a-person-step.md
- spec/tickets/refusal-cap-inserts-no-person.md
- spec/tickets/the-group-leaves-at-todo.md
- spec/vocabulary/terms.yml
- src/scripts/branch-usage.js
- src/scripts/unblock.js
- test/contract/pull-payload.test.js
- test/level0/pull-escalate.test.js
- test/level0/pull-leaves.test.js
- test/level0/pull-steps.test.js
- test/level0/work-group.test.js
- spec/design_output/pull.md
- src/doors/fake/git.js
- src/scripts/group.js
- src/scripts/guidance-hand.js
- src/scripts/test-verb.js
- test/level0/pull-doors.js
- test/level0/pull.test.js

<!-- the form is files -->

## verdict

fail

- `takeBack` weighs the record's role against the named hand, so a person's `--back` comes back refused
- the fix stands in `src/scripts/pull.js`, where the hand-back check wants `roleOf(who.hand)`
- the write one line under that check already takes `roleOf`, so the read alone trails it
- the suite drives `--back` on a box hand alone, and runs green over this break
- the three pieces of the ask otherwise land: the refusal, the git author name, the signing door
- `signFaults` names the tip and takes `G` and `U`, which the hand-rule chapter owns
- `signFaults` lets a private ticket by, and the tests drive the tracked path alone
- `excludes` reads a hand as its role, which keeps the `not` rule on the record's words
- the two generated command files follow the config key, and the schema carries its help line
- the files past this ask come from the sibling tickets on this branch, and each stands under its own
- `./RUNME.sh check` exits green on this tip

<!-- the form is verdict -->

## checked

- the hand-rule chapter owns the signing rule, and each new function points at it. The schema holds the key's help line, which the generated commands take.

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- this ticket splits off [[spec/tickets/step-changes-hands]], which waited at a person step. The branch behind it closes, and the branches waiting on it move.
