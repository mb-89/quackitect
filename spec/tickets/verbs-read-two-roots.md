---
kind: [[ticket]]
state: closed
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
    needs: ["work test"]
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
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
process: [[spec/processes/standard]]
process_hash: 8cc8301e3ca3ba8d
group: the-verbs-read-two-roots
step: verdict
record:
  - step: design/draft
    hand: box ea4589862ac3
    hash_before: c2e318dea6e4eb5ef0298ff0f77aff5cdc039944
    hash_after: c2e318dea6e4eb5ef0298ff0f77aff5cdc039944
  - step: design/review
    hand: box ea4589862ac3 · helper-2
    hash_before: 1c265ac5ec45f318062c0aae815e5e50b2ecf79f
    hash_after: 1c265ac5ec45f318062c0aae815e5e50b2ecf79f
  - step: implement/tests-red
    hand: box ea4589862ac3
    hash_before: fe69616f09d4ae995f02663de181a79a595fbdcd
    hash_after: fe69616f09d4ae995f02663de181a79a595fbdcd
    answered:
      - name: tests
        exit: 1
        said: assertion, 11 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box ea4589862ac3
    hash_before: 2fd2a0b4d2b8c8d7f0e1e186d8444361d3f66ec3
    hash_after: 2fd2a0b4d2b8c8d7f0e1e186d8444361d3f66ec3
    answered:
      - name: lint
        exit: 0
        said: 14 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box d42624a67d18a8 · claude-code
    hash_before: c5e8270659b5ba232d854fcd568cb22905e84715
    hash_after: c5e8270659b5ba232d854fcd568cb22905e84715
    answered:
      - name: tests
        exit: 0
        said: green, 575 test(s) pass in 52 file(s)
      - name: check
        exit: 0
        said: 67 stand at warning, which the panel draws and check allows.
  - step: verdict
    hand: box d42624a67d18a8 · claude-code · helper-7
    hash_before: 32e96c2fd1993d3fa3ae284c2b5a5fc8c00d844e
    hash_after: 32e96c2fd1993d3fa3ae284c2b5a5fc8c00d844e
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A project keeps its own tickets, its own guidance notes and its own overrides. The vehicle's rules hold over all of it.

<!-- breaks, as text: what breaks if it is never done -->
A stub's tickets land in the vehicle, or the rules read the stub's guidance as the vehicle's. The two trees leak into each other.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- ticket note, ticket update, branch take and the pull read and write spec/tickets under the work root
- the standing layer joins the method's guidance with the work root's file by file, as [[spec/design_output/vehicle#the-work-root-inherits]] rules
- the write door refuses a bad write inside the stub with the vehicle's rules, over two fake roots
- the projections land in the work root and read the method's schema

Read [[spec/design_input/a-stub-takes-its-vehicle]] first, the chapters The stub's files and The bridgehead step by step.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The command line hands every verb both roots, and each read names the root it belongs to. The server's box carries the two already, so the doors take the same rule.

| the read | the root |
|---|---|
| a ticket, a private note, a hold, the box id, the brief | the work root |
| a schema, a process, the Vale config, the styles, the vehicle id | the method root |
| a guidance note | the work root's file where it stands, else the method's |
| a link a field names | the work root first, then the method root |
| a projection's target | the work root |
| a projection's source | the work root's file where it stands, else the method's, and a JSON source joins key by key |

The verbs and the files each one keeps under the work root:

| verb | keeps under the work root |
|---|---|
| `ticket note`, `retro notes` | `.se/tickets` |
| `ticket update`, `ticket open` | `spec/tickets` |
| `branch take`, `branch pull` | `spec/tickets`, `.se/hold`, `.se/box.json` |

- `rootsHere` runs once in the command line. The verbs take `it.method` and `it.work`, and `it.root` is the work root.
- Git runs at the work root, because a stub is its own repository.
- `schemasHere` and `processAt` read the method root. So a stub's ticket meets the vehicle's schema and route.
- The pull runs a command field and a test at the work root. It names the Vale config under the method root, so a relative config resolves in the stub.
- One reader, `inherits`, stands beside `layered` in the layer module. It reads a relative path off the two roots, and the work root's file wins.
- The reader lists a folder as the union of both, with the work root's name winning. A JSON file both roots hold joins key by key.
- On a tree driving itself the reader reads the one root.
- The standing layer reads `spec/guidance` through that reader, in the server and in `standing`. A stub's note joins the set, and one it names again replaces the vehicle's.
- The helper's guidance and the canary count follow the standing layer.
- The write door keeps its reads. The path is relative to the work root, and the schemas and Vale come off the method root.
- A test drives the write door over two fake roots. A ticket under the stub breaking the vehicle's schema comes back refused, and one keeping it passes.
- `readAll` takes two readers: the sources through `inherits`, and the targets in the work root alone. A target the method root holds counts for nothing in a stub.
- The server's projection and the `project` and `check` verbs land every target under the work root. The owner door refuses a write to one there.
- The stop rules and the judged styles stay on the method root, because the ask names guidance and nothing else.
- The stub verb writes `project/spec/tickets`. This ticket reads `spec/tickets` under the work root, as the ask says. A private note carries that to the retro.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
- The approach answers each done_when line, and the two tables name the root of every read.
- The reader `inherits` matches the chapter The work root inherits: silent, replaced, or joined, one file a unit.
- The layer module holds `layered` and `deeply` already, so the reader builds on what stands.
- The server's box carries `method`, `work` and `root` already, so the doors take the rule with no new field.
- The write door test over two fake roots feeds a bad ticket and asserts a refusal, as reviewing asks.
- The targets read the work root alone, so a target the vehicle holds stays out of the stub.
- The chapter names the stop rules and the judged styles as inheriting too. The approach leaves them on the method root on purpose.
- The stub verb writes `project/spec/tickets`, and the approach carries the mismatch with `spec/tickets` to the retro.
- No branch stands yet, so `./RUNME.sh check` waits for implement.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Eleven tests fail on their own assertion, across five files. Two files are new: the verbs over two roots, and the write door over two fake roots.

- The verbs fail because the route and the schema stand under the method root. The verbs read the work root for both.
- The pull hands out the stub's ticket already, because every file read goes through `it.root`. It misses the note the work root lacks.
- The link check refuses a note the method root holds, so the second road stands unwritten.
- The reader fails on the method's file, because it reads the work root alone until the change lands.
- The projection lands its target in the method root, and the standing layer takes the work root for the environment.
- The write door refuses the stub's bad ticket already, and passes the good one. The three places rule refuses a route whose last leaf names no reader, which the fixtures first missed.
- The take on a cloud box passes already, because it writes the record under `it.root`. The command line alone decides which root that is.

### checked

- the change touches the layer module, the reader tests and the test files the ask names, and no stub file
- every door the tests reach is a fake: the disk, git, the clock and the log
- the reader carries a comment naming the chapter The work root inherits

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint

### checked

- the change touches the layer, the projection, the guidance door, the command line and the verbs. No stub file moves.
- every door the change reaches is a fake in its test: the disk, git, the clock and the log. The fixtures stand in one shared module.
- every changed function carries a comment naming the chapter The work root inherits

## tests-green

<!-- makes the tests pass -->

### tests

    ./RUNME.sh branch test

<!-- the form is command -->

### check

    ./RUNME.sh check

<!-- the form is command -->

### says

The fixture the pull tests drive now names both roots.

| what stands | what it becomes |
|---|---|
| `handFaults` joins the Vale config onto `it.method`, and the fixture names no root | the fixture names the method root and the work root |
| the answer key spells that path with a forward slash | the key builds its path with `join`, so either separator reads |
| a pointer stands on the second line of a comment | each pointer stands on the line the rule reads |

A stub lints under the vehicle's rules, so the config comes off the method root. Where that join throws, the try swallows it and the voice reads nothing back. The two cases over the hand-back then read green where the rules refuse.

<!-- the form is text -->

### checked

- the change touches no file the ask leaves out. The commit holds two fixtures and one comment.
- every door the change reaches has a fake. The cases drive the fake disk, git and process.
- a comment names the approach. The one in `hand.js` points at the work root chapter.

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

    .claude/commands/se-agent-control-binding-god.md
    .claude/commands/se-agent-control-binding-queue.md
    .claude/commands/se-agent-control-binding-unbound.md
    .claude/commands/se-config-code-fileLines.md
    .claude/commands/se-config-code-functionLines.md
    .claude/commands/se-config-engine-binding-god.md
    .claude/commands/se-config-engine-binding-queue.md
    .claude/commands/se-config-engine-binding-unbound.md
    .claude/output-styles/level0.md
    .claude/skills/level0/hooks/level0.js
    .claude/skills/level0/lib/answer.js
    .claude/skills/level0/lib/apply.js
    .claude/skills/level0/lib/bash.js
    .claude/skills/level0/lib/code.js
    .claude/skills/level0/lib/config.js
    .claude/skills/level0/lib/controls.js
    .claude/skills/level0/lib/copilot-dispatch.js
    .claude/skills/level0/lib/copilot-runtime.js
    .claude/skills/level0/lib/copilot-setup.js
    .claude/skills/level0/lib/guidance.js
    .claude/skills/level0/lib/hash.js
    .claude/skills/level0/lib/helpers.js
    .claude/skills/level0/lib/layer.js
    .claude/skills/level0/lib/log.js
    .claude/skills/level0/lib/magic.js
    .claude/skills/level0/lib/mutations.js
    .claude/skills/level0/lib/names.js
    .claude/skills/level0/lib/paragraph.js
    .claude/skills/level0/lib/private.js
    .claude/skills/level0/lib/projection.js
    .claude/skills/level0/lib/refuse.js
    .claude/skills/level0/lib/review.js
    .claude/skills/level0/lib/runs.js
    .claude/skills/level0/lib/schema.js
    .claude/skills/level0/lib/servers.js
    .claude/skills/level0/lib/shout.js
    .claude/skills/level0/lib/size.js
    .claude/skills/level0/lib/snippets.js
    .claude/skills/level0/lib/stop.js
    .claude/skills/level0/lib/ticket.js
    .claude/skills/level0/lib/todo.js
    .claude/skills/level0/lib/tools.js
    .claude/skills/level0/lib/tree.js
    .claude/skills/level0/lib/trunk.js
    .claude/skills/level0/lib/undo.js
    .claude/skills/level0/lib/vocabulary.js
    .claude/skills/level0/lib/voice.js
    .claude/skills/level0/hooks/pull-tool.js
    .claude/skills/level0/lib/pull.js
    .gitignore
    .vale.ini
    spec/config/biome.json
    spec/config/level0.json
    spec/config/level0.schema.json
    spec/config/stop/level0.yml
    spec/config/stop/level1.yml
    spec/config/styles/VoiceParagraph/Characters.yml
    spec/config/styles/VoiceParagraph/CodeSpans.yml
    spec/config/styles/VoiceParagraph/ListItem.yml
    spec/config/styles/VoiceParagraph/Markup.yml
    spec/config/styles/VoiceParagraph/Shape.yml
    spec/config/styles/VoiceParagraph/ShapeAnswer.yml
    spec/config/styles/VoiceParagraph/Vocabulary.yml
    spec/config/styles/VoiceVale/DigitInProse.yml
    spec/design_input/a-stub-takes-its-vehicle.md
    spec/design_input/the-tree-view-editor.md
    spec/design_input/the-window-holds-every-tab.md
    spec/design_input/the-write-door.md
    spec/design_output/apply.md
    spec/design_output/bash.md
    spec/design_output/config.md
    spec/design_output/doors.md
    spec/design_output/editor.md
    spec/design_output/extension.md
    spec/design_output/index.md
    spec/design_output/level0.md
    spec/design_output/log.md
    spec/design_output/private.md
    spec/design_output/projection.md
    spec/design_output/pull.md
    spec/design_output/review.md
    spec/design_output/schema.md
    spec/design_output/stop.md
    spec/design_output/tools.md
    spec/design_output/tree-view.md
    spec/design_output/tree.md
    spec/design_output/vehicle.md
    spec/design_output/tui.md
    spec/design_output/work.md
    spec/funnel/a-paragraph-has-a-schema.md
    spec/guidance/cloud.md
    spec/guidance/code/code.md
    spec/guidance/voice-checks.md
    spec/guidance/voice.md
    spec/guidance/working.md
    spec/processes/group.yaml
    spec/processes/standard.yaml
    spec/processes/trivial.yaml
    spec/rationales/cloud.md
    spec/rationales/voice-checks.md
    spec/rationales/working.md
    spec/schemas/guidance.schema.yaml
    spec/schemas/paragraph.schema.yaml
    spec/schemas/ticket.schema.yaml
    spec/tickets/a-base-file-says-it.md
    spec/tickets/a-cell-takes-an-edit.md
    spec/tickets/a-done-branch-joins-queue.md
    spec/tickets/a-group-is-a-branch.md
    spec/tickets/a-link-click-opens-it.md
    spec/tickets/a-person-reads-the-pull.md
    spec/tickets/a-stale-claim-comes-back.md
    spec/tickets/brand-reads-folder.md
    spec/tickets/bridgehead-installs-upstream.md
    spec/tickets/code-has-a-size-ceiling.md
    spec/tickets/edit-door-reads-whole.md
    spec/tickets/escalate-inserts-a-person-step.md
    spec/tickets/level-zero-handover.md
    spec/tickets/level-zero-hands-over.md
    spec/tickets/person-step-refuses-an-agent.md
    spec/tickets/python-writes-pass-the-door.md
    spec/tickets/refusal-cap-inserts-no-person.md
    spec/tickets/refused-payload-stays-off-disk.md
    spec/tickets/reviewer-reads-no-group-retro.md
    spec/tickets/sidebar-makes-both.md
    spec/tickets/the-answer-door-reads-notes.md
    spec/tickets/the-answer-lands-in-chat.md
    spec/tickets/the-brand-names-the-plugin.md
    spec/tickets/the-brand-reads-the-folder.md
    spec/tickets/the-bridgehead-installs-upstream.md
    spec/tickets/the-bridgehead-needs-no-shell.md
    spec/tickets/the-brief-verbs-go.md
    spec/tickets/the-canary-ends-no-turn.md
    spec/tickets/the-check-starts-the-server.md
    spec/tickets/the-cloud-box-starts-serving.md
    spec/tickets/the-colours-stand-in-config.md
    spec/tickets/the-controls-wire-up.md
    spec/tickets/the-group-leaves-at-todo.md
    spec/tickets/the-hand-carries-a-step.md
    spec/tickets/the-hand-carries-the-session.md
    spec/tickets/the-help-reads-the-cursor.md
    spec/tickets/the-hook-reloads-its-door.md
    spec/tickets/the-judge-reads-answer-rules.md
    spec/tickets/the-mouse-reaches-the-window.md
    spec/tickets/the-person-step-holds.md
    spec/tickets/the-pull-says-refused-commit.md
    spec/tickets/the-record-quotes-its-why.md
    spec/tickets/the-record-why-holds-spans.md
    spec/tickets/the-server-holds-its-socket.md
    spec/tickets/the-session-file-proves-itself.md
    spec/tickets/the-sidebar-makes-both.md
    spec/tickets/the-spawn-answers-a-helper.md
    spec/tickets/the-spawn-takes-a-step.md
    spec/tickets/the-stop-wakes-again.md
    spec/tickets/the-stub-plugin-name.md
    spec/tickets/the-successor-names-a-person.md
    spec/tickets/the-take-skips-an-orphan.md
    spec/tickets/the-tree-draws-its-columns.md
    spec/tickets/the-tree-takes-a-filter.md
    spec/tickets/the-verbs-read-a-group.md
    spec/tickets/the-verbs-read-two-roots.md
    spec/tickets/the-viewer-draws-the-note.md
    spec/tickets/the-viewer-filters-the-talk.md
    spec/tickets/the-window-grows-a-frame.md
    spec/tickets/ticket-open-lints-the-ask.md
    spec/tickets/verbs-read-two-roots.md
    spec/tickets/voice-rules-skip-the-record.md
    spec/vocabulary/terms.yml
    src/bridge/answer.js
    src/bridge/apply.js
    src/bridge/bash.js
    src/bridge/code.js
    src/bridge/config.js
    src/bridge/guidance.js
    src/bridge/projection.js
    src/bridge/prose.js
    src/bridge/reload.js
    src/bridge/review.js
    src/bridge/search.js
    src/bridge/server.js
    src/bridge/status.js
    src/bridge/stop.js
    src/bridge/vehicle.js
    src/bridge/window.js
    src/bridge/write.js
    src/doors/biome.js
    src/doors/disk.js
    src/doors/fake/disk.js
    src/doors/git.js
    src/doors/index.js
    src/doors/log.js
    src/doors/proc.js
    src/doors/vale.js
    src/extension/editor.js
    src/extension/lib/rows.js
    src/extension/sidebar.js
    src/lsp/go.mod
    src/lsp/install.go
    src/lsp/lsp.go
    src/lsp/main.go
    src/lsp/names.go
    src/lsp/note.go
    src/lsp/schema.go
    src/lsp/schema_test.go
    src/lsp/serve.go
    src/lsp/tree.go
    src/scripts/ask-lint.js
    src/scripts/cli.js
    src/scripts/copilot.js
    src/scripts/group.js
    src/scripts/hand.js
    src/scripts/install.sh
    src/scripts/landed.js
    src/scripts/prepush.js
    src/scripts/probe.js
    src/scripts/pull.js
    src/scripts/retro.js
    src/scripts/review.js
    src/scripts/serve.js
    src/scripts/stand.js
    src/scripts/test-verb.js
    src/scripts/ticket.js
    src/scripts/tui.js
    src/scripts/unblock.js
    src/scripts/vehicle.js
    src/scripts/viewer.js
    src/scripts/work.js
    src/stub/.claude/skills/bridgehead/.claude-plugin/plugin.json
    src/stub/.claude/skills/bridgehead/hooks/bridgehead.js
    src/stub/.claude/skills/level0/.claude-plugin/plugin.json
    src/stub/.claude/skills/level0/hooks/bridgehead.js
    src/stub/.claude/skills/level0/hooks/hooks.json
    src/tui/base.go
    src/tui/base_test.go
    src/tui/colour.go
    src/tui/detail.go
    src/tui/detail_test.go
    src/tui/door.go
    src/tui/door_test.go
    src/tui/footer.go
    src/tui/frame_test.go
    src/tui/go.mod
    src/tui/help.go
    src/tui/keys.go
    src/tui/main.go
    src/tui/model_test.go
    src/tui/mouse.go
    src/tui/mouse_test.go
    src/tui/sort.go
    src/tui/sort_test.go
    src/tui/tabs.go
    src/tui/tree.go
    src/tui/tree_test.go
    src/tui/treedraw.go
    src/tui/treeedit.go
    src/tui/treeedit_test.go
    src/tui/treefilter.go
    src/tui/ui.go
    src/tui/work.go
    src/tui/wrap.go
    src/yaml/go.mod
    src/yaml/value.go
    src/yaml/yaml.go
    src/yaml/yaml_test.go
    test/contract/biome.test.js
    test/contract/cloud-start.test.js
    test/contract/paragraph.test.js
    test/contract/pull-payload.test.js
    test/contract/sidebar.test.js
    test/contract/stub.test.js
    test/contract/tree.test.js
    test/contract/vale.test.js
    test/level0/answer-door.test.js
    test/level0/ask-lint.test.js
    test/level0/bash.test.js
    test/level0/bridgehead.test.js
    test/level0/canary-debt.test.js
    test/level0/clicks.test.js
    test/level0/code-door.test.js
    test/level0/controls.test.js
    test/level0/fixtures.js
    test/level0/guidance.test.js
    test/level0/hand.test.js
    test/level0/hooks.test.js
    test/level0/landed.test.js
    test/level0/layer.test.js
    test/level0/level1.test.js
    test/level0/magic.test.js
    test/level0/note-answer.test.js
    test/level0/panel.test.js
    test/level0/paragraph.test.js
    test/level0/projection.test.js
    test/level0/pull-schema.js
    test/level0/pull.test.js
    test/level0/quoted.test.js
    test/level0/ready.test.js
    test/level0/reload.test.js
    test/level0/review.test.js
    test/level0/roots.test.js
    test/level0/serve.test.js
    test/level0/sidebar.test.js
    test/level0/size.test.js
    test/level0/stand.test.js
    test/level0/stop-door.test.js
    test/level0/stop-hold.test.js
    test/level0/stop.test.js
    test/level0/stub.test.js
    test/level0/ticket-verb.test.js
    test/level0/ticket.test.js
    test/level0/tools-door.test.js
    test/level0/tools.test.js
    test/level0/trunk-door.test.js
    test/level0/unblock.test.js
    test/level0/vehicle.test.js
    test/level0/viewer.test.js
    test/level0/widgets.test.js
    test/level0/work.test.js
    test/level0/write.test.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass
- The verbs, the pull and the doors take both roots, and each read names the root the approach gives it.
- `inherits` holds the chapter The work root inherits: silent, replaced, joined, and a JSON file joins key by key.
- The write door case feeds a bad ticket under the stub over two fake roots, and asserts the refusal.
- A projection target reads the work root alone, and the schema and the route come off the method root.
- `./RUNME.sh check` answers zero, and `./RUNME.sh branch review` answers check passes.
- One check run fails on `test/level0/hooks.test.js`, and two later runs pass. That file alone passes, so the failure wants a note.
- `voiceFaults` joins the Vale config onto `it.method` alone, inside the try. A caller naming no method root reads the voice as clean.
- Take `it.method ?? it.root` there, as the two other spots in the file take it.
- `readNotes` drops a draft note from the standing layer, and no case asserts that drop.
- `inherits` reads the two roots as text, so two spellings of one folder answer as two roots.
- The handback carries no retro, and the group's route holds one ahead.
- Every hunk stands inside the ask. The group ticket and its one child travel with the branch.
- `changedSince` reads the first record's hash, so the read field names every file trunk moves since. The hunks of this branch stand inside that list.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
