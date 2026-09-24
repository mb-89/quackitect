---
kind: [[ticket]]
state: closed
depends_on: [the-stub-takes-shape]
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
    does: mints the children, or assigns standing tickets, each naming this group
    from: anyone
    by: anyone
    input: ask
    reads: [[spec/guidance/working]]
    checklist: ["every child is small enough to review whole, or is a group itself", "the children add up to the goal, and nothing of the goal stands outside them", "a child that waits on another names it under depends_on"]
    evidence:
      - name: children
        form: list
        says: every child as a link, one a line, with its process
  - name: children
    by: children
    on_fail: split
  - name: retro
    reads: [[spec/guidance/working]]
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
        evidence:
          - name: done
            form: list
            says: what was done, one line a ticket or a thing
          - name: well
            form: list
            says: what went well, and what made it go well
          - name: badly
            form: list
            says: what did not, each with its moment in the log or the transcript
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
process_hash: 484b33f9aed1254b
record:
  - step: sync
    hand: box d42624a67d18a8
    hash_before: 09860bacd8a43c5cad5d8f0e4e6e2f4a37023559
    hash_after: a02e060a83d63d945154a2f4c8de1f3a0c696181
  - step: sync
    hand: box 1eeed4143ad0
    hash_before: fd6ff70d4fee2fea1b7c5946d0c91afb4c572934
  - step: sync
    hand: box 1eeed4143ad0
    hash_before: 19fffa9cb5df008828a081ee38038791c51251b5
    hash_after: 19fffa9cb5df008828a081ee38038791c51251b5
    answered:
      - name: sync
        exit: 0
        said: work/the-sidebar-makes-both already carries every commit on main.
  - step: split
    hand: box 1eeed4143ad0
    hash_before: 30489c13808377aa6d82cde35b443a999802eefc
    hash_after: 30489c13808377aa6d82cde35b443a999802eefc
  - step: children
    hand: the engine
    hash_before: dfdc887ee691bae3046e5aa3437e1a23c2b85ac7
    hash_after: dfdc887ee691bae3046e5aa3437e1a23c2b85ac7
  - step: retro/notes
    hand: box 1eeed4143ad0
    hash_before: 69d9292f129e896e427e69aadce00fa8ec663d88
    hash_after: 69d9292f129e896e427e69aadce00fa8ec663d88
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 1eeed4143ad0
    hash_before: 18e60be12d7a1a5734c27f85d91d2c26dce6e217
    hash_after: 18e60be12d7a1a5734c27f85d91d2c26dce6e217
  - step: retro/cloud
    hand: box 1eeed4143ad0
    hash_before: 96666705d1535dd16aee3843d59002aaf1369c0e
    hash_after: 5f889c7c77c6a54e94af51fa17983effb96d3a10
step: retro/cloud
reason: done
---

# Ask

Two buttons beside the engine's play and stop marks: one makes a vehicle, one makes a stub, each asking for a folder.

The design input [[spec/design_input/a-stub-takes-its-vehicle]] names this group, its proof and what it waits for. The design output [[spec/design_output/vehicle]] carries what stands built.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->
<!-- the form is command -->

./RUNME.sh branch sync

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->
<!-- the form is list -->

- [[spec/tickets/sidebar-makes-both]], on the standard process, which stood minted with the group and closed done

## checked

- the one child is one change over the extension, and a hand reviewed its diff whole at the verdict step
- the child carries every line of the ask: the two buttons, the folder ask, the tests and the design output
- the child waits on nothing, and the group names the stub group under depends_on

# children

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

- sidebar-makes-both: two action buttons in the section `engine`, a folder ask on the editor door, three tests touched, one chapter
- the group: sync, split, the derived children step, and this retro
- both tickets opened from draft, because the take left them at draft and the pull waited

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the design output named every module, so the approach took one read and the review passed first time
- the tests went red for the reason expected, and one function on the sidebar turned them green
- the voice checks at the hand-back caught long sentences before a reviewer read them

### badly

<!-- what did not, each with its moment in the log or the transcript -->
<!-- the form is list -->

- the first pull answered wait, because both tickets stood draft after the take
- the lint over the tree failed on the ask, whose done_when line held angle brackets outside a code span
- the check failed once on the tree test, which counted five drawn controls
- the check failed once for want of the server, and once when a shell redirection met the write rule
- the formatter rewrites lines from main in the editor door, so a whole-file format widened the diff

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the branch verb that cuts a group opens it where its ask stands written, in the work verbs
- the mint puts the commands of a done_when line in code spans, in the ticket placeholder
- the extension design output names the tree test beside the schema, so a new widget updates both
- the check verb starts the server it asks for, or names the server step as skipped where none runs
- the working guidance names the redirection rule beside the script folder line

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The sidebar needs no new drawing for a new button, and the design output says so. The whole cost of the ask sat in one question: how a press picks a folder before it runs. Reading `asks` off the schema by key kept the page and the message untouched.

The formatter and the committed files disagree on a few long lines, and a hand writing through the shell meets that at once. The rule holding the shell to no redirection came up only once the server ran. So the first check ran outside the cage, and the second inside it.

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- nothing: every tool installed at the take, the proxy refused no host, and the platform refused no right
- an editor, so the two buttons stand proven through the fake door and the declaration alone

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- no trunk guard, and no conflict at sync
- no cap on an answer
- the write rule on shell redirection, once the server ran, at the check before tests-green
- the tree test counting five drawn controls, which failed on the box until it counted seven
- the check asking for the server, which failed on the box until the serve verb ran

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked, and no ticket minted without a group
- the marks on the two buttons are placeholders, and the owner picks the final ones in the schema
- a press in a real window waits for a desk with the editor, as the retro says

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
