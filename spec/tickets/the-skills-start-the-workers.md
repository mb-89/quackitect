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
depends_on: [dispatch-writes-the-bundles]
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 069b8a6b0af850a654b0efff8fa4292d8995f37f
    hash_after: 069b8a6b0af850a654b0efff8fa4292d8995f37f
    inputs:
      - name: ask
        hash: 99785aee8d05058a
        size: 1293
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 5a2557d24d86ab34
        size: 13510
      - name: [[spec/guidance/cloud/cloud]]
        hash: 095e262b0b5667dc
        size: 2735
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: edee5580adcac419419ffd8da6fc530f2058fdca
    hash_after: edee5580adcac419419ffd8da6fc530f2058fdca
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 6f2fc1b0d0385faf
        size: 2860
    def: 08e16d07b0de477c
  - step: design/draft
    hand: the engine
    stale: ask
  - step: design/tests-red
    hand: the engine
    stale: design/draft
  - step: design/draft
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 7c52096aa4d4c15f675aa6635125fb770a3c3fe1
    hash_after: 7c52096aa4d4c15f675aa6635125fb770a3c3fe1
    inputs:
      - name: ask
        hash: c0a5647ee3b28623
        size: 1295
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 5a2557d24d86ab34
        size: 13510
      - name: [[spec/guidance/cloud/cloud]]
        hash: 095e262b0b5667dc
        size: 2735
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 903ffafe8dd8380d5b8e10e8e2c7661a2edcf496
    hash_after: 903ffafe8dd8380d5b8e10e8e2c7661a2edcf496
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: f134a7899a5eeb1c
        size: 3048
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: 54c0cfa924ddefbc4a513e65ea9228cc9fb9cfdf
    hash_after: 54c0cfa924ddefbc4a513e65ea9228cc9fb9cfdf
    inputs:
      - name: design/draft
        hash: f134a7899a5eeb1c
        size: 3048
      - name: design/tests-red
        hash: 08402033f055fd7e
        size: 610
    def: dc4904ab364efa10
---

# Ask

Two skills stand under `.claude/skills/`, per [[spec/design_input/the-cloud-runs-itself#the-dispatcher]] and [[spec/design_input/the-cloud-runs-itself#the-workers]]. The dispatch skill runs `./RUNME.sh dispatch --json`, and opens a pull request with auto-merge over the write branch where one stands. It starts one worker session per ready group and per stuck hand-over through the cloud-sessions connector, with the prompt `run the work skill`. It messages the owner with each question, and leaves. The work skill runs `./RUNME.sh branch take`, works the group as [[spec/guidance/cloud/cloud]] says, and ends at `./RUNME.sh branch done`.

Without them a routine's prompt carries the road in its own words, outside git. A change to the road then means an edit of a routine nobody reviews.

- `.claude/skills/dispatch/SKILL.md` and `.claude/skills/work/SKILL.md` stand, each with its `name` and `description`
- the dispatch skill acts on the verb's JSON alone, and computes nothing the verb answers
- a case in `test/contract/skills.test.js` reads both skills
- that case finds every `./RUNME.sh` verb they name among the verbs `./RUNME.sh help` lists
- `spec/guidance/cloud/cloud.md` points a worker at the work skill for its road
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

Two skill files carry the road, and the verb carries every decision. A skill reads the verb's JSON and acts on each list in it.

The dispatch skill, `.claude/skills/dispatch/SKILL.md`:

1. Run `./RUNME.sh dispatch --json`, and read its object.
2. Where `write.state` reads `pushed` or `standing`, open a pull request over `write.branch` through the GitHub connector, with auto-merge on. Where one stands already, leave it.
3. Start one session through the cloud-sessions connector for each entry under `ready` and under `stuck`, with the prompt `run the work skill`.
4. Send the owner one message naming each entry under `questions`, with its ticket and its group.
5. Leave. The skill counts, sorts and judges nothing the object answers.

The work skill, `.claude/skills/work/SKILL.md`:

1. Run `./RUNME.sh branch take`, and read the ask it prints.
2. Work the group as `spec/guidance/cloud/cloud.md` says.
3. Run `./RUNME.sh branch done`.
4. Open a pull request over the branch through the GitHub connector, with auto-merge on.

Each file opens with the `name` and `description` the skill loader reads.

The test, `test/contract/skills.test.js`, reads both files through the disk door, so it stands under test/contract, where FakeDoorsInTest puts a test driving the real thing. It parses the frontmatter, and gathers every `./RUNME.sh <verb>` the body names. It imports `verbs` from `src/scripts/cli.js`, the table `help` prints, so the verb list stands in one place.

`spec/guidance/cloud/cloud.md` gains a rule pointing a worker at the work skill for its road, and the skill links the guidance back for the rules.

I assume a connector names the session tool and the pull request tool, so the skill names the connector and no tool id, because tool ids drift between boxes. The objection is a skill too vague to act on. The step names the act, its input and its prompt, which a session maps onto whichever tool its connector lists.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- none: both skill files stand new, and the cloud routine prompt names them later
- spec/guidance/cloud/cloud.md: gains the pointer rule
- src/scripts/cli.js verbs: read by the new test alone

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/contract/skills.test.js: both skills carry a name and a description
- test/contract/skills.test.js: every verb a skill names stands among the verbs help lists
- test/contract/skills.test.js: the dispatch skill reads each key the verb's JSON answers

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- the rename moves the test under test/contract, and the approach names the new path

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .claude/skills/dispatch/SKILL.md
- .claude/skills/work/SKILL.md
- test/contract/skills.test.js
- spec/guidance/cloud/cloud.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I opened the dispatch JSON through the verb itself, the write states in dispatch.js carried, the verbs table in cli.js, and the design input sections
- the callers list names the guidance and the verbs table, and nothing calls a skill file yet
- each done_when line maps to a case in the tests list, the guidance line stands as a checkpoint, and the check needs none

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/contract/skills.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/contract/skills.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

All three cases fail on their own assertion, because neither skill file stands yet.

The test reads the real skill files through the disk door, so FakeDoorsInTest puts it under test/contract. The verb list comes from the verbs table in cli.js, the one help prints.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line on the skills and the verbs meets a failing case
- the guidance pointer and the check stand as checkpoints
- the disk door is the one door the test reaches, and the contract folder holds real doors

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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

The test reads the real skill files through the disk door, so it stands at `test/contract/skills.test.js`, where `FakeDoorsInTest` puts a test driving the real thing. The rename rewrites every line naming the old path, the ask among them.
