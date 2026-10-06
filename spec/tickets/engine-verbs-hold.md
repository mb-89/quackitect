---
kind: [[ticket]]
state: open
step: children
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
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 590a6a06f568a18650b52557879cacc6491b7aeb
  - step: sync
    hand: box 57a5a484096e · claude-code-remote
    hash_before: ef294dd556428914875cf733e7ff3004a2b0ba4e
    hash_after: 8316b1b9e5d706ea51dcb87b6523ba48048345cc
    answered:
      - name: sync
        exit: 0
        said: work/engine-verbs-hold took 2 commit(s) from main.
    def: 8a9850a81227554b
  - step: split
    hand: box 57a5a484096e · claude-code-remote
    hash_before: ea5d1445cca91b590f5096ce1ffb609c9a220e36
    hash_after: ea5d1445cca91b590f5096ce1ffb609c9a220e36
    inputs:
      - name: ask
        hash: c8bde0276841d2e6
        size: 661
    def: 19b6849b1f151cd5
---

# Ask

The engine's verbs carry a box from its first call to a merged pull request with no hand reaching past them. A ticket, a key, a fix group and a pull request each land through a verb, a pull hands out the work its plan names, and a fix on main reaches every running box. Every index tool a box sees answers, every path a note names stands, each helper and each default stands once, no commit carries a trailer naming a model, and a bare `./RUNME.sh` exits clean.

Boxes now clone front matter with sed, open drafts by hand, push branches with no pull request, count goldens again after each note edit, and fall back to the shell where a listed tool stays silent.

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

[[spec/tickets/accepts-reads-away-modules]] trivial
[[spec/tickets/attribution-trailer-meets-the-door]] trivial
[[spec/tickets/bare-runme-exits-clean]] standard
[[spec/tickets/box-opens-its-pr]] trivial
[[spec/tickets/branch-done-opens-the-pr]] standard
[[spec/tickets/collect-truthy-joins-yaml]] trivial
[[spec/tickets/commit-door-refuses-model-trailers]] standard
[[spec/tickets/copy-rule-drops-twin-word]] trivial
[[spec/tickets/dispatch-mints-fix-groups-open]] standard
[[spec/tickets/dispatch-skips-merged-done-branches]] trivial
[[spec/tickets/dispatch-update-collides]] trivial
[[spec/tickets/every-index-tool-answers]] standard
[[spec/tickets/every-named-path-resolves]] standard
[[spec/tickets/golden-readers-read-joined-paths]] trivial
[[spec/tickets/helpers-keep-the-plan-ticket]] trivial
[[spec/tickets/js-stale-reads-settings-default]] trivial
[[spec/tickets/model-trailer-refuses-in-place]] trivial
[[spec/tickets/one-send-door]] trivial
[[spec/tickets/pull-hands-the-working-ticket]] standard
[[spec/tickets/real-catalog-reads-accepts]] trivial
[[spec/tickets/running-work-takes-main-fixes]] standard
[[spec/tickets/shared-helpers-stand-once]] standard
[[spec/tickets/size-golden-drops-line-counts]] standard
[[spec/tickets/stale-span-reads-schema-unset]] trivial
[[spec/tickets/tool-call-hook-answers]] trivial
[[spec/tickets/tool-list-keeps-unreadable-actions]] trivial
[[spec/tickets/vehicle-truthy-joins-yaml]] trivial
[[spec/tickets/verbs-mint-tickets-and-keys]] standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Every child stands closed, each small enough for one review: a standard child carried one change with its tests, and a trivial child one fix a gate or a retro named.
The children add up to the ask: verbs-mint-tickets-and-keys lands a ticket and a key, dispatch-mints-fix-groups-open a fix group, branch-done-opens-the-pr and box-opens-its-pr the pull request, pull-hands-the-working-ticket the work a plan names, running-work-takes-main-fixes a fix on main reaching each box, every-index-tool-answers the tools, every-named-path-resolves the paths, shared-helpers-stand-once each helper and default, commit-door-refuses-model-trailers the trailer, and bare-runme-exits-clean the bare call.
No child waits on another, since each stands closed, and each fix child landed with the parent change it pointed at.
Each child read its siblings through the branch it landed on, in the order the queue handed them, and the sync took main in last.
The diff stays one review: the folds the copy rule named landed under shared-helpers-stand-once, so no further split stands.

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
