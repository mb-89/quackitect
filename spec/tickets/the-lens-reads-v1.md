---
kind: [[ticket]]
state: open
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
          - name: size
            form: list
            says: every file the approach touches, one a line
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
group: sidebar-switches-over
depends_on: [the-lens-calls-actions, the-sidebar-reads-v1]
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d88ef4f8a2d6 · claude-code-remote
    hash_before: bb46e7bbc795351b09a200c7d07eba94fd6fa6a8
    hash_after: bb46e7bbc795351b09a200c7d07eba94fd6fa6a8
    inputs:
      - name: ask
        hash: 856bfcbf8f23ff19
        size: 738
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d88ef4f8a2d6 · claude-code-remote
    hash_before: 76525ac47293425321ec90fc262a5404d8e525ba
    hash_after: 76525ac47293425321ec90fc262a5404d8e525ba
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: c2dda916aefee2d6
        size: 7569
    def: 08e16d07b0de477c
  - step: gate
    hand: box d8901b0331d5 · claude-code-remote
    hash_before: e2164e4f22caca2562bb90a872a64e92d9cc0b84
    hash_after: e2164e4f22caca2562bb90a872a64e92d9cc0b84
    inputs:
      - name: design/draft
        hash: c2dda916aefee2d6
        size: 7569
      - name: design/tests-red
        hash: 85e6ff1c384fab28
        size: 1761
    def: dc4904ab364efa10
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

The ticket lens, the field marks and the route drawing read the holds, the group ticket, the leaf marks and the route graph off `/v1` values. They import no module out of the tree, and wake on `/v1/watch`.

Today `lens.js`, `fields.js` and `route-host.js` list and read the holds and tickets themselves. They import `graph.js`, `pull-route.js`, `pull-chapter.js` and `schema.js` out of the tree. So each computes a second copy of what the pull holds.

- `git grep -n 'door.read\|door.list\|door.imports\|door.watch' src/extension/lib` answers nothing
- a case under `test/level0` draws a held ticket's marks and route over a fake index
- `./RUNME.sh check` exits 0

view: a held ticket, its marked fields and its route drawing

from: none

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

The lens, the marks and the drawing read two index values over `/v1`, and wake on `/v1/watch`. The index gains a list of standing holds and a drawing for each ticket path. It already answers `tickets/cloud`.

1. `src/q/projection.go`: `keyed` trims the key off the family name the registration carries at call time, `strings.TrimSuffix(one.name, "<path...>")`, in place of the local name it captured. Today wiring renames `notes/<path...>` to `tickets/notes/<path...>`, so the trim misses, `covers` refuses, and every wired keyed read answers its default. Seen live: `tickets/notes/spec/tickets/the-lens-reads-v1.md` answers an empty head, and a watch on it sends nothing. The fix also mends `newTicket` in `src/extension/sidebar.js`, which asks that value whether a file stands.
2. `src/note` owns the note reader: `readNote` and `sectionsOf` move out of `src/modules/check/note.go` and export, and the check module imports them.
3. `src/modules/holds/holds.go` derives `holds/standing` over the `hold/<path...>` family and `tickets/all`. It answers one row a hold, as `{ticket, path, step, hand, person}`. `person` follows the rule `personHolds` in `lens.js` holds, and a hold whose ticket stands closed drops out, as `stillHeld` drops it today. `spec/wiring.yaml` binds `tickets/all` in.
4. `src/modules/tickets/drawn.go` projects both ticket folders a second time as `tickets/drawn/<path...>`, Loaded, through a read-only codec: `Serialize` refuses. `Parse` answers `{graph, steps, leaves}`:
   - `graph` is what `graphIn` in `src/scripts/graph.js` answers: nodes, hold, pass and fail edges, and each node's chapter and line.
   - `steps` is the front's `steps`, which the page takes for an edit.
   - `leaves` maps each leaf path to `{does, fields}`. `fields` lists the evidence in route order, with `checked` last where the chain carries a checklist, each as `{name, form, says, items, line, filled}`. `line` follows `headingLines` in `fields.js`, and `filled` follows `chapterOf` in `src/scripts/pull-chapter.js`.
   A golden test holds the Go answer equal to the JS emitter over testdata tickets, the way the check twins hold theirs.
5. `src/extension/lib/lens.js`: `ticketLensOf.lenses` reads `holds/standing` and `tickets/cloud` through `door.index.values`. `lensesOf` takes `cloud`, a boolean, in place of the group text, and keeps the ticket's own marker off the text it holds. `holdsIn`, `stillHeld`, `parsedOrNull`, `HOLDS`, `HOLD_WATCHES` and `GROUPS` leave, and `names` replaces `watches`.
6. `src/extension/lib/fields.js` reads the person's holds off `holds/standing` and a path's marks off `tickets/drawn/<path>`: every field of the held leaf standing unfilled, at its line, with the hover `hoverOf` builds. `rules`, `marksIn`, `headingLines`, `ROUTE` and `CHAPTER` leave. `names` reads `holds/standing` and `tickets/all`, and `held` draws each seen path again.
7. `src/extension/lib/route-host.js`: `graphOf` reads `tickets/drawn/<path>` and `holds/standing`, and the `EMITTER` and `SCHEMA` imports leave. `names` matches the one in `fields.js`, and `refreshed()` posts the message again to every page shown.
8. `src/extension/lib/drawing.js`: `graphAt` and `EMITTER` leave, since nothing outside its own test calls them. `drawable` stays.
9. `src/extension/extension.js` watches `tickets.names`, `fields.names` and `route.names` through `door.index.watch`. `src/extension/editor-lens.js` drops its file watchers over `lens.watches`.

What I weigh and assume:
- The cost: the marks and the drawing follow the saved file, where today they follow the buffer. A press in the drawing saves first, so its edit draws at once. A hand edit of the YAML draws on save. The strongest objection is that a field's mark now clears on save, not as the person types. I take that cost because the ask makes the index the one reader. Feeding the projection off the `buffers/<path...>` family in `src/modules/lsp` would close the gap, and a note parks it.
- The per-path value rides the keyed fix, where one map over every ticket would ship every graph on each change.
- The JS emitter stays, because the `graph` verb draws off it, and the golden test keeps both answers equal.
- What breaks this: a keyed watch that still sends nothing after the fix. The `v1watch` case decides it, and where it stands red, the hosts wake on `tickets/all` alone and read the keyed value on each wake.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/extension/extension.js activate: ticketLensOf, routeHostOf, fieldMarksOf, fields.watches
- src/extension/editor-lens.js lenses: lens.watches
- src/extension/sidebar.js pullsNext: ticketLensOf(door).took
- src/extension/sidebar.js newTicket: tickets/notes/<path>, whose read the keyed fix mends
- src/modules/check/note.go and every check file calling readNote or sectionsOf
- src/q/projection.go ProjectIn: every Loaded family, among them tickets/notes, hold, the config projections, bless and the views bases
- test/level0/lens.test.js: lensesOf, holdsIn, HOLDS, ticketLensOf
- test/level0/holds-leave.test.js: lensesOf
- test/level0/fields-to-fill.test.js: fieldMarksOf, CHAPTER, ROUTE
- test/level0/route-host.test.js: routeHostOf
- test/level0/lens-actions.test.js: ticketLensOf, routeHostOf
- test/level0/save-fills.test.js: ticketLensOf
- test/level0/drawing.test.js: graphAt, EMITTER

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/q/projection_test.go: TestAWiredKeyedFamilyReadsItsFile
- src/index/v1watch_test.go: TestWatchSendsAKeyedName
- src/modules/holds/holds_test.go: TestStandingDropsAClosedTicketsHold
- src/modules/holds/holds_test.go: TestStandingMarksThePersonsHold
- src/modules/tickets/drawn_test.go: TestDrawnMeetsTheEmitter
- src/modules/tickets/drawn_test.go: TestDrawnMarksTheOpenFields
- src/modules/tickets/drawn_test.go: TestDrawnRefusesAWrite
- test/level0/lens-v1.test.js: a held ticket draws its marks and route over a fake index
- test/level0/lens-v1.test.js: the lens reads holds/standing and tickets/cloud, and a watch event draws it again
- test/level0/lens-v1.test.js: src/extension/lib names no door.read, door.list, door.imports or door.watch

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/q/projection.go
- src/q/projection_test.go
- src/index/v1watch_test.go
- src/note/note.go
- src/note/note_test.go
- src/modules/check/note.go
- src/modules/holds/holds.go
- src/modules/holds/holds_test.go
- src/modules/tickets/drawn.go
- src/modules/tickets/drawn_test.go
- src/modules/tickets/testdata/drawn.golden.json
- spec/wiring.yaml
- src/extension/lib/lens.js
- src/extension/lib/fields.js
- src/extension/lib/route-host.js
- src/extension/lib/drawing.js
- src/extension/extension.js
- src/extension/editor-lens.js
- test/level0/v1-index.js
- test/level0/drawn-twin.js
- test/level0/lens-v1.test.js
- test/level0/lens.test.js
- test/level0/holds-leave.test.js
- test/level0/fields-to-fill.test.js
- test/level0/route-host.test.js
- test/level0/lens-actions.test.js
- test/level0/drawing.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened lens.js, fields.js, route-host.js, drawing.js, extension.js, editor-lens.js, editor-index.js, graph.js, leafOf in pull-route.js, chapterOf in pull-chapter.js, holds.go, cloudOf in tickets.go, ProjectIn in projection.go, Declared in store.go and v1.go, and read the live catalog, a live hold, a live keyed read and a live keyed watch
- the callers list names every file the grep for the changed names finds under src and test, and the Loaded families the keyed fix reaches
- the grep line meets the lens-v1 case on the grep, the fake index line meets the lens-v1 case drawing a held ticket, and the check line meets its own run

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/lens-v1.test.js src/q/keyed_test.go src/index/v1keyed_test.go src/modules/holds/standing_test.go src/modules/tickets/drawn_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/lens-v1.test.js
- src/q/keyed_test.go
- src/index/v1keyed_test.go
- src/modules/holds/standing_test.go
- src/modules/tickets/drawn_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every new case fails on its own assertion, and every older case in the same packages and the sidebar files passes.

What surprised me:
- The holds module stands outside `spec/wiring.yaml`, so its names come out bare as `hold/<path...>` and `bless/agent`. So `holds/standing` reads the bare name `tickets/all`, and the wiring line of the approach falls away.
- A wired keyed read answers an error, and the door logs it and keeps the default. So a keyed watch sends the default once, in place of nothing. The keyed fix answers both cases.
- The door holds a testdata ticket to the ticket schema, so each fixture carries every evidence heading. The `checked` field carries no heading, and it covers the line where a mark falls back to the leaf's heading.
- `test/level0/drawn-twin.js` serves both sides: the fake index draws off it, and its main block writes the golden file the Go case reads.
- The fake answers `tickets/drawn` as plain JSON. The Go codec answers the same, so the hosts need no `plainOf` there.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the grep line meets the grep case in lens-v1.test.js, the fake index line meets its first case, and the check line waits on the check itself, which leaves the red list out until tests-green
- the index door has its fake in test/level0/v1-index.js, which now answers holds/standing, tickets/cloud and tickets/drawn; the Go cases run on q/qtest; the door in lens-v1 refuses every file read

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- every done_when line meets a red case: the grep and fake-index cases in test/level0/lens-v1.test.js, and the check at tests-green
- the Go cases in src/q, src/index, src/modules/holds and src/modules/tickets compile and fail on their own assertion, and no older case there fails
- the wiring line falls away, as tests-red found, since the holds module reads the bare name tickets/all
- the marks follow the saved file, not the buffer; the draft names that cost and parks the buffers feed, which the ask leaves out

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
