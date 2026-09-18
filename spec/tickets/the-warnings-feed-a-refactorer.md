---
kind: [[ticket]]
state: open
urgency: now
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
        checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every number the change adds carries a name in one place, and a copy a technical reason forces says so beside it", "every header the change writes says what its file is for, and counts nothing"]
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
process_hash: 3c35c048932fd579
step: retro/cloud
record:
  - step: sync
    hand: box a5e189c39e1d · claude-code-remote
    hash_before: 8da7e3bf8fb26d2e2159dd2529269e8b07af57a1
  - step: sync
    hand: box dd2a59294365 · claude-code-remote
    hash_before: ca14d3ebef6ad6d884d1dc93144acbcf239c951f
    hash_after: ca14d3ebef6ad6d884d1dc93144acbcf239c951f
    answered:
      - name: sync
        exit: 0
        said: work/the-warnings-feed-a-refactorer already carries every commit on main.
  - step: split
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 861c27e54700ee4201fc9a2aa4edd8ad1836dffe
    hash_after: 861c27e54700ee4201fc9a2aa4edd8ad1836dffe
  - step: children
    hand: the engine
    hash_before: 3f1eaa05c35efb1d5db546d742107319f3737010
    hash_after: 3f1eaa05c35efb1d5db546d742107319f3737010
  - step: retro/notes
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 117f292ecafa88589d975cfa77c70c2a7ca9935c
    hash_after: 117f292ecafa88589d975cfa77c70c2a7ca9935c
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 3f191e95c85ea5150cb27faf0de841ef024863ea
    hash_after: 3f191e95c85ea5150cb27faf0de841ef024863ea
---

# Ask

A rule a refactoring hand fixes becomes a warning in place of a refusal. One list feeds the problems panel, the hand and the push door. The stop hook spawns the hand past a number, and nothing leaves the box while a warning stands.

[[spec/design_input/the-warnings-feed-a-refactorer]] and [[spec/design_input/the-runtime-files-stand-apart]] carry the asks, and the children below split them.

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

- [[spec/tickets/the-runtime-files-stand-apart]], standard, which splits the private folder
- [[spec/tickets/a-rule-carries-its-side]], standard, which gives each rule its side
- [[spec/tickets/the-hook-spawns-a-refactorer]], standard, which spawns the draining hand
- [[spec/tickets/the-panel-draws-every-file]], standard, which draws every file in the panel
- [[spec/tickets/a-pointer-names-its-heading]], standard, which holds a pointer to a heading
- [[spec/tickets/a-write-meets-its-hash]], standard, which holds a write against its hash
- [[spec/tickets/one-function-answers-the-hand]], standard, which gives the hand rule one owner

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every child is small enough to review whole: each carries a standard route, and a reader reads its diff whole
- the children add up to the goal: the side, the spawn and the panel cover the first ask. The split covers the second
- a child that waits on another names it: the three after the split name it, or the side, under depends_on

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

- [[spec/tickets/the-runtime-files-stand-apart]]: the private folder splits, and every writer names its owner
- [[spec/tickets/the-panel-draws-every-file]]: the server sweeps on its second message, and the panel draws every file
- [[spec/tickets/a-rule-carries-its-side]]: its approach stands, and the list question leaves on a ticket
- [[spec/tickets/the-hook-spawns-a-refactorer]]: its approach stands, and the spawn question leaves on a ticket
- [[spec/tickets/one-function-answers-the-hand]]: its approach stands, and the reach question leaves on a ticket
- `PrivateFolderOwned` joins the rules over two files, and refuses a reader the move leaves behind
- four tickets stand minted outside this group, each carrying a question a person answers

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- every review read the code before it wrote, so each finding named a file and a line
- the runtime split's own verdict caught a live break in the stop hook's hold path
- the tests-red step held its shape on a Go change, because the evidence ran the real tests
- the unblock verb carried each question out whole, so no person step held the branch
- the design notes followed the move in one pass, because a grep over the old names found them

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- the first change commit tracked a built binary, which the verdict caught
- the install sweep minted a second box record, and the hold read the first
- a sibling commit cost one verdict hand its whole reading, at the runtime split's first verdict
- three of four design drafts met a person step, each after two review returns
- the unblock verb wrote a list line past its own cap, twice, and the check turned red on it
- the note's own choice field wants a word the prose door refuses, at the retro's notes step

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- `.gitignore` names the index binary beside the language server's own, so the next build hides
- the install sweep moves a box record in place of minting one, in `src/scripts/install.sh`
- [[spec/tickets/the-verdict-guard-reads-tips]] carries the guard, so a sibling commit costs no reading
- the unblock verb cuts a line to the cap as it copies, in `src/scripts/unblock.js`
- the tense reader takes a choice field's value as a value, in `src/bridge/prose.js`

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The person step is the load-bearing piece of this run, and it reads two ways:

- a design a reader returns twice may want a decision a person owns
- it may want a reader who knows the code better

This box met the second case at least once. The first draft of the side ticket claimed every rule reads error, and two rules already read warning. A reader caught it, and the redraft carried the correction.

So the wall the engine builds at two returns does two jobs. It parks a question a person owns, and it parks a draft a hand could fix with one more pass. Each of the four tickets this run leaves carries a real question, and a draft standing closer than the one before it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every fact stands in one place: the folder names live in one module, and each note points at it
- every number carries a name in one place: the moved names stand in the module. The installer names it beside its copy
- every header says what its file is for: the new module and the new test file each open with one

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
