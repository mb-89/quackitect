---
kind: [[ticket]]
state: open
step: verdict
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
group: the-tree-names-its-things
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
  - step: design/person-1
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 9183b66a38b54f46c165b7d3c1c38c787ebdeb8b
    hash_after: 9183b66a38b54f46c165b7d3c1c38c787ebdeb8b
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: f675c71cc3f09695a133b1712807d5f8478b298a
    hash_after: f675c71cc3f09695a133b1712807d5f8478b298a
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-7
    hash_before: 0c67da24f8ba825b2705465c78cf10e665e61b47
    hash_after: 0c67da24f8ba825b2705465c78cf10e665e61b47
  - step: implement/tests-red
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 0f18222b7f8f8c4409486bf31bda410db901d041
    hash_after: 0f18222b7f8f8c4409486bf31bda410db901d041
    answered:
      - name: tests
        exit: 1
        said: assertion, 10 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/tests-red
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 89d13b0031887d1b346837c72ebca97e76edf80d
    hash_after: 89d13b0031887d1b346837c72ebca97e76edf80d
    returns: 1
    why: the hand takes it back
  - step: implement/tests-red
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: a5bdcd95250494a172a38885fcdb37a05209ad18
    hash_after: a5bdcd95250494a172a38885fcdb37a05209ad18
    answered:
      - name: tests
        exit: 1
        said: assertion, 12 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/tests-red
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: ba59402d45f450265344f87ab2bb48a596562f31
    hash_after: ba59402d45f450265344f87ab2bb48a596562f31
    returns: 2
    why: the hand takes it back
  - step: implement/tests-red
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 2581b81744407e872b42de6c40c126314406dfa2
    hash_after: 2581b81744407e872b42de6c40c126314406dfa2
    answered:
      - name: tests
        exit: 1
        said: assertion, 11 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 6f38b6aa113c7aa846ab07ccf9857e8b4e672954
    hash_after: 6f38b6aa113c7aa846ab07ccf9857e8b4e672954
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 201fd0e3b377d851630008332f39720037e166a7
    hash_after: 201fd0e3b377d851630008332f39720037e166a7
    answered:
      - name: tests
        exit: 0
        said: green, 44 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: The rules pass.
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

A label names the note and the number, so one label reaches one rule.

`notesSaid` opens a run per note and numbers from one inside it. So a leaf
reading two notes hands the judge two rules under each number. The label
carries the note's name with it, and each label then reaches one rule.

| what the leaf reads | the labels it hands the judge |
|---|---|
| `spec/guidance/voice` | `voice-1` up to the last rule the note carries |
| `spec/guidance/code/code` | `code-code-1` and its siblings |
| a leaf whose rules all carry the mark | `follows` alone |

The label is the note's path under `spec/guidance`, with each slash as a
hyphen, then a hyphen and the rule's number in that note. `follows` stands
beside them, and a label outside the set reads as `follows`.

A refusal reads the label back to the note it names, so it says the note, the
number and the rule's own line. A reader then opens one place.

What this call weighs, on a box nobody sits beside:

- the numbering inside a note stands as it stands, so the hand-out changes none of it
- two notes share a last segment, so the label carries the whole path under the folder
- the owner rules at the merge, and a shorter label costs a rename of one function

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

| what changes | how |
|---|---|
| the guidance schema | takes a second mark beside `detailMarker`, as `answerMarker: "^"` |
| the guidance library | strips the mark in `actionables`, and answers `forEvidence` |
| the material in the pull | reads the rules through `forEvidence`, each with its label |
| the wrapper under level one | asks by label, and names the note and the rule it hears |
| the voice note | marks its two answer rules with a trailing `^` |
| [[spec/design_output/pull#the-checks]] | says the judge answers a label, and what each answer does |

A rule that describes an answer ends in `^`, the way a rule wanting argument
ends in `*`. `actionables` strips both, so every reader of the chapter reads
the rule whole and the output style shows no mark. A second reader,
`forEvidence`, drops the marked rules and keeps each rule's number in the
chapter. So a refusal naming rule 15 names line 15 of the note, and the
hand-out's numbering stays the one numbering.

A label names the note beside that number, because a leaf reads several notes
and `notesSaid` numbers from one inside each. The label is the note's path
under `spec/guidance`, with each slash as a hyphen, then a hyphen and the
number:

| the note a leaf reads | the labels it hands the judge |
|---|---|
| `spec/guidance/voice` | `voice-1` up to the last rule the note carries |
| `spec/guidance/code/code` | `code-code-1` and its siblings |

The judge then names what it finds. The classify call takes `follows` and one
label per rule it hands over. A label answers the first rule the evidence
breaks. The refusal reads that label back to its note, naming the note, the
number and the rule's own line. A label outside the set reads as `follows`,
because a judge naming nothing refuses nothing.

A leaf whose rules all carry the mark hands the judge an empty list. The judge
stands silent there, as it does today where the reads name no note. So the
answer rules reach the answer gate alone, which holds them already.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- the label carries the note's path and the number, so one label reaches one rule
- `forEvidence` keeps the chapter's number, so a refusal names the line the note holds
- the mark writes `^`, and `actionables` strips it the way it strips the star
- the schema row and the [[spec/design_output/pull#the-checks]] row stand in the table
- a leaf whose rules all carry the mark hands an empty list, and the judge stands silent
- the diff touches this ticket alone
- `./RUNME.sh check` answers 0
- the handback carries no retro, which the branch owes at done

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/guidance.test.js test/level0/level1.test.js test/level0/pull-leaves.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The command answers assertion, and every failing case fails on its own assertion.

| the case | what it holds open |
|---|---|
| the answer mark strips the way the star does | `actionables` leaves the mark standing |
| a label carries the note's path beside the number | `labelOf` stands nowhere |
| the rules for evidence drop the marked one | `forEvidence` stands nowhere |
| a note of marked rules hands an empty list | the same |
| a mark in a code span reads as the bare one | the same |
| the judge's question names each rule by its label | `judgeAsk` numbers from one |
| the labels open on follows | `judgeLabels` stands nowhere |
| a label reads back to the note and the line | `ruleBroken` stands nowhere |
| a label outside the set reads as follows | the same |
| the judge's material names the rules its reads name | the material hands plain strings |
| the judge's ask leaves the answer rules out | the material keeps every rule |
| the shipped note keeps its answer rules out | the note carries no mark |

A named import of a name the module answers nowhere breaks the whole file, and the door reads build over it. So each new case takes the module whole and asks the name is a function first. That surprises me: a red case for a name nobody writes yet stays red where the case takes the module whole. The standing case over `judgeAsk` numbers plain strings, so the label shape turns it red beside the new ones.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. Four case files and this ticket, one per piece the approach names.
- every door the change reaches has a fake. The pull cases reach the disk through the fake in the pull doors. The library cases touch memory alone. The case reading the shipped note stands under test/contract.
- a comment names the approach the change implements. Each case carries a line pointing at this ticket, and the fixture comment names the answer mark.

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

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. Each file the approach's table names, and no other.
- every door the change reaches has a fake. The change reaches no door, and each new reader takes the text its caller hands it.
- a comment names the approach the change implements. Each new function points at the chapter the approach names.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/guidance.test.js test/level0/level1.test.js test/level0/pull-leaves.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The judge now answers a label, and each label names one rule.

| what changes | how |
|---|---|
| the guidance schema | carries `answerMarker` beside `detailMarker` |
| the guidance library | strips both marks, and answers `labelOf` and `forEvidence` |
| the pull's material | hands one labelled rule per rule the leaf's reads name |
| the wrapper under level one | asks by label, and `ruleBroken` reads a label back to its note |
| the voice note | marks its two answer rules |
| [[spec/design_output/pull#the-checks]] | carries the two sections under it |

A rule describing an answer ends in the answer mark, the way a rule wanting argument ends in the star. `forEvidence` drops the marked rules and keeps the chapter's own numbering. So a refusal names the note, the number and the rule's own line, and a reader opens one place.

The note writes the mark in a code span, because the paragraph rules admit the character nowhere else in prose. The library strips either form, so every reader of the chapter reads the rule whole.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. Each file the approach's table names, and the case files beside them.
- every door the change reaches has a fake. The pull cases reach the disk through the fake in the pull doors.
- a comment names the approach the change implements. Each new function points at the chapter the approach names.

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
