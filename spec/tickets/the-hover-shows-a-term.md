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
step: design/review
record:
  - step: design/draft
    hand: box a0ae5042621d · claude-code-remote
    hash_before: 13edadb5938b7e4cc1e59cbab7b5d7bf22ba59b4
    hash_after: 13edadb5938b7e4cc1e59cbab7b5d7bf22ba59b4
  - step: design/review
    hand: box a0ae5042621d · claude-code-remote · helper-2
    hash_before: 89c6e4b1043e4f41545199f3b5fde71305a3b368
    hash_after: 89c6e4b1043e4f41545199f3b5fde71305a3b368
    returns: 1
    why: "| finding | fix |; |---|---|; | The cases pin only the rows they name, so a Go row drifts unseen | Move `ENDINGS` and `PREFIXES` into `stems.yaml`, and let both readers load the table |; | No Go test reads `slug.yaml`, so \"as the slug cases do\" holds on the JavaScript side alone | Name the Go test that loads `stems.yaml` |; | The slug test stands in `test/contract/vocabulary.test.js` | Name the file the shared cases land in |; | `knownIn` reads `PREFIXES` too, so `unread` reaches `read` | Say whether the hover reads a prefix |; | `src/extension` asks for a hover off the server's capabilities | Write that the client needs no change |; | The draft names no test for either done line | Name the hover test and the test after `terms.yml` changes |; The rest reads true: `took`, `Tree.Read`, `pathsOf` and the terms file each stand as the draft says."
  - step: design/draft
    hand: box a0ae5042621d · claude-code-remote
    hash_before: 61e1ad45a0ffa0412a9f94402d1935163740625f
    hash_after: 61e1ad45a0ffa0412a9f94402d1935163740625f
---

# Ask

The language server shows what a term means where the cursor rests on it. The
plan stands in
[[spec/design_input/the-editor-draws-the-ticket#terms-mean-themselves]].

| the cursor rests on | the hover shows |
|---|---|
| a term, or a plural or past form of one | the term and its `means` line |
| a term carrying `source` | the line, then the address |
| a core word or no word | nothing |

**Gain.** A reader learns a word in the editor, where they read it, and opens
no file for it.

**Breaks.** Without it the line stands in the dictionary alone, and a reader
opens `terms.yml` to learn one word.

**Done when.**

- the server answers a hover over a term with its line, and `./RUNME.sh branch test src/lsp` holds it
- the server reads the terms again after `terms.yml` changes, and the same test holds it
- `./RUNME.sh check` is green

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The server answers `textDocument/hover`, and a new file `src/lsp/hover.go`
holds the answer:

| piece | change |
|---|---|
| `initialize` | names `hoverProvider` |
| the terms | read off `terms.yml` through the tree on each ask, so an open buffer or a save counts at once |
| the paths | the vocabulary layer of `paragraph.schema.yaml` names them, as `pathsOf` reads them, and the defaults stand where it names none |
| the word | the run of letters under the cursor, widened to the longest term covering it, such as `level zero` |
| a stem or a prefix | the server reads the table of endings and the prefixes off `stems.yml`, as the rule does |
| the answer | the term, its `means` line, and its `source` under it where it cites one, as markdown |
| a core word or no word | no hover |

The table of endings and the prefixes move out of `vocabulary.js` into a new
list, `spec/vocabulary/stems.yml`. So the rule, the check and the server read
one source:

- `pathsOf` names `stems` beside the three lists, so a write to it projects the rule again
- `knownIn`, `looseMeanings` and `vocabularyRule` take the table from the lists
- `stems.yml` carries cases, each a word and the listed word it reaches, and both tests drive them

| test | holds |
|---|---|
| `src/lsp/hover_test.go` | a hover over a term, a plural, a prefix, a term of two words and a source, and no hover over a core word |
| the same file | a hover after `terms.yml` changes in an open buffer shows the new line |
| the same file | the Go reader reaches every case `stems.yml` names |
| `test/level0/vocabulary.test.js` | the JavaScript reader reaches every case, and the rule writes every row |

The client needs no change. The extension already starts the server over
markdown files, and the language client asks for a hover once the server
names `hoverProvider`.

`spec/design_output/lsp.md` gains a chapter on the hover, and
`spec/design_output/vocabulary.md` names the fourth list.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/lsp/lsp.go`, `took` answers `initialize` and gains the hover case
- `.claude/skills/level0/lib/vocabulary.js`, where `knownIn`, `looseMeanings` and `vocabularyRule` read the table
- `.claude/skills/level0/lib/projection.js`, `listsOf` and `alsoReads` read the paths `pathsOf` names
- `src/bridge/prose.js`, `wordsHere` reads the lists, and `src/bridge/caches.js` watches their paths
- `test/level0/vocabulary.test.js` and `test/contract/vocabulary.test.js` drive the table and the lists
- `src/extension/lib/lsp.js`, the client, needs no change, because it asks for a hover off the capabilities

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- a Go copy of the table drifts: the table moves into `stems.yml`, and both readers load it
- no Go test reads the slug cases: `hover_test.go` loads `stems.yml` and drives its cases
- the shared cases land in the wrong file: they land in `test/level0/vocabulary.test.js`, beside the table test
- the prefixes stand unnamed: the hover reads them off `stems.yml` too, so `unread` reaches `read`
- the client stands unnamed: the callers say it needs no change, and why
- no test for the two lines of done: the table of tests names each

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

| finding | fix |
|---|---|
| The cases pin only the rows they name, so a Go row drifts unseen | Move `ENDINGS` and `PREFIXES` into `stems.yaml`, and let both readers load the table |
| No Go test reads `slug.yaml`, so "as the slug cases do" holds on the JavaScript side alone | Name the Go test that loads `stems.yaml` |
| The slug test stands in `test/contract/vocabulary.test.js` | Name the file the shared cases land in |
| `knownIn` reads `PREFIXES` too, so `unread` reaches `read` | Say whether the hover reads a prefix |
| `src/extension` asks for a hover off the server's capabilities | Write that the client needs no change |
| The draft names no test for either done line | Name the hover test and the test after `terms.yml` changes |

The rest reads true: `took`, `Tree.Read`, `pathsOf` and the terms file each stand as the draft says.

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
