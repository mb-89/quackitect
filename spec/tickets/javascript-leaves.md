---
kind: [[ticket]]
state: closed
step: retro/cloud
steps:
  - name: sync
    does: takes trunk into the branch, so the box works on the latest
    when: cloud
    by: agent
    needs: ["branch sync"]
    evidence:
      - name: sync
        form: command
        expects: 0
        says: branch sync, so the branch carries trunk
  - name: split
    does: reads the standing children, and mints more where the goal needs them, each naming this group
    from: anyone
    by: anyone
    input: ask
    checklist: ["every child is small enough to review whole, or is a group itself", "the children add up to the goal, and nothing of the goal stands outside them", "a child that waits on another names it under depends_on"]
    evidence:
      - name: children
        form: list
        says: every child as a link, one a line, with its process
  - name: children
    by: children
    on_fail: split
  - name: accept
    gate: does the work of every child add up to the goal, and does every command of the route pass
    final: true
    does: reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points
    tags: ["review", "accept"]
    input: ["ask", "children"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: retro
    to: retro
    steps:
      - name: notes
        does: decides every private note on the box, and works what it mints into this group
        needs: ["retro"]
        evidence:
          - name: drained
            form: command
            expects: 0
            says: retro notes, which passes when the private folder is empty
      - name: write
        does: writes the retro over the box's own window
        input: ["children", "notes"]
        checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every number the change adds carries a name in one place, and a copy a technical reason forces says so beside it", "every header the change writes says what its file is for, and counts nothing", "the chapter carries the run's owner prompts and errors off the transcript, each with its time", "the chapter says the role, and carries no name, address or path of the box"]
        evidence:
          - name: done
            form: list
            says: what was done, one line a ticket or a thing
          - name: well
            form: list
            says: what went well, and what made it go well
          - name: badly
            form: list
            says: what did not go well, each error of the run and each owner prompt turning it, with its time
          - name: improve
            form: list
            home: true
            says: how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks
          - name: thoughts
            form: text
            says: what the thoughts say that the actions do not, off the transcript
      - name: cloud
        does: names what the box lacked, met and leaves for a person
        when: cloud
        input: write
        evidence:
          - name: lacked
            form: list
            says: a tool, a host the proxy refused, a right the platform refused, an install, each with its moment
          - name: met
            form: list
            says: the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone
          - name: left
            form: list
            says: every person step parked, every ticket minted with no group, and what the handover says
process: [[spec/processes/group]]
process_hash: d9f9539fef3ec913
record:
  - step: sync
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: 4c7ae3ab4e354f3746aad3727782ad93debc07a8
    hash_after: 6fe6eeb88094bc1641369359d1e457e0fc8c8453
  - step: sync
    hand: box fb4ccb7cacc7 · claude-code-remote · helper-4
    hash_before: 14bf2c00d19e67327ea730cb9fd867926aa657b2
    hash_after: b87c4c0f69041591032102183302d4014b9b6f7e
    answered:
      - name: sync
        exit: 0
        said: work/javascript-leaves took 2 commit(s) from main.
    def: 8a9850a81227554b
  - step: split
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 4ff7fa868a926591263ea50da20cac17743edd74
    session: cse_01JvgNjKzrPHbhvu3UPuWaU8
    hash_after: 8a98e8888a624a818461613810b5299f03e0ddc2
  - step: split
    hand: box e1136d8488e3 · claude-code-remote
    hash_before: 8a98e8888a624a818461613810b5299f03e0ddc2
    session: cse_01QPKQ8Dn3mMFhbV6UQ2vR5N
    hash_after: 6874c8da30449f545047f80ea571f5e52d68741c
  - step: split
    hand: box ba1101ec7b2d · claude-code-remote
    hash_before: 6874c8da30449f545047f80ea571f5e52d68741c
    session: cse_01Vzgwb5Dc586imx6m8Gnoyt
  - step: split
    hand: box ba1101ec7b2d · claude-code-remote
    hash_before: e28e0354facf6833323ec9cc2e0dbb351328bf8c
    hash_after: e28e0354facf6833323ec9cc2e0dbb351328bf8c
    inputs:
      - name: ask
        hash: 232bc1595e9752ed
        size: 1445
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 3ea664748c13ab37b2ca22629a369e5cc1922be3
    hash_after: 3ea664748c13ab37b2ca22629a369e5cc1922be3
  - step: accept
    hand: box ba1101ec7b2d · claude-code-remote
    hash_before: 6e67e6dfe9c240cc885dbd8743d27c1508a26c5a
    hash_after: 6e67e6dfe9c240cc885dbd8743d27c1508a26c5a
    answered:
      - name: sync/sync
        exit: 0
        said: work/javascript-leaves already carries every commit on main.
    inputs:
      - name: ask
        hash: 232bc1595e9752ed
        size: 1445
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: accept
    hand: box ba1101ec7b2d · claude-code-remote
    hash_before: ed326bc9d6d75d0c2d46e53b6480967ddb12973a
    hash_after: ed326bc9d6d75d0c2d46e53b6480967ddb12973a
    answered:
      - name: sync/sync
        exit: 0
        said: work/javascript-leaves already carries every commit on main.
    inputs:
      - name: ask
        hash: 232bc1595e9752ed
        size: 1445
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: accept
    hand: box ba1101ec7b2d · claude-code-remote
    hash_before: 8db9fc4e069228fc4abfcd29bd37f62d72e6e47f
    hash_after: 8db9fc4e069228fc4abfcd29bd37f62d72e6e47f
    answered:
      - name: sync/sync
        exit: 0
        said: work/javascript-leaves already carries every commit on main.
    inputs:
      - name: ask
        hash: 232bc1595e9752ed
        size: 1445
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box ba1101ec7b2d · claude-code-remote
    hash_before: 992f2a44cfdc518067fb96bf8c7b307d625062a3
    hash_after: 992f2a44cfdc518067fb96bf8c7b307d625062a3
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box ba1101ec7b2d · claude-code-remote
    hash_before: 7ab598871c4ace7e15bc64f3dade9ca3c56c9af4
    hash_after: 7ab598871c4ace7e15bc64f3dade9ca3c56c9af4
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box ba1101ec7b2d · claude-code-remote
    hash_before: 0676b5e9ea1dbc87dd10e4f5580192a450d55508
    hash_after: 0676b5e9ea1dbc87dd10e4f5580192a450d55508
    inputs:
      - name: retro/write
        hash: 09110f7f98a63a74
        size: 2964
    def: 4da1ca5da87d5bbc
reason: done
---

# Ask

JavaScript leaves the tree, except where it must stay: the VS Code extension under `src/extension`, and the level zero function hooks Claude Code loads as JavaScript modules. Each hook stays thin. It hands its work to the Go engine through the hooks door, a verb or the index, and holds no logic Go can hold.

`src/scripts`, `src/engine`, `src/bridge`, the doors serving ported code, the plugin libraries holding logic, and every JavaScript test of code that leaves all go. Each slice runs the migration pattern: shadow, compare, switch, delete. Most slices find their Go twin already switched, so they cut the entry point keeping the JavaScript loaded, then delete it with its tests. A Go test through the interface takes each behaviour no Go test holds, and tests no implementation detail.

Test code ends at or under one line per line of code, per language. Every port keeps code pure, impurity in declared doors, each door tested once for real and faked elsewhere, fixtures built once in their home, and no timers. The lint and Vale scripts belong to the lint-without-vale group, and this group leaves them standing.

The group ends with `./RUNME.sh check` green, and the JavaScript that stays listed with its reason in the doors design note. The owner's direction for this group stands in for the phase switches of [[spec/design_input/the-migration-runs-in-slices]], so a child switches its own slice. The inventory stands under Discussion.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->
<!-- the form is command -->

./RUNME.sh branch sync

# split

<!-- reads the standing children, and mints more where the goal needs them, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->
<!-- the form is list -->

- [[spec/tickets/boot-span-outlives-start-js]] trivial
- [[spec/tickets/branch-scripts-leave]] standard
- [[spec/tickets/bridge-library-leaves]] standard
- [[spec/tickets/cage-libs-leave]] standard
- [[spec/tickets/cold-comments-name-go-owner]] trivial
- [[spec/tickets/config-libs-leave]] standard
- [[spec/tickets/copilot-hooks-run-in-go]] standard
- [[spec/tickets/copilot-mutations-take-wholeafter]] trivial
- [[spec/tickets/doors-move-beside-their-users]] trivial
- [[spec/tickets/engine-and-doors-leave]] standard
- [[spec/tickets/extension-imports-stay-inside]] standard
- [[spec/tickets/git-hooks-run-in-go]] standard
- [[spec/tickets/guidance-lib-leaves]] standard
- [[spec/tickets/hook-finds-the-exe-binary]] trivial
- [[spec/tickets/hook-holds-gate-every-push]] trivial
- [[spec/tickets/hook-markers-reuse-land-check]] trivial
- [[spec/tickets/javascript-rows-name-each-file]] trivial
- [[spec/tickets/level0-hooks-forward-to-go]] standard
- [[spec/tickets/lint-cut-on-group-ticket]] trivial
- [[spec/tickets/logbook-test-leaves-level0-lib]] trivial
- [[spec/tickets/plugin-libs-leave]] standard
- [[spec/tickets/probe-verb-drops-script-comments]] trivial
- [[spec/tickets/probes-leave-node]] standard
- [[spec/tickets/pull-scripts-leave]] standard
- [[spec/tickets/quack-reaches-through-box-doors]] standard
- [[spec/tickets/recovers-cases-share-one-table]] trivial
- [[spec/tickets/remaining-js-names-its-reason]] standard
- [[spec/tickets/schema-libs-leave]] standard
- [[spec/tickets/scripts-folder-leaves]] standard
- [[spec/tickets/se-front-leaves]] standard
- [[spec/tickets/session-start-leaves-node]] standard
- [[spec/tickets/stop-folder-keeps-runner]] trivial
- [[spec/tickets/stub-settings-shim-runs-in-go]] standard
- [[spec/tickets/test-lines-stay-under-code]] standard
- [[spec/tickets/ticket-scripts-leave]] standard
- [[spec/tickets/tree-libs-leave]] standard
- [[spec/tickets/vale-drops-hook-scripts]] trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every child is one slice or one fix, small enough to review whole
- the children cover every inventory row under Discussion, and the two drafts take the dead se-front binary and the quack verbs past their doors
- no open child waits on another: both drafts stand on code the closed children already switched

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

<!-- retro notes, which passes when the private folder is empty -->
<!-- the form is command -->

./RUNME.sh retro notes

## write

<!-- writes the retro over the box's own window -->

### done

<!-- what was done, one line a ticket or a thing -->
<!-- the form is list -->

- unloaded-js-readers-leave: the vale and survey readers no road loads left with their tests and their doors rows
- level0-note-drops-faultin: the broken-rule section of the level0 note names lspRules in place of the deleted faultIn
- javascript-leaves: accept passed twice, the second on the one-line fix
- four private notes decided: two dropped, two carried on as retro findings

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the accept read the tree past the diff, and a search for the deleted file names found the stale note line before the merge
- the handover named the index and push workarounds, so no hand-back stalled on them

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 10:12 the canary gate logged that the canary opens no answer, on an answer that opened with it, and the tool.call hook asked for it a second time
- 10:17 the tests field of a prose leaf refused ./RUNME.sh check, whose last line prints timings and never green
- 10:20 the push refused, since the check ran against the commit before the hand-back
- 10:24 the notes step refused a bare pass, since its drained field wants a command
- standing: the index process pushes through a proxy port the box no longer serves, so every MCP hand-back needs a shell push after it
- standing: a go test over src/quack stops the live index, seen four times on this box
- standing: ExampleCovers warns on the stamp, bundle and hook verbs among others

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the canary gate reads the first text block of the answer the tool call stands in: `.claude/skills/level0/hooks/`
- the trivial process names `./RUNME.sh check > /dev/null 2>&1 && echo green` under tests for a change that touches no code: `spec/processes/trivial.yaml`
- the hand-back runs the check on the commit it lands, so the push takes it: `src/quack/check.go`
- the notes step prints its drained command in the pull answer: `spec/processes/group.yaml`
- the index reads the proxy from the box at each push, not from its start: `src/quack/main.go`
- the src/quack test that stops the index runs against a temp root: `src/quack/check.go` holds stopsOwnIndex, which spares an index the check found standing
- an example per verb, starting with a fake go list runner for stamp: `src/quack/examples_harness_test.go`

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The group's ask was met before this box took it. What remained was proof that nothing still points at the deleted files, and one stale line was the whole gap. The refusals this run cost were all of one kind: a field or a step wanting a form the pull answer never showed. A pull that prints the expected form beside each field removes that class.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- one place: each improve line points at the file that owns the fix, and repeats none of its logic
- numbers: the chapter adds none
- headers: the change writes no file header
- prompts and errors: the errors carry their times off the session log, and the owner wrote no prompt this run past the fire's prompt the handover quotes
- role: the chapter names the box and the owner by role alone

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- 10:11 the index process reached a proxy port the box no longer serves, so its push to origin failed and a shell push carried each commit
- the gh CLI, which the box lacks, so the pull request goes through the GitHub connector

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- the canary gate at 10:12, which logged no canary on an answer that opened with it
- the index stopping under the go tests, which this run worked around by starting it before each shell hand-back
- the push guard at 10:20, which wanted a check on the commit it pushes

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- cloud-setup-runs-root-install, a person ticket the owner holds, which stays on main
- no ticket minted with no group
- the handover names the pull request and its watch as the step left

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The inventory follows. Every JavaScript file the tree tracks, off `git ls-files`, with its fate. A file that goes names its Go home, the Go code already holding its job or taking it, and the child that deletes it.

| fate | why |
|---|---|
| stays | the VS Code extension, which VS Code loads as JavaScript |
| stays thin | a function hook Claude Code loads as a JavaScript module, cut to a forwarder of its event |
| moves | the reporter `node --test` loads, the extension's build, or shell running before any binary stands: each leaves `src/scripts` for a home beside its user |
| stays, door | a door the extension loads, the server its contract tests stand up, or a fake its tests drive, each beside the others in `src/doors` |
| stays, prototype | a browser prototype outside the product, which a funnel note points at |
| other group | the lint-without-vale group takes it |

The code:

| file | fate | Go home | child |
|---|---|---|---|
| `.claude/skills/level0/hooks/cage.js` | stays thin | `src/quack` | [[spec/tickets/level0-hooks-forward-to-go]] |
| `.claude/skills/level0/hooks/clear.js` | stays thin | `src/modules/hooks` | [[spec/tickets/level0-hooks-forward-to-go]] |
| `.claude/skills/level0/hooks/level0.js` | stays thin | `src/modules/hooks` | [[spec/tickets/level0-hooks-forward-to-go]] |
| `.claude/skills/level0/hooks/pull-tool.js` | stays thin | `src/index/tools.go` | [[spec/tickets/level0-hooks-forward-to-go]] |
| `.claude/skills/level0/hooks/shape.js` | stays thin | `src/modules/hooks` | [[spec/tickets/level0-hooks-forward-to-go]] |
| `.claude/skills/level0/hooks/start.js` | stays thin | `src/index` | [[spec/tickets/level0-hooks-forward-to-go]] |
| `.claude/skills/level0/hooks/transcript.js` | stays thin | `src/modules/hooks` | [[spec/tickets/level0-hooks-forward-to-go]] |
| `.claude/skills/level0/lib/answer.js` | goes | `src/modules/drafts/answer.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/apply.js` | goes | `src/modules/edits/apply.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/bash-test.js` | goes | `src/modules/hooks/command/reads.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/bash.js` | goes | `src/modules/hooks/command/findings.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/candidate-check.js` | goes | none, dead | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/cloud.js` | goes | `src/pull/pull_holds.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/code.js` | goes | `src/modules/hooks/command/findings.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/commit-reads.js` | goes | `src/modules/hooks/command/reads.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/config.js` | goes | `src/modules/config/config.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/controls.js` | goes | `src/modules/config` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/copilot-dispatch.js` | goes | `src/quack/dispatch.go` | [[spec/tickets/copilot-hooks-run-in-go]] |
| `.claude/skills/level0/lib/copilot-setup.js` | goes | `src/quack/copilotsetup.go` | [[spec/tickets/copilot-hooks-run-in-go]] |
| `.claude/skills/level0/lib/copilot.js` | goes | `src/modules/hooks` | [[spec/tickets/copilot-hooks-run-in-go]] |
| `.claude/skills/level0/lib/folders.js` | goes | `src/q` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/git-writes.js` | goes | `src/modules/hooks/command/gitwrites.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/guidance.js` | goes | `src/modules/hooks/brief.go` | [[spec/tickets/guidance-lib-leaves]] |
| `.claude/skills/level0/lib/hash.js` | goes | `src/pull/hash.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/helpers.js` | goes | `src/projection/snippets.go` | [[spec/tickets/schema-libs-leave]] |
| `.claude/skills/level0/lib/index-tools.js` | goes | `src/index/tools.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/index.js` | goes | `src/index/binary.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/layer.js` | goes | `src/modules/config` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/log.js` | goes | `src/quack/log.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/magic.js` | goes | `src/modules/check` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/markers.js` | goes | `src/pull/pull_landed.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/mutations.js` | goes | `src/modules/edits` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/names.js` | goes | `src/modules/check` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/paragraph-rules.js` | goes | `src/projection/rules.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/paragraph.js` | goes | `src/projection` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/paths.js` | goes | `src/modules/check/paths.go` | [[spec/tickets/schema-libs-leave]] |
| `.claude/skills/level0/lib/plugin-check.js` | goes | `src/quack/check.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/private.js` | goes | `src/modules/hooks/command/findings.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/projection-owner.js` | goes | `src/projection/entries.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/projection.js` | goes | `src/projection` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/pull.js` | goes | `src/pull/pull.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/pulled.js` | goes | `src/modules/hooks/command/pulled.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/refuse.js` | goes | `src/modules/hooks/command/refuse.go` | [[spec/tickets/schema-libs-leave]] |
| `.claude/skills/level0/lib/review.js` | goes | `src/quack/review.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/rulefile.js` | goes | `src/modules/hooks/stop/rules.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/runs.js` | goes | `src/quack/check.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/schema-body.js` | goes | `src/modules/check/schema-body.go` | [[spec/tickets/schema-libs-leave]] |
| `.claude/skills/level0/lib/schema-fault.js` | goes | `src/modules/check` | [[spec/tickets/schema-libs-leave]] |
| `.claude/skills/level0/lib/schema-mint.js` | goes | `src/modules/check/mint.go` | [[spec/tickets/schema-libs-leave]] |
| `.claude/skills/level0/lib/schema-read.js` | goes | `src/note/note.go` | [[spec/tickets/schema-libs-leave]] |
| `.claude/skills/level0/lib/schema-route.js` | goes | `src/modules/check/route.go` | [[spec/tickets/schema-libs-leave]] |
| `.claude/skills/level0/lib/schema-table.js` | goes | `src/modules/check/table.go` | [[spec/tickets/schema-libs-leave]] |
| `.claude/skills/level0/lib/schema-yaml.js` | goes | `src/yaml/yaml.go` | [[spec/tickets/schema-libs-leave]] |
| `.claude/skills/level0/lib/schema.js` | goes | `src/modules/check/schema.go` | [[spec/tickets/schema-libs-leave]] |
| `.claude/skills/level0/lib/scripted.js` | goes | `src/modules/hooks/command/scripts.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/search.js` | goes | `src/modules/hooks/search.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/servers.js` | goes | `src/quack/doctor_verb.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/shell-values.js` | goes | `src/modules/hooks/command/tokens.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/size.js` | goes | `src/modules/check` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/slug.js` | goes | `src/modules/check/restated.go` | [[spec/tickets/schema-libs-leave]] |
| `.claude/skills/level0/lib/snippets.js` | goes | `src/projection/snippets.go` | [[spec/tickets/schema-libs-leave]] |
| `.claude/skills/level0/lib/stop.js` | goes | `src/modules/drafts/answer.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/tested.js` | goes | `src/modules/hooks/command/tested.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/ticket.js` | goes | `src/pull` | [[spec/tickets/schema-libs-leave]] |
| `.claude/skills/level0/lib/todo.js` | goes | `src/quack/ticket_todo.go` | [[spec/tickets/schema-libs-leave]] |
| `.claude/skills/level0/lib/tokens.js` | goes | `src/modules/hooks/command/tokens.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/tools.js` | goes | `src/quack/survey.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/tree.js` | goes | `src/modules/check` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/trunk.js` | goes | `src/modules/hooks/command/guards.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/undo.js` | goes | `src/modules/edits/journal.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/vale.js` | other group | | |
| `.claude/skills/level0/lib/vehicle.js` | goes | `src/vehicle` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/verb-line.js` | goes | `src/modules/hooks/command` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/vocabulary.js` | goes | `src/projection/vocabulary.go` | [[spec/tickets/schema-libs-leave]] |
| `.claude/skills/level0/lib/voice.js` | goes | `src/voice/voice.go` | [[spec/tickets/plugin-libs-leave]] |
| `.claude/skills/level0/lib/warnings.js` | goes | `src/modules/hooks/command/voice.go` | [[spec/tickets/plugin-libs-leave]] |
| every file under `prototype/trace-view` | stays, prototype | | [[spec/tickets/remaining-js-names-its-reason]] |
| `src/bridge/agent.js` | goes | `src/modules/hooks/agent.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/answer-read.js` | goes | `src/modules/drafts/answer.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/answer.js` | goes | `src/modules/hooks/fold.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/apply.js` | goes | `src/modules/edits/edits.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/ask.js` | goes | `src/modules/hooks/fold.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/bash.js` | goes | `src/modules/hooks/command` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/binding.js` | goes | `src/modules/hooks/stop/vote.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/bless.js` | goes | `src/modules/hooks/command/guards.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/cloud-ask.js` | goes | `src/modules/hooks/fold.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/code.js` | goes | `src/modules/hooks/write` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/config.js` | goes | `src/config/config.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/findings.js` | goes | `src/modules/check/textfaults.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/grace.js` | goes | `src/modules/hooks/fold.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/guidance.js` | goes | `src/modules/hooks/brief.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/handover.js` | goes | `src/modules/hooks/marks.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/index-tools.js` | goes | `src/index/tools.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/plan.js` | goes | `src/modules/plans/plans.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/projection.js` | goes | `src/projection/entries.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/prose.js` | goes | `src/modules/drafts/prose.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/review.js` | goes | `src/modules/hooks/review.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/search.js` | goes | `src/modules/hooks/search.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/stop.js` | goes | `src/modules/hooks/stop/checks.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/tools.js` | goes | `src/modules/drafts/answer.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/vale-rows.js` | goes | `src/modules/lsp/tools.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/vehicle.js` | goes | `src/vehicle/bridge.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/wait.js` | goes | `src/modules/waits/waits.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/bridge/write.js` | goes | `src/modules/hooks/write/door.go` | [[spec/tickets/bridge-library-leaves]] |
| `src/doors/awake.js` | goes | none, dead | [[spec/tickets/engine-and-doors-leave]] |
| `src/doors/biome.js` | goes | `src/modules/check` | [[spec/tickets/engine-and-doors-leave]] |
| `src/doors/clock.js` | stays, door | | [[spec/tickets/doors-move-beside-their-users]] |
| `src/doors/disk.js` | stays, door | | [[spec/tickets/doors-move-beside-their-users]] |
| `src/doors/fake/awake.js` | goes | none, dead | [[spec/tickets/engine-and-doors-leave]] |
| `src/doors/fake/behaves.js` | stays, door | | [[spec/tickets/doors-move-beside-their-users]] |
| `src/doors/fake/clock.js` | stays, door | | [[spec/tickets/doors-move-beside-their-users]] |
| `src/doors/fake/disk.js` | stays, door | | [[spec/tickets/doors-move-beside-their-users]] |
| `src/doors/fake/front.js` | goes | `src/front` | [[spec/tickets/schema-libs-leave]] |
| `src/doors/fake/git.js` | goes | `src/modules/git` | [[spec/tickets/plugin-libs-leave]] |
| `src/doors/fake/http.js` | stays, door | | [[spec/tickets/doors-move-beside-their-users]] |
| `src/doors/fake/index.js` | goes | `src/index` | [[spec/tickets/engine-and-doors-leave]] |
| `src/doors/fake/log.js` | goes | `src/modules/log` | [[spec/tickets/engine-and-doors-leave]] |
| `src/doors/fake/proc.js` | stays, door | | [[spec/tickets/doors-move-beside-their-users]] |
| `src/doors/fake/session.js` | goes | `src/modules/hooks` | [[spec/tickets/copilot-hooks-run-in-go]] |
| `src/doors/fake/vscode.js` | stays, door | | [[spec/tickets/doors-move-beside-their-users]] |
| `src/doors/front.js` | goes | `src/front` | [[spec/tickets/schema-libs-leave]] |
| `src/doors/git.js` | goes | `src/modules/git` | [[spec/tickets/plugin-libs-leave]] |
| `src/doors/http.js` | stays, door | | [[spec/tickets/doors-move-beside-their-users]] |
| `src/doors/index.js` | goes | `src/index` | [[spec/tickets/engine-and-doors-leave]] |
| `src/doors/log.js` | goes | `src/modules/log` | [[spec/tickets/engine-and-doors-leave]] |
| `src/doors/proc.js` | stays, door | | [[spec/tickets/doors-move-beside-their-users]] |
| `src/doors/session.js` | goes | `src/modules/hooks` | [[spec/tickets/copilot-hooks-run-in-go]] |
| `src/doors/vale.js` | other group | | |
| `src/doors/wire.js` | stays, door | | [[spec/tickets/doors-move-beside-their-users]] |
| `src/engine/front-merge.js` | goes | `src/branches/sync.go` | [[spec/tickets/engine-and-doors-leave]] |
| `src/engine/group.js` | goes | `src/branches/group.go` | [[spec/tickets/engine-and-doors-leave]] |
| `src/engine/named.js` | goes | `src/modules/hooks/command/ticket.go` | [[spec/tickets/engine-and-doors-leave]] |
| `src/engine/projection.js` | goes | `src/projection` | [[spec/tickets/engine-and-doors-leave]] |
| `src/engine/status.js` | goes | `src/modules/hooks/status.go` | [[spec/tickets/engine-and-doors-leave]] |
| `src/engine/tools.js` | goes once the lint group's Vale door leaves it | `src/quack/survey.go` | [[spec/tickets/engine-and-doors-leave]] |
| `src/scripts/battery-reporter.js` | moves | | [[spec/tickets/scripts-folder-leaves]] |
| `src/scripts/battery.js` | goes | `src/quack/retro_collect_values.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/boot.js` | goes | `src/quack` | [[spec/tickets/session-start-leaves-node]] |
| `src/scripts/brand.js` | goes | `src/quack/brand.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/browser.js` | moves | | [[spec/tickets/scripts-folder-leaves]] |
| `src/scripts/bundle.js` | moves | | [[spec/tickets/scripts-folder-leaves]] |
| `src/scripts/check-twins.js` | goes | `src/quack/check_twins_test.go` | [[spec/tickets/scripts-folder-leaves]] |
| `src/scripts/cli-check.js` | goes | `src/quack/check.go` | [[spec/tickets/scripts-folder-leaves]] |
| `src/scripts/cli-doors.js` | goes | `src/pull/pull_doors.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/cli-go.js` | goes | `src/quack/tui_verb.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/cli-main.js` | goes | `src/quack` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/cli-read.js` | other group | | |
| `src/scripts/config-golden.js` | goes | `src/config` | [[spec/tickets/scripts-folder-leaves]] |
| `src/scripts/copilot-door.js` | goes | `src/modules/hooks` | [[spec/tickets/copilot-hooks-run-in-go]] |
| `src/scripts/copilot.js` | goes | `src/quack/copilotsetup.go` | [[spec/tickets/copilot-hooks-run-in-go]] |
| `src/scripts/editor.js` | goes | `src/vehicle/vehicle.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/ephemeral-pull.js` | goes | `src/pull/pull_ephemeral.go` | [[spec/tickets/ticket-scripts-leave]] |
| `src/scripts/ephemeral.js` | goes | `src/pull/pull_ephemeral.go` | [[spec/tickets/ticket-scripts-leave]] |
| `src/scripts/go-source.js` | goes | `src/branches/review.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/go-stamp.sh` | moves | | [[spec/tickets/scripts-folder-leaves]] |
| `src/scripts/graph.js` | goes | `src/modules/tickets/graph.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/guidance-golden.js` | goes | `src/quack/guidance_test.go` | [[spec/tickets/ticket-scripts-leave]] |
| `src/scripts/guidance-hand.js` | goes | `src/modules/guidance/guidance.go` | [[spec/tickets/ticket-scripts-leave]] |
| `src/scripts/guidance-verb.js` | goes | `src/branches/guidance.go` | [[spec/tickets/ticket-scripts-leave]] |
| `src/scripts/install.sh` | moves | | [[spec/tickets/scripts-folder-leaves]] |
| `src/scripts/log-golden.js` | goes | `src/modules/log` | [[spec/tickets/scripts-folder-leaves]] |
| `src/scripts/precommit.js` | goes | `src/modules/hooks/command` | [[spec/tickets/git-hooks-run-in-go]] |
| `src/scripts/prepush.js` | goes | `src/quack/push.go` | [[spec/tickets/git-hooks-run-in-go]] |
| `src/scripts/probe-clear.js` | goes | `src/quack` | [[spec/tickets/probes-leave-node]] |
| `src/scripts/probe-cold.js` | goes | `src/quack/probe_cold.go` | [[spec/tickets/probes-leave-node]] |
| `src/scripts/probe-dry.js` | goes | `src/quack` | [[spec/tickets/probes-leave-node]] |
| `src/scripts/process.js` | goes | `src/pull/process.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-accept.js` | goes | `src/pull/pull_accept.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-bless.js` | goes | `src/pull/pull_bless.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-cap.js` | goes | `src/pull/pull_cap.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-chapter.js` | goes | `src/pull/pull_chapter.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-children.js` | goes | `src/pull/pull_writes.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-cleanup.js` | goes | `src/pull/pull_when.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-escalate.js` | goes | `src/branches/escalate.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-format.js` | goes | `src/pull/pull_chapter.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-gate.js` | goes | `src/pull/pull_gate.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-hand-of.js` | goes | `src/pull/pull_holds.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-hand.js` | goes | `src/pull/pull_hand.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-kept.js` | goes | `src/pull/pull_kept.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-landed.js` | goes | `src/pull/pull_landed.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-outline.js` | goes | `src/modules/queue/outline.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-push.js` | goes | `src/pull/pull_landed.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-queue.js` | goes | `src/modules/queue/score.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-route.js` | goes | `src/pull/pull_route.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-spawn.js` | goes | `src/pull/pull_branch.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-stale.js` | goes | `src/pull/pull_stale.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-when.js` | goes | `src/pull/pull_when.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull-writes.js` | goes | `src/pull/pull_writes.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/pull.js` | goes | `src/pull/pull.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/quack-topic.js` | goes | `src/pull` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/serve.js` | goes | `src/quack/serve_verb.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/styles.js` | other group | | |
| `src/scripts/ticket-ask-lint.js` | goes | `src/pull/pull_ticket.go` | [[spec/tickets/ticket-scripts-leave]] |
| `src/scripts/ticket-drift.js` | goes | `src/pull/route.go` | [[spec/tickets/ticket-scripts-leave]] |
| `src/scripts/ticket-edit.js` | goes | `src/pull/edit.go` | [[spec/tickets/ticket-scripts-leave]] |
| `src/scripts/ticket-fill.js` | goes | `src/quack/ticket_fill.go` | [[spec/tickets/ticket-scripts-leave]] |
| `src/scripts/ticket-route.js` | goes | `src/pull/route.go` | [[spec/tickets/ticket-scripts-leave]] |
| `src/scripts/ticket-yours.js` | goes | `src/quack/twins.go` | [[spec/tickets/ticket-scripts-leave]] |
| `src/scripts/ticket.js` | goes | `src/quack/verb_ticket.go` | [[spec/tickets/ticket-scripts-leave]] |
| `src/scripts/tool-call.js` | goes | `src/pull/pull_route.go` | [[spec/tickets/pull-scripts-leave]] |
| `src/scripts/trust.js` | goes | `src/quack` | [[spec/tickets/scripts-folder-leaves]] |
| `src/scripts/tui-build.js` | goes | `src/quack/tui_verb.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/vehicle.js` | goes | `src/vehicle` | [[spec/tickets/ticket-scripts-leave]] |
| `src/scripts/work-answer.js` | goes | `src/modules/work/rows.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/work-fix.js` | goes | `src/branches/fix.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/work-free.js` | goes | `src/branches/free.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/work-held.js` | goes | `src/branches/held.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/work-list.js` | goes | `src/branches/list.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/work-merge.js` | goes | `src/branches/merge.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/work-read.js` | goes | `src/branches/read.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/work-review.js` | goes | `src/branches/review.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/work-stands.js` | goes | `src/branches/stands.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/work-test.js` | goes | `src/branches/test.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/work-unblock.js` | goes | `src/branches/unblock.go` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/work-usage.js` | goes | `src/branches` | [[spec/tickets/branch-scripts-leave]] |
| `src/scripts/work.js` | goes | `src/branches` | [[spec/tickets/branch-scripts-leave]] |
| `src/stub/.claude/skills/level0/hooks/bridgehead.js` | stays thin | `src/vehicle/pure.go` | [[spec/tickets/level0-hooks-forward-to-go]] |
| every file under `src/extension` | stays | | |

The tests:

A test that goes leaves with the first child deleting code it reads. The child writes a Go test of the same behaviour in the code's Go home, where no Go test holds it yet. A test that stays and reads code that leaves drops that import in the child named.

- the lint-without-vale group: `contract/outside-in-doors.test.js`, `contract/paragraph.test.js`, `contract/process.test.js`, `contract/ruled.js`, `contract/schema.test.js`, `contract/shape.test.js`, `contract/vale-fix.test.js`, `contract/vale-paths.test.js`, `contract/vale.test.js`, `level0/paragraph.test.js`, `level0/semicolon-vale.js`, `level0/vale-rows.test.js`, `level0/voice.test.js`
- [[spec/tickets/copilot-hooks-run-in-go]], goes: `contract/session.test.js`, `level0/copilot-dispatch.test.js`, `level0/copilot-setup.test.js`
- [[spec/tickets/copilot-hooks-run-in-go]], stays and drops its imports: `level0/copilot.test.js`
- [[spec/tickets/git-hooks-run-in-go]], goes: `level0/precommit.test.js`, `level0/prepush.test.js`, `level0/warnings.test.js`
- [[spec/tickets/probes-leave-node]], goes: `level0/probe-clear.test.js`, `level0/probe-cold.test.js`, `level0/probe-dry.test.js`
- [[spec/tickets/session-start-leaves-node]], stays and drops its imports: `level0/hooks.test.js`
- [[spec/tickets/bridge-library-leaves]], goes: `contract/cli-doors.test.js`, `contract/cli-mint-callers.test.js`, `contract/one-config.test.js`, `contract/one-reading.test.js`, `contract/stop-rules.test.js`, `contract/write-door-cases.test.js`, `level0/agent.test.js`, `level0/answer-door.test.js`, `level0/answer-origin.test.js`, `level0/answer-read.test.js`, `level0/answer.test.js`, `level0/apply-door.test.js`, `level0/ask-door.test.js`, `level0/bash-bless.test.js`, `level0/bash-commit.test.js`, `level0/bash-desk.test.js`, `level0/bash-engine.test.js`, `level0/bash-ticket.test.js`, `level0/binding.test.js`, `level0/brief-cases.test.js`, `level0/canary-debt.test.js`, `level0/cloud-ask.test.js`, `level0/code-door.test.js`, `level0/command-cases.test.js`, `level0/commit-guards-cases.test.js`, `level0/config-door.test.js`, `level0/context-handover.test.js`, `level0/findings.test.js`, `level0/grace-asks.test.js`, `level0/grace.test.js`, `level0/guidance.test.js`, `level0/hand-tools.test.js`, `level0/handover-door.test.js`, `level0/holds-leave.test.js`, `level0/named.test.js`, `level0/note-answer.test.js`, `level0/one-reader.test.js`, `level0/outside-hand.test.js`, `level0/plan-queue.test.js`, `level0/plan.test.js`, `level0/projection.test.js`, `level0/prose.test.js`, `level0/pulled.test.js`, `level0/review-cases.test.js`, `level0/review-door.test.js`, `level0/search-door.test.js`, `level0/serve-port.test.js`, `level0/session-layer.test.js`, `level0/stop-binding.test.js`, `level0/stop-door.test.js`, `level0/stop-helper.test.js`, `level0/stop-hold.test.js`, `level0/style-top.test.js`, `level0/tools-door.test.js`, `level0/topic-readers.test.js`, `level0/trunk-door.test.js`, `level0/vehicle.test.js`, `level0/wait.test.js`, `level0/write-bless.test.js`, `level0/write.test.js`
- [[spec/tickets/bridge-library-leaves]], stays and drops its imports: `level0/cage.test.js`
- [[spec/tickets/branch-scripts-leave]], goes: `contract/drawing-page.test.js`, `contract/git.test.js`, `contract/go-stamp.test.js`, `contract/pull-payload.test.js`, `level0/battery.test.js`, `level0/branch-needs.test.js`, `level0/brand.test.js`, `level0/budget.test.js`, `level0/check-server.test.js`, `level0/check-twins.js`, `level0/cli-exit.test.js`, `level0/config-golden.js`, `level0/drawing-edit.test.js`, `level0/drawn-twin.js`, `level0/editor.test.js`, `level0/git-batch.test.js`, `level0/go-modules.test.js`, `level0/go-source.test.js`, `level0/go-tests.test.js`, `level0/graph.test.js`, `level0/guidance-golden.js`, `level0/guidance-golden.test.js`, `level0/guidance-hand.test.js`, `level0/guidance-tags.test.js`, `level0/log-golden.js`, `level0/log-golden.test.js`, `level0/person-step.test.js`, `level0/pull-accept.test.js`, `level0/pull-bare.test.js`, `level0/pull-bless.test.js`, `level0/pull-cap.test.js`, `level0/pull-ephemeral.test.js`, `level0/pull-escalate.test.js`, `level0/pull-fail-verdict.test.js`, `level0/pull-fails.test.js`, `level0/pull-fields.test.js`, `level0/pull-findings.test.js`, `level0/pull-format.test.js`, `level0/pull-gate.test.js`, `level0/pull-hand-desk.test.js`, `level0/pull-hand.test.js`, `level0/pull-leaves.test.js`, `level0/pull-person.test.js`, `level0/pull-push.test.js`, `level0/pull-stale.test.js`, `level0/pull-steps.test.js`, `level0/pull-todo.test.js`, `level0/pull-unbound.test.js`, `level0/pull-writes-view.test.js`, `level0/pull-writes.test.js`, `level0/pull.test.js`, `level0/queue-cloud.test.js`, `level0/queue-golden.js`, `level0/ready.test.js`, `level0/retro-notes-pull.test.js`, `level0/review.test.js`, `level0/roots.test.js`, `level0/sidebar-writes.test.js`, `level0/stand.test.js`, `level0/test-verb.test.js`, `level0/ticket-edit.test.js`, `level0/ticket-yours.test.js`, `level0/unblock.test.js`, `level0/v1-index.js`, `level0/viewer.test.js`, `level0/work-answer-cloud.test.js`, `level0/work-answer.test.js`, `level0/work-chain.test.js`, `level0/work-cloud-marker.test.js`, `level0/work-desk.test.js`, `level0/work-done.test.js`, `level0/work-doors.js`, `level0/work-fix.test.js`, `level0/work-gate.test.js`, `level0/work-group.test.js`, `level0/work-held.test.js`, `level0/work-list.test.js`, `level0/work-marked.test.js`, `level0/work-merge-cloud.test.js`, `level0/work-open.test.js`, `level0/work-orphan.test.js`, `level0/work-rows.test.js`, `level0/work-stands.test.js`, `level0/work-switch.test.js`, `level0/work-sync.test.js`, `level0/work-usage.test.js`, `level0/work.test.js`
- [[spec/tickets/branch-scripts-leave]], stays and drops its imports: `level0/fields-to-fill.test.js`, `level0/lens-actions.test.js`, `level0/lens-v1.test.js`, `level0/lens.test.js`, `level0/logbook.test.js`, `level0/route-host.test.js`, `level0/serve.test.js`, `level0/sidebar-v1.test.js`, `level0/sidebar-views.test.js`, `level0/sidebar-work.test.js`, `level0/sidebar.test.js`
- [[spec/tickets/pull-scripts-leave]], goes: `contract/tree.test.js`, `level0/bless-desk.test.js`, `level0/cloud-desk.test.js`, `level0/folders.test.js`, `level0/landed.test.js`, `level0/lint-sweep.test.js`, `level0/process.test.js`, `level0/pull-chapter.test.js`, `level0/pull-children.test.js`, `level0/pull-cleanup.test.js`, `level0/pull-hand-front.test.js`, `level0/pull-hand-of.test.js`, `level0/pull-kept.test.js`, `level0/pull-outline.test.js`, `level0/pull-spawn.test.js`, `level0/pull-when.test.js`, `level0/queue.test.js`, `level0/spawn-answer.test.js`, `level0/ticket-verb.test.js`, `level0/tool-call.test.js`, `level0/verdict-guard.test.js`
- [[spec/tickets/pull-scripts-leave]], stays and drops its imports: `level0/hand.test.js`, `level0/level1.test.js`, `level0/route-fixture.test.js`
- [[spec/tickets/ticket-scripts-leave]], goes: `contract/vehicle.test.js`, `level0/ask-lint.test.js`, `level0/ticket-drift.test.js`, `level0/ticket-fill.test.js`, `level0/ticket-new.test.js`, `level0/ticket-route.test.js`, `level0/ticket-todo.test.js`
- [[spec/tickets/ticket-scripts-leave]], stays and drops its imports: `level0/save-fills.test.js`
- [[spec/tickets/guidance-lib-leaves]], goes: `contract/guidance-rules.test.js`, `contract/guidance-tags.test.js`, `contract/question-grades.test.js`
- [[spec/tickets/plugin-libs-leave]], goes: `contract/biome.test.js`, `contract/candidate-check.test.js`, `contract/folders.test.js`, `contract/install.test.js`, `contract/lint-twins.test.js`, `contract/topic-keys.test.js`, `level0/apply.test.js`, `level0/bash-test-run.test.js`, `level0/bash.test.js`, `level0/check-twins.test.js`, `level0/config.test.js`, `level0/controls.test.js`, `level0/index-tools.test.js`, `level0/index.test.js`, `level0/layer.test.js`, `level0/log-serve.test.js`, `level0/log.test.js`, `level0/magic.test.js`, `level0/markers.test.js`, `level0/mutations.test.js`, `level0/names.test.js`, `level0/plugin-check.test.js`, `level0/private.test.js`, `level0/projection-builtin.test.js`, `level0/pull-doors.js`, `level0/quack-doors.js`, `level0/reply-hook.test.js`, `level0/schema-notes.js`, `level0/schema-route.test.js`, `level0/schema-slots.test.js`, `level0/schema-sweep.test.js`, `level0/schema.test.js`, `level0/servers.test.js`, `level0/shell-values.test.js`, `level0/size.test.js`, `level0/stop.test.js`, `level0/tested.test.js`, `level0/ticket.test.js`, `level0/tools.test.js`, `level0/trunk.test.js`, `level0/verb-line.test.js`, `level0/verbs.test.js`, `level0/vocabulary.test.js`
- [[spec/tickets/plugin-libs-leave]], stays and drops its imports: `contract/cloud-start.test.js`, `contract/tree-extension.test.js`, `level0/caged-door.test.js`, `level0/door-clear.test.js`, `level0/door-spawn.test.js`, `level0/lsp.test.js`, `level0/pull-spawn-hook.test.js`, `level0/read-tools.test.js`, `level0/start-constants.test.js`
- [[spec/tickets/schema-libs-leave]], goes: `contract/front.test.js`, `contract/handover-words.test.js`, `contract/retro-route.test.js`, `contract/schema-bless.test.js`, `contract/ticket.test.js`, `contract/tree-of.js`, `contract/vocabulary.test.js`, `level0/front-writer.test.js`, `level0/paths.test.js`, `level0/todo.test.js`, `level0/writes-here.test.js`
- [[spec/tickets/schema-libs-leave]], stays and drops its imports: `contract/drawing-page.test.js`, `contract/process.test.js`, `contract/schema.test.js`, `level0/lens-actions.test.js`, `level0/lens-v1.test.js`, `level0/sidebar-views.test.js`, `level0/v1-index.js`
- [[spec/tickets/engine-and-doors-leave]], goes: `contract/awake.test.js`, `contract/clock.test.js`, `contract/compact.test.js`, `contract/http.test.js`, `contract/index.test.js`, `contract/log.test.js`, `level0/front-merge.test.js`, `level0/group.test.js`, `level0/quoted.test.js`, `level0/status.test.js`, `level0/ticket-folders.test.js`
- [[spec/tickets/engine-and-doors-leave]], stays and drops its imports: `contract/process.test.js`, `level0/bridgehead.test.js`, `level0/log.test.js`
- [[spec/tickets/plugin-libs-leave]], goes with the git door: `contract/real-git.test.js`
- [[spec/tickets/remaining-js-names-its-reason]], stays beside the wire door: `contract/editor-index.test.js`, `contract/wire.test.js`
- [[spec/tickets/scripts-folder-leaves]], goes: `level0/trust.test.js`
- [[spec/tickets/test-lines-stay-under-code]], goes, since nothing imports it or it pins the tree's own text: `contract/check-workflow.test.js`, `contract/cli-verbs.test.js`, `contract/commands.js`, `contract/desk-start.test.js`, `contract/dispatch-workflow.test.js`, `contract/experiment.test.js`, `contract/extension-spawns-no-verb.test.js`, `contract/fetching.js`, `contract/go-module.test.js`, `contract/install.test.js`, `contract/sidebar-reads-no-file.test.js`, `contract/sidebar.test.js`, `contract/skills.test.js`, `contract/tree.test.js`, `contract/verb-programs.test.js`, `level0/battery-reporter.test.js`, `level0/fixtures.js`, `level0/styles.test.js`
- [[spec/tickets/test-lines-stay-under-code]], goes, its rule cases held in `src/modules/lsp/rules_contract_test.go`: `contract/outside-in-doors.test.js`, `contract/paragraph.test.js`, `contract/process.test.js`, `contract/ruled.js`, `contract/schema.test.js`, `contract/shape.test.js`, `contract/vale-fix.test.js`
- [[spec/tickets/test-lines-stay-under-code]], stays with its door cases alone: `contract/vale.test.js`
- [[spec/tickets/test-lines-stay-under-code]], stays, since `./RUNME.sh doors` wants a contract test a door: `contract/disk.test.js`, `contract/proc.test.js`, `contract/wire.test.js`
- [[spec/tickets/test-lines-stay-under-code]], folds into `level0/sidebar.test.js`: `level0/sidebar-v1.test.js`, `level0/sidebar-views.test.js`, `level0/sidebar-work.test.js`, `level0/sidebar-writes.test.js`
- [[spec/tickets/test-lines-stay-under-code]], folds into `level0/lens.test.js`: `level0/lens-actions.test.js`, `level0/lens-v1.test.js`
- [[spec/tickets/test-lines-stay-under-code]], folds into `level0/pull-tool.test.js`: `level0/index-tools.test.js`, `level0/level1.test.js`, `level0/pull-spawn-hook.test.js`
- [[spec/tickets/test-lines-stay-under-code]], folds into `level0/level0-door.test.js`: `level0/caged-door.test.js`, `level0/door-clear.test.js`, `level0/door-spawn.test.js`
- [[spec/tickets/test-lines-stay-under-code]], stays, each case repeating a behaviour cut: `contract/tree-extension.test.js`, `contract/work-buttons.test.js`, `level0/clicks.test.js`, `level0/fields-to-fill.test.js`, `level0/gesture.test.js`, `level0/lsp.test.js`, `level0/panel.test.js`, `level0/route-host.test.js`, `level0/widgets.test.js`
- [[spec/tickets/test-lines-stay-under-code]], stays: `contract/editor-files.test.js`, `level0/bridgehead.test.js`, `level0/drawing.test.js`, `level0/editor-doors.test.js`, `level0/extension-load.test.js`, `level0/fake-paths.test.js`, `level0/layout.test.js`, `level0/rows.test.js`, `level0/settle.test.js`, `level0/states.test.js`, `level0/work-strings.test.js`
- For the lint-without-vale group: [[spec/tickets/bridge-library-leaves]] cuts the node lint out of `src/scripts/cli-read.js`, which no road runs, and deletes `test/level0/vale-rows.test.js` with `src/bridge/vale-rows.js`. It ports neither, and the Go lint verb stands as the lint road.
