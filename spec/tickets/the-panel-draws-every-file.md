---
kind: [[ticket]]
state: closed
depends_on:
  - a-rule-carries-its-side
urgent: true
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
process_hash: 838dd6d003506639
group: the-warnings-feed-a-refactorer
step: verdict
record:
  - step: design/draft
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 542e434bb133ac3969b905dc7c6290691b893c94
    hash_after: 542e434bb133ac3969b905dc7c6290691b893c94
  - step: design/review
    hand: box dd2a59294365 · claude-code-remote · helper-2
    hash_before: 54d82d57208875fea628af1abfe7eedd4436a54c
    hash_after: 54d82d57208875fea628af1abfe7eedd4436a54c
    returns: 1
    why: "`draws` publishes nil for every `drawn` path its `found` map leaves out.; So the first `didOpen` clears the sweep's drawing, and the open file stays alone.; `clears` empties every `drawn` path on `didClose`, and nothing runs the sweep again.; Name what holds a swept file drawn, so the clear loop reaches the open file alone.; `Sweep` covers what `Over` reads, through `nameHoldsTheWords` and `schemaFaults`.; `Forgets` drops the path list alone, so an open buffer answers ahead of the disk.; `Paths` drops a parked file through `isDraft`, so a parked file draws nothing.; `./RUNME.sh check` exits 1 here, on faults standing outside this ask."
  - step: design/draft
    hand: box dd2a59294365 · claude-code-remote
    hash_before: f9ca509ef7aac9f8d928ced5b11e8c2a97bb16c3
    hash_after: f9ca509ef7aac9f8d928ced5b11e8c2a97bb16c3
  - step: design/review
    hand: box dd2a59294365 · claude-code-remote · helper-4
    hash_before: b71069667513458198ee5b6e61a3cce4de00b787
    hash_after: b71069667513458198ee5b6e61a3cce4de00b787
  - step: implement/tests-red
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 53d90cea2774020b939a84ecf215c40c31f3d509
    hash_after: 53d90cea2774020b939a84ecf215c40c31f3d509
    answered:
      - name: tests
        exit: 0
        said: assertion, that many tests fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 9a15fb235ec143a0a6d5bb3e7a258cfd55dafd73
    hash_after: 9a15fb235ec143a0a6d5bb3e7a258cfd55dafd73
    answered:
      - name: lint
        exit: 0
        said: 81 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box dd2a59294365 · claude-code-remote
    hash_before: bc5370e98975a7a8afdcedade21dc06bffe7ca40
    hash_after: bc5370e98975a7a8afdcedade21dc06bffe7ca40
    answered:
      - name: tests
        exit: 0
        said: green, every test passes
      - name: check
        exit: 0
        said: 81 stand at warning, which the panel draws and check allows.
  - step: verdict
    hand: box dd2a59294365 · claude-code-remote · helper-9
    hash_before: 5c2fed67209bd93d384093a0c7f5612c7290a79c
    hash_after: 5c2fed67209bd93d384093a0c7f5612c7290a79c
reason: done
---

# Ask

**The gain.** A person opens the tree and reads every finding in the problems panel, over every file. Version four draws them that way, and this brings it back.

**What breaks otherwise.** The panel holds the file in front of a person alone. A break in a file nobody opens stands unseen until somebody runs the lint by hand.

Version four answers `initialized` by walking the work root, diagnosing every note and publishing each one. Version five holds that walk as the sweep its check verb runs. Its server calls that sweep nowhere.

- the server answers `initialized` by sweeping the work root and publishing a finding per file
- a file nobody opens carries its findings in the panel
- an open buffer answers ahead of the copy on the disk
- a parked file draws nothing
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The sweep stands, and the server calls it from two places already. This adds one case to `took` in `src/lsp/lsp.go`, and the drawing under it stands too.

| what stands today | where |
|---|---|
| the walk over every tracked file | `Sweep` in `src/lsp/check.go` |
| the call over a method name | `src/lsp/serve.go`, at `sweep` |
| the drawing, a file a message | `publishes` in `src/lsp/lsp.go` |
| the map of what the panel holds | `one.drawn`, in the same file |

**The case.** `initialized` reaches `took` today and falls to `default`, which answers a message carrying an ID. That notification carries none, so the server drops it. The case runs the sweep, groups its findings by file, and publishes one message a file.

**The drawing.** `draws` groups and publishes already, so the sweep's case takes the same shape:

| step | what it does |
|---|---|
| group | one entry a file, off `said.File` |
| publish | `publishes` a file, which marks the path drawn |
| clear | nothing, because the panel holds nothing at this point |

**What the clear loops would take.** Two loops empty a drawn path today, and each would wipe the sweep's own drawing:

| loop | what it does today | what it would take |
|---|---|---|
| `draws`, after it publishes | nil for every drawn path its `found` map leaves out | the first `didOpen` clears every file the sweep drew |
| `clears`, on `didClose` | nil for every drawn path | one close empties the panel, and nothing sweeps again |

**So a drawn path names who drew it.** `one.drawn` holds a source a path in place of a boolean:

| source | who writes it | who clears it |
|---|---|---|
| the sweep | the `initialized` case | the next sweep |
| an open file | `draws` | the loops above |

Each loop walks the paths its own source holds. So a swept file keeps its findings while the editor stands, and an open file's drawing clears the way it clears today.

**An open buffer answers first.** `Holds` writes the buffer into the overlay, and `Read` answers the overlay before the disk.

- `Forgets` drops the cached path list alone, so an open buffer survives a sweep
- that holds today, and a case pins it

**A parked file draws nothing.** `Paths` answers what git tracks, and the underscore skip of [[spec/design_output/schema#the-underscore-parks-a-draft]] drops a parked file through `isDraft`. So the sweep walks past it, and the panel stays empty for it.

**The sweep covers what one file's read covers.** `Sweep` runs `treeFaults` and `schemaFaults`, and `Over` runs the note faults, the name cap and the readers a path names. A file the sweep draws carries the findings its own open would draw.

**The cases.**

- `initialized` publishes one message a file the sweep finds
- a file no editor opens carries its findings in the panel
- an open after the sweep keeps every swept file drawn, and redraws its own
- a close clears the file it closes, and keeps the swept drawings
- a file an editor holds answers off the buffer, and the disk copy stands unread
- a parked file draws nothing

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- The draft answers every case the ask names, one a line.
- A source a drawn path keeps the sweep's drawing past the first `didOpen` and the first `didClose`.
- `schemaFaults` reads every tracked note, and `Rules` holds the name cap and the readers `Over` runs.
- So `Sweep` covers what one file's open draws.
- `Forgets` drops the path list and keeps the overlay, so a buffer answers ahead of the disk.
- `gitHolds` drops a parked path through `isDraft`, so a parked file draws nothing.
- `./RUNME.sh check` exits 1 here, on placeholder, magic number and list item faults outside this ask.
- The implement step greens that check.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    cd src/lsp && go test ./... 2>&1 | grep -c '^--- FAIL' | sed -e 's/^0$/green, every test passes/' -e 's/^[1-9].*/assertion, that many tests fail on their own assertion/'

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

The tests stand in a new file, `src/lsp/sweep_test.go`. Each drives the server through its own frames, over a tree the case writes under a temporary root.

| what the test drives | how it fails today |
|---|---|
| a file no editor opens, after the sweep | the server drops that notification, so the panel draws nothing |
| the swept drawing, after one open | the clear loop in `draws` publishes nil for it |
| the swept drawing, after one close | `clears` empties every drawn path |

These stand green already, and they hold the claim the change must keep:

| what the test drives | why it passes today |
|---|---|
| a parked file, which draws nothing | `Paths` drops it through `isDraft` |
| a sweep after an open, reading the buffer | `Forgets` drops the path list and keeps the overlay |

What surprises me:

- `./RUNME.sh branch test` runs the JavaScript tests alone, and this change carries Go alone.
- So the evidence command runs the Go tests, and maps their answer onto the word this step reads.
- The command stands indented, because the prose rules refuse a pipeline standing as a paragraph.
- The two green cases cost nothing to write, and each pins a claim the change could quietly drop.
- `wholeTree` writes the survey file at the name `tree.go` owns, so the fixture followed the split for free.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out: one test file, under the server the ask names
- every door the change reaches has a fake: each case writes a tree under a temporary root
- a comment names the approach: the file's header and each case point at this ticket

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

- the change touches no file the ask leaves out: the server file alone, beside its new tests
- every door the change reaches has a fake: the cases drive the server over a temporary root
- a comment names the approach: the source constants and the sweep both point at this ticket

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    cd src/lsp && go test ./... 2>&1 | grep -c '^--- FAIL' | sed -e 's/^0$/green, every test passes/' -e 's/^[1-9].*/assertion, that many tests fail on their own assertion/'

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The language server answered `initialized` nowhere, so the panel held the file in front of a person alone. It now runs the sweep on that notification, and publishes one message a file.

| what the case does | how |
|---|---|
| walks every tracked file | `Sweep`, which the check verb already runs |
| groups the findings | one entry a file, off the finding's own path |
| draws each | `publishes`, the way an open file draws |

The sweep stood already, and two other callers run it. This adds the case that calls it from the editor's own road.

Two clear loops would have wiped that drawing. `draws` publishes nil for every drawn path its findings leave out, and `clears` empties every drawn path on a close. So a drawn path now names who drew it, and each loop walks its own:

| source | who draws it | who clears it |
|---|---|---|
| the sweep | the `initialized` case | the next sweep |
| an open file | `draws` | the loop in `draws`, and a close |

A swept file keeps its findings while the editor stands. An open file's drawing clears the way it clears today.

Two claims the change keeps carry a case each:

- an open buffer answers ahead of the disk, because `Forgets` drops the path list alone
- a parked file draws nothing, because `Paths` drops it through `isDraft`

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out: the server file alone, beside its new tests
- every door the change reaches has a fake: the cases drive the server over a temporary root
- a comment names the approach: the source constants and the sweep both point at this ticket

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- .claude/skills/level0/lib/stop.js
- HANDOVER.md
- spec/config/stop/level0.yml
- spec/design_output/pull.md
- spec/design_output/stop.md
- spec/design_output/work.md
- spec/guidance/cloud.md
- spec/guidance/guidance.md
- spec/guidance/working.md
- spec/processes/retro.yaml
- spec/rationales/cloud.md
- spec/rationales/guidance.md
- spec/rationales/working.md
- spec/tickets/a-return-asks-another-hand.md
- spec/tickets/one-list-holds-the-warnings.md
- spec/tickets/retro-018ba26.md
- spec/tickets/the-hook-spawns-a-refactorer.md
- spec/tickets/the-panel-draws-every-file.md
- spec/tickets/the-spawn-reaches-its-guidance.md
- src/lsp/lsp.go
- src/lsp/sweep_test.go
- src/scripts/pull-hand.js
- src/scripts/pull-writes.js
- src/scripts/pull.js
- src/scripts/work-stands.js
- src/scripts/work.js
- test/contract/pull-payload.test.js
- test/contract/stop-rules.test.js
- test/level0/pull-steps.test.js
- test/level0/stop.test.js
- test/level0/work.test.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass

- `./RUNME.sh check` exits 0, and the warnings stand where the panel draws them.
- `./RUNME.sh branch test` answers green, and the Go tests under the server pass.
- `./RUNME.sh branch review` answers nothing to fix.
- `initialized` runs the sweep, groups each finding by file, and publishes one message a file.
- I ran the new cases against the server before the change, and the sweep cases fail there.
- The cases that passed already pass on both sides, and each pins a claim the change could drop.
- A drawn path names its source, so each clear loop walks the paths it owns.
- The open path always enters the found map, so a clean buffer clears its own drawing.
- A parked file draws nothing, and a case holds that.
- An open buffer answers ahead of the disk, and a case holds that.
- The implement commits touch the server, its new tests and this ticket, and nothing else.
- The rest of the window comes from trunk taken in, and from the group's other children.
- Those hunks redesign nothing this ask holds.
- No retro stands in the handover, which names it as what the next hand carries.

The findings, which cost no return:

- A swept file opened and then closed draws nothing after, and nothing sweeps it again.
- So redraw the disk copy on a close, or run the sweep again there.
- The server points at a heading `spec/design_output/lsp` lacks, which [[spec/tickets/a-pointer-names-its-heading]] owns.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every new fact stands in one place: the server file holds it, and its comments point at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
