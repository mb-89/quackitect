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
urgent: true
process: [[spec/processes/group]]
process_hash: 3c35c048932fd579
step: children
record:
  - step: sync
    hand: box fa49097ce66c · claude-code-remote
    hash_before: c09f7d6b59b03a07bef340db575ad54235c99398
  - step: sync
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 9f8eaf16be55eb3c26138d03d43e72b056b6d826
    hash_after: 9f8eaf16be55eb3c26138d03d43e72b056b6d826
    answered:
      - name: sync
        exit: 0
        said: work/the-bridge-keeps-transport already carries every commit on main.
  - step: split
    hand: box fa49097ce66c · claude-code-remote
    hash_before: eece86491dd64d1b9e71bf59dfcd2f041561440f
    hash_after: eece86491dd64d1b9e71bf59dfcd2f041561440f
---

# Ask

The session's own machinery holds its state and says when it falls. The retro
found the turn reopening after a standing stop. The canary comes due on every
call. The answer door refuses the work that answers it. Tools answer nothing
after a restart, and the bridge dies unnoticed. Each ticket here fixes one of
those, and the engine takes the work the bridge does past transport.

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

- [[spec/tickets/a-standing-stop-ends-turns]], standard
- [[spec/tickets/the-canary-pays-once]], standard
- [[spec/tickets/the-canary-survives-a-restart]], trivial
- [[spec/tickets/the-answer-door-reads-chat]], standard
- [[spec/tickets/the-session-file-proves-itself]], standard
- [[spec/tickets/the-session-says-its-cage]], trivial
- [[spec/tickets/the-bridgehead-needs-no-shell]], trivial
- [[spec/tickets/the-cloud-setup-installs]], trivial
- [[spec/tickets/the-check-starts-the-server]], trivial
- [[spec/tickets/the-server-holds-its-socket]], trivial
- [[spec/tickets/the-bridge-says-it-falls]], standard
- [[spec/tickets/the-doctor-probes-every-hook]], standard
- [[spec/tickets/the-tools-answer-after-restart]], standard
- [[spec/tickets/an-engine-takes-bridge-work]], standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every child carries one ask, and each one reviews whole under its own verdict
- the ask names a fault a line, and a child answers each one
- no child waits on another, so `depends_on` stands empty on every one

# children

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

<!-- what did not, each with its moment in the log or the transcript -->

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
