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
step: implement/tests-red
record:
  - step: design/draft
    hand: box a0ae5042621d · claude-code-remote
    hash_before: d0fbc75a2f079c272e9ffec2ff3592cfbdf61a45
    hash_after: d0fbc75a2f079c272e9ffec2ff3592cfbdf61a45
  - step: design/review
    hand: box a0ae5042621d · claude-code-remote · helper-2
    hash_before: 7dd7cfac752450dc43eb7e2d442de4a1100a564e
    hash_after: 7dd7cfac752450dc43eb7e2d442de4a1100a564e
---

# Ask

A term in `spec/vocabulary/terms.yml` says what it means in one line, in core
words and other terms. The plan stands in
[[spec/design_input/the-editor-draws-the-ticket#terms-mean-themselves]].

| field | holds |
|---|---|
| `means` | one line in core words and other terms, with no link |
| `source` | the address of a standard or a paper outside the tree, where the term cites one |

**Gain.** A reader learns a term where it stands, and the dictionary holds the
meaning in one place. The refusal and the hover both read this line.

**Breaks.** Without it a term points at a note, and a reader opens that note
to learn one word. The note and the term then drift apart.

**Done when.**

- every term carries `means`, and `./RUNME.sh branch test test/contract/vocabulary.test.js` holds it
- a word in a `means` line stands on the core list or the terms, and the same test holds it
- `termsOf` answers `means` and `source`, and `./RUNME.sh branch test test/level0/vocabulary.test.js` holds it
- the shape rule over `terms.yml` takes both fields, and `./RUNME.sh lint spec/vocabulary/terms.yml` passes
- `./RUNME.sh check` is green

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Each entry in `terms.yml` gains two fields, and the readers learn them:

| piece | change |
|---|---|
| `terms.yml` | every entry gains `means`, and a term naming an outside tool or standard gains `source` |
| `termsOf` | answers `means` and `source` beside `word` and `defines` |
| the stem | one table of endings and one list of prefixes in `vocabulary.js` write the Tengo stem the rule runs, and a JS function reads the same table |
| `looseMeanings` | answers every word of a `means` line the lists leave out, through that JS function |
| `VocabularyEntry.yml` | refuses a term with no `means`, a `means` holding a comma, a colon or a bracket, and a `source` that is no web address |

A `means` line holds no comma, colon or bracket, because the reader of a
one-line entry splits on the comma and the colon. `defines` stays until the
refusal child takes it away.

The stem moves into a table, so the rule and the check read one source. A
second copy of the endings drifts from the first.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `.claude/skills/level0/lib/vocabulary.js`, `wordsOf` and `undefinedTerms` call `termsOf`
- `.claude/skills/level0/lib/paragraph.js`, the projection calls `vocabularyRule`
- `test/contract/vocabulary.test.js`, the list test calls `termsOf`
- `test/level0/vocabulary.test.js`, the layer test calls `termsOf` and `vocabularyRule`
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

- design: the approach answers each line of the Ask: the two fields, `termsOf`, the shape rule and the word check.
- design: `defines` stays, and the refusal child takes it away, as the plan splits the children.
- design: the stem table keeps one source for the rule and the check, as the word line needs.
- design: the callers match the code, and `src/bridge/prose.js` reaches `termsOf` through `wordsOf` alone.
- craft: `./RUNME.sh check` answers 1 on this tree, because Biome refuses the numbers in the `ENDINGS` table.
- craft: write each stem as the ending it puts in place, so the table holds no bare number.
- craft: the rule skips a capital word past the first, and `looseMeanings` does not, so say which one holds.
- craft: `source` holds the address of a standard or a paper, as the Ask says.
- craft: the shape rule splits on a comma, so a `source` holding a comma reads wrong. A case proves it.
- craft: add a shape case for each new refusal: no `means`, a comma in `means`, a `source` off its shape.

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
