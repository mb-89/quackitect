---
kind: [[ticket]]
state: open
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
    hand: box 37997ca97a74 · claude-code-remote
    hash_before: c45381bc7f70f32791cfb8fe65ff069b2f8a41b6
    hash_after: 882bcd700829f71cd43f3ae161d4debe41b45139
  - step: sync
    hand: box a694567529c5 · claude-code-remote
    hash_before: b2fb9650106dd090afb4cbfb4a8ce95e9571f961
    hash_after: 155d3d3411adbf335d891fd43adafa317d3cc2a0
  - step: sync
    hand: box a694567529c5 · claude-code-remote
    hash_before: d675324914aeb5c056951188ab41b8cc1056998e
    hash_after: 03852e6a8fcf42ce78f1e4644e073264f516f883
  - step: sync
    hand: box 7b5a2726379b · claude-code-remote
    hash_before: aebce3ff19718b6ec962de5d8206cca44734875c
    hash_after: 0599242ce50b749efea88f22f5c738a10021fc83
  - step: sync
    hand: box 55abcb1f8a0e · claude-code-remote
    hash_before: 3ea213a055681ddee87983cff28a0f40c6867b1e
    session: cse_014fS4XHZJWsqGUfiSfzs8zR
  - step: sync
    hand: box 55abcb1f8a0e · claude-code-remote
    hash_before: 369b780e400fbe7d3dc12b34530dbadec0749394
    hash_after: 9e2137fb2735aa96afb5ef9322293ab1749ba730
    answered:
      - name: sync
        exit: 0
        said: work/code-is-pure-tests-behave already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 55abcb1f8a0e · claude-code-remote
    hash_before: a15bf7653a6492e15633d595bae50a3fb2d7f835
    hash_after: a15bf7653a6492e15633d595bae50a3fb2d7f835
    inputs:
      - name: ask
        hash: e76229b0876aa7d0
        size: 2886
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: ac04e1c9221c9d41b2967cac4191edfb18d1aa28
    hash_after: ac04e1c9221c9d41b2967cac4191edfb18d1aa28
  - step: accept
    hand: box 55abcb1f8a0e · claude-code-remote
    hash_before: 67d1cb147d32238aafc9bce7f937ba8622cf9789
    hash_after: 67d1cb147d32238aafc9bce7f937ba8622cf9789
    answered:
      - name: sync/sync
        exit: 0
        said: work/code-is-pure-tests-behave already carries every commit on main.
    inputs:
      - name: ask
        hash: e76229b0876aa7d0
        size: 2886
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 55abcb1f8a0e · claude-code-remote
    hash_before: 8cd3b89bd2a497aeabf5689421ff96818f838bcc
    hash_after: 8cd3b89bd2a497aeabf5689421ff96818f838bcc
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 55abcb1f8a0e · claude-code-remote
    hash_before: 60fb6975cd996b4e729e045b082171df82dda7b2
    hash_after: 60fb6975cd996b4e729e045b082171df82dda7b2
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: e7ed0badf886b5b5
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->
The owner never again has the discussion about tests and code. Each rule below stands in the guidance an agent reads before it writes code or a test, `spec/guidance/code/code.md` and `spec/guidance/code/testing.md`. Each has a machine check behind it, since a rule only in guidance goes unfollowed. The retro's audit checklist, in `spec/processes/retro.yaml` and `spec/guidance/retro/audit.md`, carries each rule, so every retro audits it.

1. Code is pure by default. Impure code (files, processes, network, clock, randomness, git, the index) lives only in declared IO modules, the doors. Impure code anywhere else carries a marker with its reason, and the check refuses an unmarked one. The doors-declare-what-they-own group turns its walk-around guard from report to refuse; this group builds on its declarations and adds only what it lacks.
2. A test drives behavior through interfaces, never implementation details: a verb by its output, a door by its contract, a module through its ports. A Go test lives in a black-box `package <name>_test`, and an analyzer under `src/imports` refuses an in-package test that carries no marker with its reason.
3. Each door is tested once against the real thing, and everything else runs on the door's fake. No real git repo, process or index runs outside that door's one test.
4. Fixtures live in one home: per package a `TestMain` in `main_test.go` for setup once, and shared builders in `src/q/qtest` memoized with `sync.Once`, read-only to tests. An analyzer refuses fixture building (temp dirs, git repos, a process or an index start) inside a Test function outside that home.
5. No timer and no sleep in code or tests. Code waits on events, and reads time only through the clock door.
6. Test code stays at or under the code it tests: about one line of test per line of code, never more, per language and per module. The check measures the ratio and refuses a change that pushes a module past one to one. Cut duplicated, implementation-detail and scaffolding tests (migration twins, golden copies, tests of deleted code) to get under it.
7. No hand scripts. A script a hand writes (`.se/scripts`, a python heredoc, a shell loop) becomes a verb or an engine function. The retro's classify step promotes every such script, and the check refuses a tracked script outside the engine.

Each analyzer or measure lands in report mode first, listing offenders, then the tree migrates and the check switches to refuse. The battery's slowest Go packages migrate first: `src/branches`, `src/quack`, `src/imports`, `src/index`. The tests-meet-the-doors-once group moves git, process and index tests onto fakes, and the javascript-leaves group deletes JS tests with the JS it ports; this group leaves what they move to them, and reads origin/main and their branches before each slice. The group's retro carries `./RUNME.sh check` time before and after.

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

- [[spec/tickets/black-box-tests-guard-reports]], standard
- [[spec/tickets/fixture-home-guard-reports]], standard
- [[spec/tickets/test-ratio-measure-reports]], standard
- [[spec/tickets/hand-script-guard-reports]], standard
- [[spec/tickets/purity-guard-covers-every-outside]], standard
- [[spec/tickets/code-and-test-rules-stand-in-guidance]], standard
- [[spec/tickets/go-tests-go-black-box]], trivial
- [[spec/tickets/go-fixtures-move-home]], trivial
- [[spec/tickets/js-tests-cut-to-the-ratio]], trivial
- [[spec/tickets/the-test-guards-refuse]], trivial
- [[spec/tickets/door-once-meets-module-rules]], trivial
- [[spec/tickets/imports-tests-load-the-tree-once]], trivial
- [[spec/tickets/index-tests-run-beside-each-other]], trivial
- [[spec/tickets/no-timer-joins-rule-eight]], trivial
- [[spec/tickets/ratio-rule-carries-owner-words]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child moves one guard, one rule or one slice of tests, so a reviewer reads it whole
- the five guards and the guidance child cover rules one to seven, and the refuse child turns every guard on
- the guidance child, the move children and the refuse child each name what they wait on under depends_on
- the guards land in report mode first, the migrations next, and the refuse switch last, in that order
- the merges of main after the children closed carry only guard markers and cuts, so the diff stays one review

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept: each of the seven rules stands in spec/guidance/code/code.md or testing.md with its guard named, and spec/processes/retro.yaml with spec/guidance/retro/audit.md carries them into every audit. The blackbox, fixture, ratio and script guards refuse with empty baselines, and ./RUNME.sh check answers green on the branch head. Purity runs in report mode, as the owner's redraft on purity-guard-covers-every-outside sets, and its refuse switch rides with the doors-declare-what-they-own group, as the ask says. The merges of main carry only guard markers, blackbox moves and ratio cuts, plus one guard fix: fixture markers now key by file and line.

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

- branch-take-tool-unwired closed done: the take tool runs the verb and prints the held group's ask.
- fixture-guard-matches-by-bare closed done: the fixture guard skips a call naming a local, with a test beside it.
- merge-brings-guard-offenders closed dropped: once this group merges, main carries the refuse-mode guards.
- process-group-run-untested closed done: a contract case reads each run's process group through sh and ps.
- take-hands-stale-branch-over closed done: the work skill's take names the group the prompt names.

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- Each note met its code before its verdict, so three of five closed with a fix and a test.
- The commit verb ran the check per commit, so the ratio fault stopped at the rescue branch and never reached the work branch.

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 15:24 UTC: two Bash calls opened on no ticket, and then on the group in place of the leaf in hand, and the cage refused both.
- 15:26 UTC: a commit carried a trailer naming a model, and the commit verb refused it.
- 15:29 UTC: the process group case pushed src/proc one test line past its code, and the ratio guard sent the commit to the rescue branch.
- 15:33 UTC: two code comments linked a private note under .se/tickets, which git never carries.
- 15:36 UTC: retro notes counted a closed note open, since the index watcher missed the close, and a touch woke it.

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- Name the leaf in hand in every Bash description, as `spec/guidance/working.md` rule 13 says for writes.
- Keep the commit trailer to the session line, as the commit verb in `src/quack` already enforces.
- Run `./RUNME.sh guards` before the commit verb where a change adds a test, per `spec/guidance/code/testing.md`.
- Link a code comment to a design anchor or a tracked ticket under `spec/tickets`, never to a private note.
- The index watcher under `src/index` misses a write the pull verb lands on a private note; the next retro reads whether it recurs.

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The notes leaf works best as code: a verdict of done holds only where the fix and its test land in the same window. The dropped note rests on an assumption the merge proves: main carries the guards once this group lands.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- One place: the skill step points at the take verb, and each comment points at its anchor.
- Numbers: the change adds none.
- Headers: each new test and function carries a comment saying what it holds.
- Prompts and errors: each error of the window stands under badly with its time, and the window held no owner prompt.
- Role: the chapter names the box and the owner by role alone.

## cloud

<!-- names what the box lacked, met and leaves for a person -->

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

The box releasing this branch leaves it here:

| ticket | where it waits |
|---|---|
| `black-box-tests-guard-reports` | its gate, which a hand other than the drafting one takes |
| `fixture-home-guard-reports` | its gate, past tests-red |
| `test-ratio-measure-reports` | its gate, past tests-red |
| `hand-script-guard-reports` | its gate, past tests-red |
| `purity-guard-covers-every-outside` | tests-red, until `src/owns` lands on `main` with the doors-declare-what-they-own group |

The purity tests name `src/owns`, which stands on `work/doors-declare-what-they-own` alone. Sync `main` in first, and write them once `src/owns` stands there. A merge of that branch into this one carries its open work into this group's pull request, so this branch waits for it instead.
