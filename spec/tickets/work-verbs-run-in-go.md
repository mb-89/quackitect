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
group: the-verbs-run-in-go
enabled_by: migration.phase11
cloud: true
depends_on: ["quack-holds-a-verb-registry"]
step: retro/cloud
record:
  - step: sync
    hand: box 51947abab2e8 · claude-code-remote
    hash_before: cffbc16d4559d1a95d6cb14f49da7d11f0e7a337
    hash_after: 093e69a5321803d301137d531ac38b74f60163f1
  - step: sync
    hand: box 2a515a96a323 · claude-code-remote
    hash_before: 093e69a5321803d301137d531ac38b74f60163f1
  - step: sync
    hand: box 2a515a96a323 · claude-code-remote
    hash_before: cae2bf370c481d72a64e6f641edbf13d59aa5ebd
    hash_after: cae2bf370c481d72a64e6f641edbf13d59aa5ebd
    answered:
      - name: sync
        exit: 0
        said: work/work-verbs-run-in-go already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 2a515a96a323 · claude-code-remote
    hash_before: cef295a51e2969988a22a1380dcf74996a6e81e0
    hash_after: cef295a51e2969988a22a1380dcf74996a6e81e0
    inputs:
      - name: ask
        hash: 321dd01cc387f0c5
        size: 294
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: a4eeda78134879dd181e3c1eeab25982fa303adf
    hash_after: a4eeda78134879dd181e3c1eeab25982fa303adf
  - step: accept
    hand: box 2a515a96a323 · claude-code-remote
    hash_before: 1def4210d927f909e8d5838f53c1e9246a87ec45
    hash_after: 1def4210d927f909e8d5838f53c1e9246a87ec45
    answered:
      - name: sync/sync
        exit: 0
        said: work/work-verbs-run-in-go already carries every commit on main.
    inputs:
      - name: ask
        hash: 321dd01cc387f0c5
        size: 294
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 2a515a96a323 · claude-code-remote
    hash_before: 3d5c801695e47c345b6010ecc086e54312850aab
    hash_after: 3d5c801695e47c345b6010ecc086e54312850aab
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 2a515a96a323 · claude-code-remote
    hash_before: 669a489472438393c007b2a2aed0667158da338f
    hash_after: 669a489472438393c007b2a2aed0667158da338f
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
---

# Ask

Part of phase 11 of [[spec/design_input/the-migration-runs-in-slices#the-phases]]: the verbs branch and cloud leave Node.

Done when these verbs run in Go with their contract tests passing, and their JavaScript files, and every JavaScript module no remaining JavaScript imports, leave the tree.

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

- [[spec/tickets/work-verbs-port-to-go]], standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every child is small enough to review whole: the one child ports two verbs behind one package.
- the children add up to the goal: the shims imported work.js, cli-doors.js and verb-run.js, and each keeps an importer, so no other module goes orphan.
- a child that waits on another names it: the one child waits on nothing.

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

The one child adds up to the goal. The branch and cloud verbs register in Go from src/quack/branch.go and src/quack/cloud.go, and TestTheBranchAndCloudVerbsRunInGo shows neither reaches node. The verbs folder names neither shim. No importer of them stands, and every module they imported keeps an importer. The check runs green on the branch head. Weighed: work.js and the work modules stay, because modules of other groups import them, which the goal allows.

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

- [[spec/tickets/work-verbs-port-to-go]]: the gate passes, the red case reads the wait off the listing, implement and tests-green pass, and the ticket closes.
- the check goes green: two test files take the formatter's alignment, a JS fixture loads fs without the node prefix, and a test comment says what stands.
- the group passes sync, split and accept.

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the take moved the stale hold and took main in with one verb, so no hand merge was needed.
- the previous box's port held: the Go cases ran green on the first run past the red case, so the take-over cost reading and no rework.
- the shell verb for the pull landed the hand-back the index connection dropped.

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 15:19 UTC, owner prompt: the task names the previous box's deadlock after a handover clear, where the plan ask refused every call and the box lost its work past its last push and its handover.
- 15:22 UTC: the stop hook refused the claim that a helper still runs, since a background timer dies with the turn on a cloud box.
- 15:24 and 15:33 UTC: the plan ask spent its grace and refused a shell call until the plan tool answered.
- 15:29 UTC: the plan read the ticket named as working as a todo in hand, so the pull handed nothing until the todo closed.
- 15:32 UTC: the check answered red on gofmt alignment in two test files the previous box pushed.
- 15:36 UTC: the rules part answered red on DoorsOnly over a JS fixture inside a Go string, and on History over a test comment.
- 15:41 UTC: the index refused the connection on the tests-green hand-back, and the step stood unlanded.

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the handover chapter of [[spec/guidance/cloud/cloud]] names the plan tool load as the first call after a clear, which ticket toolsearch-rides-the-plan-ask carries.
- the stop reason your-helpers-still-run names that a cloud box waits in the turn with an until loop.
- the plan tool, in src/modules/plans, reads a ticket name under working as the ticket, and holds no todo for it.
- the write door formats Go on every patch, so a file a commit lands stays gofmt clean, in src/modules/hooks/write.
- DoorsOnly in spec/config/styles/VoiceVale reads a Go file's comments and imports alone, and skips its string literals.
- the pull through the index retries once on a refused connection, in the level0 bridge.

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The take-over was mostly reading. The previous box had landed the whole port and one red case, so the open question was whether that red case tested the real JS or only its fake. The JS case served the gate from git show on trunk while its disk lacked the gate file, so the take named the wait there alone. On a real tree both ports skip the gated group without a word. Changing the code to name it would have added behaviour the JS never had, so the case moved its wait assertion onto the listing. Most of the time went to the engine's doors, not the code.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact stands in one place: the retro points at tickets and files.
- every number carries a name: the retro adds no number past the times.
- every header says what its file is for: no header changes here.
- the chapter carries the owner prompt and the errors, each with its time.
- the chapter says the box and the owner, and names no path of the box.

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
