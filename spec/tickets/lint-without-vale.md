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

- main merged into the branch with no rebase: the check keeps main's lead parts and the branch's changed lint first, the lsp tools keep the Go rules over main's Vale retry, and main's cell-run case runs under ifRules
- `drafts-name-no-vale`: the drafts module, the write door, their tests and two design notes name the Go rules in place of Vale
- accept passed over every line of the ask, after its one point closed

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the merge kept both sides' intent, since each conflict read against the commit that made it on each side
- the check answered green on the merged tree before the merge commit, so the commit landed in one try
- the accept point closed inside the group, since it stayed small enough for the trivial route

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 14:20 a bare `branch take` moved this box onto a stale hand-over of another group, ahead of the group the handover named
- 14:22 every patch stood at zero while the index rebuilt after the merge, then failed when the index restarted, and the box restarted it through `./RUNME.sh serve`
- 14:23 a resolution written through a shell heredoc met the door, and the box wrote it again through patch
- 14:29 the working name the patch set read as a todo in hand, so the pull answered wait until the plan dropped it
- 14:35 the first commit of the fix met the door for want of a Go test beside the code, since a case table under testdata counts for none

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the handover prompt names `./RUNME.sh branch take <group>` where it hands a named group: `.claude/skills/work/SKILL.md`
- a write meeting a rebuilding index answers that the index rebuilds, in place of standing at zero: `a-down-index-refuses-calls`
- the plan field on a write names the ticket as working and adds no todo: `src/quack/verb_ticket.go`
- the commit door counts an embedded case table beside the test reading it: `src/modules/hooks/command/tested.go`

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The take's preference for a stale hand-over is right for a fire naming no group, and wrong for a handover naming one. The box read the take's code to find the name argument, and the prompt could carry it. The index churn after a merge of many commits cost the most wall time, and nothing in the door said it rebuilt.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every fact stands in one place: each improve line points at the file or ticket owning the fix
the change adds no number
the change writes no header
the chapter carries the run's errors off the transcript, each with its time, and the run met no owner prompt past the handover
the chapter names the role and the box nowhere

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- nothing: every tool the run called stood on the box, and the proxy refused no host

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- 14:20 a conflict at the merge of main, over the check parts, the lsp tools and their test, and a paragraph contract case
- 14:22 the index rebuilding after the merge held every write until it came back up
- 14:35 the commit hook refusing code with no Go test beside it

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked, and no ticket minted outside the group
- the handover asks for the pull request against main with auto-merge on, and this box opens it next

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
