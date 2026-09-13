---
kind: [[ticket]]
state: open
urgency: soon
step: person-1
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
  - name: person-1
    does: answers the question the engine asks
    by: person
    asks: the hand-back met refused 5 times: verdict breaks Vocabulary at line 96 of its chapter: splices stands outside the words this tree writes. Write a core word, or add splices to spec/vocabulary/terms.yml with the note that defines it.
    evidence:
      - name: answer
        form: text
        says: the answer, which the step behind this one reads
    to: engine
  - name: verdict
    does: reads every hunk against the ask and the approach
    not: implement
    on_fail: implement/reflect
    reads: [[spec/guidance/review/reviewing]]
    input: ["diff", "implement"]
    to: retro
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
process: [[standard]]
record:
  - step: design/draft
    hand: box d49afdfe301a64
    hash_before: 498aad19b4261f5a7e49f30bee2d9b19b79659a4
    hash_after: 498aad19b4261f5a7e49f30bee2d9b19b79659a4
  - step: design/review
    hand: box d49afdfe301a64 · helper-2
    hash_before: dfceb7dfbcf41bd854dfad206c132fe05a3cdcef
    hash_after: dfceb7dfbcf41bd854dfad206c132fe05a3cdcef
  - step: implement/tests-red
    hand: box d49afdfe301a64
    hash_before: c23cd73cf8720d3e1e74607a27b213971bf92a19
    hash_after: c23cd73cf8720d3e1e74607a27b213971bf92a19
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box d49afdfe301a64
    hash_before: ef56e031e23add53823e98c64c8ea53c93f2f8ee
    hash_after: ef56e031e23add53823e98c64c8ea53c93f2f8ee
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box d49afdfe301a64
    hash_before: 5fa31704f3f279214f37059fd33c9a6602bcb709
    hash_after: 5fa31704f3f279214f37059fd33c9a6602bcb709
    answered:
      - name: tests
        exit: 0
        said: green, 312 test(s) pass in 13 file(s)
      - name: check
        exit: 0
        said: The rules pass.
group: the-agent-pulls-a-ticket
---

# Ask

The agent pulls: one verb hands it a leaf of a ticket, and the same verb takes the leaf back with a verdict. Done is two verbs standing under the fakes, with the record, the hold and the stop rule around them:

- `./RUNME.sh branch pull`
- `./RUNME.sh branch test`

**Where it stands.** The design input `spec/design_input/the-agent-pulls-tickets.md` says what the
owner asks for, and the page beside it draws it. Read the note first. It
stands on the branch `claude/relaxed-knuth-f0uk4d` until the owner merges it,
so take that branch in where `work sync` leaves it absent.

This branch is the engine. Its chapters are The pull, The test verb, Evidence
per step, Children and private tickets, and the three rules at the top.

| what stands today | where |
|---|---|
| the schemas, the routes, the record and the render | the two branches before this one |
| the group verbs and the claim | the group branch |
| the judge, which runs through `$.model.classify` inside the hook process | `.claude/skills/level0/hooks/level0.js` |
| the stop rules, one file | `spec/config/stop/level0.yml` |
| the box id v4 keeps | none here yet |

**What waits.**

| the piece | where | proves it |
|---|---|---|
| `work pull [ticket]` | `src/scripts/work.js` | it hands back the ticket in hand and answers `work`, `refused` or `wait` |
| the five checks, cheapest first | `work.js` | the hold and the take hash, the schema and the fields, the commands, the hand rule, the judge |
| the idempotent hand-back | `work.js` | a hand-back the record answers gets the recorded answer, and a stale take hash gets `refused` |
| the pass | `work.js` | the record entry, the step, `state: open`, one commit named by ticket and step, the push, the next ticket |
| the rejected push | `work.js` | it fetches, rebases the one commit, tries once, else answers `refused` |
| the fail | `work.js` | `on_fail` or the step itself, the reason, the return in the record |
| `work.failsBeforePerson` | `work.js` and the config | a step failing back twice inserts a person step |
| `when` at the hand-out | `work.js` | the pull skips a leaf whose condition fails to hold, and the record says so |
| `needs` at the hand-out | `work.js` | a verb the box lacks answers `wait` with the reason |
| the `checked` field | `work.js` | the pull refuses a hand-back with a line short of the checklist |
| `work test` | `work.js` | it answers `green`, `assertion`, `build` or `missing` over the delta from the first take |
| the hold per hand | `.se/hold/<hand>.json`, `.se/box.json` | the pull refuses a second live hold for one session |
| the two-level pull | `work.js` | on trunk a box takes a group, on a branch it takes the group's own leaves around its tickets |
| the derived `children` | `work.js` | a parent advances once every child closes `done` or `became`, and a `dropped` child sends it to `on_fail` |
| the private queue | `work.js` | a box's private tickets come after the group's run out |
| the stop rule | `spec/config/stop/level1.yml` | `work-waiting` reads the session's hold |
| the plugin wrapper | `.claude/skills/level1/` | the pull runs under the tool, and the judge check runs there alone |

**The rules to hold.**

- The agent holds three verbs, and this branch lands one. The shell is the verb, and the tool wraps it.
- A `work` answer hands the leaf, with its fields, its guidance and `does` first.
- A leaf holding a `verdict` field takes the verdict from the field, and the pull refuses the flag there.
- The pull fetches the branch before every hand-out and hand-back.
- A person's hand-back from the shell meets the four mechanical checks. The judge reads it at the next agent pull.

**The tests.**

Every check and every answer takes a test under the fake doors, and the
rejected push takes one of its own. Drive one real pull under
`claude --plugin-dir` before `work done`, and write what you see in the retro.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

One module beside the work verbs holds the engine, and the branch verb hands it `pull` and `test`. The hand-out reads every ticket on the branch and offers four pools in order: a tagged note, the children, the group, the private tickets. The hand-back runs the four mechanical checks in the shell and leaves the judge to the plugin wrapper. Every case runs under the fakes, and one real pull walks this ticket. For details, see [[spec/design_output/pull]].

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

pass
- the approach covers every row of the ask, from the hand-out to the plugin wrapper
- the design note holds the three answers, the five checks, the pass, the fail and the rejected push
- the ask names `work.js` and the note names `pull.js`, so the implement step settles the file
- the ask names the stop rule `work-waiting` and the note names `the-group-stands-in-hand`, so one name wins
- the note names no test for the rejected push, so the tests-red step adds one
- the note names no stop config file, so the implement step writes `spec/config/stop/level1.yml`

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

The verb runs the four test files the branch changes since the take, and one assertion fails: the private ticket carries no turn yet. The surprise is the size of the delta, because the take stands before the engine landed. So the verb runs the whole window, and one red line decides the word.

### checked

- the change touches the stop hook, its ticket lib and two notes, and no other file
- the hook reaches the disk through the harness, and the hook tests carry its fake
- the check points at the private queue chapter of the pull note

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

### checked

- the change touches the stop hook, its ticket lib and two notes, and no other file
- the hook reaches the disk through the harness, and the hook tests carry its fake
- the check points at the private queue chapter of the pull note

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

- the change touches the stop hook, its ticket lib and two notes, and no other file
- the hook reaches the disk through the harness, and the hook tests carry its fake
- the check points at the private queue chapter of the pull note

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

The stop hook now counts an open private ticket the way it counts a hold. A note alone carries nothing, because a note waits for a retro. The design names that count under what level zero changes, and the hook lacked it. So a hand that mints a breakdown on the box keeps its turn until the breakdown closes.

### checked

- the change touches the stop hook, its ticket lib and two notes, and no other file
- the hook reaches the disk through the harness, and the hook tests carry its fake
- the check points at the private queue chapter of the pull note

# person-1

<!-- answers the question the engine asks -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->
<!-- the form is files -->

    - .claude/commands/se-config-answer-ceiling.md
    - .claude/skills/level0/hooks/level0.js
    - .claude/skills/level0/lib/answer.js
    - .claude/skills/level0/lib/apply.js
    - .claude/skills/level0/lib/judge.js
    - .claude/skills/level0/lib/paragraph.js
    - .claude/skills/level0/lib/projection.js
    - .claude/skills/level0/lib/refuse.js
    - .claude/skills/level0/lib/schema.js
    - .claude/skills/level0/lib/stop.js
    - .claude/skills/level0/lib/ticket.js
    - .claude/skills/level0/lib/todo.js
    - .claude/skills/level0/lib/vocabulary.js
    - .claude/skills/level1/hooks/level1.js
    - .claude/skills/level1/lib/pull.js
    - .vale.ini
    - spec/config/level0.json
    - spec/config/level0.schema.json
    - spec/config/stop/level1.yml
    - spec/config/styles/VoiceParagraph/Vocabulary.yml
    - spec/config/styles/VoiceShape/VocabularyEntry.yml
    - spec/design_input/copilot.md
    - spec/design_input/the-agent-pulls-tickets.md
    - spec/design_output/apply.md
    - spec/design_output/bash.md
    - spec/design_output/config.md
    - spec/design_output/copilot.md
    - spec/design_output/doors.md
    - spec/design_output/editor.md
    - spec/design_output/extension.md
    - spec/design_output/index.md
    - spec/design_output/level0.md
    - spec/design_output/private.md
    - spec/design_output/projection.md
    - spec/design_output/pull.md
    - spec/design_output/schema.md
    - spec/design_output/stop.md
    - spec/design_output/tree.md
    - spec/design_output/vehicle.md
    - spec/design_output/vocabulary.md
    - spec/design_output/work.md
    - spec/funnel/a-paragraph-has-a-schema.md
    - spec/funnel/level-zero-closes.md
    - spec/funnel/the-table-holds-every-rule.md
    - spec/guidance/review/reviewing.md
    - spec/guidance/tickets.md
    - spec/guidance/voice.md
    - spec/processes/retro.yaml
    - spec/rationales/cloud.md
    - spec/rationales/extension.md
    - spec/rationales/reviewing.md
    - spec/rationales/testing.md
    - spec/rationales/tickets.md
    - spec/rationales/voice.md
    - spec/schemas/paragraph.schema.schema.json
    - spec/schemas/paragraph.schema.yaml
    - spec/schemas/ticket.schema.yaml
    - spec/tickets/agent-pulls-ticket.md
    - spec/tickets/the-agent-pulls-a-ticket.md
    - spec/vocabulary/core.yml
    - spec/vocabulary/swaps.yml
    - spec/vocabulary/terms.yml
    - spec/vocabulary/words.yml
    - src/scripts/cli.js
    - src/scripts/install.sh
    - src/scripts/prepush.js
    - src/scripts/pull.js
    - src/scripts/ticket.js
    - src/scripts/work.js
    - test/contract/vale.test.js
    - test/contract/vehicle.test.js
    - test/contract/vocabulary.test.js
    - test/level0/answer.test.js
    - test/level0/hooks.test.js
    - test/level0/level1.test.js
    - test/level0/prepush.test.js
    - test/level0/pull.test.js
    - test/level0/ticket-verb.test.js
    - test/level0/ticket.test.js
    - test/level0/todo.test.js
    - test/level0/vocabulary.test.js
    - test/level0/work.test.js

## verdict

<!-- pass or fail, findings one a line -->
<!-- the form is verdict -->

fail
- the files check slices a trimmed porcelain row, so a modified file loses its first letter
- so a payload hand-back on a files field refuses its own ticket, and staging it first gets through
- the voice rule reads a files field as prose, so a path with no slash breaks the vocabulary
- the payload writer splices by the own rows, so a fence in a field swallows the next heading
- the wrapper judges the leaf in hand alone, so a person's shell hand-back meets no judge later
- the wrapper's tool handler carries no hook test, so the judge and the spawn loop go unproven
- the payload lands on disk before the stale-hold check, so a stale hand-back still writes the file
- the branch lands every other row of the ask, the check answers 0, and the retro stands
- the retro names the real pull under the plugin timing out twice

# Discussion

The review step and the verdict step each name `not`, so one box takes one side alone. On a box with no second hand the pull parks them, and a person or the next box answers on the branch.

The engine, its tests and its design note landed in the branch's commits before this ticket's route reached its build phase. The pull had to exist before a record could take a hand. So the leaves under `implement` carry no record, and the review reads the branch's diff against the approach.
