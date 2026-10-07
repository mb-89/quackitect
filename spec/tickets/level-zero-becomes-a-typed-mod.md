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
    hash_after: 702e6bd13c632deb0c237df9bdde21a8c77a84d2
    final: "The group closes: the start verb reads the manifest alone, the check validates the plugin strictly, the boot hook note names both roads, and the pull hand takes no session tag."
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
  - step: accept
    hand: box eabbd46a6a23 · claude-code-remote
    hash_before: 6fe308d048d2a4885f04dc9e5ba60c01cf03d2b2
    hash_after: 6fe308d048d2a4885f04dc9e5ba60c01cf03d2b2
    answered:
      - name: sync/sync
        exit: 0
        said: work/level-zero-becomes-a-typed-mod already carries every commit on main.
    inputs:
      - name: ask
        hash: b061d8c7cb9abdac
        size: 1329
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box eabbd46a6a23 · claude-code-remote
    hash_before: 87cae7e0eeb57a1358743c38eca3b132e654083a
    hash_after: 87cae7e0eeb57a1358743c38eca3b132e654083a
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box eabbd46a6a23 · claude-code-remote
    hash_before: ea7917f00193bc9bebddda2a3e8bf49c6ec7eacf
    hash_after: ea7917f00193bc9bebddda2a3e8bf49c6ec7eacf
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box eabbd46a6a23 · claude-code-remote
    hash_before: 72539c4372ee8b93125fa9894d23dfdb48ed63d0
    hash_after: 72539c4372ee8b93125fa9894d23dfdb48ed63d0
    inputs:
      - name: retro/write
        hash: 2589cc56f5b87ee3
        size: 3974
    def: 4da1ca5da87d5bbc
reason: done
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

`level0-drops-what-standard-replaces`: the start verb reads the manifest alone, at d314010ac
`boot-hook-names-desk-road`: the boot hook section names the cloud road and the desk road, and the standard road row points at it, at 4b13c0876
`level0-plugin-validate-in-check`: the plugin part runs validate with --strict, and the level0 note names the part, at e3adb5dc3
`hand-spawn-skips-session-tag`: the spawn answer leaves the pull hand untagged off the hand line q owns, at 7e1d8ff1b
the private notes `check-answers-no-green` and `kit-drops-the-own-spawn` stand decided
the battery before, at 376fa30: the check exits 1 in 1m50s wall, its tests part red on a vale limit
the battery after, at ea7917f00: the check exits 0 in 98s wall, 95.6s across its parts, with rules at 58.8s the longest

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

each gate went to a hand of its own, and the gate on the start verb found the stale boot hook sentence the do step then fixed
the commit door ran the check and the cold probe on every commit, so no push landed red
the red test before each fix named the fault in its own words, so the fix took one write

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

17:34 the canary hook asked the line again after it opened the first answer
17:40 the stop under your-helpers-still-run fell, since a cloud box stops its helpers at the turn end, and the wait tool returned at once with its result on the next turn
17:36 the gate hand named a child past five words, and the pull refused it once
17:51 the design note edit broke CountedList, DigitInProse and Sentence, and the check went red on it
17:59 and 18:04 the pull refused the tests field twice: a green field wants a last line opening on green, and the check ends on its timing line
18:05 the commit door refused a message naming no ticket, then a trailer naming the model the harness attribution asks for
18:06 the plugin pull tool answered no tool.call hook, and the shell verb took its place
18:20 the second gate hand pulled under --as with no ticket name, and the pull read the plan working item, still a closed ticket
18:3x the accept hand-back with --pass was refused, since the verdict field decides
18:56 the commit door refused a change to q and the pull with no test of their own staged, and a test literal named a field the Leaf type embeds
the beat wrote nothing all window, since its push met no git proxy
no owner prompt reached this window past the routine prompt at the session start

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

the do step of `spec/processes/trivial` says the tests field takes a test of the code the change describes, since the check prints no green verdict
`src/pull/pull_branch.go` spawnPrompt names the ticket in its first pull, so a hand reads no stale plan item
`src/modules/waits` blocks inside the call up to its cap on a cloud box, so a wait ends no turn
`.claude/skills/level0/hooks/pull-tool.ts` answers every call of the tool it registers
`.claude/settings.json` carries the attribution setting with no co-author line, so the harness asks for no trailer the commit door refuses
`src/branches` beat pushes through the same remote the commit verb reaches
`spec/guidance/tickets` rule 15 holds the Leaf literal miss: open the type before the test writes it

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The window read the handover first and took the queue as the road, and the door kept the agent on the ticket in hand. Most of the time went to the engine rather than the change: the wait that returns at once, the green form, the stale hand. Each answer was found by reading the engine source, which the next box can skip once the improve lines land.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every fact stands once: the battery stands in the done list, and each improve line points at its home
the numbers are measured times off the check and the log, each beside its commit
the chapter writes no file header
the chapter carries the errors off the log with their times, and says no new owner prompt reached the window
the chapter names roles alone, and carries repository paths with no box path

## cloud

true

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

the beat push met no git proxy from 17:28 onward, while the commit verb pushed through
a wait that blocks inside a call: the wait tool and the plugin patch returned at once, with their result on the next turn

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

the stop hook, which refuses a turn end while a helper runs on a cloud box
the shell guard LandingFollowsItsGate, which refuses a landing verb after a pipe
the commit door, which refuses a model trailer and a change with no test staged
no conflict at sync, since the branch carries every commit on main

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

no person step stands parked, and no ticket stands minted outside the group
the handover names the pull request against main with auto-merge on, and the improve lines of the retro for the next retro to mint

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

What the box found before the split, at commit 376fa30, which matches `origin/main`:

- The hooks entry `hooks/pull-tool.js` reaches 17 files of the plugin. The other `lib/` files serve the scripts under `src/`, which import `lib/` from 102 files, and the javascript-leaves group ports them. The mod this group types and tests is the hooks entry and what it reaches. The split takes that as its assumption.
- `src/quack/check.go` already carries a `plugin` part, `pluginHolds`, which runs `claude plugin validate` without `--strict`.
- `claude --plugin-dir <mod> -p ""` lays `.claude-plugin/types/` and exits before any model turn. The laid folder carries its own `.gitignore`, a `tsconfig.json` including `hooks`, `types` and `tests`, and declares `claude-code/testing`.
- `claude plugin test` hands each test `($, on)`: `$` raises events through the module, `on` stubs every door, `$.classic` raises every settings event, and `mock.clock` drives time. A probe mod under `.se/scripts/probe` ran green.
- The mods overview says Claude Code 2.1.287 and later ignores `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS`.

The battery before, at 376fa30: `./RUNME.sh check` exits 1 in 1m50s wall. Its `tests` part fails at `test/contract/vale-paths.test.js`, where a vale run meets its 2s limit, and the check stops there at 77.6s.
