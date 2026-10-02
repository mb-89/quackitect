---
kind: [[ticket]]
state: open
step: gate
steps:
  - name: design
    steps:
      - name: owner-read
        does: reads the ask a handover carries, before any draft
        by: person
        when: handed
        input: ask
        evidence:
          - name: read
            form: verdict
            says: pass where the ask says what the owner said, or fail with the owner's words
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
      - name: tests-red
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft
        checklist: ["every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides", "every door the tests reach has a fake"]
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: red
            form: list
            says: every test file standing red until tests-green closes, one a line, which the check leaves out
          - name: seen
            form: text
            says: what you see, and what surprises you
  - name: gate
    gate: does the approach answer the ask, and does a red test decide every done_when line
    does: reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points
    not: design/draft
    tags: ["review"]
    input: ["design/draft", "design/tests-red"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    steps:
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: design/tests-red
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
  - name: accept
    gate: does the whole work answer the ask, and does every command of the route pass
    final: true
    when: backlog
    does: reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points
    not: implement/change
    tags: ["review", "accept"]
    input: ["ask", "implement"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: view
    does: reads the change in the view the ask names
    by: person
    when: view
    on_fail: implement
    to: retro
    input: ["ask", "implement/tests-green"]
    evidence:
      - name: seen
        form: verdict
        says: pass where the view shows the ask's number, or fail with what it shows
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: node-leaves-the-boxes
record:
  - step: design/draft
    hand: box 77f4c295c43a · claude-code-remote
    hash_before: 0c0ed9c7d1e03f8d7b1fe003d3b64ae840a9b63a
    hash_after: 0c0ed9c7d1e03f8d7b1fe003d3b64ae840a9b63a
    inputs:
      - name: ask
        hash: 3fb4091882eab748
        size: 178
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box 77f4c295c43a · claude-code-remote
    hash_before: f9f420eeca428c39e26f2d6cbefcbd7cf2412478
    hash_after: f9f420eeca428c39e26f2d6cbefcbd7cf2412478
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: ed6fdc47ea2d140c
        size: 2716
      - name: [[spec/tickets/install-drops-node]]
        hash: 83575bda3f482f6c
        size: 216
    def: 08e16d07b0de477c
---

# Ask

The webview ships prebuilt, so a box builds none of it.

A box then needs no Node to draw the route.

- a fresh clone opens the webview with no build
- `./RUNME.sh check` exits 0

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->

<!-- the form is verdict -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The drawing lands in git, in a folder of the extension, and no box bundles it.

- `OUT` in `src/scripts/bundle.js` moves to `src/extension/drawing/route.mjs`, and esbuild writes `route.css` beside it.
- `bundle` stamps a banner line naming a hash of the sources it reads: every file under `webview/route` and the webview's lock file.
- `stampOf` in `bundle.js` computes that hash, and `fresh` replaces `bundled`: the shipped banner names the hash the sources give now.
- `insetDoor` in `src/extension/editor-inset.js` reads the drawing off `context.extensionUri`, and the resource roots narrow to the extension alone.
- The `drawing` item leaves `src/scripts/install.sh`, with `drawing_here`, `get_drawing` and its rows under `wanted`, `missed`, `here`, `why` and `get`.
- The case in `test/contract/install.test.js` names the browser alone, and `drawing-page.test.js` loads the shipped bundle and builds nothing.
- A line in `.gitattributes` marks the folder as generated, so a diff view folds it.
- `spec/design_output/drawing.md` follows.

Weighed: the bundle takes `.mjs`. It is built output, and the rules over hand-written `src/**/*.js` read it nowhere: the test-first rule, the source spells and Biome. The stamp holds it to its sources in their place. A `.js` name costs an exemption in each rule's own list.

Weighed: the page test and the bundle test run where a maintainer installs the webview's modules by hand, and skip elsewhere. The stamp case runs on every box, so a stale bundle meets the check.

Assumed: a webview serves `.mjs` as JavaScript, and the bundle stays a classic script.

The `browser` item stays for [[spec/tickets/install-drops-node]].

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/extension/editor-inset.js`: `insetDoor` reads `DRAWING`
- `src/scripts/install.sh`: `drawing_here` and `get_drawing` run `bundle.js`
- `test/contract/drawing-page.test.js`: the `before` hook calls `bundled`, `bundle` and `OUT`
- `test/contract/drawing-bundle.test.js`: the stub case calls `bundle`
- `test/contract/install.test.js`: the case naming the drawing and the browser as wants

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `test/contract/drawing-shipped.test.js`: git tracks the drawing the inset loads, and its banner names the hash of the sources it reads
- `test/contract/install.test.js`: the install resolves a browser as a want, and bundles no drawing

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I open `bundle.js`, `editor-inset.js`, `install.sh` and both drawing tests, and each name stands where the draft says
- a search for `bundle.js`, `bundled`, `OUT` and the runtime drawing folder over `src`, `test` and `.claude` gives the callers list
- the fresh-clone line rides the shipped case, and the check decides the second

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/contract/drawing-shipped.test.js test/contract/install.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/contract/drawing-shipped.test.js
- test/contract/install.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion. Git tracks nothing under the runtime folder `OUT` names now, the bundle's first line holds minified code and no banner, and the install loop still names the drawing. The shipped case reads `bundle.js` through a namespace, so a missing `stampOf` fails the assertion and leaves the import standing.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the fresh-clone line rides the two shipped cases, and the check decides the second line
- the cases read git, the disk and the source text, which are the real things a contract case drives, and no door they reach takes a fake here

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# implement

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

# accept

<!-- reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# view

<!-- reads the change in the view the ask names -->

## seen

<!-- pass where the view shows the ask's number, or fail with what it shows -->

<!-- the form is verdict -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
