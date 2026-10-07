---
kind: [[ticket]]
state: open
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
            says: how each bad line stops happening, named by its home
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
process_hash: 5d4a884bfb2491ff
step: accept
record:
  - step: sync
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: ae3d32de0c6708f2066851db7130eb500e8ddda1
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

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every child is small enough to review whole: each standard child landed in moves of its own commit, and each trivial child touches a file or a few
the children add up to the goal: the Go engine, the compare, the check's lint in Go, the changed-file lint, the comment rules and the leaving of Vale each hold a child, and the design notes child closes what Vale left in prose
no open child waits on another: the design notes child reads the tree the closed children left, so it names no depends_on

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- vale-comments-leave-the-code: comments and names still describe Vale where the Go rules run. These are the doc comments of commitVoice, heard, valeHeard, heardOver and heardIn in src/quack/command.go, with valeHeard renamed. They also take the header and the faultIn message of .claude/skills/level0/lib/vale.js, and TestCommitVoiceReadsNothingWhereNoValeStands in src/quack/commit_voice_test.go. The layer's opening says Vale holds the mechanical rules, in src/modules/hooks/brief/layer.go, src/projection/style.go and lib/guidance.js, and the projection writes it again. Since main took the readers out, src/doors/vale.js and teachRules in test/level0/quack-doors.js stand with no caller past their own contract tests, so they leave too.

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
