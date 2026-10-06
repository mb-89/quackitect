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
step: children
record:
  - step: sync
    hand: box b4c8cb96d125 · claude-code-remote
    hash_before: 2f1b5f46b1ad7759fbd03300e960a9f30cc081f3
    hash_after: 472620917c08040ef259afc945b2aa41320593bf
  - step: sync
    hand: box b4c8cb96d125 · claude-code-remote
    hash_before: a47eec3f025f60595a652abb07701ac1e0bbb5d9
    hash_after: a47eec3f025f60595a652abb07701ac1e0bbb5d9
    answered:
      - name: sync
        exit: 0
        said: work/tests-meet-the-doors-once already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box b4c8cb96d125 · claude-code-remote
    hash_before: cf0671a1471b15bcbf52a1f25b0b4af04650e84e
    hash_after: d0a6d0935cc30439058b6d35474c5f000d795048
    inputs:
      - name: ask
        hash: 75adcafc745ca0d5
        size: 910
    def: cb8f90bc86fc7d39
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->
Every door (disk, git, a spawned process, the clock, the network, the index) meets one test against the real thing, and every other test runs against that door's fake. A fixture builds once and is shared. A module inside the doors reads the index, computes, and writes the index, so it tests alone without the real index and without the other modules. A module holds no state of its own, and state stands as a named exception.

Done when the lease flake and the two cold-box contract waits run on a fake clock or on readiness; an audit lists every test touching a real door, keeps one door test per door plus its contract against the fake, moves the rest onto fakes, and merges fixtures built more than once; `spec/guidance/code/testing` carries these rules, with a guard the check runs where a rule is mechanical; and `./RUNME.sh check` stands green, with its time measured before and after in the Discussion.

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

- [[spec/tickets/lease-waits-meet-a-fake-clock]], standard, closed
- [[spec/tickets/alarm-ticks-await-the-beat]], a gate point, closed
- [[spec/tickets/hang-guard-under-suite-timer]], a gate point, closed
- [[spec/tickets/start-fault-names-its-span]], a gate point, closed
- [[spec/tickets/io-case-red-before-green]], a gate point, closed
- [[spec/tickets/each-door-meets-one-test]], standard
- [[spec/tickets/the-testing-rules-name-the-doors]], standard, waits for the audit

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child reviews whole: the flake fix, the audit, and the guidance with its guard, and the audit names a child for any refactor past one review
- the children add up to the goal: the waits, the audit with its fixtures and pure modules, the rules with the guard, and the check measured
- the guidance child names the audit under depends_on, because the guard reads the audit's list of door tests

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
