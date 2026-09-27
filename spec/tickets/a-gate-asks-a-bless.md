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
group: the-process-stays-editable
step: design/draft
record:
  - step: design/draft
    hand: box d7d8cca563b1 · claude-code-remote
    hash_before: 64523823009cf9c060fde1537507f05ec76fb700
    hash_after: 64523823009cf9c060fde1537507f05ec76fb700
  - step: design/review
    hand: box d7d8cca563b1 · claude-code-remote · helper-2
    hash_before: 7906727a23f0f93bccd2aab8805031d3c9868014
    hash_after: 7906727a23f0f93bccd2aab8805031d3c9868014
    returns: 1
    why: "the desk guard leaves bless.agent open: `./RUNME.sh config bless.agent true` writes it through `settings.write` in .claude/skills/level0/lib/config.js, and the write door never sees that write; a shell write into .se/.runtime/config.json passes, since `FREE` in .claude/skills/level0/lib/bash.js frees every path under .se; the env layer answers bless.agent from `SE_BLESS_AGENT` through `varOf`, and the approach guards the `HARNESS` names alone, so an agent sets it on its own command line; the strip on an edit rests on src/scripts/pull-stale.js, which stands unbuilt, and the chapter says a merge where the ask says an edit; name the function that drops the bless and the ticket it waits on; the callers list leaves out spec/config/level0.schema.json, which needs the bless.agent entry the sidebar button draws, and the new src/scripts/pull-bless.js; `HARNESS` in src/extension/lib/lens.js copies the list in src/scripts/pull-hand-of.js; point the shell door at one list"
---

# Ask

A gate that matters waits for a bless beside its verdict, and the owner decides who blesses on a desk. [[spec/design_input/level-two]] asks it in its chapter The bless.

Today nothing tells a verdict from a bless, and an agent passes a gate the owner wants to hold.

- `spec/schemas/process.schema.yaml` admits a bless on a gate, and a gate asking one waits after its verdict. A case under `test/level0` decides it
- at a desk a sidebar button writes the key that lets the agent bless. The write door refuses the agent that key. A case under `test/level0` decides it
- on a cloud box the environment decides. The shell door refuses a command setting the variables naming the box or the hand. A case under `test/level0` decides it
- a bless binds to the hash of what it blesses, and an edit strips it. A case under `test/level0` decides it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

For details, see [[spec/design_output/pull#the-bless]].

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/scripts/pull.js handBack, which calls passed and withPayload,src/scripts/pull-writes.js passed, which leaves a bless gate on its step,src/scripts/ticket.js the verb table, which gains bless,src/extension/sidebar.js set, which the bless button calls,src/bridge/write.js the write door, which gains the bless key guard,src/bridge/bash.js onBash, whose check list gains the harness guard,spec/schemas/ticket.schema.yaml the step properties, which gain bless

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

test/level0/pull-bless.test.js an accept at a bless gate leaves the step on the gate,test/level0/pull-bless.test.js an agent at a desk without bless.agent is refused the bless,test/level0/pull-bless.test.js an agent on a cloud box blesses,test/level0/pull-bless.test.js an edit to an input chapter strips the bless,test/level0/write-bless.test.js the write door refuses an agent's write to bless.agent,test/level0/bash-harness.test.js the shell door refuses a command setting a harness variable,test/level0/schema-bless.test.js the ticket schema admits bless on a gate

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

passed, handFaults, HARNESS, set, onBash and the verdict branch of handBack stand opened, and each claim checked there
the callers list names each function whose behaviour the bless changes
each done_when line maps to a test above: schema and wait, desk key, cloud and shell door, hash and strip

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->
<!-- the form is verdict -->

fail
- the desk guard leaves bless.agent open: `./RUNME.sh config bless.agent true` writes it through `settings.write` in .claude/skills/level0/lib/config.js, and the write door never sees that write
- a shell write into .se/.runtime/config.json passes, since `FREE` in .claude/skills/level0/lib/bash.js frees every path under .se
- the env layer answers bless.agent from `SE_BLESS_AGENT` through `varOf`, and the approach guards the `HARNESS` names alone, so an agent sets it on its own command line
- the strip on an edit rests on src/scripts/pull-stale.js, which stands unbuilt, and the chapter says a merge where the ask says an edit; name the function that drops the bless and the ticket it waits on
- the callers list leaves out spec/config/level0.schema.json, which needs the bless.agent entry the sidebar button draws, and the new src/scripts/pull-bless.js
- `HARNESS` in src/extension/lib/lens.js copies the list in src/scripts/pull-hand-of.js; point the shell door at one list

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
