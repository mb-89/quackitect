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
  - step: design/review
    hand: box a0ae5042621d · claude-code-remote · helper-4
    hash_before: 79ad01c3e4118d1bc075e5d7b9f7fe9886312f11
    hash_after: 79ad01c3e4118d1bc075e5d7b9f7fe9886312f11
    returns: 2
    why: "| finding | fix |; |---|---|; | The vocabulary layer of `paragraph.schema.yaml` holds `stems` as a line of prose, so `pathsOf` takes that line as the path | Name the key the path takes, and move or rename the line of prose |; | `VocabularyEntry` reads every file in `spec/vocabulary` and refuses a row under a key past `words`, `terms` and `swaps` | Name the change to the shape rule, or put the table beside `spec/config/slug.yaml` |; | `WATCHES` in `src/extension/lib/lsp.js` holds markdown alone, so the client sends no buffer of `terms.yml` | Hold the save case in the test, or add the list to `WATCHES` and drop \"the client needs no change\" |; | `rulesFrom` in `.claude/skills/level0/lib/paragraph.js` calls `vocabularyRule` and stands off the callers | Add it to the callers |; The six earlier findings stand settled by the answers. The rest reads true, and each piece stands as the draft says:; `took` and `Tree.Read` in `src/lsp`; `listsOf` and `alsoReads` in the projection; `wordsHere` and the caches in `src/bridge`"
  - step: design/draft
    hand: box a0ae5042621d · claude-code-remote
    hash_before: 7b4092316d9b3d15c285ea66c88843fa27bc1b15
    hash_after: 7b4092316d9b3d15c285ea66c88843fa27bc1b15
  - step: design/review
    hand: box a0ae5042621d · claude-code-remote · helper-6
    hash_before: 9f9a15cdae34af957244a412cf79149ed5d84bed
    hash_after: 9f9a15cdae34af957244a412cf79149ed5d84bed
    returns: 3
    why: "| finding | fix |; |---|---|; | The approach names `stems.yaml`, and the answers name `stems.yml` | Name the file one way in every line |; | `test/level0/vocabulary.test.js` reads fixture lists and touches no disk, so it reaches no case the real `stems.yaml` holds | Drive the cases in `test/contract/vocabulary.test.js` beside the slug test, and keep a fixture table in the level zero file |; | No test in `src/lsp` reads a file of the tree, and `hover_test.go` reads the real `stems.yaml` | Name the path the Go test reads and the disk it reads through |; | `paragraph.schema.schema.json` names `stems` in the vocabulary layer and leaves `endings` out | Add `endings` as a string to the shape |; The ten earlier findings stand settled by the answers. The rest reads true:; `took` answers `initialize`, and `Tree.Read` reads an open buffer or the index copy, which `follows` pulls after a save; `alsoReads` and the caches take every path `pathsOf` names, so a new key reaches both; `faultsOf` refuses no key the shape leaves out, and nothing in `spec/config` refuses a new yaml file"
  - step: design/draft
    hand: box a0ae5042621d · claude-code-remote
    hash_before: f44e23101baa6c0bc98869a3eb905f5a80ba8535
    hash_after: f44e23101baa6c0bc98869a3eb905f5a80ba8535
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
| the terms | read off `terms.yml` through the tree on each ask, so a save counts at once |
| the paths | the vocabulary layer of `paragraph.schema.yaml` names them, as `pathsOf` reads them, and the defaults stand where it names none |
| the word | the run of letters under the cursor, widened to the longest term covering it, such as `level zero` |
| a stem or a prefix | the server reads the table of endings and the prefixes off `stems.yaml`, as the rule does |
| the answer | the term, its `means` line, and its `source` under it where it cites one, as markdown |
| a core word or no word | no hover |

The table of endings and the prefixes move out of `vocabulary.js` into
`spec/config/stems.yaml`, beside the slug cases. The shape rule over the word
lists leaves it alone there. The rule, the check and the server read one source:

- `pathsOf` names it under a new key, `endings`, because the layer holds a line of prose under `stems`
- `paragraph.schema.schema.json` gains `endings` as a string
- a write to it projects the rule again, because `alsoReads` reads every path `pathsOf` names
- `knownIn`, `looseMeanings` and `vocabularyRule` take the table from the lists
- `stems.yaml` carries cases, each a word and the listed word it reaches, and both tests drive them

| test | holds |
|---|---|
| `src/lsp/hover_test.go` | a hover over a term, a plural, a prefix, two words and a source, and none over a core word |
| the same file | a hover after a save to `terms.yml` shows the new line |
| the same file | the Go reader reaches every case the real `stems.yaml` names, read through `os.ReadFile` off the tree root, as `src/tui/work_test.go` reads the tree |
| `test/contract/vocabulary.test.js` | the JavaScript reader reaches every case of the real `stems.yaml` through the disk door, beside the slug test |
| `test/level0/vocabulary.test.js` | the reader and the rule over a fixture table |

The client needs no change. The extension already starts the server over
markdown files, and the language client asks for a hover once the server
names `hoverProvider`.

The extension watches no `terms.yml` buffer, so the server reads the saved
file. `spec/design_output/lsp.md` gains a chapter on the hover, and
`spec/design_output/vocabulary.md` names the table.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/lsp/lsp.go`, `took` answers `initialize` and gains the hover case
- `.claude/skills/level0/lib/vocabulary.js`, where `knownIn`, `looseMeanings` and `vocabularyRule` read the table
- `.claude/skills/level0/lib/projection.js`, `listsOf` and `alsoReads` read the paths `pathsOf` names
- `.claude/skills/level0/lib/paragraph.js`, `rulesFrom` calls `vocabularyRule` with the lists
- `src/bridge/prose.js`, `wordsHere` reads the lists, and `src/bridge/caches.js` watches their paths
- `test/level0/vocabulary.test.js` and `test/contract/vocabulary.test.js` drive the table and the lists
- `src/extension/lib/lsp.js`, the client, needs no change, because it asks for a hover off the capabilities

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- a Go copy of the table drifts: the table moves into `stems.yaml`, and both readers load it
- no Go test reads the slug cases: `hover_test.go` loads `stems.yaml` and drives its cases
- the shared cases land in the wrong file: they land in `test/contract/vocabulary.test.js`, beside the slug test
- the prefixes stand unnamed: the hover reads them off `stems.yaml` too, so `unread` reaches `read`
- the client stands unnamed: the callers say it needs no change, and why
- no test for the two lines of done: the table of tests names each
- the key `stems` stands taken: the path goes under `endings`
- the shape rule refuses a table under the word lists: the table stands in `spec/config`
- the editor sends no `terms.yml` buffer: the test holds a save, and the server reads the saved file
- `rulesFrom` stands unnamed: the callers name it
- the file name drifts: every line names `stems.yaml`
- the layer test reads no disk: the real cases land in the contract test, and it keeps a fixture
- the Go test names no path: it reads the real table off the tree root, as the viewer tests do
- the shape of the schema lacks the key: `endings` joins it as a string

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

| finding | fix |
|---|---|
| The approach names `stems.yaml`, and the answers name `stems.yml` | Name the file one way in every line |
| `test/level0/vocabulary.test.js` reads fixture lists and touches no disk, so it reaches no case the real `stems.yaml` holds | Drive the cases in `test/contract/vocabulary.test.js` beside the slug test, and keep a fixture table in the level zero file |
| No test in `src/lsp` reads a file of the tree, and `hover_test.go` reads the real `stems.yaml` | Name the path the Go test reads and the disk it reads through |
| `paragraph.schema.schema.json` names `stems` in the vocabulary layer and leaves `endings` out | Add `endings` as a string to the shape |

The ten earlier findings stand settled by the answers. The rest reads true:

- `took` answers `initialize`, and `Tree.Read` reads an open buffer or the index copy, which `follows` pulls after a save
- `alsoReads` and the caches take every path `pathsOf` names, so a new key reaches both
- `faultsOf` refuses no key the shape leaves out, and nothing in `spec/config` refuses a new yaml file

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
