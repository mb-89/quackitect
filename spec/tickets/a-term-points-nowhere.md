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
step: implement/tests-red
record:
  - step: design/draft
    hand: box a0ae5042621d · claude-code-remote
    hash_before: ad4e1e2e92fc384e7bf4c82c4e74c35b5dd9cc8a
    hash_after: ad4e1e2e92fc384e7bf4c82c4e74c35b5dd9cc8a
  - step: design/review
    hand: box a0ae5042621d · claude-code-remote · helper-2
    hash_before: f713b1b569f92991b3afb4ad19597eb3849db8cc
    hash_after: f713b1b569f92991b3afb4ad19597eb3849db8cc
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
