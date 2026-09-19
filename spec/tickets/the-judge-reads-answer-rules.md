---
kind: [[ticket]]
state: open
step: design/person-1
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: person-1
        does: answers the question the engine asks
        by: person
        to: engine
        asks: "design/review failed back 2 times: Name the note beside the number in a label. A leaf reads several notes, and the material flattens them. So chapter numbering hands the classify call two labels under one number, and a refusal names two rules."
        evidence:
          - name: answer
            form: text
            says: the answer, which the step behind this one reads
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
record:
  - step: design/draft
    hand: box d42624a67d18a8
    hash_before: 9aedaa83df601abf9fb9a8c1bd61f480aa3ac6ab
    hash_after: 9957d177f3a0e444e29956bf26ddd8eed26b6884
  - step: design/review
    hand: box d42624a67d18a8 · helper-2
    hash_before: bbee3dab2891bec671a6779c41a8ed42173cc93a
    hash_after: bbee3dab2891bec671a6779c41a8ed42173cc93a
    returns: 1
    why: Carry each rule's chapter number through `forEvidence`. The hand-out numbers through `actionables`, so a refusal naming 13 names the chapter's 15.; Name the character the mark writes. Every reader strips it the way `actionables` strips the star.; Add `spec/schemas/guidance.schema.yaml` to the table of what changes. Name the second mark beside the `detailMarker` it carries.; Add [[spec/design_output/pull#the-checks]] to the table of what changes. It says a `breaks` answers `refused`, and the numbered labels replace that.; Say what the judge does over a leaf whose rules all carry the mark. Today it stands silent where the reads name no rule.
  - step: design/draft
    hand: box d42624a67d18a8
    hash_before: a8c792b794309a5f97e52f26644a33057d9a1980
    hash_after: 5727411a42b74034a29fcc054a42f749386edc09
  - step: design/review
    hand: box d42624a67d18a8 · helper-4
    hash_before: 8ca072d847c565e5fadaea8b05ec7454957981e4
    hash_after: 8ca072d847c565e5fadaea8b05ec7454957981e4
    returns: 2
    why: Name the note beside the number in a label. A leaf reads several notes, and the material flattens them. So chapter numbering hands the classify call two labels under one number, and a refusal names two rules.
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The judge reads evidence against the rules that fit evidence, and names the rule it finds broken. A hand then fixes the line, and the plugin road stays open to an agent.

Today the judge answers breaks over every hand-back on a cloud box. One run met ten refusals over drafts that lint clean, and it named no rule. Two voice rules describe an answer, and the judge reads them over evidence. So every agent hand-back walks the shell road, which reads no judge, and the judge holds nothing.

- `./RUNME.sh branch test` passes a case where the judge's ask leaves the answer rules out
- `./RUNME.sh branch test` passes a case where a refusal names the rule the judge finds broken
- `./RUNME.sh check` answers 0

# design

## person-1

<!-- answers the question the engine asks -->

### answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

| what changes | how |
|---|---|
| the guidance schema | takes a second mark beside `detailMarker`, as `answerMarker: "^"` |
| the guidance library | strips the mark in `actionables`, and answers `forEvidence` |
| the material in the pull | reads the rules through `forEvidence`, each with its chapter number |
| the wrapper under level one | asks by number, and names the rule it hears |
| the voice note | marks its two answer rules with a trailing `^` |
| [[spec/design_output/pull#the-checks]] | says the judge answers a number, and what each answer does |

A rule that describes an answer ends in `^`, the way a rule wanting argument
ends in `*`. `actionables` strips both, so every reader of the chapter reads
the rule whole and the output style shows no mark. A second reader,
`forEvidence`, drops the marked rules and keeps each rule's number in the
chapter. So a refusal naming rule 15 names line 15 of the note, and the
hand-out's numbering stays the one numbering.

The judge then names what it finds. The classify call takes the labels
`follows` and one number per rule it hands over. A number answers the first
rule the evidence breaks, and the refusal names that number with the rule's
own line. A label outside the set reads as `follows`, because a judge naming
nothing refuses nothing.

A leaf whose rules all carry the mark hands the judge an empty list. The judge
stands silent there, as it does today where the reads name no note. So the
answer rules reach the answer gate alone, which holds them already.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- Name the note beside the number in a label. A leaf reads several notes, and the material flattens them. So chapter numbering hands the classify call two labels under one number, and a refusal names two rules.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

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
