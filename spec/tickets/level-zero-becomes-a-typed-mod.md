---
kind: [[ticket]]
state: open
step: accept
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
    checklist: ["every child is small enough to review whole, or is a group itself", "the children add up to the goal, and nothing of the goal stands outside them", "a child that waits on another names it under depends_on", "each child names what it reads from its siblings, and the children land in that order", "a group whose diff grows past one review splits into a group of its own before it grows further"]
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
    hand: box 4ec4b2b1634e · claude-code-remote
    hash_before: 2ba744881bf0ea113d63802bef0a92f91232240c
    session: cse_019gdjBL3W2A1vtUVGZvVPNS
    hash_after: c71f687a2723640d85dfb22a66c5afb43e72e4a6
  - step: sync
    hand: box 49b3bfe9f7b0 · claude-code-remote
    hash_before: c703cc21ccd8520657da66be83916676d1292e20
    session: cse_01DyjMbZQSGv9pA5CSQStLWz
    hash_after: ab4f60fd71ab54b180b9ee7cf7c2231eea7cb60b
  - step: sync
    hand: box 9148247b4610 · claude-code-remote
    hash_before: e9465f11b6d01d931ca000be3f2c05a1adfcdd73
    session: cse_01KE91kzkQWf2nAx63oXGhcu
    hash_after: 9b311a05fce277570fe9175da16044c21273ac90
  - step: sync
    hand: box eabbd46a6a23 · claude-code-remote
    hash_before: fc41c9687cbed3390f0ec36a85e08b7f472b7a69
    session: cse_01TMpYhceevNqNNEKTryYJRo
  - step: sync
    hand: box eabbd46a6a23 · claude-code-remote
    hash_before: 045621def3c6ce7230fb93daa5e24d302572f8f3
    hash_after: 045621def3c6ce7230fb93daa5e24d302572f8f3
    answered:
      - name: sync
        exit: 0
        said: work/level-zero-becomes-a-typed-mod already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box eabbd46a6a23 · claude-code-remote
    hash_before: 2fcc1070624c7a94866873f389f01f0fafa129d8
    hash_after: 2fcc1070624c7a94866873f389f01f0fafa129d8
    inputs:
      - name: ask
        hash: b061d8c7cb9abdac
        size: 1329
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 9e87fed0471ca50dec862990f2f01e9c84d74284
    hash_after: 9e87fed0471ca50dec862990f2f01e9c84d74284
cloud: true
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->

goal: Level zero stands as a standard, typed Claude Code mod, tested with the testing helpers Claude Code ships. The skill folder at `.claude/skills/level0` already loads as `level0@skills-dir` and registers function hooks through `hooks/hooks.json`. After this group its hooks module is TypeScript, checked by `tsc -p` against the types under `.claude-plugin/types/`; each hook stays thin and hands its work to Go. `claude plugin validate` stands in the check, and the smoke test drops what validate proves. The tests under `test/level0` move onto `claude plugin test`, as `*.test.ts` files beside the plugin using `claude-code/testing`, testing behavior through the hooks' interface, at or under one line of test per line of plugin code, and our own harness faking Claude Code goes. What is no longer needed to stay standard goes, and `spec/design_output/level0` names the reason for each piece that stays, the function hooks over settings command hooks among them. The retro carries the battery measured with `./RUNME.sh check` before and after. Wherever standard costs nothing, take standard. The javascript-leaves group ports `lib/` logic to Go on another box, and the level-zero-smoke group owns the smoke test; this group meets both through `main`, merged in often, and takes only the hooks module, its glue and its tests.

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

[[spec/tickets/level0-hooks-move-to-typescript]] standard
[[spec/tickets/level0-hooks-hold-no-rule]] standard
[[spec/tickets/level0-plugin-validate-in-check]] standard
[[spec/tickets/level0-tests-move-to-plugin-test]] standard
[[spec/tickets/level0-drops-what-standard-replaces]] standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every child stands closed and reviewed whole through its own gate
the children cover the goal: the typed module, the thin hooks, validate in the check, the plugin tests and the standard road with its reasons, and the battery lands in the retro
no open child waits on another, since every child stands closed
the children landed in the order they read each other, the typed module first
the diff closes here, so no child splits into a group of its own

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

<!-- retro notes, which passes when the private folder is empty -->

<!-- the form is command -->

## write

<!-- writes the retro over the box's own window -->

### done

<!-- what was done, one line a ticket or a thing -->

<!-- the form is list -->

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->

<!-- the form is list -->

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## cloud

true

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

What the box found before the split, at commit 376fa30, which matches `origin/main`:

- The hooks entry `hooks/pull-tool.js` reaches 17 files of the plugin. The other `lib/` files serve the scripts under `src/`, which import `lib/` from 102 files, and the javascript-leaves group ports them. The mod this group types and tests is the hooks entry and what it reaches. The split takes that as its assumption.
- `src/quack/check.go` already carries a `plugin` part, `pluginHolds`, which runs `claude plugin validate` without `--strict`.
- `claude --plugin-dir <mod> -p ""` lays `.claude-plugin/types/` and exits before any model turn. The laid folder carries its own `.gitignore`, a `tsconfig.json` including `hooks`, `types` and `tests`, and declares `claude-code/testing`.
- `claude plugin test` hands each test `($, on)`: `$` raises events through the module, `on` stubs every door, `$.classic` raises every settings event, and `mock.clock` drives time. A probe mod under `.se/scripts/probe` ran green.
- The mods overview says Claude Code 2.1.287 and later ignores `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS`.

The battery before, at 376fa30: `./RUNME.sh check` exits 1 in 1m50s wall. Its `tests` part fails at `test/contract/vale-paths.test.js`, where a vale run meets its 2s limit, and the check stops there at 77.6s.
