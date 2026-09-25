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
group: the-editor-holds-the-drawing
depends_on: [the-editor-takes-an-inset, the-ticket-answers-the-editor, the-drawing-draws-a-route]
step: design/review
record:
  - step: design/draft
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: 6684e0b917fda94b0ab8f35ac4f27a34aa428034
    hash_after: 6684e0b917fda94b0ab8f35ac4f27a34aa428034
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A person opens a ticket and reads its route as a drawing where the frontmatter stands. A button flips the drawing to the YAML code and back, as Obsidian flips a render and its source. The body stays the markdown editor's own text. So the completion, the Vale findings and the ticket buttons hold there. The probe decides between the inset and the side panel. The plan stands in [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]].

Without it the drawing of the two cloud groups reaches no editor. So a person reads the route as raw YAML, and level one stays open.

- a ticket draws its route over the folded frontmatter, and a test drives it through a fake editor
- the drawing stands in the inset or the side panel the probe decides
- a button flips the drawing to the YAML code and back, and a test drives it
- a change to the file redraws the drawing, and a test drives it
- `./RUNME.sh check` passes

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The probe's `decide` waits on the owner. So the host tries the inset, and opens the side panel where the editor refuses the call. The page and the messages stay the same under both. For details, see [[spec/design_output/drawing#the-page-speaks-in-messages]].

| part | file | what it does |
|---|---|---|
| the host | `src/extension/lib/route-host.js`, `routeHostOf(door)` | reads a ticket's text, answers the page's `ready` with `graph` and `theme`, answers `jump` with a reveal of the line, and posts `graph` again on each change. It calls no `vscode`, so a test drives it over a fake door |
| the flip | `src/extension/lib/lens.js`, `lensesOf` | a lens on the first line reads `Show the YAML` or `Show the drawing`, and a press folds the frontmatter under the drawing or unfolds it and hides the drawing |
| the door | `src/extension/editor-inset.js`, `insetDoor(context, folder)` | `createWebviewTextEditorInset` over the first line where the call stands, and `createWebviewPanel` beside the text otherwise. It folds the frontmatter through `editor.fold`, and hands each text change on to the host |
| the manifest | `src/extension/package.json` | names `editorInsets` under `enabledApiProposals`, and the flip command |
| the wire | `src/extension/extension.js`, `activate` | opens the host on every visible ticket, and on a change of the active editor |

The page loads the bundle `src/scripts/bundle.js` writes, so the webview names its folder among `localResourceRoots`. The host hands `take`, `handback` and `edit` on to [[spec/tickets/the-host-runs-the-verbs]], and answers them with nothing here.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/extension/extension.js`, `activate`, which opens the host
- `src/extension/editor.js`, `editorDoor`, which spreads the inset door beside the lens door
- `src/extension/lib/lens.js`, `lensesOf`, which gains the flip lens
- `src/extension/lib/drawing.js`, `graphAt`, which the host reads the graph through
- `test/level0/lens.test.js`, the lens cases the flip lens joins

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

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
