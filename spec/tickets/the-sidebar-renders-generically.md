---
kind: [[ticket]]
state: open
step: implement/tests-green
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
group: sidebar-lands-in-shadow
record:
  - step: design/draft
    hand: box d85821f54410d · claude-code-remote
    hash_before: 1569981adfaf811abf71dca91a6a83e66af2f576
    hash_after: f89e10364c5f402039d01fadafbc5e92d771a691
    inputs:
      - name: ask
        hash: 069459d1fd027aa4
        size: 418
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d85821f54410d · claude-code-remote
    hash_before: 1bb90c6590392a3f578dc971a6a39444b7668c9d
    hash_after: 1bb90c6590392a3f578dc971a6a39444b7668c9d
    answered:
      - name: tests
        exit: 1
        said: assertion, 5 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: a96c231c20daddb8
        size: 5334
      - name: [[spec/design_output/model]]
        hash: 3e2cd8b099700681
        size: 74868
    def: 08e16d07b0de477c
  - step: gate
    hand: box d85821f54410d · claude-code-remote · helper-3
    hash_before: f3c8acd87d86d664e3dbd2fd6e06ed00c09ca76b
    hash_after: f3c8acd87d86d664e3dbd2fd6e06ed00c09ca76b
    inputs:
      - name: design/draft
        hash: a96c231c20daddb8
        size: 5334
      - name: design/tests-red
        hash: e867491ef5ef53a1
        size: 1174
      - name: [[spec/design_output/model]]
        hash: 3e2cd8b099700681
        size: 74868
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d85821f54410d · claude-code-remote
    hash_before: c458b9ee4f9f4ceea3f1bc7dd75ecfd0902162f6
    hash_after: 9b2d304fc365010c7fa6473f90157d187296931d
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
---

# Ask

The sidebar and its forms draw the base files under `spec/views`, beside the sidebar that draws today. Each label, doc, icon and look comes off the registrations, and the sidebar writes none.

A new value then shows in the sidebar with no extension change.

- a case under `test/level0` draws the sidebar over a fake catalog
- a case reads a badge's label equal to the one the window draws
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

The sidebar draws a section for each base file under `spec/views`, below the groups it draws today. Every text in that section comes off the catalog the index answers at `/v1`: the badge off the `index/names` row of the name under `badge`, and each button and form off the `index/actions` row of the action it calls. The base file names what shows, and the registration says how it reads.

| part | file | what changes |
|---|---|---|
| the action rows | `src/modules/index/catalog.go`, `ActionRow`, `catalogOf` | carry the `label` and `icon` the registration declares, as `NameRow` does |
| the index door | `src/extension/editor-index.js`, new, `indexDoor(root)` | `values(name)` reads `/v1/values/<name>`, and `calls(name, input)` posts `/v1/actions/<name>`. The port comes off `.se/.runtime/index.json`, as `standingOf` in `src/index/main.go` reads it. It answers nothing where no index stands. `activate` in `src/extension/extension.js` hands it in as `door.index` |
| the badge | `src/extension/lib/views.js`, new, `badgeOf(names, name)` | the rule `BadgeOf` in `src/tui/work/shadow.go` holds: the label, and `label (value)` where the look is `count` |
| the views | `src/extension/lib/views.js`, `viewsOf(bases, catalog)` | one section a base file: its title off the file name, its badge and icon off the row of `badge`, and one button for each action carrying `button`. A button takes the label, doc and icon of the action it `calls`, and its own name where the registration gives no label |
| the forms | `src/extension/lib/views.js`, `formOf(action)` | an action carrying `edits: form` draws a form, one field a row, with the label and doc of each input field |
| the panel | `src/extension/lib/panel.js`, `panelHtml` | draws the `views` sections below the groups, and writes no text of its own into them |
| the sidebar | `src/extension/sidebar.js`, `html`, `took`, `watches` | reads each base file through `door.list` and `door.read`, parses it with `readYaml` out of `.claude/skills/level0/lib/schema-yaml.js` through `door.imports`, and reads the two rows through `door.index`. A message of the kind `call` calls its action through `door.index.calls`. The watch adds `spec/views/*.base` |
| the note | `spec/design_output/extension.md` | a chapter on the views section, pointing at [[spec/design_output/model#views]] for the keys |

The group's shadow compare, the slice key and the `shadow` rows, stands outside this ticket. The group's split mints it as a child of its own, since it reads what this ticket draws.

What I weigh and assume:
- The index door over the verb road. The model's surfaces name `/v1` for every client, and a spawn a draw costs what the switch-over removes.
- A shared case file over two tests written apart. `src/tui/work/testdata/badges.json` holds the rows and the text each draws, and the Go case and the JavaScript case read the same file. So the badge reads alike by construction, with no index running.
- An index standing down draws each view with its base names alone, and the sidebar that draws today stays whole.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/modules/index/manager.go`, the start that writes `index/actions` off `catalogOf`
- `src/tui/registry/tab.go`, the `cli` tab, which reads the action rows by their `fields` member and takes the new members unread
- `src/extension/extension.js`, `activate`, which builds the door `sidebarOf` takes
- `src/extension/sidebar.js`, `sidebarOf`, called from `activate` and from `test/level0/sidebar.test.js` and `test/level0/sidebar-work.test.js`
- `src/extension/lib/panel.js`, `panelHtml`, called from `sidebarOf().html` and from `test/level0/panel.test.js`
- `src/tui/work/shadow.go`, `BadgeOf`, which the shared case file holds, called from `Shadow.Check`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `test/level0/sidebar-views.test.js`, `the sidebar draws every base file over a fake catalog`
- `test/level0/sidebar-views.test.js`, `a badge reads as the window draws it, over the shared cases`
- `test/level0/sidebar-views.test.js`, `a button takes its label, doc and icon off the registration, and the base file writes none`
- `test/level0/sidebar-views.test.js`, `a form draws one field a row off the action's input`
- `test/level0/sidebar-views.test.js`, `a click on a view button calls its action through the index door`
- `src/tui/work/badge_test.go`, `TestBadgeOfReadsTheSharedCases`
- `src/modules/index/catalog_test.go`, `TestActionRowsCarryLabelAndIcon`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft, so no earlier review names a finding

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened: `sidebar.js` with `html`, `took` and `watches`, `widgets.js`, `panel.js` by its export, `editor-files.js`, `editor-lens.js`, `extension.js` by its door, `catalog.go` with `ActionRow` and `catalogOf`, `shadow.go` with `BadgeOf`, `registry/v1.go`, `index/main.go` with `V1` and `standingOf`, `spec/views/work.base` and `log.base`, and the model's views chapters
- the callers list comes off a search for `ActionRow`, `catalogOf`, `sidebarOf`, `panelHtml` and `BadgeOf` across `src` and `test`
- the first done line meets `the sidebar draws every base file over a fake catalog`; the second meets `a badge reads as the window draws it, over the shared cases` beside `TestBadgeOfReadsTheSharedCases`; the check line meets `./RUNME.sh check` before the hand-back

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/sidebar-views.test.js src/modules/index src/tui/work

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/sidebar-views.test.js
- src/modules/index/catalog_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The five sidebar cases fail on their assertions against the stub in `src/extension/lib/views.js`, and `TestActionRowsCarryLabelAndIcon` fails since the action rows carry no label. `TestBadgeOfReadsTheSharedCases` passes at once, and that is its job: it holds the window's side of the shared cases, so the file stays out of the red list. What surprises me: `sidebarOf().html()` draws over a door carrying no schema and no tracked file, so the views section can join the panel with no change to what the sidebar reads today.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the first done line meets `the sidebar draws every base file over a fake catalog`; the second meets `a badge reads as the window draws it, over the shared cases` beside `TestBadgeOfReadsTheSharedCases`; the check line is a checkpoint the hand answers at tests-green
- the one door the tests reach is the index door, and the cases hand a fake of it on the door object, as the sidebar's own tests fake the editor. The Go cases run against `q/qtest`

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass with findings
- base-actions-get-registered: The base files call work/pull, work/place, tickets/flip-urgent and tickets/set-field. No module under src/modules registers them, so each view button draws its bare name and no icon.
- draws-json-yields-to-views: The sibling moved the pull button's help and icon into spec/config/draws.json, which the draft predates. Once work/pull registers them too, the icon stands in two places until the widget grid retires.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/extension src/modules/index test/contract/editor-index.test.js spec/design_output/extension.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the approach names, plus the click script, which sends the call kind, and the size golden, which records the note length
- the one new door, the index door, has a contract case against a real server through the wire door, and the sidebar cases hand a fake of it
- every new function carries a link to the views section chapter or to this ticket
- the keys stand once in the model views chapter, and the new chapter points at it

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
