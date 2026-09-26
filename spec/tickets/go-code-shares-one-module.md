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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it"]
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: tests
            form: list
            says: every test the change adds, one a line, as a file and a test name
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/design]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass, pass with findings naming a child a line, or fail with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every row the design review passes with stands fixed in the change"]
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
        to: retro
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
step: implement/tests-red
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
group: the-foundation-lands-unchanged
record:
  - step: design/draft
    hand: box d7a69cb6601d7 · claude-code-remote
    hash_before: b0ac652023873f16e6fcb7cd77c6af570ae6d8ed
    hash_after: b0ac652023873f16e6fcb7cd77c6af570ae6d8ed
  - step: design/review
    hand: box d7a69cb6601d7 · claude-code-remote · helper-2
    hash_before: 0831e91ee4fa4af07f8b27b79d940bcb97bb13d1
    hash_after: 0831e91ee4fa4af07f8b27b79d940bcb97bb13d1
---

# Ask

The Go code moves into one module with one Go version, and the packages keep their folders. [[spec/rationales/go-stands-as-one-module]] argues it.

One module lets every package share code without a copy. Without it the Go versions drift apart, and no single binary stands.

- `git ls-files '*go.mod'` names one file
- - `go test ./...` from the root passes
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

One `go.mod` stands at the root of the tree, as `module quackitect` on `go 1.24`, the Go this box and the other modules run. One `go.sum` holds the union of the two sums the tree carries now. The packages keep their folders, and every import takes the folder under the root: `quackitect/yaml` reads `quackitect/src/yaml`, and `quackitect/swap` reads `quackitect/src/engine/swap`. The six other `go.mod` files and their `go.sum` files leave.

| the part | what it does after |
|---|---|
| the battery | runs `go test ./...` once at the root, and `gofmt -l src` once |
| the test verb | runs `go test ./<folder>/...` from the root, for the package folder holding a changed test |
| a binary's stamp | hashes the root `go.mod` and `go.sum`, the package folder, and every tree package it imports, read off its import lines to the end of the chain |
| the builds | run from the root, as `go build ./src/lsp`, `./src/index` and `./src/tui` |
| the module fetch | runs `go mod download` once at the root |
| CI | reads its Go off the root `go.mod`, and caches on the root `go.sum` |

The import walk stands in `src/scripts/cli-go.js`, the home of every Go helper. It replaces the replace-line reader and the shared folders the window lists by hand. Each design chapter naming the old split takes the one module:

- the Go reader chapter of the config note
- the build chapter of the language server note
- the stamp chapter of the window note
- the last chapter of the rationale

Where a package of the window needs a later Go, the one version rises to the lowest that builds every package. The implement step names it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/cli-go.js` `goModulesIn`, which finds the root module
- `src/scripts/cli-check.js` `goHolds` and `goFormat`, which run once at the root
- `src/scripts/work-test.js` the Go loop, `goModulesOf` and `moduleOver`, which name a package folder
- `src/scripts/go-source.js` `foldersOf` and `hashOf`, which take the import walk
- `src/scripts/tui-build.js` `viewerOf`, `SHARED` and `foldersOf`, which take the import walk and build from the root
- `src/scripts/install.sh` `get_lsp`, `get_index` and `get_modules`, which run from the root
- `.github/workflows/check.yml` the Go setup step
- every `.go` file importing a tree package, and `src/tui/layout_test.go` `module`
- `spec/design_output/config.md`, `spec/design_output/lsp.md`, `spec/design_output/tui.md` and `spec/rationales/go-stands-as-one-module.md`, the chapters naming the split

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/go-modules.test.js` "the tree holds one go.mod, at the root", which decides the first done line
- `test/level0/go-modules.test.js` "the battery lists the one module at the root"
- `test/level0/go-modules.test.js` "a changed test names the package folder holding it"
- `test/level0/go-source.test.js` "a binary's folders take every tree package it imports, to the end of the chain"
- `go test ./...` from the root, run by the battery, which decides the second done line
- `./RUNME.sh check`, which decides the third

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every `go.mod`, script, test and the install and CI step the approach names stands opened
- each module passes `go test ./...` on the branch today
- the callers list comes off a search for `go.mod`, `go build`, `go test` and `quackitect/` over the tree
- each done line names its test in the tests list

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings

- split-tests-take-one-module: the callers list misses the tests that assert the split layout, and each breaks under one module: `test/level0/go-modules.test.js` and `test/level0/go-tests.test.js` on `goModulesIn`, `test/level0/test-verb.test.js` on `go -C src/index test ./...` and `goModulesOf`, `test/level0/pull-leaves.test.js` on `goModulesOf`, `test/level0/go-source.test.js` on the replace-line `foldersOf`, `test/level0/viewer.test.js` on its `go build -o <exe>.new .` fake and its `src/tui/go.mod`, and `test/contract/install.test.js` on the module fetch. Rewrite each beside the caller it tests
- tidy-writes-the-go-line: the approach leaves the Go version to the implement step. Settle it here: `src/tui` asks for 1.27 today, yet it builds on this box's 1.24 once its `go.mod` asks for 1.24, and `go mod tidy` then writes `go 1.24.2` as the floor its dependencies set. Take the line tidy writes at the root, and take the root `go.sum` from `go mod tidy` in place of a hand union of the two sums
- seven-go-mods-leave: the approach says the six other `go.mod` files leave, and `git ls-files '*go.mod'` names seven, none at the root. All seven leave, with both `go.sum` files, and the new root `go.mod` stands as the one the first done line counts

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

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
