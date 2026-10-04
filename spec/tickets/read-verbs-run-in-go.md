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
group: the-verbs-run-in-go
enabled_by: migration.phase11
cloud: true
depends_on: ["quack-holds-a-verb-registry"]
step: retro/cloud
record:
  - step: sync
    hand: box af8a15ff4571 · claude-code-remote
    hash_before: 2c31204387af1d0de43764a0bedef6501861515b
    hash_after: 41a72f76d018d51937f54abd5db61cd328ffe4b1
  - step: sync
    hand: box 10fabe1f5ba9 · claude-code-remote
    hash_before: 41a72f76d018d51937f54abd5db61cd328ffe4b1
  - step: sync
    hand: box 10fabe1f5ba9 · claude-code-remote
    hash_before: 607df136701fa1519d4685e54faae314389127e0
    hash_after: 607df136701fa1519d4685e54faae314389127e0
    answered:
      - name: sync
        exit: 0
        said: work/read-verbs-run-in-go already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 10fabe1f5ba9 · claude-code-remote
    hash_before: 16087f7c64209614ed51277539d475783e370f20
    hash_after: 16087f7c64209614ed51277539d475783e370f20
    inputs:
      - name: ask
        hash: 455feaeb9a8bedca
        size: 317
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 9d175a1f909a9d686b2288485e7d693443b40367
    hash_after: 9d175a1f909a9d686b2288485e7d693443b40367
  - step: accept
    hand: box 10fabe1f5ba9 · claude-code-remote
    hash_before: 2dc04aeeac30effa98b0c8ddee0bd2587cd40225
    hash_after: cb2e5e0d3fbc3a789e412180ae03a4108921f7e0
    answered:
      - name: sync/sync
        exit: 0
        said: work/read-verbs-run-in-go took 2 commit(s) from main.
    inputs:
      - name: ask
        hash: 455feaeb9a8bedca
        size: 317
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: accept
    hand: box 10fabe1f5ba9 · claude-code-remote
    hash_before: 64dddeb8cf484bb0df7f9b0f1493fe882ff192db
    hash_after: 64dddeb8cf484bb0df7f9b0f1493fe882ff192db
    answered:
      - name: sync/sync
        exit: 0
        said: work/read-verbs-run-in-go already carries every commit on main.
    inputs:
      - name: ask
        hash: 455feaeb9a8bedca
        size: 317
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 10fabe1f5ba9 · claude-code-remote
    hash_before: bf04e028d3e3728fd03a938dc3d549456286ce56
    hash_after: bf04e028d3e3728fd03a938dc3d549456286ce56
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 10fabe1f5ba9 · claude-code-remote
    hash_before: d71d47b895dc88634ef8c7e713601067201a5657
    hash_after: d71d47b895dc88634ef8c7e713601067201a5657
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
---

# Ask

Part of phase 11 of [[spec/design_input/the-migration-runs-in-slices#the-phases]]: the verbs index, links, lint, notes, find and log leave Node.

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

- [[spec/tickets/read-verbs-port-to-go]], standard
- [[spec/tickets/read-verbs-callers-fix]], trivial
- [[spec/tickets/read-verbs-importer-test]], trivial
- [[spec/tickets/read-verbs-say-doc]], trivial
- [[spec/tickets/read-verbs-lint-drift]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every child is small enough to review whole: the port carries the six verbs, and each gate point stands as a one-file fix
- the children add up to the goal: the port moves the six verbs and deletes their JavaScript, and the importer test decides no module stands orphaned
- no child waits on another: the gate points all follow the port, which their parent field names

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

- read-verbs-lint-drift: a contract case holds the Go lint and the check lint to one list of findings, and the log verb names its span seconds
- read-verbs-say-doc: the say action names the Go log verb
- read-verbs-port-to-go: implement and tests-green handed back over the port an earlier box wrote
- index-why-prints-text: index why prints the tree as text, off the accept review
- lint-row-keeps-floor: the lint log row keeps the log.level floor, off the accept review

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- a reviewer helper read the whole diff against the JavaScript, and found two drifts the port tests never asked about
- each fix met a red case before its code, so each commit landed green on the first check

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 15:24 branch take with the work prefix doubled the prefix, and answered no free todo
- 15:24 the first shell call named no ticket, and the door refused it
- 15:24 the branch take tool answered with no handler
- 15:27 the plan grace ran out, and ToolSearch stood refused until the plan answered
- 15:29 a stop on a running check fell, since a cloud turn ending stops the container
- 15:33 the commit door refused verb_log.go with no test beside it
- 15:34 a piped gate before the commit verb met LandingFollowsItsGate
- 15:35 the tests evidence failed twice on raw runner output, before branch test
- 15:37 a sed write into a scratch file met ShellWritesNothing
- 15:46 a helper started in the foreground met a refusal

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the take prefix: branch take in src/quack names the bare group in its usage, or strips a work prefix
- the take tool: the level0 plugin answers index_branch_take, or leaves it unregistered
- the stop and the helpers: spec/guidance/cloud/cloud names waiting on a helper inside the turn
- the tests evidence: the do step in spec/processes/trivial names branch test as its tests command
- the rest: the doors named the fix in their own refusal, and held

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The port stood nearly whole on arrival, so the run spent itself on proving it rather than writing it. The JavaScript lint and the Go lint now stand side by side, and the contract case is the one thing holding them together until the check port lands. The review helper paid for itself: both of its points were real drifts no test had asked about.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact stands in one place: the lines name tickets and files, and repeat no rule
- every number the change adds carries a name: the span seconds and the log floor key stand named once
- every header says what its file is for: the new contract case says it holds both lints to one list
- the chapter carries the run errors with their times, and no owner prompt reached this run
- the chapter says the role, and names no box

## cloud

true

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
