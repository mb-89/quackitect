---
kind: [[ticket]]
state: closed
step: implement/tests-green
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: person-1
        does: answers the question the engine asks
        by: person
        to: engine
        asks: The badge follows the queue with no window reload. Does that line wait for the-badge-reads-open-tasks in phase 2, while this ticket lands the rest now?
        evidence:
          - name: answer
            form: choice
            says: the answer, which the step behind this one reads
            options: ["wait for phase 2 and land the rest now", "an interim redraw off the bridge now"]
      - name: person-2
        does: answers the question the engine asks
        by: person
        to: engine
        asks: Phase 2 moves the badge onto work/open-tasks. Do the redraw line, its sidebar case and the compare step move to the-badge-reads-open-tasks, while this ticket lands the todo, the rows and the lens?
        evidence:
          - name: answer
            form: choice
            says: the answer, which the step behind this one reads
            options: ["move them to phase 2", "keep them here"]
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
group: the-engine-fixes-its-faults
record:
  - step: design/draft
    hand: box 63693613eded · claude-code-remote
    hash_before: 3062638584d4132b1819045f9190e198799a1d2d
    hash_after: 3062638584d4132b1819045f9190e198799a1d2d
  - step: design/review
    hand: box d6f05e3a585030 · claude-code
    hash_before: b4d3c8ed536c28bad242530e350e48a8db83a241
    hash_after: b4d3c8ed536c28bad242530e350e48a8db83a241
    returns: 1
    why: "the redraw runs `./RUNME.sh tui work --count` on every burst of ticket, plan and hold writes. Each run starts node, can build the viewer, and reads git over every work branch, thirteen seconds on the owner's desk. The owner rules on sidebar-lands-in-shadow that the sidebar builds and restarts nothing, and draws a question mark until the engine answers. The redraft reads a count the engine already keeps, and spawns no verb on a draw; the count stands at 68 on the owner's desk, because the queue reads a group as the cloud's by its branch alone. the-queue-reads-the-marker reads `cloud: true` in its place, so the redraft names it under `depends_on`, and the badge and the brackets agree on the local count once it lands"
  - step: design/person-1
    hand: box d6f05e3a585030 · claude-code · the owner says so
    hash_before: ccc6f854a3a0c823c6ef7aabd3a6a948366ce048
    hash_after: ccc6f854a3a0c823c6ef7aabd3a6a948366ce048
    def: 3acd0a8c729a3d0a
  - step: design/person-2
    hand: box d6f05e3a585030 · claude-code · the owner says so
    hash_before: 470addc968f88b7ac21abe0d29f596cd90dbc64e
    hash_after: 470addc968f88b7ac21abe0d29f596cd90dbc64e
    def: b235913657b5dd0b
  - step: design/draft
    hand: box d7e124b659cd · claude-code-remote
    hash_before: 999bb5115eadae3c20ae1069bd40026f6e393ad9
    hash_after: 999bb5115eadae3c20ae1069bd40026f6e393ad9
    inputs:
      - name: ask
        hash: fa8da1e99d07158b
        size: 1688
    def: 71651f49796eeda4
  - step: design/review
    hand: box d7e124b659cd · claude-code-remote · helper-6
    hash_before: 0ed4fef88ca5f741a0fed7ca735e590468f39c11
    hash_after: 0ed4fef88ca5f741a0fed7ca735e590468f39c11
    inputs:
      - name: design/draft
        hash: 7c7cba5a828521e1
        size: 4191
    def: 0f8c340e80e8ece6
  - step: implement/tests-red
    hand: box d7e124b659cd · claude-code-remote
    hash_before: b9cfc4d4a0d9d85929f780392244362bd9b8932b
    hash_after: b9cfc4d4a0d9d85929f780392244362bd9b8932b
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
    def: 06865600120e8b38
  - step: implement/change
    hand: box d7e124b659cd · claude-code-remote
    hash_before: f802e71b9735eb514f80cf0eac225d84c934931b
    hash_after: f802e71b9735eb514f80cf0eac225d84c934931b
    answered:
      - name: lint
        exit: 0
        said: "src/scripts/pull-hand-of.js:61:38: Antithesis: Say what is. 'never' opens a half that says what the thing is not."
    def: 21d63335f32dfcda
  - step: implement/tests-green
    hand: box d7e124b659cd · claude-code-remote
    hash_before: a5f7c20414ea24d5b17b7117862b2a27dd3d4a16
    hash_after: a5f7c20414ea24d5b17b7117862b2a27dd3d4a16
    answered:
      - name: tests
        exit: 0
        said: green, 28 test(s) pass in 2 file(s); green, src/tui passes
      - name: check
        exit: 0
        said: "src/scripts/pull-hand-of.js:61:38: Antithesis: Say what is. 'never' opens a half that says what the thing is not."
    inputs:
      - name: implement/tests-red
        hash: d9cfbca89cb39c57
        size: 1298
    def: a27db29c1d1562f2
reason: done
---

# Ask

The sidebar badge shows the number in the work tab's brackets, under a briefcase, and follows the queue with no window reload. The tab and the branch list draw a ticket once, with what it waits on.

The badge counts the rows the tab draws, and the sidebar redraws on a config change alone. So the badge and the brackets show two numbers for one queue. The tab draws a plan todo nested under its group again at the top.

- the `editor` entry in `spec/config/level0.schema.json` counts through a verb printing `Places.Takeable`, the number in the work tab's brackets
- `src/tui/workcount_test.go` holds the printed count equal to the brackets
- the `editor` entry carries a briefcase icon, and its help names the bracket number
- `Placed` in `src/tui/work/workplaces.go` reads every nested row before it adds a plan todo
- a case in `src/tui/workplaces_test.go` holds a todo under its group drawn once
- `childRows` in `src/scripts/work-list.js` names the tickets a child waits on
- the group row names a group branch behind main
- cases in `test/level0/work-group.test.js` hold both the child row and the group row
- `lensesOf` in `src/extension/lib/lens.js` draws no lens over a ticket standing on a cloud branch. A case under `test/level0` holds it
- `./RUNME.sh check` exits 0

# design

## person-1

<!-- The badge follows the queue with no window reload. Does that line wait for the-badge-reads-open-tasks in phase 2, while this ticket lands the rest now? -->

### answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is choice -->

wait for phase 2 and land the rest now

## person-2

<!-- Phase 2 moves the badge onto work/open-tasks. Do the redraw line, its sidebar case and the compare step move to the-badge-reads-open-tasks, while this ticket lands the todo, the rows and the lens? -->

### answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is choice -->

move them to phase 2

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The owner's answers move the badge off this ticket: the redraw, its sidebar case and the compare step go to the-badge-reads-open-tasks in phase 2. The count, the flag, the briefcase and the help stand on main. This ticket lands the todo, the rows and the lens, and no change here spawns a verb on a draw.

| part | file | what changes |
|---|---|---|
| the todo | `src/tui/work/workplaces.go`, `Placed` | `standing` walks every item and its `Kids`, as `amend` in `src/tui/tree/tree.go` does, so a todo the index nests under its group lands no second row at the left |
| the child row | `src/scripts/work-list.js`, `childRows` | reads `dependsOn` off the child, keeps each name standing as an open ticket on the same tip, and writes `waits for a, b` in place of the step. A child waiting on nothing keeps `whyOf` |
| the behind read | `src/scripts/work-stands.js`, `refsHere` | reads `rev-parse origin/main` once a listing, and marks a ref `behind` where `baseOnTrunk` shares a base and that base differs from the trunk tip. `orphan` stands as it is |
| the group row | `src/scripts/work-list.js`, `rowOf` | the why column names `behind main` for a ref marked `behind`, after what it waits for and before the mark |
| the note | `spec/design_output/work.md`, the reads of the listing | gains the one `rev-parse` read |
| the lens | `src/extension/lib/lens.js`, `lensesOf` | takes `group`, the text of the ticket's group file, and answers no lens where the ticket or its group carries `cloud: true`, the marker `placesIn` in `src/scripts/work-answer.js` reads |
| the lens door | `src/extension/lib/lens.js`, `ticketLensOf().lenses` | reads the group file named under `group:` through `door.read`, and spawns no verb |

The listing's `behind` read waits on nothing. The lens reads the marker alone, so it agrees with the queue once the-queue-reads-the-marker lands. The Discussion names that dependency, since the door refuses a front write on an open ticket.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/tui/work/work.go`, `Tab.Update`, the two calls of `Placed`
- `src/tui/workplace_test.go`, which calls `work.Placed`
- `src/scripts/work-list.js`, `list`, the one caller of `rowOf` and `childRows`
- `src/scripts/work-stands.js`, `readWork`, the one caller of `refsHere`
- `src/scripts/work-answer.js`, `answerOf`, and `src/scripts/work-stands.js`, `standOf`, which read the refs through `readWork`
- `src/scripts/work-merge.js`, which calls `baseOnTrunk` and stands unchanged
- `test/level0/work-doors.js`, `remoteSaying`, the fake git the listing cases run over, which answers `rev-parse origin/main`
- `src/extension/lib/lens.js`, `ticketLensOf().lenses`, the one caller of `lensesOf` in `src`
- `src/extension/extension.js`, `activate`, `src/extension/lib/route-host.js` and `src/extension/sidebar.js`, which build `ticketLensOf`
- `src/extension/editor-lens.js`, `lenses`, which calls `lens.lenses`
- `test/level0/lens.test.js`, `test/level0/holds-leave.test.js` and `test/level0/save-fills.test.js`, which call `lensesOf` and `ticketLensOf`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/tui/workplaces_test.go`, `TestATodoUnderItsGroupDrawsOnce`
- `test/level0/work-group.test.js`, `a child row names the tickets it waits on`
- `test/level0/work-group.test.js`, `a group row names a branch behind main`
- `test/level0/lens.test.js`, `a ticket whose group carries the cloud marker draws no lens`
- `test/level0/lens.test.js`, `the lens door reads the group file and runs no verb`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- the redraw spawning a verb on each burst: the redraw leaves this ticket for the-badge-reads-open-tasks, as the owner answers person-2, and no line here spawns a verb on a draw
- the count reading a group as the cloud's by its branch alone: the lens reads `cloud: true`, and the ticket waits for the-queue-reads-the-marker, named in the Discussion because the door refuses a front write

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `Placed`, `amend`, `childRows`, `rowOf`, `waitingOn`, `refsHere`, `baseOnTrunk`, `lensesOf`, `ticketLensOf` and `placesIn` stand opened, and each reads as the table says
- a search over `src` and `test` names every caller in the list
- each ask line left on this ticket names its test, and the moved lines go to phase 2

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->
<!-- the form is verdict -->

pass with findings
- phase-two-carries-badge-lines: the-badge-reads-open-tasks carries none of the lines the owner moves at person-2: the sidebar redraw after a burst of ticket, plan and hold writes, its case in `test/level0/sidebar.test.js`, and the person step comparing the badge with the brackets. This ask still carries all three, so they land on that ticket's ask and leave this one, or this ticket closes on lines nobody builds
- behind-read-reaches-past-ask: the behind read touches `refsHere` in `src/scripts/work-stands.js`, `spec/design_output/work.md` and `remoteSaying` in `test/level0/work-doors.js`, which the ask leaves out. The group-row line needs them. `remoteSaying` answers neither `rev-parse origin/main` nor a `merge-base` per listed ref today, though the callers list says it does, so the builder adds both answers to the fake

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/work-rows.test.js test/level0/lens.test.js src/tui/workplaces_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion. The Go case counts the nested todo twice, which is the fault the ask names.

| the case | the fault it guards |
|---|---|
| a todo under its group draws once | a plan todo drawn again at the left |
| a child row names what it waits on | a child row naming its step while it waits |
| a group row names a branch behind main | a stale group branch that reads as level |
| a cloud-marked ticket draws no lens | a take offered on a ticket the cloud holds |
| the lens door reads the group file | a lens that spawns a verb on each draw |

The row cases pass the file ceiling in the group test file, so they stand in a file of their own. The fake git learns the trunk tip and the merge base inside the case, since the review names that gap.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the cases reach the files the draft names, plus the new row test file the ceiling asks for
- the listing cases run over the fake git, and the lens cases over the fake door
- each case links this ticket
- each case asserts its claim once, and the fixtures stand in the files that own them
- the review rows stand: the badge lines go to phase two, and the fake learns the trunk tip

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the drafted files, plus the row test file the ceiling asks for
- the listing reads git through the fake git, and the lens reads through the fake door
- each changed function links this ticket or the note section it follows
- the cloud marker and the group folder point at their owners, and the note gains one row
- the review rows stand: the badge lines wait for phase two, and the fake learns the trunk tip

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/work-rows.test.js test/level0/lens.test.js src/tui/workplaces_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The work tab and the branch list now draw each ticket once, with what it waits on.

| where | before | now |
|---|---|---|
| the work tab | a plan todo under its group drew again at the left | it draws once, where the index nests it |
| a child row in the branch list | its step, even while it waits | the open tickets it waits on, else its step |
| a group row | no word on a stale base | behind main, where its base stands short of trunk |
| the ticket lens | a take over a ticket the cloud holds | no lens where the ticket or its group carries the cloud marker |

The badge lines leave for phase two, as the owner answers. The commit door also reads the bare test command a leaf writes, so a leaf test counts for the change commit.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the tests-green commit touches no file past the change leaf
- the fakes carry the listing and the lens
- each case links this ticket
- each fact stands once, and the note points at the code
- the review rows stand as the change leaf lands them

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- the count lands on main, so the badge and the brackets read `Places.Takeable` off `PlacesAt`
- `src/tui/workcount_test.go` holds the printed count equal to the brackets
- the briefcase icon and the rest of the ask stand open
- the owner answers person-1 with a yes, and doubts it. Word for word: "Does the badge redraw wait for phase two? Yeah, I guess. I'm not sure. Yeah, I guess." The redraft asks again where phase 2 moves the badge elsewhere
- the redraft reads main, and each line below stands checked in the code
- done on main: the count, the flag, the briefcase and the help naming the brackets
- open: `Placed` in `src/tui/work/workplaces.go` builds `standing` from the top items alone, so a nested todo draws twice
- open: `childRows` in `src/scripts/work-list.js` draws the step alone
- open: `refsHere` in `src/scripts/work-stands.js` marks `orphan` alone
- open: `lensesOf` in `src/extension/lib/lens.js` reads the ticket text alone
- the lens reads `cloud: true` off the group file, as `placesIn` in `src/scripts/work-answer.js` does, and spawns no verb
- the engine keeps no count yet, so the badge redraw waits for phase 2, as person-1 answers
- the old draft names `workcount.go` and `Drawn`, and neither stands on main
- this ticket waits for the-queue-reads-the-marker. The door refuses a front write on an open ticket, so the line stands here
