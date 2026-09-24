---
kind: [[ticket]]
state: open
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
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
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
process_hash: 7a1a6e274b56e7ee
group: terms-mean-themselves
depends_on: ["a-term-means-itself"]
step: implement/change
record:
  - step: design/draft
    hand: box a0ae5042621d · claude-code-remote
    hash_before: ad4e1e2e92fc384e7bf4c82c4e74c35b5dd9cc8a
    hash_after: ad4e1e2e92fc384e7bf4c82c4e74c35b5dd9cc8a
  - step: design/review
    hand: box a0ae5042621d · claude-code-remote · helper-2
    hash_before: f713b1b569f92991b3afb4ad19597eb3849db8cc
    hash_after: f713b1b569f92991b3afb4ad19597eb3849db8cc
  - step: implement/tests-red
    hand: box a0ae5042621d · claude-code-remote
    hash_before: 920305b6fee5cd1e2d59183c24cf65d6c1835f2f
    hash_after: 920305b6fee5cd1e2d59183c24cf65d6c1835f2f
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box a0ae5042621d · claude-code-remote
    hash_before: ed2c819ba8b31ddb918cfe3de12839c1d91271f9
    hash_after: ed2c819ba8b31ddb918cfe3de12839c1d91271f9
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box a0ae5042621d · claude-code-remote
    hash_before: 7881a0843d8d831ccf1220ed0fa8157ab2bccefd
    hash_after: 7881a0843d8d831ccf1220ed0fa8157ab2bccefd
    answered:
      - name: tests
        exit: 0
        said: green, 30 test(s) pass in 4 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box a0ae5042621d · claude-code-remote · helper-7
    hash_before: 2289fe49fca86ce807117f49caa3cd3d6b9d4675
    hash_after: 2289fe49fca86ce807117f49caa3cd3d6b9d4675
    returns: 1
    why: "design: the branch answers each row of the Ask table, and `./RUNME.sh check` answers 0.; design: each term drops `defines` and keeps its line, and no caller reads `defines` or `undefinedTerms`.; craft: the `linked` case puts the link under `source`, and the source shape refuses that already.; craft: so no case proves the new link check fires, and the rule passes its test without it.; craft: add a case with a link under a field no other check reads, and assert a refusal."
  - step: implement/reflect
    hand: box a0ae5042621d · claude-code-remote
    hash_before: 7c789e64c1cee00c00748f0b08e6948b7e06b512
    hash_after: 7c789e64c1cee00c00748f0b08e6948b7e06b512
---

# Ask

The dictionary is the source of what a term means, so a term points at no
note in this tree. A note points at a term, and the dictionary points at
nothing inside the tree. The plan stands in
[[spec/design_input/the-editor-draws-the-ticket#terms-mean-themselves]].

| where | refuses |
|---|---|
| the shape rule over `terms.yml` | `defines`, and a link into the tree in any field |
| the entry the paragraph schema names | `defines`, and names `means` in its place |
| the vocabulary rule | nothing new, and its refusal names the line a term wants |

**Gain.** A term reads whole where it stands, and no note carries a second
copy of what it means.

**Breaks.** Without it a session adds a term with a link again, and the
dictionary splits its meaning over the notes.

**Done when.**

- no term in `terms.yml` carries `defines`, and `./RUNME.sh branch test test/contract/vocabulary.test.js` holds it
- the shape rule refuses a term with `defines` or a link, and `./RUNME.sh branch test test/contract/shape.test.js` holds it
- the refusal names `means`, and `./RUNME.sh branch test test/level0/vocabulary.test.js` holds it
- `spec/design_output/vocabulary.md` says a term carries its line
- `./RUNME.sh check` is green

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Every term drops `defines`, and each reader stops asking for it:

| piece | change |
|---|---|
| `terms.yml` | every entry drops `defines`, and the header says a term carries its line |
| `VocabularyEntry.yml` | refuses `defines`, and a link anywhere in a term |
| `vocabulary.js` | `termsOf` drops `defines`, `undefinedTerms` and its pattern go, and the refusal names the line a term wants |
| `refuse.js` | the refusal writes the entry with `means` |
| `paragraph.schema.yaml` | the growth entry names `means` and `source` |
| `vocabulary.md`, `voice.md`, the header of `core.yml` | say a term carries its line |

The list test stops resolving notes. It holds that no term carries `defines`
or a link, beside the test the field child adds.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `test/contract/vocabulary.test.js`, the list test calls `undefinedTerms` and resolves `defines`
- `test/level0/vocabulary.test.js`, the layer test calls `undefinedTerms` and reads the refusal from `grown`
- `.claude/skills/level0/lib/refuse.js`, `refusal` calls `grown`
- `.claude/skills/level0/lib/paragraph.js`, the projection calls `vocabularyRule`
- `test/level0/hooks.test.js`, the write door case edits a term line
- `test/contract/shape.test.js`, the entry cases run `VocabularyEntry.yml`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- design: the approach answers each row of the Ask table and each line of Done when.
- design: every term carries `means` already, because `a-term-means-itself` stands closed.
- craft: the pieces leave out `VoiceParagraph/Vocabulary.yml`, so project it again, or the check reads it stale.
- craft: the callers leave out `answerFindings` and `gateNote` in `refuse.js`, which reach `grown` too.
- craft: the `who` line of the growth entry names the note, so change it with `entry`.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/contract/vocabulary.test.js test/contract/shape.test.js test/level0/vocabulary.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

| test | stands |
|---|---|
| the list test | red, because every term still carries `defines` |
| the shape test | red, because the rule still asks for `defines` and passes a term carrying one |
| the refusal test | red, because the refusal still asks for a note |
| the rule test | red, because the rule still names the note a term wants |

Nothing surprises me. The field child leaves every term a line, so the list
loses nothing when `defines` goes.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the tests touch the list, the two rules and the refusal, and the ask names each
- the tests read fixture text and the lists through the disk door, and reach no other door
- each test carries a comment naming the design output

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

The class is a case that a second check refuses first. The `linked` case puts
its link under `source`, where the address check already refuses it, so the
case passes with the link check gone. The fix gives each refusal a case that
breaks that refusal alone, here a link under a field no other check reads.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the fix touches the shape test alone, and the ask names it
- the shape test reaches the rule through the one door it reads, and no other
- the case carries the comment of the test it joins

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the list, both rules, the refusal, the schema, the notes the ask names and their tests
- the tests reach the disk door alone, and the fake disk stands for it
- the shape rule and the reader each carry a comment naming the design output

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test test/contract/vocabulary.test.js test/contract/shape.test.js test/level0/vocabulary.test.js test/level0/hooks.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

No term points at a note now. The line under `means` says what a term means,
and the dictionary is the source.

| piece | what changes |
|---|---|
| `terms.yml` | every entry drops `defines`, and the header says a term carries its line |
| `VocabularyEntry.yml` | refuses `defines` and a link anywhere in a term |
| `vocabulary.js` | `termsOf` drops `defines`, `undefinedTerms` goes, and the rule names the line a term wants |
| `refuse.js` | the refusal writes the entry with `means` |
| the schema and the notes | the growth entry, `vocabulary.md`, rule fifteen of `voice.md` and the header of `core.yml` say a term carries its line |

The design review names three gaps, and each lands here:

- the projected `Vocabulary.yml` stands projected again
- `answerFindings` and `gateNote` reach `grown` through `road`, so the new refusal reaches them too
- the `who` line of the growth entry names no note

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the list, both rules, the refusal, the schema, the notes the ask names and their tests
- the tests reach the disk door alone, and the fake disk stands for it
- the shape rule and the reader each carry a comment naming the design output

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- spec/tickets/a-term-points-nowhere.md
- spec/vocabulary/terms.yml
- spec/vocabulary/core.yml
- spec/config/styles/VoiceShape/VocabularyEntry.yml
- spec/config/styles/VoiceParagraph/Vocabulary.yml
- .claude/skills/level0/lib/vocabulary.js
- .claude/skills/level0/lib/refuse.js
- spec/schemas/paragraph.schema.yaml
- spec/design_output/vocabulary.md
- spec/guidance/voice.md
- .claude/output-styles/level0.md
- spec/design_input/the-editor-draws-the-ticket.md
- test/contract/vocabulary.test.js
- test/contract/shape.test.js
- test/level0/vocabulary.test.js
- test/level0/hooks.test.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

fail

- design: the branch answers each row of the Ask table, and `./RUNME.sh check` answers 0.
- design: each term drops `defines` and keeps its line, and no caller reads `defines` or `undefinedTerms`.
- craft: the `linked` case puts the link under `source`, and the source shape refuses that already.
- craft: so no case proves the new link check fires, and the rule passes its test without it.
- craft: add a case with a link under a field no other check reads, and assert a refusal.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the line stands in `terms.yml` alone, and each note points at `terms.yml` or `vocabulary.md`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
