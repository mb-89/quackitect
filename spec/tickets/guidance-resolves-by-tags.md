---
kind: [[ticket]]
state: open
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
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
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/design]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass, pass with findings naming a child a line, or fail with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every row the design review passes with stands fixed in the change"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
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
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
group: guidance-rides-each-step
step: implement/tests-green
record:
  - step: design/draft
    hand: box d7d8cca5d3cd · claude-code-remote
    hash_before: c9357e0c72b41a81c1081d9f320a0a3ecf21e4cb
    hash_after: c9357e0c72b41a81c1081d9f320a0a3ecf21e4cb
  - step: design/review
    hand: box d7d8cca5d3cd · claude-code-remote · helper-2
    hash_before: 0767ae03db9546538a1c98cebde1e923b1892888
    hash_after: 0767ae03db9546538a1c98cebde1e923b1892888
  - step: implement/tests-red
    hand: box d7d8cca5d3cd · claude-code-remote
    hash_before: 503bdeac09f8081dcf3c173cf54ab861f98275a8
    hash_after: 503bdeac09f8081dcf3c173cf54ab861f98275a8
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
  - step: implement/change
    hand: box d7d8cca5d3cd · claude-code-remote
    hash_before: d8e0d1ef7a34ab7616c0b2db4f5ae3c48b894f21
    hash_after: d8e0d1ef7a34ab7616c0b2db4f5ae3c48b894f21
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/the-style-carries-the-top.md:143:56: Vocabulary: blocksof stands outside the words this tree writes. Write "
---

# Ask

Each step meets the notes its work needs, and no step names a note by hand. [[spec/design_input/level-two]] asks it in its chapter Guidance.

Today `spec/processes/trivial.yaml` reads working alone, so a trivial fix to code meets no code rule before the write door.

- `spec/schemas/ticket.schema.yaml` admits `tags` on a step, and `spec/schemas/guidance.schema.yaml` admits `tags` on a note. A case under `test/level0` decides it
- a note under a subfolder reaches a step carrying all its tags, folder names among them. Its `env` matches too. A case under `test/level0` decides it
- the check refuses a note that reaches no step. A case under `test/level0` decides it
- the pull prints each resolved note as a section of the ticket, its rules numbered as the note numbers them. A case under `test/level0` decides it
- `./RUNME.sh branch guidance` prints the notes a named step resolves. A case under `test/level0` decides it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

- `spec/schemas/ticket.schema.yaml` admits `tags` on a step, an array of words. `spec/schemas/guidance.schema.yaml` admits `tags` on a note.
- A note under a subfolder of `spec/guidance` carries a tag for each folder on its path, plus the `tags` of its frontmatter. A note at the top carries none and resolves by no tag: it rides the output style.
- A leaf carries its own `tags` and those of every step above it, as `leafOf` in `src/scripts/pull-route.js` sums `needs` today.
- `resolved(it, tags, env)` in `src/scripts/guidance-hand.js` answers every subfolder note whose tags all stand among the leaf's, where `bindsHere` passes its `env`. `readsFor(it, leaf)` answers the resolved notes, then any `reads` an older ticket still names. `handed`, `workAnswer` and `stepReads` call it in place of `leaf.reads`, so `leafOf` stays a pure function over the frontmatter.
- `unreached(it)` answers every subfolder note that no leaf of any process under `spec/processes` reaches. A battery case over the tree asserts it answers none, so the check refuses such a note.
- `notesSaid` prints each note as a section: a heading naming the note, its rules numbered as the note numbers them, then its Examples table.
- `./RUNME.sh branch guidance --step <process>:<path>` prints the notes that step resolves.
- The processes drop `reads` and carry `tags`. Code steps carry `code`, and `testing` where they read testing. Gates carry `review`, and the final accept adds `accept`. Each retro step carries `retro` and the name of its note. The notes gain the `tags` that tell them apart.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/scripts/pull-route.js leafOf, which gains tags,src/bridge/handover.js, which reads held.reads off the hold and stays as it stands,src/scripts/pull-route.js stepReads and stillHeld, which read leaf.reads,src/scripts/pull-hand.js handed, which reads leaf.reads into the hold,src/scripts/pull-chapter.js workAnswer, which calls notesSaid,src/scripts/pull-route.js stillHeld, which calls notesSaid,src/scripts/guidance-verb.js guidance and said, which call notesSaid,src/scripts/work.js branch, which routes the guidance verb

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

test/level0/guidance-tags.test.js the schemas admit tags on a step and on a note,test/level0/guidance-tags.test.js a note under a subfolder reaches a step carrying all its tags, and its env decides too,test/level0/guidance-tags.test.js a note no step reaches stands unreached, and the tree holds none,test/level0/guidance-tags.test.js the pull prints each resolved note as a section, numbered as the note numbers them,test/level0/guidance-tags.test.js the guidance verb prints the notes a named step resolves

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened: leafOf, stepReads, stillHeld, handed, workAnswer, notesSaid, guidance, both schemas, every process
- the callers list names every reader of leaf.reads and of notesSaid, found by a search
- each done_when line names a case in test/level0/guidance-tags.test.js, and the check line names ./RUNME.sh check

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->
<!-- the form is verdict -->

pass
- test/contract/process.test.js, the group route case, asserts gate.reads holds spec/guidance/review/design and lacks review/reviewing. The processes drop reads, so the case reads the notes resolved from the gate's tags, and the callers list names it.
- test/level0/pull.test.js pins the old print form, Reads spec/guidance/voice: and an indented 1. The new section form breaks it, so the builder moves it to the heading form the guidance-tags cases pin.
- spec/guidance/review/reviewing reaches no step today. The builder gives it accept, so the final accept reaches it, and the design gate, carrying review alone, keeps off it as the contract case asks. Each retro note gains its own name as a tag.
- spec/processes/trivial.yaml gives its do step code and testing, because a trivial fix to code meeting no code rule is the fault the ask names.
- The schema case and the tree case stand in test/contract, since they read the real tree, while the ask names test/level0. The tests line of the draft names each file as it lands, and tests-green says why.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/guidance-tags.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The level0 cases fail on their assertions: the env match lets no cloud note in under SE_CLOUD, unreached answers an empty list, the pull prints no note section, and the guidance verb takes no --step. The contract case for the schemas fails because the ticket schema names no tags on a step. What surprises me: resolved and tagsOf stand already, and the cloud miss sits in bindsHere, not in the tag match. unreached stands as a bare stub answering an empty list, so the files load and reach their assertions.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches no file the ask leaves out: two test files and a bare unreached stub in guidance-hand.js, all under the ask
every door the change reaches has a fake: the level0 cases read fakeDisk alone, and the contract case drives the real disk door
a comment names the approach the change implements: each file opens on the claim and links level-two#guidance
every fact the change adds stands in one place: the tests link the design input and copy no rule
every row the design review passes with stands fixed in the change: the review rows land at the change step, and these tests hold the schema, resolve, unreached, pull and verb rows

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches no file the ask leaves out: the schemas, the resolver in guidance-hand.js, its callers leafOf, stepReads, handed and workAnswer, the guidance verb, the processes, the notes gaining tags, and the cases beside each changed module
every door the change reaches has a fake: the resolver and unreached read the disk door alone, which fakeDisk stands in for, and the contract cases drive the real disk
a comment names the approach the change implements: listOf, readsFor, unreached, underFolders, notesSaid and the verb step reader each link level-two#guidance
every fact the change adds stands in one place: listOf serves envOf and tagsOf alike, and notesSaid prints through rulesOf in place of a second numbering
every row the design review passes with stands fixed in the change: process.test.js reads the notes the gate tags resolve, pull.test.js pins the heading form, reviewing gains accept and the final accepts carry review and accept, each retro note gains its own name, trivial do carries code and testing, and the tag cases stand in test/contract where they read the tree

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

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
