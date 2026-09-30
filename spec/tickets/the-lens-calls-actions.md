---
kind: [[ticket]]
state: open
steps:
  - name: design
    steps:
      - name: owner-read
        does: reads the ask a handover carries, before any draft
        by: person
        when: handed
        input: ask
        evidence:
          - name: read
            form: verdict
            says: pass where the ask says what the owner said, or fail with the owner's words
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it"]
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: tests
            form: list
            says: every test the change adds, one a line, as a file and a test name
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
          - name: size
            form: list
            says: every file the approach touches, one a line
      - name: tests-red
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft
        checklist: ["every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides", "every door the tests reach has a fake"]
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: red
            form: list
            says: every test file standing red until tests-green closes, one a line, which the check leaves out
          - name: seen
            form: text
            says: what you see, and what surprises you
  - name: gate
    gate: does the approach answer the ask, and does a red test decide every done_when line
    does: reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points
    not: design/draft
    tags: ["review"]
    input: ["design/draft", "design/tests-red"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    steps:
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: design/tests-red
        to: retro
        evidence:
          - name: tests
            form: command
            expects: green
            says: the same tests pass
          - name: check
            form: command
            expects: 0
            says: the check is green on the commit
          - name: says
            form: text
            says: what changes and why, for a reader who was not there
  - name: accept
    gate: does the whole work answer the ask, and does every command of the route pass
    final: true
    when: backlog
    does: reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points
    not: implement/change
    tags: ["review", "accept"]
    input: ["ask", "implement"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: view
    does: reads the change in the view the ask names
    by: person
    when: view
    on_fail: implement
    to: retro
    input: ["ask", "implement/tests-green"]
    evidence:
      - name: seen
        form: verdict
        says: pass where the view shows the ask's number, or fail with what it shows
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: sidebar-switches-over
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d88dc33717d8 · claude-code-remote
    hash_before: 48909e257bc6bc19ceac1eec9d58d614bc74f86c
    hash_after: 48909e257bc6bc19ceac1eec9d58d614bc74f86c
    inputs:
      - name: ask
        hash: c4aed852cff1f0c8
        size: 636
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d88dc33717d8 · claude-code-remote
    hash_before: 1204befd1a3083b814e23c85850ee3ad59916c5c
    hash_after: 1204befd1a3083b814e23c85850ee3ad59916c5c
    answered:
      - name: tests
        exit: 1
        said: assertion, 5 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: dcb6d88df5f0252a
        size: 4500
    def: 08e16d07b0de477c
  - step: gate
    hand: box d88ef4f8a2d6 · claude-code-remote
    hash_before: 8c345ae48da6f11e258990c46bc30c66e260730c
    hash_after: 8c345ae48da6f11e258990c46bc30c66e260730c
    inputs:
      - name: design/draft
        hash: dcb6d88df5f0252a
        size: 4500
      - name: design/tests-red
        hash: e381fe43c48eb17a
        size: 966
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d88ef4f8a2d6 · claude-code-remote
    hash_before: f44d3700a7b7da8b2a6984460e36507e1ece91ac
    hash_after: f44d3700a7b7da8b2a6984460e36507e1ece91ac
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d88ef4f8a2d6 · claude-code-remote
    hash_before: 2cccc3d1ddd93e5cfe88175814d6eb32fbca1bac
    hash_after: 2cccc3d1ddd93e5cfe88175814d6eb32fbca1bac
    answered:
      - name: tests
        exit: 0
        said: green, 4 test(s) pass in 1 file(s); green, src/modules/verbs passes; green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/the-lens-calls-actions.md:367:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: design/tests-red
        hash: e381fe43c48eb17a
        size: 966
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    hand: box d88ef4f8a2d6 · claude-code-remote
    hash_before: 1aec9f974ca3d14355b26d70ac15066551d4d115
    hash_after: 1aec9f974ca3d14355b26d70ac15066551d4d115
    returns: 1
    why: "a person action posted through acts on the live index answers running at once, since acts sets no Prefer wait and the default wait is zero; so a pass pressed reads work before the verb ends, and a refusal never reaches the toast; the fix: acts sends Prefer wait=N, and a wait that runs out answers the handle to read"
  - step: implement/change
    hand: box d88ef4f8a2d6 · claude-code-remote
    hash_before: 6e162009ea5b795f3ae9662ed75fca87b5cabdd2
    hash_after: 6e162009ea5b795f3ae9662ed75fca87b5cabdd2
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

The ticket buttons post `ticket/pull`, `ticket/fill` and `ticket/route` to `/v1/actions`. Pull for me reads `work/yours` and takes its first row. The node spawn in `editor-lens.js` leaves, with `asksVerb` and `runsVerb`.

Today each ticket button spawns `src/scripts/verbs/ticket.js` through node. So a click pays a process start, and skips the index that answers the same verb.

- `git grep -n 'spawn(' src/extension` names no verb spawn
- a case under `test/level0` presses each ticket button over a fake action door, and reads what it posts
- `./RUNME.sh check` exits 0

view: a ticket's buttons, a pass pressed on a leaf

from: none

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->

<!-- the form is verdict -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The door's two verb seams give way to one action seam over the index door.

- `src/extension/editor-index.js`: `indexDoor` gains `acts(name, input)`. It posts to `/v1/actions/<name>` and answers the shape `answerOf` in `lib/lens.js` reads. A 200 answers `{code: 0, out: result}`. A 422 answers `{code: 1, err: detail}`, since the problem's detail carries the verb's output. No index answers `{code: 1, err}` naming `./RUNME.sh index standing`.
- `src/extension/lib/lens.js`: a new `actionOf(argv)` turns the words `argvOf`, `fillArgvOf` and `routeArgvOf` answer into the action `ticket/<verb>` and the input `{args, person: true}`. `took` and `saved` post through `door.index.acts`.
- `src/extension/lib/route-host.js`: `routes` posts the same way.
- `src/extension/sidebar.js`: `pullsNext` reads `work/yours` through `door.index.values`, takes its first row, and hands it to the lens. `counted` reads the value its counts line names through `door.index.values`.
- `src/extension/editor-lens.js`: `asksVerb`, `runsVerb`, `ranOf`, `personEnv`'s caller and the `spawn` import leave. The progress toast wraps `acts` in `editor.js`.

The index runs the node module under its own environment, and an agent's session may have started it. So a person's click would read as an agent's hand in `handOf` in `src/scripts/pull-hand-of.js`. `Words` in `src/modules/verbs/verbs.go` gains `person`. `Topic` then hands the node module a request whose args carry the words and that mark. `nodeAccept` in `src/quack/twins.go` runs such a request with the harness variables taken out, as `personEnv` does today.

Weighed: keeping `runsVerb` as the seam name spares the lens's callers a change. But the name would then lie about what it does, and the ask names both seams leaving.

Assumed: with no index standing, a ticket button refuses with a toast naming the verb that starts it. The extension starts no index, since the ask forbids a verb spawn.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/extension/editor-lens.js lensDoor asksVerb and runsVerb, which leave
- src/extension/editor-lens.js ranOf, which leaves with its spawn
- src/extension/editor-index.js indexDoor, which gains acts
- src/extension/lib/lens.js ticketLensOf took and saved
- src/extension/lib/route-host.js routeHostOf routes
- src/extension/sidebar.js pullsNext and counted
- src/modules/verbs/verbs.go Topic and Words
- src/quack/twins.go nodeAccept and wordsOf
- test/level0/lens.test.js doorOf, whose fake holds runsVerb
- test/level0/route-host.test.js, whose fake holds runsVerb
- test/level0/save-fills.test.js, whose fake holds runsVerb
- test/level0/sidebar-work.test.js doorOf, whose fake holds asksVerb and runsVerb
- test/level0/sidebar-views.test.js, whose fake holds asksVerb

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/lens-actions.test.js each ticket button posts its action: pass, fail, drop, take and back post ticket/pull with the words and person
- test/level0/lens-actions.test.js a save posts ticket/fill, and a route edit posts ticket/route
- test/level0/lens-actions.test.js a refusal reads its word off the 422 detail
- test/level0/lens-actions.test.js pull for me takes the first row of work/yours
- test/level0/lens-actions.test.js no verb spawn stands in the extension: git grep for spawn( over src/extension names none
- src/quack/twins_test.go TestAPersonRunCarriesNoHarness: a request marked person runs with no harness variable
- src/modules/verbs/verbs_test.go TestAVerbActionCarriesThePersonMark: the action hands the node module the words and the mark

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/extension/editor-index.js
- src/extension/editor-lens.js
- src/extension/editor.js
- src/extension/lib/lens.js
- src/extension/lib/route-host.js
- src/extension/sidebar.js
- src/modules/verbs/verbs.go
- src/modules/verbs/verbs_test.go
- src/quack/twins.go
- src/quack/twins_test.go
- test/level0/lens-actions.test.js
- test/level0/lens.test.js
- test/level0/route-host.test.js
- test/level0/save-fills.test.js
- test/level0/sidebar-work.test.js
- test/level0/sidebar-views.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every name stands opened on this branch: indexDoor, lensDoor, ranOf, ticketLensOf, routes, pullsNext, counted, personEnv, answerOf, Topic, Words, nodeAccept, wordsOf, handOf and the actions route in src/index/actions.go
- git grep for asksVerb, runsVerb, index.calls and ranOf names every caller above
- the spawn line meets the grep case in lens-actions.test.js, the buttons line meets its button cases, and the check line meets ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/lens-actions.test.js src/modules/verbs/person_test.go src/quack/person_run_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/lens-actions.test.js
- src/modules/verbs/person_test.go
- src/quack/person_run_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every case fails on its own assertion. The lens cases catch the throw a missing seam raises, then read what the fake index door recorded, so each fails on the post it wants. The Go cases stand in files of their own, in place of twins_test.go and verbs_test.go. So the red list leaves no standing case out of the check. The node module refuses a map of words today, which the person case reads as its failure.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the spawn line meets the grep case, the buttons line meets the button, save, route, refusal and pull cases, and the check line meets ./RUNME.sh check
- the index door is a fake recording each post, the disk is fakeDisk, and the node module runs a program the case writes under a temporary root

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass
- the approach answers the ask: every ticket button posts ticket/pull, ticket/fill or ticket/route through one acts seam, pull for me reads work/yours, and the spawn in editor-lens.js leaves
- each done_when line meets a red case: the spawn grep and the button cases in test/level0/lens-actions.test.js, and the check at tests-green
- fix in place: counted in src/extension/sidebar.js reads the index since the-sidebar-reads-v1, so that item of the approach stands done
- fix in place: the fake index in lens-actions.test.js answers config/spec/config/level0.schema.json, which orderedOf in test/level0/v1-index.js builds, or the sidebar finds no work.pull entry
- fix in place: acts in src/extension/editor-index.js builds on the asks helper beside calls, so the door holds one fetch path

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/extension src/modules/verbs src/quack/twins.go test/contract/editor-index.test.js test/contract/extension-spawns-no-verb.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the fix touches editor-index.js and its contract case alone, both inside the size
- the real door meets a real server in test/contract/editor-index.test.js, which reads the Prefer wait, the output and the refusal
- ACT_WAIT links the design section on a caller setting its wait
- the wait stands once, as ACT_WAIT in src/extension/editor-index.js

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/lens-actions.test.js src/modules/verbs/person_test.go src/quack/person_run_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Every ticket button reaches its verb through the index. The lens, the save fill and the route edit post ticket/pull, ticket/fill and ticket/route to /v1/actions through acts on the index door, which answers a run as the old spawn did: the output on a 200, and the problem detail, which carries the verb output, on a refusal. Where no index stands, acts answers a refusal naming ./RUNME.sh index standing. Each post carries the person mark. The verbs module hands the node module the words and that mark, and the node module then runs the verb with the harness variables taken out, so a person click reads as a person hand in the pull whoever started the index. Pull for me takes the first row of work/yours. The spawn, asksVerb and runsVerb leave editor-lens.js, and the progress toast wraps acts in editor.js. The route host gains took for a message on a path, which the route case drives.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change stays within the size the gate weighed, plus route-host took and the spawn grep case under test/contract
- every case builds its index door with acts, and the real door meets a real server in test/contract/editor-index.test.js
- each new function, constant and field links spec/tickets/the-lens-calls-actions
- the harness names stand in HARNESS in src/extension/lib/lens.js, and the Go copy names that owner beside it

# accept

<!-- reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# view

<!-- reads the change in the view the ask names -->

## seen

<!-- pass where the view shows the ask's number, or fail with what it shows -->
<!-- the form is verdict -->

fail
- a person action posted through acts on the live index answers running at once, since acts sets no Prefer wait and the default wait is zero
- so a pass pressed reads work before the verb ends, and a refusal never reaches the toast
- the fix: acts sends Prefer wait=N, and a wait that runs out answers the handle to read

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The grep case drives the real git, so it stands under `test/contract`. It lands at tests-green as `test/contract/extension-spawns-no-verb.test.js`, once no spawn stands.
