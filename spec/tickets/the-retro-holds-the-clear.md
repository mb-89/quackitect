---
kind: [[ticket]]
state: open
group: the-gates-read-the-state
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
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: fb38d274e4bcd57a1cc5891b6c01579290460856
    hash_after: fb38d274e4bcd57a1cc5891b6c01579290460856
---

# Ask

A retro runs to its end in one conversation, and the binding holds until the owner changes it.

The clear fires mid-retro on a binding that reads `queue` with no press logged, and the next session rebuilds the retro from a handover.

- `clearsHere` in `src/bridge/handover.js` answers false while a retro ticket stands in hand, and a case under `test/level0` covers it
- every change of `engine.binding` writes a log line naming what makes it, and a case under `test/level0` covers it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Two changes: the clear waits on a retro, and every binding change names its maker.

| the file | the change |
|---|---|
| `src/bridge/handover.js` | `clearsHere` answers false where a hold under `holdsIn` names a retro: a ticket on `spec/processes/retro`, or a step under a group's `retro` |
| `src/extension/lib/session.js` | `opened` already answers `cleared`, the keys a new window drops. `opened` in `src/extension/sidebar.js` writes one `sidebar` line naming them, with `a new window` as the maker |
| `src/bridge/binding.js` | `bindingLine` runs at `prompt.submit` and at the turn's end besides the stop refusal. A change no line names reads as a change by hand, with the layer |

The sidebar's `set` already writes its line with the button as the maker. The window road stands as the likely source of a `queue` reading with no press. It wipes the local file, and the tracked layer then answers.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/bridge/handover.js` `measures` and `holdsForHandover`, and the clear road at the third call, which call `clearsHere`
- `src/extension/sidebar.js` the `opened` entry, which calls `opened` in `lib/session.js`
- `src/extension/extension.js`, which calls the sidebar's `opened` at a window start
- `src/bridge/stop.js` the refusal's last line, which calls `bindingLine`
- `src/bridge/server.js` `submitsPrompt` and the turn's end, which gain a `bindingLine` call

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/handover.test.js` a retro in hand keeps the conversation past the handover key
- `test/level0/handover.test.js` a hold on any other ticket clears under the queue as today
- `test/extension/session.test.js` a new window writes a line naming the keys it drops
- `test/level0/binding.test.js` a binding changed in the file writes a line at the next prompt, naming the layer

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- `clearsHere`, `holdsIn`, `heldAs`, `bindingLine`, `whereFrom`, the sidebar `set` and `opened` stand opened. The extension call site of `opened` stands unread, and the implement step reads it first
- the callers list comes off a grep for `clearsHere`, `bindingLine` and `opened`
- each done_when line names its test above. Where the test files stand is a guess the implement step settles, and `./RUNME.sh check` decides the last

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
