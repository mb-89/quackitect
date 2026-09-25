---
kind: [[ticket]]
state: open
step: implement/reflect
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
  - step: design/draft
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: 662875782b2e85ca3eeb82649d837ccc0923990c
    hash_after: 662875782b2e85ca3eeb82649d837ccc0923990c
  - step: design/review
    hand: box 75b31b3d5012 · claude-code-remote · helper-6
    hash_before: 274a0c1a18ca4f799b4bc7a30f54ef93cca9ec13
    hash_after: 274a0c1a18ca4f799b4bc7a30f54ef93cca9ec13
  - step: implement/tests-red
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: 7f45c250412c3c6a2ed3437ee006f2a60991500d
    hash_after: 7f45c250412c3c6a2ed3437ee006f2a60991500d
    answered:
      - name: tests
        exit: 1
        said: assertion, 8 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: 8d1c6c9c4c3d7619a8e1f9db1955b3b655cc77a4
    hash_after: 8d1c6c9c4c3d7619a8e1f9db1955b3b655cc77a4
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/the-inset-folds-the-frontmatter.md:175:1: CodeSpans: A sentence holds 4 code spans, and this one holds 5. C"
  - step: implement/tests-green
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: e45673ac52f13309ed54e91e2509be6ac7f04aed
    hash_after: e45673ac52f13309ed54e91e2509be6ac7f04aed
    answered:
      - name: tests
        exit: 0
        said: green, 34 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-inset-folds-the-frontmatter.md:384:166: Sentence: A sentence holds 25 words. Cut this one in two."
  - step: verdict
    hand: box 75b31b3d5012 · claude-code-remote · helper-8
    hash_before: f196511b7b79e907e0314e3a7e8a3caf263826aa
    hash_after: f196511b7b79e907e0314e3a7e8a3caf263826aa
    returns: 1
    why: "An edit in the YAML view that changes the node count calls `opened` again.; That reopens the drawing and folds the frontmatter under the person's cursor.; Fix: keep the YAML side on a height change, and reopen the page hidden.; Add a case: flip, change to a longer route, and assert no fold and a hidden page.; A side panel the person closes stays in the host, and a later post throws.; Fix: forget the page on the panel's `onDidDispose` event, and on the inset's too.; The rest meets the ask: the draw, the panel fallback, the flip and the redraw each carry a test.; The check answers exit 0, and no retro stands in the hand-back."
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
| the message | `routeHostOf().graphOf(path, text)` | answers `graph` out of `graphIn`, `steps` out of the frontmatter `readNote` reads, and `held` where a hold `personHolds` reads names the ticket. `graphIn` loads through `door.imports(EMITTER)`, and `readNote` through `door.imports(".claude/skills/level0/lib/schema.js")`, as `graphAt` loads the emitter |
| the answer | `routeHostOf().took(path, message)` | answers `ready` with `graph` and `theme`, and hands `jump`, `take`, `handback` and `edit` on to [[spec/tickets/the-host-runs-the-verbs]] |
| the redraw | `routeHostOf().changed(path, text)` | posts `graph` again over the text the editor holds |
| the flip | `routeHostOf().flipped(path)` | hides the page and unfolds the frontmatter, or shows the page and folds it again |
| the flip button | `routeHostOf().lenses(path)` | a lens on the first line of every drawable ticket, whatever its `state`, reading `Show the YAML` or `Show the drawing`. It runs the command `quackitect.route.flip` with the path |
| the door | `src/extension/editor-inset.js`, `insetDoor(context, folder)` | `page(path, lines)` calls `createWebviewTextEditorInset` where the call stands, and `createWebviewPanel` beside the text otherwise. `folds` and `unfolds` run `editor.fold` and `editor.unfold` on the first line |
| the events | `insetDoor().onEditors(run)`, `onChange(run)`, `onTheme(run)` | `onDidChangeVisibleTextEditors` calls `opened` on each ticket shown, and so covers a switch of the active editor. `onDidChangeTextDocument` calls `changed`, and `onDidChangeActiveColorTheme` posts `theme` again |
| the theme | `insetDoor().theme()` | reads `activeColorTheme.kind`, and answers `light` for the light kinds and `dark` otherwise |
| the height | `routeHostOf().linesOf(graph)` | the inset's height in lines, one per node the layout stacks, between a floor and a ceiling the host names. A change of height opens the inset again at the new height, as the probe's grow did. The page's protocol holds no size message, so the host reads the height off the graph |
| the script | `src/extension/editor-inset.js`, `DRAWING` | the bundle's folder `src/scripts/bundle.js` writes, spelled again because the extension bundles alone. The page names it and the extension's own folder under `localResourceRoots` |
| the manifest | `src/extension/package.json` | names `editorInsets` under `enabledApiProposals`, and the flip command |
| the wire | `src/extension/extension.js`, `activate` | registers the flip command, and adds the flip lens beside the ticket lens. It hands the host to `door.onEditors?.`, `door.onChange?.` and `door.onTheme?.`, so the fake `doorOf` carrying none of them stays green |

The tests stand in `test/level0/route-host.test.js`, over a fake door:

| case | what it asserts |
|---|---|
| a ticket draws its route over the folded frontmatter | the open asks for a page and a fold, and `ready` answers `graph` with `graph`, `steps` and `held`, and `theme` |
| the side panel stands in where the inset fails | a door refusing the inset opens the panel, and the page gets the same messages |
| the flip shows the YAML and back | a flip hides the page and unfolds, a second shows and folds, and the lens title follows |
| a change redraws the drawing | `changed` posts a `graph` carrying the new route |
| a theme change reaches the page | `onTheme` posts `theme` with the kind the door answers |
| a longer route opens a taller inset | a graph with more nodes asks the door for a page at more lines |
| a closed ticket carries the flip | the lens stands on a ticket whose `state` reads `closed` |
| the verbs wait for the next ticket | `take`, `handback`, `edit` and `jump` post nothing and run nothing |

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/extension/extension.js`, `activate`, which opens the host and registers the flip
- `src/extension/editor.js`, `editorDoor`, which spreads the inset door beside the lens door
- `src/extension/editor-lens.js`, `lenses`, whose provider now answers the flip lens beside the ticket lens
- `src/extension/lib/drawing.js`, `drawable` and `EMITTER`, which the host reads
- `src/extension/lib/lens.js`, `holdsIn` and `personHolds`, which the host reads `held` through, and which the change exports
- `test/level0/sidebar.test.js`, `doorOf`, the fake door `activate` takes, which carries no inset and stays as it stands behind the `?.` calls

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
- the editor events: the events row names each, and the tests drive `opened` and `changed`
- the theme: `theme()` reads the kind, and `onTheme` posts it again
- the height: `linesOf` answers it off the graph, and a change of height opens the inset again
- `personHolds`: `lens.js` exports it, and the host reads `held` through it
- the modules: the message row names the `door.imports` call for each
- the guard: `activate` calls each new door function through `?.`

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
- The approach meets each line of the ask, and the test table drives each one.
- The answers list meets all seven findings of the first review, and all eight of the second.
- Detail for implement: `onDidChangeVisibleTextEditors` skips editors shown at activation, so the host opens `visibleTextEditors` once.
- Detail for implement: `lensDoor().lenses` walks `lens.watches`, so the flip host answers an empty `watches`.
- Detail for implement: the fold asks the markdown folding for a frontmatter range, and a test fakes it.
- Detail for implement: `linesOf` replaces the probe's posted height, so the drawing test checks the page fits.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh test test/level0/route-host.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

A stub host answering nothing leaves every case red but the one on a note outside the ticket folders, which draws nothing either way. The fake door hands a page, and the inset and the side panel read alike to the host. The fake `imports` hands the real emitter and the real schema reader. So the graph and the steps a case reads come off the code the verbs run.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the tests touch the new host and its test file, which the approach names
- the page, the fold, the theme, the holds and the imports each carry a fake in `doorOf`
- the host's header and the test's header point at this ticket

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

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the host, the inset door, the editor door, the start, the lens exports and the manifest
- the host reaches the editor through the door alone, and `doorOf` in the host test fakes each call
- the host and the inset door point at this ticket in their headers

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh test test/level0/route-host.test.js test/level0/sidebar.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A ticket open in the editor now carries its route as a drawing over its first line, and the frontmatter folds under it. The drawing stands in an inset where the editor runs `createWebviewTextEditorInset`, and in a side panel otherwise. So the probe's open `decide` blocks nothing. A lens flips the drawing to the YAML and back, on every ticket whatever its state. An edit redraws the drawing, and a longer route opens a taller inset. A theme change reaches every page.

The inset takes a proposed API, so `package.json` names `editorInsets`. The editor turns it on through `--enable-proposed-api quackitect.quackitect` or `argv.json`. A press on a node, the pointer or an edit posts nothing yet, since [[spec/tickets/the-host-runs-the-verbs]] runs the verbs behind them.

The start also carries a case for the wire in `test/level0/sidebar.test.js`, which the commit hook asked for beside the code.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change stays inside the files the approach names, and the wire case joins the sidebar test
- the host test fakes every call the host makes, and the wire case fakes the events
- the host and the inset door point at this ticket in their headers

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- src/extension/lib/route-host.js
- src/extension/editor-inset.js
- src/extension/editor.js
- src/extension/extension.js
- src/extension/lib/lens.js
- src/extension/package.json
- test/level0/route-host.test.js
- test/level0/sidebar.test.js
- src/extension/editor-lens.js
- src/extension/lib/drawing.js
- src/scripts/bundle.js
- .claude/skills/level0/lib/folders.js
- spec/tickets/the-inset-folds-the-frontmatter.md
- src/extension/webview/route/drawing.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

fail
- An edit in the YAML view that changes the node count calls `opened` again.
- That reopens the drawing and folds the frontmatter under the person's cursor.
- Fix: keep the YAML side on a height change, and reopen the page hidden.
- Add a case: flip, change to a longer route, and assert no fold and a hidden page.
- A side panel the person closes stays in the host, and a later post throws.
- Fix: forget the page on the panel's `onDidDispose` event, and on the inset's too.
- The rest meets the ask: the draw, the panel fallback, the flip and the redraw each carry a test.
- The check answers exit 0, and no retro stands in the hand-back.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The bundle folder repeats in `editor-inset.js`, and its comment points at the owning file.
- The schema path and the flip command each stand in one constant.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
