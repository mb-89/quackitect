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
    hand: box 742a1c2f7477 · claude-code-remote
    hash_before: 178f0cefca766131029b685bc5008c3952eb6038
    hash_after: d5ac3eb22e851a89c2e877f5e8e93425183476de
  - step: sync
    hand: box 742a1c2f7477 · claude-code-remote
    hash_before: c2600a8bb323c6154947b08335b5f55ea16d009a
    hash_after: c2600a8bb323c6154947b08335b5f55ea16d009a
    answered:
      - name: sync
        exit: 0
        said: work/the-drawing-draws-a-route already carries every commit on main.
  - step: split
    hand: box 742a1c2f7477 · claude-code-remote
    hash_before: f7c81a82e44973baa4a64420e387a08b13823ce2
    hash_after: 29d8afa1a94ae4e991aff2e155a8807a671e02b8
  - step: children
    hand: box 711806cd7e87 · claude-code-remote
    hash_before: 5b0cc1e761a877f955049b43e70e564897591435
  - step: children
    hand: the engine
    hash_before: 5cb57b54363da9fd561c488c1447f4ce58159e06
    hash_after: 5cb57b54363da9fd561c488c1447f4ce58159e06
  - step: retro/notes
    hand: box 711806cd7e87 · claude-code-remote
    hash_before: 34f91b46cdc24861f02bd7091e0d50abdfb17c66
    hash_after: 34f91b46cdc24861f02bd7091e0d50abdfb17c66
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 711806cd7e87 · claude-code-remote
    hash_before: 7a6c89f36d2a406c881e459862a271d6758f4ed1
    hash_after: 7a6c89f36d2a406c881e459862a271d6758f4ed1
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->
One web page draws a ticket's route from the graph, and speaks to its host through messages alone. Install bundles it and resolves a browser, and the check drives the page through a fake host in that browser. The plan stands in [[spec/design_input/the-editor-draws-the-ticket#the-drawing-draws-a-route]]. It starts beside the engine group, and the child for clicks waits on the engine's node places.

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

- [[spec/tickets/the-drawing-bundles]], trivial
- [[spec/tickets/the-drawing-draws-read-only]], trivial
- [[spec/tickets/the-drawing-speaks-edits]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- each child is one row of the design input's table, and a reader holds it whole
- the bundle, the read-only page and the messages add up to the goal, and the design input carries the approach
- the page names the bundle under `depends_on`, and the messages name the engine group, which carries the node places

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

- [[spec/tickets/the-drawing-speaks-edits]]: the page posts `jump`, `take`, `handback` and `edit`, and refuses an edit behind the pointer
- the emitter marks each node `ticket route` holds fixed as `reached`

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- the edits child ran whole on the box, because the engine group landed its node places and `ticket route` first
- the browser cases passed at once: the page child's fake host took the new messages unchanged
- each edit test checks its answer against `aheadOnly`, so the page and the verb read one rule

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- the first commit came back refused: `layout.js` changed with no test beside it
- the first check exited 1 on a missing button `type`, past tense and a digit word in the design note
- the first hand-back came back refused on two checklist lines past the word cap
- a second `--pass` went to `retro/write` with no evidence written, and the door refused it
- an edit test fed JSON as frontmatter, and the reader parsed no steps out of it

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- [[spec/guidance/code/testing]] rule five already names the test door, so the hand reads it before staging
- a hand runs `./RUNME.sh check` before the commit verb, which catches the lint findings first
- a hand hands back one leaf a call, and reads the answer before the next

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The graph carried no route fields and no hold, so the page could not build the route `ticket route` takes out of it alone. The `graph` message took `steps` and `held` in place of a wider emitter, and the emitter took `reached` alone, since the refusal rule belongs to the engine. Adding a step, and picking a hand, a condition or a fail edge, stay out until the desk trial decides how far the drawing edits.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the protocol stands in [[spec/design_output/drawing]] alone, and the ticket's says points at it
- the change adds no number a note repeats
- the new file `edit.js` opens on a header saying what it holds, and counts nothing

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

The box releases the group at the children step, with two of three children closed:

| child | stands |
|---|---|
| [[spec/tickets/the-drawing-bundles]] | closed: install bundles the drawing into `.se/.runtime/drawing` and resolves a browser |
| [[spec/tickets/the-drawing-draws-read-only]] | closed: the page draws a route, and a fake host drives it in the check |
| [[spec/tickets/the-drawing-speaks-edits]] | open at `do`, waiting on `the-ticket-answers-the-editor` |

The engine group's branch carries no child yet, so no node place stands for a jump to read. The next box takes this group once that group lands, works the edits child, then runs the retro. [[spec/design_output/drawing]] owns the protocol the edits child extends.
