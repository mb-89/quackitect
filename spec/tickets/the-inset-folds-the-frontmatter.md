---
kind: [[ticket]]
state: open
step: design/draft
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: person-1
        does: answers the question the engine asks
        by: anyone
        to: engine
        asks: "design/review fails back 2 times: The answers list meets each finding of the earlier review.; The door names `page`, `folds` and `unfolds` alone. Name the editor events that call `opened` and `changed`.; Those events cover the visible tickets, a switch of the active editor, and an edit to the text.; The host answers `theme` on open and on change. Name the door call reading the editor's theme, and its event.; The probe grows the inset to the height its page posts back. Name the inset's height, and the message growing it.; `held` reads a hold whose hand is the person, through `personHolds`. Export it from `lens.js`, or name the host's own reading.; `graphIn` and `readNote` load as modules into a CommonJS host. Name the `door.imports` call reaching each, as `graphAt` does.; `activate` runs over the fake `doorOf` in `sidebar.test.js`. Name the guard keeping it green there."
        evidence:
          - name: answer
            form: text
            says: the answer, which the step behind this one reads
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
record:
  - step: design/draft
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: 6684e0b917fda94b0ab8f35ac4f27a34aa428034
    hash_after: 6684e0b917fda94b0ab8f35ac4f27a34aa428034
  - step: design/review
    hand: box 75b31b3d5012 · claude-code-remote · helper-2
    hash_before: 06835a53e105ab1f1554762252ca0b929c63749f
    hash_after: 06835a53e105ab1f1554762252ca0b929c63749f
    returns: 1
    why: "The ask calls for three tests, and the approach names none: the draw through a fake editor, the flip, and the redraw on a change. Name the test file and the case for each.; `lensesOf` reads `path`, `text` and `holds` alone, so the flip lens has no input saying which side shows. Name where that state lives and how it reaches `lensesOf`.; `lensesOf` answers nothing on a ticket whose `state` reads other than open, so a closed ticket gets no flip. Name where the flip lens stands apart from that return.; A lens runs `COMMAND`, and `argvOf` answers no verb for a flip. Name the command and the handler a press on the flip runs.; The jump belongs to the ask of [[spec/tickets/the-host-runs-the-verbs]]. Hand it on beside `take`, `handback` and `edit`.; The `graph` message carries `graph`, `steps` and `held`, and the host names `graph` alone. Name where `steps` and `held` come from, or hand them on. For details, see [[spec/design_output/drawing#the-page-speaks-in-messages]].; `src/scripts/bundle.js` writes the bundle into the workspace's runtime folder, outside the extension folder. Name that folder among `localResourceRoots`, and where the extension spells its path, since it bundles alone."
  - step: design/draft
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: 4fd4f9079ccaef655e629edb23fcc31537c84184
    hash_after: 4fd4f9079ccaef655e629edb23fcc31537c84184
  - step: design/review
    hand: box 75b31b3d5012 · claude-code-remote · helper-4
    hash_before: 737916ddbdad2c1c22f6df09a987a17d77c148aa
    hash_after: 737916ddbdad2c1c22f6df09a987a17d77c148aa
    returns: 2
    why: The answers list meets each finding of the earlier review.; The door names `page`, `folds` and `unfolds` alone. Name the editor events that call `opened` and `changed`.; Those events cover the visible tickets, a switch of the active editor, and an edit to the text.; The host answers `theme` on open and on change. Name the door call reading the editor's theme, and its event.; The probe grows the inset to the height its page posts back. Name the inset's height, and the message growing it.; `held` reads a hold whose hand is the person, through `personHolds`. Export it from `lens.js`, or name the host's own reading.; `graphIn` and `readNote` load as modules into a CommonJS host. Name the `door.imports` call reaching each, as `graphAt` does.; `activate` runs over the fake `doorOf` in `sidebar.test.js`. Name the guard keeping it green there.
  - step: design/person-1
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: 39813f51c8b57783c2dd1b2e4dcdec1ee5509d1e
    hash_after: 39813f51c8b57783c2dd1b2e4dcdec1ee5509d1e
group: the-editor-holds-the-drawing
depends_on: ["the-editor-takes-an-inset", "the-ticket-answers-the-editor", "the-drawing-draws-a-route"]
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

## person-1

<!-- design/review fails back 2 times: The answers list meets each finding of the earlier review.; The door names `page`, `folds` and `unfolds` alone. Name the editor events that call `opened` and `changed`.; Those events cover the visible tickets, a switch of the active editor, and an edit to the text.; The host answers `theme` on open and on change. Name the door call reading the editor's theme, and its event.; The probe grows the inset to the height its page posts back. Name the inset's height, and the message growing it.; `held` reads a hold whose hand is the person, through `personHolds`. Export it from `lens.js`, or name the host's own reading.; `graphIn` and `readNote` load as modules into a CommonJS host. Name the `door.imports` call reaching each, as `graphAt` does.; `activate` runs over the fake `doorOf` in `sidebar.test.js`. Name the guard keeping it green there. -->

### answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

The approach holds, and each finding asks for a name the draft leaves out. The next draft names each one, as the answers list shows. No finding changes the design, so the draft goes on.

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The probe's `decide` waits on the owner. So the host tries the inset, and opens the side panel where the editor refuses the call. The page and its messages hold under both. For details, see [[spec/design_output/drawing#the-page-speaks-in-messages]].

| part | file | what it does |
|---|---|---|
| the host | `src/extension/lib/route-host.js`, `routeHostOf(door)` | holds one drawing a ticket, and which side each shows. It calls no `vscode`, so a test drives it over a fake door |
| the open | `routeHostOf().opened(path, text)` | asks the door for a page over the first line, folds the frontmatter, and draws nothing past a path `drawable` refuses |
| the message | `routeHostOf().graphOf(path, text)` | answers `graph` out of `graphIn`, `steps` out of the frontmatter `readNote` reads, and `held` out of the holds `holdsIn` reads |
| the answer | `routeHostOf().took(path, message)` | answers `ready` with `graph` and `theme`, and hands `jump`, `take`, `handback` and `edit` on to [[spec/tickets/the-host-runs-the-verbs]] |
| the redraw | `routeHostOf().changed(path, text)` | posts `graph` again over the text the editor holds |
| the flip | `routeHostOf().flipped(path)` | hides the page and unfolds the frontmatter, or shows the page and folds it again |
| the flip button | `routeHostOf().lenses(path)` | a lens on the first line of every drawable ticket, whatever its `state`, reading `Show the YAML` or `Show the drawing`. It runs the command `quackitect.route.flip` with the path |
| the door | `src/extension/editor-inset.js`, `insetDoor(context, folder)` | `page(path)` calls `createWebviewTextEditorInset` where the call stands, and `createWebviewPanel` beside the text otherwise. `folds` and `unfolds` run `editor.fold` and `editor.unfold` on the first line |
| the script | `src/extension/editor-inset.js`, `DRAWING` | the bundle's folder `src/scripts/bundle.js` writes, spelled again because the extension bundles alone. The page names it and the extension's own folder under `localResourceRoots` |
| the manifest | `src/extension/package.json` | names `editorInsets` under `enabledApiProposals`, and the flip command |
| the wire | `src/extension/extension.js`, `activate` | registers the flip command, and adds the flip lens beside the ticket lens. It opens the host on each visible ticket and each change of the active editor |

The tests stand in `test/level0/route-host.test.js`, over a fake door:

| case | what it asserts |
|---|---|
| a ticket draws its route over the folded frontmatter | the open asks for a page and a fold, and `ready` answers `graph` with `graph`, `steps` and `held`, and `theme` |
| the side panel stands in where the inset fails | a door refusing the inset opens the panel, and the page gets the same messages |
| the flip shows the YAML and back | a flip hides the page and unfolds, a second shows and folds, and the lens title follows |
| a change redraws the drawing | `changed` posts a `graph` carrying the new route |
| a closed ticket carries the flip | the lens stands on a ticket whose `state` reads `closed` |
| the verbs wait for the next ticket | `take`, `handback`, `edit` and `jump` post nothing and run nothing |

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/extension/extension.js`, `activate`, which opens the host and registers the flip
- `src/extension/editor.js`, `editorDoor`, which spreads the inset door beside the lens door
- `src/extension/editor-lens.js`, `lenses`, whose provider now answers the flip lens beside the ticket lens
- `src/extension/lib/drawing.js`, `drawable` and `EMITTER`, which the host reads
- `src/extension/lib/lens.js`, `holdsIn`, which the host reads `held` through
- `test/level0/sidebar.test.js`, `doorOf`, the fake door `activate` takes, which carries no inset and stays as it stands

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- the three tests the ask calls for: the test table names the file and a case for each
- the flip state: `routeHostOf` holds the side each ticket shows, and its own `lenses` reads it
- the closed ticket: the flip lens stands in the host, apart from `lensesOf`, and a case drives a closed ticket
- the flip command: `quackitect.route.flip` runs `routeHostOf().flipped`
- the jump: the host hands it on beside `take`, `handback` and `edit`
- `steps` and `held`: the message table names where each comes from
- the bundle's folder: `DRAWING` names it, and `localResourceRoots` holds it

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail
- The answers list meets each finding of the earlier review.
- The door names `page`, `folds` and `unfolds` alone. Name the editor events that call `opened` and `changed`.
- Those events cover the visible tickets, a switch of the active editor, and an edit to the text.
- The host answers `theme` on open and on change. Name the door call reading the editor's theme, and its event.
- The probe grows the inset to the height its page posts back. Name the inset's height, and the message growing it.
- `held` reads a hold whose hand is the person, through `personHolds`. Export it from `lens.js`, or name the host's own reading.
- `graphIn` and `readNote` load as modules into a CommonJS host. Name the `door.imports` call reaching each, as `graphAt` does.
- `activate` runs over the fake `doorOf` in `sidebar.test.js`. Name the guard keeping it green there.

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
