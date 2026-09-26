---
kind: [[ticket]]
state: open
group: the-verbs-land-whole
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
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
step: design/review
record:
  - step: design/draft
    hand: box d1fe1ca62214 · claude-code-remote
    hash_before: 2a0e0a1108a413f8a1554ab2babd0144528c7218
    hash_after: 2a0e0a1108a413f8a1554ab2babd0144528c7218
---

# Ask

The tests part of the check falls back. Each slow case proves its step over a fixture in place of the real tree, shell or bundler.

`test/contract/vehicle.test.js` copies the whole method and runs `RUNME.sh vehicle` in a real shell, the slowest case in the battery's report. `test/contract/process.test.js` spawns Vale once a route, `test/contract/cli-verbs.test.js` spawns `cli.js test` where a fake proves the verb, and `test/contract/drawing-bundle.test.js` bundles the real drawing.

- `test/contract/vehicle.test.js` produces its vehicle off a fixture root holding the marker, `RUNME.sh`, `package.json` and a private folder
- `test/contract/process.test.js` reads every rendered route in a single Vale run
- `test/contract/cli-verbs.test.js` spawns no `cli.js test`
- `test/contract/drawing-bundle.test.js` bundles a stub entry in place of the drawing's
- the battery report in `.se/.runtime/check.json` names none of these files among its slowest cases
- `test/contract/paragraph.test.js`, `test/contract/vale.test.js` and `test/contract/vale-paths.test.js` keep every case. The owner keeps these tests.
- Each of the three runs faster in the battery report, or the design step names what holds its time.
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

1. `test/contract/vehicle.test.js` builds a fixture root in its temp folder. It holds the marker, `RUNME.sh` with its run bit, `package.json` and a `.se` file.
   - The first case calls `produce` over that root. It asserts the three files travel, `.se` stays behind, and the count matches the fixture.
   - The third case drops the `RUNME.sh vehicle` shell run and `fakeInstall`. It calls `rootsHere` on the vehicle, the function `theVehicle` in `src/scripts/cli.js` reads.
   - It asserts method and work both name the vehicle, and nothing names the tree.
2. `test/contract/process.test.js` declares every route's minted ticket through `rulesIn` and `proves` in `test/contract/ruled.js`.
   - Each text stands at `spec/tickets/<name>-rendered.md`, so the tickets section of `.vale.ini` reads it.
   - One Vale run reads them all. The case keeps what `voiceOver` keeps: rows past `withoutFalsePast` at a severity `REFUSES` holds.
   - It asserts `spawned()` answers one.
3. `test/contract/cli-verbs.test.js` reads the `test` row as text, like its other cases. It asserts the row hands `rest` to `namedTests`, which calls `testVerb`.
   - The spawn and the `proc` import go. `test/level0/test-verb.test.js` already proves the runner word over a fake.
4. `bundle` in `src/scripts/bundle.js` takes an optional entry and out, with `ENTRY` and `OUT` as defaults.
   - `test/contract/drawing-bundle.test.js` writes a stub entry importing one small style sheet. It bundles into a temp folder, and asserts the script and sheet land.
5. The battery report: `./RUNME.sh check` writes `slowest` into `.se/.runtime/check.json`. The tests-green step reads it and names none of the four files there.
6. `test/contract/paragraph.test.js`, `test/contract/vale.test.js` and `test/contract/vale-paths.test.js` stay untouched.
7. Those three keep the real Vale binary on purpose. Its runs hold their time: one run a file through `rulesIn`, and the door runs in `vale.test.js`.
8. `./RUNME.sh check` exits 0 on the commit, as the tests-green step records.

A risk: `test/contract/drawing-page.test.js` bundles the real drawing in `before` when `bundled` says stale. Until now the bundle case ran first and left it fresh.
The install bundles too, so a fresh box meets no cost there. If the report names `drawing-page.test.js`, that time comes off the install gap.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/bundle.js` the script guard at its foot, calling `bundle`
- `src/scripts/install.sh` the bundle step, running `node src/scripts/bundle.js`
- `test/contract/drawing-page.test.js` `before`, calling `bundle`
- `test/contract/drawing-bundle.test.js` its one case, calling `bundle`
- `src/scripts/cli.js` `testArgv`, through `test` and the `check` verb, loading every changed test file
- `src/scripts/cli.js` `namedTests`, running a named test file through `testVerb`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/contract/vehicle.test.js` "a vehicle carries the fixture's marker and run bits, and leaves its private folder behind"
- `test/contract/vehicle.test.js` "a vehicle names itself as method and work, with no tree behind it"
- `test/contract/process.test.js` "a ticket minted off every route draws no finding from the voice rules, in one Vale run"
- `test/contract/cli-verbs.test.js` "the test verb hands the files you name to the branch runner"
- `test/contract/drawing-bundle.test.js` "the step writes a script and its style sheet off a stub entry"
- `./RUNME.sh check` and its `slowest` list decide the report line and the check line, and no test does

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- Opened all seven test files and `test/contract/ruled.js`.
- Opened `src/scripts/vehicle.js`, `src/scripts/bundle.js` and `src/bridge/findings.js`.
- Opened the `test` and `vehicle` verbs in `src/scripts/cli.js`.
- Unchecked: no `.se/.runtime/check.json` stands on this box, so which cases lead the slowest list stays unread.
- The ask says `cli.js test` spawns where a fake proves the verb. True: `test/level0/test-verb.test.js` proves it over `fakeProc`.
- Grep for `bundle(` and `bundle.js` gave the callers of `bundle`. The test files change no export, so the runner is their one caller.
- Each numbered item names its case in the tests list. The report and check lines name `./RUNME.sh check` in their place.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

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
