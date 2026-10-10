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
step: retro/notes
record:
  - step: sync
    hand: box 54da26a4513f · claude-code-remote
    hash_before: 6a8096513ee31671921dfdac6de6cb726765a1a2
    session: cse_01Q7UDWbx2giXnR9StfsDJWS
  - step: sync
    hand: box 54da26a4513f · claude-code-remote
    hash_before: 978e23642af86bccd18ce3c1f32293acf4c02c1a
    hash_after: b534144665e4d91743775aefe6a15a04e7136588
    answered:
      - name: sync
        exit: 0
        said: work/tests-and-ci-hold took 88 commit(s) from main.
    def: 8a9850a81227554b
  - step: split
    hand: box 54da26a4513f · claude-code-remote
    hash_before: f80f283a4d6200b1cae08085d11adfd2ce73a1fd
    hash_after: f80f283a4d6200b1cae08085d11adfd2ce73a1fd
    inputs:
      - name: ask
        hash: 9ee9ce1729d4b9bc
        size: 416
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 234e819a3bd6ecfad00ceb682139564275bd3c98
    hash_after: 234e819a3bd6ecfad00ceb682139564275bd3c98
  - step: accept
    hand: box 54da26a4513f · claude-code-remote
    hash_before: e4d292292e69e85411c82ef14fa6f1b7013f065e
    hash_after: e4d292292e69e85411c82ef14fa6f1b7013f065e
    answered:
      - name: sync/sync
        exit: 0
        said: work/tests-and-ci-hold already carries every commit on main.
    inputs:
      - name: ask
        hash: 9ee9ce1729d4b9bc
        size: 416
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->
goal: A new cloud box starts installed through the old setup path. Origin names live work branches alone. A verb pays the install only where the binary is missing or stale. Each test the review fleet confirmed weak fails where its thing breaks, cleans up, and runs on every box. The CI cache saves the download it names. Biome fetches the asset its arch names. The write door holds every spelling of an in-tree path.

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

- [[spec/tickets/setup-install-path-stands]] trivial
- [[spec/tickets/merged-work-branches-close]] trivial
- [[spec/tickets/runme-installs-when-stale]] standard
- [[spec/tickets/a-killed-door-reads-dead]] trivial
- [[spec/tickets/appearing-stops-on-a-fatal]] trivial
- [[spec/tickets/bus-cap-builds-its-origin]] trivial
- [[spec/tickets/door-tests-hold-their-port]] trivial
- [[spec/tickets/quack-tests-remove-their-folders]] trivial
- [[spec/tickets/the-fake-runner-drops-names]] trivial
- [[spec/tickets/ci-caches-the-runtime-bin]] trivial
- [[spec/tickets/biome-fetches-its-arch]] trivial
- [[spec/tickets/write-door-cleans-its-paths]] trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child is one fix sketch or one verb road, small enough to review whole
- each goal sentence maps to a child: the old setup path, the branch close, the stale install, the six weak tests, the CI cache, the Biome arch and the write door
- no child waits on another, so none names depends_on
- no child reads a sibling, so the land order stands free
- the diff stays one review, so no child splits into a group

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- the old setup path: src/scripts/install.sh hands every argument to the root install, under a case reading the argument count
- origin branches: the close deletes none for the reason its says field gives, and old-groups-leave-origin carries the delete to the owner
- the stale install: RUNME.sh runs install.sh on a bare call, a missing binary or a stale stamp, on stderr
- the weak tests: the session read, the zombie wait, the deferred stop, the held port, the shared TestMain and the fake env each fail where their thing breaks
- the CI cache keys on the Biome pin install.sh carries, over the folder the install writes
- Biome fetches the arm asset on an arm Linux box, and a binary that cannot run is fetched again
- the write door cleans both sides, and a climb out of the root reads as outside
- a fresh binary now skips the want checks, so a want lost after the build returns at the next boot or the next stale stamp

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

<!-- what anybody adds, at any time, on this ticket -->

The order that minted this group leaves main unpushed, and `./RUNME.sh branch open` pushes a marker on main. The box cut `work/tests-and-ci-hold` off main by hand, as `#138` and `#140` did, and the pull request carries the group to main.

The children come off the review list `groups/tests-and-ci-hold.md` on the review fleet's branch, with the owner's two children first. Each low finding's fix sketch stands as its design, so those children take the trivial route. The medium finding changes the verb road in three places, so it takes the standard route.

The close of merged work branches deletes none. Each `work/*` branch on origin carries commits main's history lacks, counted with `git rev-list --count origin/main..origin/work/<name>`:

| branch kind | what the count shows | why it stays |
|---|---|---|
| the old groups, from `the-ticket-answers-the-editor` to `phase7-switch-turns-on` | thousands of commits ahead, and no merge base with main | main's history restarts at a rewrite, so git reads every old commit as unmerged |
| `check-notices-leave-the-cap`, `dead-tests-and-code-leave`, `windows-check-holds` | one commit ahead, the branch's own opening marker | the marker stands outside main |
| `hooks-v1-hold-the-line`, `checks-and-index-read-right`, `tickets-keep-their-chapters`, `edits-and-files-hold` | live groups ahead of main | running boxes hold them |
| `tests-and-ci-hold` | this group | this box holds it |

`./RUNME.sh branch close` deletes a branch git counts merged into main, and it runs on main, where it drops a marker and pushes main. It finds none, and the order forbids a push of main and the delete of a branch carrying an unmerged commit. Deleting the old groups wants a person's call on whether the rewrite carried their work, so this box leaves them standing.
