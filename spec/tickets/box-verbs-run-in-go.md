---
kind: [[ticket]]
state: closed
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
depends_on: ["quack-holds-a-verb-registry"]
step: retro/cloud
record:
  - step: sync
    hand: box 8ca46dccf16b · claude-code-remote
    hash_before: 446e024525aefd1cb1de8f9b434f4748924bdaad
    hash_after: c14721f2d156f5bd5183a12863fe7d867f9ec618
  - step: sync
    hand: box 660db8e33adc · claude-code-remote
    hash_before: c14721f2d156f5bd5183a12863fe7d867f9ec618
    hash_after: 905d5333df5cad9aa1bba7b6f04ed9717e50f667
  - step: sync
    hand: box 660db8e33adc · claude-code-remote
    hash_before: 4503579d69345f1100f6496591538ceaf9516cd9
    hash_after: 4503579d69345f1100f6496591538ceaf9516cd9
    answered:
      - name: sync
        exit: 0
        said: work/box-verbs-run-in-go already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 660db8e33adc · claude-code-remote
    hash_before: 02f717c53a9c5391a90751bc2911daf43e020743
    hash_after: 02f717c53a9c5391a90751bc2911daf43e020743
    inputs:
      - name: ask
        hash: 811a2cbc704967e5
        size: 308
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 4427809253f95ac7f113aed594e7b7e2fd189a47
    hash_after: 4427809253f95ac7f113aed594e7b7e2fd189a47
  - step: accept
    hand: box 660db8e33adc · claude-code-remote
    hash_before: 9857e8f1d50ba0a5865ddc0c78e15b9a6bf501bb
    hash_after: 55a95590cfc10e8666dec8e0f0ef37a2ef7d9f19
    answered:
      - name: sync/sync
        exit: 0
        said: work/box-verbs-run-in-go took 2 commit(s) from main.
    inputs:
      - name: ask
        hash: 811a2cbc704967e5
        size: 308
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 660db8e33adc · claude-code-remote
    hash_before: 9b9ad82a1b7ab47a1d64bccb5e6fe6eb4648fd5c
    hash_after: 9b9ad82a1b7ab47a1d64bccb5e6fe6eb4648fd5c
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 660db8e33adc · claude-code-remote
    hash_before: 50006799373850d78894b92628717a820cc2add1
    hash_after: 50006799373850d78894b92628717a820cc2add1
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box 660db8e33adc · claude-code-remote
    hash_before: 3f6fb8ff732e3e9c26d071d1eba14af8e85293ba
    hash_after: 3f6fb8ff732e3e9c26d071d1eba14af8e85293ba
    inputs:
      - name: retro/write
        hash: 0e6afb192a03cb0f
        size: 2023
    def: 4da1ca5da87d5bbc
reason: done
---

# Ask

Part of phase 11 of [[spec/design_input/the-migration-runs-in-slices#the-phases]]: the verbs setup, probe, tools and doctor leave Node.

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

- [[spec/tickets/box-verbs-port-to-go]], standard
- [[spec/tickets/box-verbs-brand-caller]], standard
- [[spec/tickets/probe-dry-leaves-node]], standard
- [[spec/tickets/box-verbs-no-node-test]], standard
- [[spec/tickets/setup-road-without-index]], standard
- [[spec/tickets/probe-dry-entry]], standard
- [[spec/tickets/box-verbs-dead-entries]], standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child reviews whole: the port, five gate fixes, and the dead entries the port leaves
- the port moves the four verbs to Go and deletes their programs; the dead-entries child takes the JavaScript the port leaves with no caller, so the goal stands inside the children
- box-verbs-dead-entries waits on nothing open, since the port it follows stands closed

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

- box-verbs-port-to-go: setup, probe and doctor answer in Go, and their programs leave
- box-verbs-dead-entries: editor.js keeps homeIn alone, and browser.js loses its program entry
- extension-link-note-names-go: the extension note names editorlink.go
- three contract tests read a verb as a program or a Go registration

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- three helpers ported in parallel, each in its own unpacked tree, so no half file broke another
- the take moved a stale hold and took main in one step
- the no-node case over fakes proved every box verb without a live run

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 14:34 the owner prompt asked for a merge first, and the cage refuses a raw git merge
- 14:37 the stop fell, since ending a cloud turn stops its helpers
- 14:58 the doctor and the probe ports declared five names twice, and the index stayed unbuilt
- 15:00 a regex replacement read each template slot as a capture group, and emptied it
- 15:03 the commit gate ran the whole suite, and two contract tests read every verb as a program
- 15:16 vale-paths failed under the check twice with exit 2, and passed alone

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the owner prompt for a take names branch take, which merges main, in place of a git merge
- the work skill says a cloud box waits inside its turn for its helpers
- a port helper gets the list of names the other helpers declare
- the patch tool doc says a regex replacement reads a dollar sign as a group
- registered() in test/contract/commands.js owns the verb table read, so a port edits no test
- CI on the PR decides the vale flake, and a red run there gets fixed

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The work split cleanly by verb, and the shared pieces collided anyway. A helper writing in isolation cannot see a name another helper declares. So the merge step needs a compile before anything else.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact points at its owner file, registered() among them
- no number lands in prose
- each new header says what its file is for
- the badly list carries each error with its time
- the chapter names roles alone

## cloud

true

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- nothing: every tool stood, and no host was refused

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- 14:48 the take refused while the hold stood fresh, and passed at 14:56
- 14:56 the cage refused git push, and the commit verb pushed in its place
- 15:03 the commit hook asked a test beside brand.js
- 15:13 the check refused node:fs in a test, and the disk door took its place
- 15:16 vale-paths failed under the full check on this box alone

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step
- no ticket outside the group
- no handover

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
