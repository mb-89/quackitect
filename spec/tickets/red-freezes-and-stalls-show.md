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
step: retro/cloud
record:
  - step: sync
    hand: box cc2a5a1dc9c0 · claude-code-remote
    hash_before: 210710e158d1bd945b3c4a5eb0777c0478d8efb0
    session: cse_01HuedT1uwwN1DNnMT5J3koj
  - step: sync
    hand: box cc2a5a1dc9c0 · claude-code-remote
    hash_before: a2a91c4847141a0f6184692e892a5a9ce104cd83
    hash_after: f066d7b4421d00821f04f293aaf4f6094dcf1564
    answered:
      - name: sync
        exit: 0
        said: work/red-freezes-and-stalls-show already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box cc2a5a1dc9c0 · claude-code-remote
    hash_before: 0b7e8e2eac1d406c67d8c051584770cafe6e597c
    hash_after: 0b7e8e2eac1d406c67d8c051584770cafe6e597c
    inputs:
      - name: ask
        hash: c6e74e775b670b87
        size: 395
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 8b76b17c50654428217570b07df16eb8662b6daf
    hash_after: 8b76b17c50654428217570b07df16eb8662b6daf
  - step: accept
    hand: box cc2a5a1dc9c0 · claude-code-remote
    hash_before: 10b349b7ab212cac5734278343e37cc6c5d1c05b
    hash_after: 10b349b7ab212cac5734278343e37cc6c5d1c05b
    answered:
      - name: sync/sync
        exit: 0
        said: work/red-freezes-and-stalls-show already carries every commit on main.
    inputs:
      - name: ask
        hash: c6e74e775b670b87
        size: 395
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box cc2a5a1dc9c0 · claude-code-remote
    hash_before: d224c3038a85e910b3ed746a75e46092e22140a0
    hash_after: d224c3038a85e910b3ed746a75e46092e22140a0
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box cc2a5a1dc9c0 · claude-code-remote
    hash_before: 96c3d6c70bb1ec2ea1b4acd6ed4727960ac957c0
    hash_after: 96c3d6c70bb1ec2ea1b4acd6ed4727960ac957c0
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: cd64de0d4d23e2c7
        size: 40
    def: e7ed0badf886b5b5
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->

The engine holds a hand to the work it agreed to and shows a hand that stops moving. A red test keeps its meaning from its gate to the accept, with a logged way back for an honest test bug. A box that beats but commits nothing shows up, hands over, and loses its hold. Three clean-room teams built both on their own, and v5 lacks both.

Done when every child closes through the command it names.

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

- [[spec/tickets/red-tests-freeze]], standard
- [[spec/tickets/stalls-read-progress]], standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child touches one engine part, the pull or the branch holds, and each closes as one review
- red-tests-freeze holds the red test half of the goal and stalls-read-progress the stuck box half, so nothing of the goal stands outside them
- neither child waits on the other, so neither names depends_on
- the children read nothing from each other and land in either order, and both stand closed
- the group diff stays inside one review, so no child splits into a group

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

- [[spec/tickets/stalls-read-progress]]: tests-red-3, gate, the change and tests-green, so a live hold past work.progressAfter stalls and past twice it moves
- [[spec/tickets/red-tests-freeze]]: implement/change and tests-green over the code an earlier round landed
- the group: sync with trunk, split, and accept after an independent review
- the exe hook case retries a stub that reads text file busy

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the red cases from tests-red-2 already decided every gate finding, so tests-red-3 passed on a fresh read of the tree
- the freeze from red-tests-freeze caught two moved red files on this run's own hand-back, and the reopen path let both honest moves through

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 22:18 the first branch take met a push refusal, since another box released the branch and pushed in the same minute
- the gate rejected stalls-read-progress twice with the same words before a person step answered it
- the first tests-green hand-back met a gofmt fault in a red test file and three past-tense lines in work.md the design pass left
- the hand-back check failed once on TestGitHooksTakeTheExeWhereItStandsAlone, a text file busy race the solo runs never show
- the review found an old box beating on after a take over, which keeps a taken hold live, and two pass paths that skip the freeze

### improve

<!-- how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks -->
<!-- the form is list -->

- a take that meets a push refusal fetches and retries once by itself: `src/branches/take.go`
- a gate reject repeating the last one word for word reads the red cases before it answers: [[spec/guidance/review/design]]
- the tests-red pass runs gofmt over its red files before it freezes them: `src/pull/pull_frozen.go`
- the stub race stays fixed by the retry in `src/quack/githooks_exe_test.go`
- the beat checks the origin ticket's open take before it pushes, so a box whose hold was taken stops beating: `src/branches/beat.go`
- a red leaf pass through minted findings writes its frozen rows, and a verdict that decides became skips the freeze: `src/pull/pull_writes.go`

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The branch looked contested at the take, so the run checked the hold before working: the earlier box had released it. The rest of the run was steady leaf work. Two of the review's findings come from the design's own wording, so the run left them as they stand and carried the two real ones forward.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact of the change stands in settings.go or the design note, and the tickets point there
- progressAfter takes its number once in settings.go, and the retry count takes a named constant
- the headers of the touched files stand as they were, and say what each file is for
- the badly list carries each error of the run with its time, and no owner prompt came
- the chapter names the box by role alone

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
