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
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: ae3d32de0c6708f2066851db7130eb500e8ddda1
    hash_after: 4a64e8f5d3973f78d37a622894ccc6760a070d5f
  - step: sync
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 5ddff27b13dabc94c35c8e10d0ea52e1c721fbba
    hash_after: 82f365f04883b53dd31f5333a0f18ea75551c4ef
    answered:
      - name: sync
        exit: 0
        said: work/lint-without-vale already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 8297fc59a8d194ff130c1d8a3b4d33b86320c2d3
    hash_after: 4ed7285940f3845b9391dcd752dc111269cfb6b3
    inputs:
      - name: ask
        hash: b1429804df0c41dd
        size: 958
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 9bcd4b0e78ebbc1b03c030d1fa9626080e047e60
    hash_after: 9bcd4b0e78ebbc1b03c030d1fa9626080e047e60
  - step: accept
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 2e35e158b98503c515343b0078143133c1d72d33
    hash_after: f30fde4663153a9f7a3d7b57638d4810099120df
    answered:
      - name: sync/sync
        exit: 0
        said: work/lint-without-vale already carries every commit on main.
    inputs:
      - name: ask
        hash: b1429804df0c41dd
        size: 958
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: split
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 12775477aff311fb507d2148b71ca0cf28aa98b9
    hash_after: 12775477aff311fb507d2148b71ca0cf28aa98b9
    inputs:
      - name: ask
        hash: b1429804df0c41dd
        size: 958
    def: 19b6849b1f151cd5
  - step: children
    hand: box 612227244607 · claude-code-remote
    hash_before: 43d1136b2b3d3327a2b94c6cefb020ff6d378f72
    session: cse_01BXnrFXaextXggvGwAnAU5j
    hash_after: 4e0a51d31cfaac92b9b1858f928f9d8180c05b35
  - step: children
    hand: the engine
    hash_before: a31b6f23641c85d19924a2d6e7c39467e0d09fd2
    hash_after: a31b6f23641c85d19924a2d6e7c39467e0d09fd2
  - step: accept
    hand: box 612227244607 · claude-code-remote
    hash_before: 6040751f7693a724e04dd5feea1d4c2345651e9c
    hash_after: 6040751f7693a724e04dd5feea1d4c2345651e9c
    answered:
      - name: sync/sync
        exit: 0
        said: work/lint-without-vale already carries every commit on main.
    inputs:
      - name: ask
        hash: b1429804df0c41dd
        size: 958
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: accept
    hand: box 612227244607 · claude-code-remote
    hash_before: 2c4eca542a42281601948a0a733da33efc40b24a
    hash_after: 2c4eca542a42281601948a0a733da33efc40b24a
    answered:
      - name: sync/sync
        exit: 0
        said: work/lint-without-vale already carries every commit on main.
    inputs:
      - name: ask
        hash: b1429804df0c41dd
        size: 958
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 612227244607 · claude-code-remote
    hash_before: d216ada5c24bb0f0e1f805cd7dd7be1287e23bb3
    hash_after: d216ada5c24bb0f0e1f805cd7dd7be1287e23bb3
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 612227244607 · claude-code-remote
    hash_before: 3bf41ceaec88427150bd09d31ec7c5e64237916b
    hash_after: 3bf41ceaec88427150bd09d31ec7c5e64237916b
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box 612227244607 · claude-code-remote
    hash_before: 11f2c09037d0041cb5250ade3d5b1f07c361b496
    hash_after: 11f2c09037d0041cb5250ade3d5b1f07c361b496
    inputs:
      - name: retro/write
        hash: 06136bf143995702
        size: 2556
    def: 4da1ca5da87d5bbc
  - step: retro/cloud
    hand: box 612227244607 · claude-code-remote
    hash_before: db99954d4f6a628f1421e2ff0634bade94d6ec3e
    hash_after: db99954d4f6a628f1421e2ff0634bade94d6ec3e
    returns: 1
    why: the hand takes it back
  - step: retro/cloud
    hand: box 612227244607 · claude-code-remote
    hash_before: aa72a3922e4fb228def0b379735182cdd3aea002
    hash_after: b32f3c8da55669b131c76ab2f3b2d86ad2dd6959
    inputs:
      - name: retro/write
        hash: 06136bf143995702
        size: 2556
    def: 4da1ca5da87d5bbc
  - step: children
    hand: the engine
    hash_before: cd82c791b988110fff775e33be417addbb7bd933
    hash_after: cd82c791b988110fff775e33be417addbb7bd933
  - step: accept
    hand: box 612227244607 · claude-code-remote
    hash_before: 7b709587cda55499a94a0a8294ce4bf9dd771ed4
    hash_after: 14f3ca96937355e7de080985f2d6c93bb3c29098
    answered:
      - name: sync/sync
        exit: 0
        said: work/lint-without-vale already carries every commit on main.
    inputs:
      - name: ask
        hash: b1429804df0c41dd
        size: 958
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 612227244607 · claude-code-remote
    hash_before: 151cae475a2a6d40dacb335c2a6a70e5041791ae
    hash_after: 151cae475a2a6d40dacb335c2a6a70e5041791ae
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 612227244607 · claude-code-remote
    hash_before: c182413c0e1c1e4b504598963da87bd29b1fc477
    hash_after: c182413c0e1c1e4b504598963da87bd29b1fc477
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box 612227244607 · claude-code-remote
    hash_before: b7d989ad27290624d6c287b21af18707de5231aa
    hash_after: b7d989ad27290624d6c287b21af18707de5231aa
    inputs:
      - name: retro/write
        hash: 4625134cbd0d0ff1
        size: 2010
    def: 4da1ca5da87d5bbc
  - step: retro/cloud
    hand: box 612227244607 · claude-code-remote
    hash_before: e73e7d66b102f21c014c332b538c7ad0d506a85e
    hash_after: e73e7d66b102f21c014c332b538c7ad0d506a85e
    returns: 2
    why: the hand takes it back
  - step: retro/cloud
    hand: box 612227244607 · claude-code-remote
    hash_before: 55e9b22b18123e61bb39573a37114849b9878875
    hash_after: 61165883f8912d1e5552240cd08d7a8c287678d0
    inputs:
      - name: retro/write
        hash: 4625134cbd0d0ff1
        size: 2010
    def: 4da1ca5da87d5bbc
  - step: children
    hand: the engine
    hash_before: 4349b339dcd60750dbf44e06165dda5904e28b59
    hash_after: 4349b339dcd60750dbf44e06165dda5904e28b59
  - step: accept
    hand: box 612227244607 · claude-code-remote
    hash_before: 5467a6f2075de205b6fa840378b407f110a1fc87
    hash_after: 5467a6f2075de205b6fa840378b407f110a1fc87
    answered:
      - name: sync/sync
        exit: 0
        said: work/lint-without-vale already carries every commit on main.
    inputs:
      - name: ask
        hash: b1429804df0c41dd
        size: 958
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 612227244607 · claude-code-remote
    hash_before: 98cb8ac57d41c47114bd20c5328b7ecea9dbdfb6
    hash_after: 98cb8ac57d41c47114bd20c5328b7ecea9dbdfb6
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 612227244607 · claude-code-remote
    hash_before: 5038fb320b2cb20699d1636e1f03b4e812de8252
    hash_after: 5038fb320b2cb20699d1636e1f03b4e812de8252
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box 612227244607 · claude-code-remote
    hash_before: 8dd2b34ed0d9c93a7d11ba00fcfd6fe6efad4447
    hash_after: 60ac0c7e497218c6ac75db41bd8d4f558515b1eb
    inputs:
      - name: retro/write
        hash: 8328e03bfb21675b
        size: 2916
    def: 4da1ca5da87d5bbc
    model: claude-opus-5-5
    cost: 0
    final: "lint-without-vale lands: pull request 130 open with auto-merge, main merged in, the check green"
reason: done
---

# Ask

The tree lints its prose and its code with its own Go rules, at commit and mint over the changed files, with no Vale and no JavaScript lint left.

- The 43 rules under `spec/config/styles` run in a Go rule engine over a parsed markdown tree, with path scoping in our code: the script rules, the existence, occurrence and substitution rules, and the sequence rules through the part-of-speech tagger `github.com/jdkato/prose`.
- One run over the whole tree compares the Go rules against Vale, and the retro names what differs. Then Vale, its install, its door and the vale-paths test leave the tree, and the editor's diagnostics read the Go rules.
- The check's lint leaves `src/scripts/cli-read.js` for Go, and the old JavaScript lint and `test/contract/lint-twins.test.js` leave the tree.
- The rules run over the changed files at commit and mint, so a finding shows in seconds.
- The code comment rules say what the lint holds.
- `./RUNME.sh check` exits 0.

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

[[spec/tickets/go-rules-replace-vale]], standard
[[spec/tickets/go-rules-design-note]], trivial
[[spec/tickets/go-rules-exemption-marker]], trivial
[[spec/tickets/go-rules-rename-voicevale]], trivial
[[spec/tickets/go-rules-span-parity]], trivial
[[spec/tickets/comment-rules-meet-the-lint]], trivial
[[spec/tickets/rules-lint-changed-files-first]], standard
[[spec/tickets/changed-lint-without-merge-base]], trivial
[[spec/tickets/working-rule-strict-commit]], trivial
[[spec/tickets/the-check-lint-runs-in-go]], standard
[[spec/tickets/lint-contract-test-leaves]], trivial
[[spec/tickets/lint-strict-leaves-erred]], trivial
[[spec/tickets/vale-leaves-the-tree]], standard
[[spec/tickets/done-when-grep-meets-testdata]], trivial
[[spec/tickets/vale-size-misses-files]], trivial
[[spec/tickets/design-notes-name-no-vale]], trivial
[[spec/tickets/vehicle-rules-come-down]], trivial
[[spec/tickets/vale-comments-leave-the-code]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every child is small enough to review whole: each standard child landed move by move in commits of its own, and each trivial child touches a few files
the children add up to the goal: the engine, the compare, the check's lint in Go, the changed-file lint, the comment rules and the leaving of Vale each hold a child, and the last three close what Vale left in notes, vehicles and comments
no child stands open, so none waits on another
each child reads what its parent landed: the engine before the leaving of Vale, and the leaving before the notes and comments that describe it, and they landed in that order
the diff stands past one review, and every child stands closed, so the group goes to its retro whole in place of a split it no longer needs

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

- main came into the branch twice by merge, and no rebase ran
- `drafts-name-no-vale` names the Go rules where the drafts named Vale
- `the-tree-lints-clean` points the stamp at the source the Go rules write
- the same ticket clears the Go code and the notes of every warning
- `mains-new-files-lint-clean` clears the warnings in four files main brings in
- accept passed over every line of the ask

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- each conflict read against both sides' commits, so the merges kept both intents
- four helpers cleared the warnings beside each other, one share each
- the stamp case pinned the source fault in one line
- the handover named the four files and the next steps, so the box after the clear went straight to them

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 14:20 a bare `branch take` moved this box onto a stale hand-over of another group
- 14:22 every write stood at zero while the index rebuilt after the merge
- 14:44 the done gate counted the prose of every open ticket
- 14:44 the cause was the stamp, which exempted ticket prose for the source `vale` alone
- 15:00 a helper rewrote the asks of other groups, and the box dropped those edits
- 15:10 a new case ran alone, and the check asked for `t.Parallel`
- 15:25 a trailer naming a model met the owner rule main brought in
- 15:34 the open read an ask written under subheadings as empty
- 15:38 two hand-backs met a refused connection while the index restarted
- 15:40 the tests field took a command printing ok, and wants a verdict starting with green
- 15:37 `t.Parallel` stands out of reach where `runsVerb` sets the root through the environment

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the handover names `branch take <group>` where it hands a group: `.claude/skills/work/SKILL.md`
- a write meeting a rebuilding index says so: `a-down-index-refuses-calls`
- a switch of finding source moves every reader of the source with it: `src/quack/battery.go`
- a helper prompt names the folders past the branch edge: `spec/guidance/cloud/cloud.md`
- the open names the form an ask takes when it reads one as empty: `src/quack/verb_ticket.go`
- the tests field says it wants `./RUNME.sh branch test`: `spec/processes/trivial.yaml`
- `runsVerb` takes the root as an argument, so its cases run in parallel: `src/quack/verb_split_test.go`

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The gate that held the branch read a source name the switch left behind. A search for every reader of a source name belongs to a switch like this one. The warnings in the Go code and the notes stood real, and clearing them cost four helpers and no design. After the clear, each refusal named its fix, and the cost lay in guessing the form a field wants.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact stands in one place: each improve line points at its home
- the change adds no number
- the change writes no header
- the chapter carries the errors with their times, and the run met no owner prompt past the handover
- the chapter names the role, and names no box

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- nothing: every tool stood on the box, and the proxy refused no host

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- 14:20 a conflict at the first merge of main
- 14:22 the index rebuilding after the merge, which held every write
- 14:35 the commit hook refusing code with no Go test beside it
- 14:44 the done gate counting the prose of open tickets
- 15:20 a conflict at the second merge of main, at the accept sync
- 15:34 the context clear at the handover threshold, and the child `mains-new-files-lint-clean` opened for the files main brings in
- 15:38 the index refusing two hand-backs while it restarted

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step, and no ticket outside the group
- the handover asks for the pull request with auto-merge on, which this box opens next

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
