---
kind: [[ticket]]
state: closed
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
step: verdict
record:
  - step: design/draft
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 856c3db4bcf415a2eb6fbe66249dca4f406c5cb7
    hash_after: 856c3db4bcf415a2eb6fbe66249dca4f406c5cb7
  - step: design/review
    hand: box d40a1b367f4d · claude-code-remote · helper-20
    hash_before: 141fc89d9930393cb80db588ade508ce3a7c940f
    hash_after: 141fc89d9930393cb80db588ade508ce3a7c940f
  - step: implement/tests-red
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: c1438220558299ffdcca63692890cdc72560a748
    hash_after: c1438220558299ffdcca63692890cdc72560a748
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 2d52b1412f3c3303a66b62824b1c271e1bb40133
    hash_after: 2d52b1412f3c3303a66b62824b1c271e1bb40133
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 3f8eedb3c30f9acb218b018dbc3fc8248d54ec28
    hash_after: 3f8eedb3c30f9acb218b018dbc3fc8248d54ec28
    answered:
      - name: tests
        exit: 0
        said: green, 10 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 108 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: verdict
    hand: box d40a1b367f4d · claude-code-remote · helper-21
    hash_before: 156d83f601b532177749fa77a0fd7b773914d207
    hash_after: 156d83f601b532177749fa77a0fd7b773914d207
reason: done
---

# Ask

A reader holding half a rule still holds what it guards, so each rule names the
failure it prevents.

A rule standing as one instruction leaves a reader guessing what breaks. The
reader then applies it where it costs and skips it where it bites.

- A check refuses a marked rule standing as one sentence.
- Every marked rule in `spec/guidance` names the failure beside it.
- The rule returns to `spec/guidance/guidance.md`, with its chapter in the rationale.
- `./RUNME.sh lint spec/guidance` exits 0.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

A shape rule refuses a marked rule standing as one sentence, every marked rule under `spec/guidance` takes the failure as its second sentence, and the guidance note says so in a rule of its own.

| piece | where | what changes |
|---|---|---|
| the check | `spec/config/styles/VoiceShape/MarkedRuleNamesFailure.yml` | a script rule over the Actionables chapter: a numbered line ending in the mark counts its sentences with code spans and links blanked, and one sentence refuses with the line |
| the sections | `.vale.ini` | none: both guidance sections read `VoiceShape` already |
| the rules | every note under `spec/guidance` | each marked rule standing as one sentence takes a second: the failure it prevents, or the cost a reader pays otherwise. A clause opened by `because` splits into that second sentence |
| the rule | `spec/guidance/guidance.md` | a new rule: write a marked rule as the instruction and then the failure it prevents, marked itself |
| the argument | `spec/rationales/guidance.md` | the chapter that rule wants, saying why half a rule holds what it guards |
| the case | `test/contract/shape.test.js` | a marked rule of one sentence at a guidance path refuses, a marked rule of two passes, and an unmarked rule of one passes |

`./RUNME.sh lint spec/guidance` answers 0 once every note carries the second sentence.


## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
The check reads the Actionables chapter the way the cap rule does, and both guidance sections of the vale config read VoiceShape already.
The rewrite reaches eighty-three of the one hundred twenty-six marked rules, across twenty notes.
The shared chapter fixture in the shape test writes one-sentence marked rules, so the new case writes a fixture of its own.
The guidance note holds twelve rules, so the new rule stands under the cap.
The rationale numbers its chapters by rule, so the new chapter takes the new rule's number.
A second sentence stays under the list item cap of twenty words, or the lint refuses the note.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh branch test test/contract/shape.test.js


### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

- the case feeds Vale a guidance note with a marked rule of one sentence, and no rule refuses it, because the shape folder holds no such rule yet
- the case with two sentences and the case with an unmarked rule pass already
- what surprises the hand: the shared chapter fixture in this test writes one-sentence marked rules, so the case writes a fixture of its own


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the cases stand in the shape contract test, and the change reaches the rule file, the guidance notes, the guidance rule and its rationale chapter
- the cases drive the real Vale, and the rule reaches no door past it
- each case's comment names the guidance note, and the rule file links it


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

./RUNME.sh lint spec/guidance


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the rule file, every guidance note holding a marked rule of one sentence, the guidance rule, its rationale chapter, the projections off the guidance, and the cases
- the rule reaches Vale alone, and the cases drive the real one
- the rule file links the guidance note, and the new rule names the rule file


## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test test/contract/shape.test.js


### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check


### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A shape rule reads the Actionables chapter of a guidance note and counts the sentences of each marked rule, with code spans and links blanked. A marked rule of one sentence refuses at error, so the lint over the guidance goes red until the rule names the failure it prevents. Every marked rule under the guidance folder that stood as one sentence now carries a second: the failure, or the cost a reader pays otherwise. A clause opened by because became that second sentence. The guidance note takes a rule saying so, marked itself, and the rationale takes the chapter arguing it. The projections off the guidance carry the new wording.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the rule file, the guidance notes, the guidance rule, its rationale chapter, the projections and the cases
- the cases drive the real Vale over a note of their own, and the lint drives it over the guidance
- the rule file links the guidance note, and the new rule names the rule file


# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- spec/tickets/a-rule-names-its-failure.md
- spec/guidance/review/reviewing.md
- spec/guidance/guidance.md
- spec/rationales/guidance.md
- spec/config/styles/VoiceShape/MarkedRuleNamesFailure.yml
- spec/config/styles/VoiceShape/GuidanceCap.yml
- test/contract/shape.test.js
- .vale.ini
- .claude/output-styles/level0.md
- spec/guidance/arguing.md
- spec/guidance/code/code.md
- spec/guidance/code/testing.md
- spec/guidance/retro/audit.md
- spec/guidance/retro/chapter.md
- spec/guidance/retro/classify.md
- spec/guidance/retro/collect.md
- spec/guidance/retro/effect.md
- spec/guidance/retro/feedback.md
- spec/guidance/retro/read.md
- spec/guidance/retro/signals.md
- spec/guidance/retro/verify.md
- spec/guidance/tickets.md
- spec/guidance/voice-checks.md
- spec/guidance/voice.md
- spec/guidance/working.md
- spec/tickets/every-road-reads-one-config.md


## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass
The rule reads the Actionables chapter the way the cap rule does, and the lint over the guidance answers green.
The case feeds the rule a marked rule of one sentence and a clause opened by because, and asserts it refuses each.
Every marked rule under the guidance names its failure in a second sentence, and the projection carries the same lines.
The second sentence of the fourth signals rule says the machinery let the agent down, and that reads as the past tense.
The diff touches no file past the ask, and the project verb writes the projection off the guidance.


## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The check stands in the rule file alone and the argument in the rationale chapter alone, the guidance rule names the check and the test comment links the note, and the projection copies the guidance by design.


# Discussion

<!-- what anybody adds, at any time, on this ticket -->
