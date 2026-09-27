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
step: implement/change
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
  - step: design/draft
    hand: box d7d8cca563b1 · claude-code-remote
    hash_before: 64040d1db173ca87b25d8f6440d24a739f81d48d
    hash_after: 64040d1db173ca87b25d8f6440d24a739f81d48d
  - step: design/review
    hand: box d7d8cca563b1 · claude-code-remote · helper-4
    hash_before: 562b42d790624630618dc6a84a48234302f41c07
    hash_after: 562b42d790624630618dc6a84a48234302f41c07
  - step: implement/tests-red
    hand: box d7d8cca563b1 · claude-code-remote
    hash_before: d6dfdc6b40f22ef491f0416a0b350a2ab6ceb149
    hash_after: d6dfdc6b40f22ef491f0416a0b350a2ab6ceb149
    answered:
      - name: tests
        exit: 1
        said: assertion, 20 test(s) fail on their own assertion
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

src/scripts/pull.js handBack, which calls passed and then blessKept,src/scripts/pull-writes.js passed, which leaves a bless gate on its step,src/scripts/pull-hand.js handOut, which calls blessHolds before a leaf past a bless gate,src/scripts/pull-bless.js blessKept, blessHolds and bless, which the change adds,src/scripts/ticket.js the verb table, which gains bless,src/extension/sidebar.js the message handler, which gains the bless message,src/bridge/write.js the write door, which refuses an agent's write to the bless file,src/bridge/bash.js onBash, whose check list gains the bless file guard and the harness guard,.claude/skills/level0/lib/bash.js FREE, which the bless file guard runs ahead of,spec/schemas/ticket.schema.yaml the step properties, which gain bless

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

test/level0/pull-bless.test.js an accept at a bless gate leaves the step on the gate,test/level0/pull-bless.test.js an agent at a desk without the bless file is refused the bless,test/level0/pull-bless.test.js an agent at a desk blesses where the bless file holds agent true,test/level0/pull-bless.test.js an agent on a cloud box blesses,test/level0/pull-bless.test.js a payload into an input chapter strips the bless,test/level0/pull-bless.test.js an edit off the engine puts the step back on the gate,test/level0/write-bless.test.js the write door refuses an agent's write to the bless file,test/level0/bash-bless.test.js the shell door refuses a command naming the bless file,test/level0/bash-bless.test.js the shell door refuses a command setting, exporting or unsetting a harness variable,test/level0/schema-bless.test.js the ticket schema admits bless on a gate

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

the config verb writes bless.agent: the key leaves the config for its own file, which no config verb writes,a shell write under .se passes FREE: the shell door refuses a command naming the bless file, ahead of FREE,SE_BLESS_AGENT reaches the key through varOf: the bless file stands outside the config, so no variable maps to it,the strip leans on pull-stale.js: blessKept and blessHolds stand in pull-bless.js, and the chapter says edit,the callers miss pull-bless.js and the config schema: the callers name pull-bless.js, and the config schema drops out with the key,lens.js copies HARNESS: the shell guard reads the one list in pull-hand-of.js, and the copy in lens.js goes to the retro as a note

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

passed, handBack, handOut, HARNESS, FREE, the config write and varOf stand opened, and each claim checked there
the callers list names each function the bless changes, pull-bless.js among them
each done_when line maps to a test above: schema and wait, desk file, cloud and shell door, hash and strip

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->
<!-- the form is verdict -->

pass with findings
- bless-guard-reads-scripts: the bless file guard and the harness guard in onBash read the command line alone, and scriptsIn and scriptWrites in .claude/skills/level0/lib/scripted.js pass a script under .se, so `node .se/scripts/x.js` writing .se/.runtime/bless.json or spawning `ticket bless` with CLAUDECODE deleted passes; run both guards over the targets writesAPath and scriptWrites resolve, ahead of FREE, and add a case for each
- bless-button-draws-itself: the key leaves the config tree, so no level0.schema.json entry draws the sidebar button; name the file that draws it beside the `bless` kind in `took` in src/extension/sidebar.js, and add a case that the button writes the bless file
- process-case-for-bless: the ask names spec/schemas/process.schema.yaml, which takes its steps by $ref from ticket.schema.yaml; the schema case reads a process file carrying bless on a gate, so it decides the line the ask names
- cloud-list-reads-harness: inCloud reads CLOUD in .claude/skills/level0/lib/cloud.js, a second list beside HARNESS, and the one-list claim holds only while HARNESS carries every CLOUD name; point the guard at both, or derive one from the other

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/pull-bless.test.js test/level0/write-bless.test.js test/level0/bash-bless.test.js test/level0/schema-bless.test.js test/level0/sidebar.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

- Every case fails on its own assertion, and src/scripts/pull-bless.js stands as a stub so no import breaks.
- The ticket schema stands in three places: spec/schemas/ticket.schema.yaml, SCHEMA in test/level0/pull-schema.js and TICKET_SCHEMA in test/level0/fixtures.js. The change adds bless to each, and a note takes the copies to the retro.
- The write door calls box.biome.stands, so write-bless.test.js fakes biome.
- A script under .se writes any .se path unread today, since scriptsIn drops the targets FREE admits.
- schema-bless.test.js reads the tracked schemas off the disk, since the ask names those files.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the tests touch the files the draft names, and sidebar.test.js takes two cases at its end
every door the tests reach runs on a fake from src/doors/fake, and biome takes one in write-bless
the header of each new file links spec/design_output/pull#the-bless
the bless file path stands once in pull-bless.js for the change to import
the four review rows each meet a case: script targets, the button, a process file, HARNESS over CLOUD

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
