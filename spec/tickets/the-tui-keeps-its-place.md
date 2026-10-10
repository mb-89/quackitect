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
step: children
record:
  - step: sync
    hand: box b0a22705166b · claude-code-remote · helper-4
    hash_before: baaeb56cc53419c155d289b7559af0e67f6abdf9
    hash_after: baaeb56cc53419c155d289b7559af0e67f6abdf9
    answered:
      - name: sync
        exit: 0
        said: work/the-tui-keeps-its-place already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box b0a22705166b · claude-code-remote · helper-4
    hash_before: 9fae3801986fde4f7e35df5b3796511714236bbc
    hash_after: 9fae3801986fde4f7e35df5b3796511714236bbc
    inputs:
      - name: ask
        hash: cc970d23e318d3cb
        size: 346
    def: 19b6849b1f151cd5
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->
goal: the TUI keeps a person's place across a redraw. An open cell edit, the cursor under a filter, the column sort and the registry selection stand where the person left them. The src/q store and scheduler findings of the same review stand fixed, or close naming why the fix costs more than it buys. Each fix carries a case that fails before it.

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

- [[spec/tickets/open-edits-outlive-redraws]], standard
- [[spec/tickets/a-filter-keeps-the-cursor]], standard
- [[spec/tickets/a-redraw-keeps-the-sort]], standard
- [[spec/tickets/a-refetch-keeps-the-selection]], standard
- [[spec/tickets/commits-read-moves-locked]], standard
- [[spec/tickets/unwatched-providers-meet-a-caller]], standard, routed onto one decide leaf

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child holds one finding and one to three files, small enough to review whole
- the six children hold the six findings of the list, and nothing of the goal stands outside them
- no child waits on another: the three tree children each touch Carry, and land one after another on one branch
- the three tree children read nothing from each other past the shared Carry function
- the group diff stays inside one review

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

<!-- how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks -->

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

Owner-approved group, from the review fleet's confirmed findings, at `groups/the-tui-keeps-its-place.md` on the fleet's review branch.

The route: `branch open` pushes `main` to mark the group cloud, and a box pushes no `main`. So `work/the-tui-keeps-its-place` stands cut off `main` by hand, as pull requests `#138` and `#140` cut theirs, and the group carries no `cloud` mark.

The mint verb refuses a group with no child, so `mint_note` wrote this ticket first and `ticket update --over` copied the group route in.
