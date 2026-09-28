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
group: the-cloud-works-its-queue
depends_on: [the-owner-stores-the-token, dispatch-writes-the-bundles, the-skills-start-the-workers, groups-land-through-pull-requests]
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d81be38d5cd0 · claude-code-remote
    hash_before: e1bdc61705fbee1901efe1bdf38ae335f98b4866
    hash_after: e1bdc61705fbee1901efe1bdf38ae335f98b4866
    inputs:
      - name: ask
        hash: d04a808d7057475e
        size: 1320
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 591680bf2c6fc6d6
        size: 13376
      - name: [[spec/tickets/the-owner-stores-the-token]]
        hash: e149bded03171451
        size: 4462
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d81be38d5cd0 · claude-code-remote
    hash_before: 7f340715b0e16c34d4c57ff0761b85d42369a4e9
    hash_after: 7f340715b0e16c34d4c57ff0761b85d42369a4e9
    answered:
      - name: tests
        exit: 1
        said: assertion, 14 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: f12745c23d9b6e33
        size: 4376
    def: 08e16d07b0de477c
  - step: gate
    hand: box d81be38d5cd0 · claude-code-remote · helper-4
    hash_before: 4c8c24b62b57bfb3b8f638558603dba5ddf2f7f0
    hash_after: 4c8c24b62b57bfb3b8f638558603dba5ddf2f7f0
    inputs:
      - name: design/draft
        hash: f12745c23d9b6e33
        size: 4376
      - name: design/tests-red
        hash: 35d1422fb21984cf
        size: 908
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d81be38d5cd0 · claude-code-remote
    hash_before: 6e31066d19d414308703aef2835a7a7bbf10f820
    hash_after: 6e31066d19d414308703aef2835a7a7bbf10f820
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
---

# Ask

A scheduled GitHub Action runs `./RUNME.sh dispatch --json` with no model, per [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]. It fires the work routine's API trigger once per ready group and per stuck hand-over. It reads `ROUTINE_FIRE_URL` and `ROUTINE_FIRE_TOKEN` off the repo secrets, and sends the `anthropic-version` header the fire page names. It opens a GitHub issue for each question in place of a message. The dispatch skill's session starts retire.

Without it every dispatch run spends a model session on work a script does. The hourly routine then counts against the daily cap.

- `.github/workflows/dispatch.yml` runs on a schedule and on a manual start
- a case in `test/contract/dispatch-workflow.test.js` reads both triggers
- a case in `test/level0/dispatch-fire.test.js` fires once per ready group and per stuck hand-over
- that case runs over a fake fetch, and stops at the caps the routines page names
- a case there prints the reason a refused fire gives
- a case there opens one issue per question, and a second run over them opens none
- the write branch's pull request opens on the token the owner names in [[spec/tickets/the-owner-stores-the-token]]
- the dispatch skill starts no session, and says the Action does
- `./RUNME.sh check` exits 0

The view: none.

The source: none.

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

A new door and a firing script carry the Action. The table names each part.

| the part | what it does |
|---|---|
| `src/doors/http.js` | sends one request through the global fetch, and answers the status, the body and the headers |
| `src/doors/fake/http.js` | answers from the routes a test registers, keeps each request under `sent`, and throws on a route it lacks |
| `test/contract/http.test.js` | drives the real door against a local server, and asserts the fake answers the same shape |
| `src/scripts/cli-doors.js` | builds the door once, as `it.http` |
| `src/scripts/dispatch-fire.js` | fires the routine, opens the issues and opens the write branch's pull request |
| `src/scripts/dispatch.js` | takes `--fire`, and answers a promise of the exit code there |
| `.github/workflows/dispatch.yml` | runs the dispatch on a clock and on a manual start |
| `.claude/skills/dispatch/SKILL.md` | starts no session, and names the Action |

The fire reads its secrets off `it.env`, and fills `plan.fire`:

- It sends one POST a ready group, then one a stuck hand-over.
- Each carries the bearer token, the version header the fire page names, and a text naming the branch.
- It stops at the routine cap, the lower of the two caps the routines page names.
- The entries past the cap stand under `left`.
- A refused fire keeps its error message under `refused`.
- A rate refusal stops the run, and names its `Retry-After`.
- It opens one issue a question on `GITHUB_TOKEN`, titled after its ticket.
- An open issue under the label `dispatch-question` carrying that title stops a second one.
- A pushed or standing write branch gets a pull request on `PULL_TOKEN`, where none stands open.
- That pull request then takes auto-merge through the GraphQL mutation.

A refused fire exits 1. Without `--fire` the dispatch stays synchronous and unchanged.

The workflow checks out the whole history on `PULL_TOKEN`. So the write branch's push and its pull request start the check. It sets up node and go as the check does, and sets a git author. It runs `./RUNME.sh dispatch --json --fire`, with the secrets in its env. It holds the issue write permission, and one run waits for the one before it.

I assume the merge method MERGE, and a refused mutation names itself in the plan. The fire text stands as context alone, since the routine's saved prompt runs the work skill.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

`src/scripts/cli.js` verbs.dispatch, which calls dispatch and awaits its answer,`test/level0/dispatch.test.js`, which calls dispatch without the flag,`src/scripts/cli-doors.js` doorsHere, which gains the door every verb takes,`.claude/skills/dispatch/SKILL.md`, which the hourly dispatch routine reads,`.github/workflows/dispatch.yml`, which calls the dispatch with the flag

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

`test/contract/dispatch-workflow.test.js`: the dispatch runs on a schedule and on a manual start,`test/contract/dispatch-workflow.test.js`: the dispatch reads the fire secrets and fires,`test/contract/http.test.js`: the real door answers a status and a body,`test/contract/http.test.js`: the fake answers what the real door answers,`test/level0/dispatch-fire.test.js`: the fire runs once a ready group and once a stuck hand-over,`test/level0/dispatch-fire.test.js`: the fire stops at the routine cap, and the rest stand left,`test/level0/dispatch-fire.test.js`: a refused fire prints the reason its envelope gives,`test/level0/dispatch-fire.test.js`: each question opens one issue, and a second run opens none,`test/level0/dispatch-fire.test.js`: the write branch's pull request opens on PULL_TOKEN with auto-merge,`test/level0/dispatch-fire.test.js`: the dispatch skill starts no session, and names the Action

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

`src/doors/http.js`,`src/doors/fake/http.js`,`test/contract/http.test.js`,`src/scripts/cli-doors.js`,`src/scripts/dispatch.js`,`src/scripts/dispatch-fire.js`,`test/level0/dispatch-fire.test.js`,`test/contract/dispatch-workflow.test.js`,`.github/workflows/dispatch.yml`,`.claude/skills/dispatch/SKILL.md`,`spec/design_output/doors.md`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the dispatch, its writes, the doors root, the command line, the fakes, the check workflow and the fire page stand opened
the callers list names the verb, the tests, the doors root, the skill and the new workflow
every done_when line names its test above, and the check line names the check verb

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/dispatch-fire.test.js test/contract/dispatch-workflow.test.js test/contract/http.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

`test/level0/dispatch-fire.test.js`,`test/contract/dispatch-workflow.test.js`,`test/contract/http.test.js`

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every case fails on its own assertion. A module standing nowhere loads through a guarded import, so its absence reads as an assertion and not a build fault.

The skill's case moves into the contract file beside the workflow. It reads a real file, and a normal test takes the fake doors alone. The fake GitHub in the fire cases keeps the issues and pull requests it opens, so the second run reads what the first one wrote.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line meets a failing case, and the check line waits for tests-green
the fire cases reach the outside through the fake http door alone, and the contract cases drive the real door and a local server

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- No case drives `dispatch --json --fire` through dispatch.js. Fix in implement/change: add one case over the fake http door.
- The routine cap holds per run. Fix in implement/change: the workflow's cron fires hourly, and no faster.
- The version header value stands in the test alone. Fix in implement/change: one exported constant beside `FIRE_CAP` owns it.
- The draft's tests list puts the skill case in the fire test. It stands in the workflow contract file, as tests-red says.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/doors/http.js src/doors/fake/http.js src/scripts/dispatch-fire.js src/scripts/dispatch.js src/scripts/cli-doors.js src/scripts/cli.js spec/design_output/doors.md .claude/skills/dispatch/SKILL.md test/level0/dispatch-fire.test.js test/contract/dispatch-workflow.test.js test/contract/http.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the files the draft names, and the command line's line for the verb besides
the http door carries its fake, and the contract case serves through the wire door
each new file opens with a comment naming the design input's section on firing the workers
the version, the cap and the label each stand once in the fire script, and the doors note carries one row for the door

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
