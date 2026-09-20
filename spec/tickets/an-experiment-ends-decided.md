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
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/reviewing]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: design/draft
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements"]
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
      - name: reflect
        does: names the class of error in the findings, and the fix for the class
        when: returned
        input: verdict
        evidence:
          - name: class
            form: text
            says: the class of error the findings describe, and the fix for the class
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
  - name: verdict
    does: reads every hunk against the ask and the approach
    not: implement
    on_fail: implement/reflect
    reads: [[spec/guidance/review/reviewing]]
    input: ["diff", "implement"]
    to: retro
    checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
group: the-tree-names-its-things
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: implement/reflect
record:
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 5dfb13d2512cf94223b9febb353210abd4b5ae9e
    hash_after: 5dfb13d2512cf94223b9febb353210abd4b5ae9e
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-2
    hash_before: 5bb6d89f88172d1b5129caec03d9ac08284274b8
    hash_after: 5bb6d89f88172d1b5129caec03d9ac08284274b8
    returns: 1
    why: "| the question reviewing asks | the answer |; |---|---|; | does the approach answer the ask | no, the removals reach past what it names |; | is what the draft touches beyond the ask trivial | yes, the draft writes this ticket alone |; | what does `./RUNME.sh check` answer | 0 on this commit |; | does a retro stand in the handback | no, `./RUNME.sh branch review` reads it absent |; | does every rule the approach adds carry a test | no, the retro's hold names none |; | what grade do the findings take | design, each one decides what the approach does |; Findings, one a line:; Name the decision each of the two plugins takes, so its row reaches a named end.; Name where the code of each leaving plugin lands, because the ask reads both as live.; The reach misses the tests importing the level one path: `test/level0/level1.test.js`, `test/level0/hand.test.js`, `test/contract/tree.test.js`.; `.claude/skills/pane/tests/pane.test.ts` stands inside a folder that leaves, so name its new home.; `./RUNME.sh links` answers the notes alone, so name the command answering the code reaching a path.; Name the step of the retro's route holding the refusal, and the test feeding it an open trial.; The retro's audit checklist already asks that every experiment stands decided, so say which of the two owns the rule."
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 4c32cd1120ae536b7558ab836f4038e7db2cc467
    hash_after: 4c32cd1120ae536b7558ab836f4038e7db2cc467
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-4
    hash_before: 37ed6315e1f9eb42673c1e3b2655b3482966d7eb
    hash_after: 37ed6315e1f9eb42673c1e3b2655b3482966d7eb
    returns: 2
    why: "| the question reviewing asks | the answer |; |---|---|; | does the approach answer the ask | no, the move lands two files level zero already holds |; | is what the draft touches beyond the ask trivial | yes, the draft writes this ticket alone |; | what does `./RUNME.sh check` answer | 0 on this commit |; | does a retro stand in the handback | no, `./RUNME.sh branch review` reads it absent |; | does every rule the approach adds carry a test | yes, the hold names a case each side |; | what grade do the findings take | design, each one decides what the approach does |; The seven findings of the last round all land. Three stand open.; Findings, one a line:; Say how `hooks/hooks.json` merges, because level zero holds a file of that name.; Say how `.claude-plugin/plugin.json` merges, because level zero holds a file of that name.; Add `spec/design_output/pull.md` to what changes, because it names the folder the wrapper leaves."
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 2ecf956449605a50c5ab70bc696e6f1b10f14700
    hash_after: 2ecf956449605a50c5ab70bc696e6f1b10f14700
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-6
    hash_before: 6821c12e0e2ce4b4cbdd6d5855e255a1283d8e30
    hash_after: 6821c12e0e2ce4b4cbdd6d5855e255a1283d8e30
  - step: implement/tests-red
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 647f73e8f0b658879fb8cd48ef122f9f4d32a978
    hash_after: 647f73e8f0b658879fb8cd48ef122f9f4d32a978
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: e785ec62a95f97f67c05f72a73b11b3a45f587d3
    hash_after: e785ec62a95f97f67c05f72a73b11b3a45f587d3
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 11505c6659903c8c0a3d0d72a45c31fd23dd24f8
    hash_after: 11505c6659903c8c0a3d0d72a45c31fd23dd24f8
    answered:
      - name: tests
        exit: 0
        said: green, 3 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 0eb9ad6feedf · claude-code-remote · helper-13
    hash_before: 1feb0b9400be8f3da87b9c17e1f4658152c34629
    hash_after: 1feb0b9400be8f3da87b9c17e1f4658152c34629
    returns: 1
    why: "| the question reviewing asks | the answer |; |---|---|; | does the branch do what the brief asks | no, the retro still closes over an open trial |; | is what the diff touches beyond the brief trivial | yes, the notes take the moved path |; | what does `./RUNME.sh check` answer | 0 on this commit |; | does a retro stand in the handback | no, the handover names it as waiting |; | does every rule the branch adds carry a test | no, the hold itself runs nowhere |; | what grade do the findings take | design, the hold picks its mechanism |; The two folders leave, the route ends on `decide`, and the verb answers each open; trial. The hold the ask asks for reaches the route nowhere.; Findings, one a line:; A need names a verb this box holds, and reads the tree nowhere. [[spec/design_output/pull#a-need-is-a-verb]]; So `needs` carries the hold nowhere, and the audit step passes over an open trial.; Run `retro audit` from the audit step's evidence, the way its `effect` step runs its own verb.; Drive that step through the pull over an open trial, because the case drives the verb alone.; Point each note at `pull-tool.js`, the name the module lands under. `git grep hooks/level1.js` answers them.; Mint a trial its ticket, or say under the approach why this one ticket carries both decisions.; Take the row naming the old folder in the design input's twin file, or leave both inputs alone."
  - step: implement/reflect
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: d33c174fc296a61f0962bf009d1b445417c9e063
    hash_after: d33c174fc296a61f0962bf009d1b445417c9e063
  - step: implement/change
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 76d502f16c050f351f6ef017bb13c0490c795418
    hash_after: 76d502f16c050f351f6ef017bb13c0490c795418
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 0b0d9297eff743fd94fd037674e2165ce40c4540
    hash_after: 0b0d9297eff743fd94fd037674e2165ce40c4540
    answered:
      - name: tests
        exit: 0
        said: green, 5 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 0eb9ad6feedf · claude-code-remote · helper-15
    hash_before: 915a6fd70328c9b18ab2e3faaa7a18be19c3acbe
    hash_after: 915a6fd70328c9b18ab2e3faaa7a18be19c3acbe
    returns: 2
    why: "| the question reviewing asks | the answer |; |---|---|; | does the branch do what the brief asks | yes, the folders leave and the hold runs |; | is what the diff touches beyond the brief trivial | yes, the check and the doors drop a dead name |; | what does `./RUNME.sh check` answer | 0 on this commit |; | does a retro stand in the handback | no, the handover names it as waiting |; | does every rule the branch adds carry a test | yes, the verb refuses, and a case reads the step |; | what grade do the findings take | craft, the approach and the note disagree on one fact |; I drove `retro audit` over a tree carrying an open trial, and it refused and named; the trial. The findings of the last round land. The approach still says what this; branch stopped doing, so a reader at the merge meets two answers to one question.; Findings, one a line:; The approach row says each folder leaves under a ticket of the experiment process, and neither does.; Take that row to what [[spec/design_output/work#an-experiment-decides]] says, that this ticket closes both.; The `says` chapter counts the closed tickets naming the old folder, and `git grep skills/level1` answers more.; Name that command in place of the count, because a count in prose goes stale."
  - step: implement/reflect
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: ce63fe7347241e179abae028a740ee80d1b4efd3
    hash_after: ce63fe7347241e179abae028a740ee80d1b4efd3
  - step: implement/change
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 7fae72ad8502863f658394bb39e0a1ab8e0e65e0
    hash_after: 7fae72ad8502863f658394bb39e0a1ab8e0e65e0
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 613e8b7c19b1e9f96d2c01ff418f0d1a926c82b3
    hash_after: 613e8b7c19b1e9f96d2c01ff418f0d1a926c82b3
    answered:
      - name: tests
        exit: 0
        said: green, 5 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 0eb9ad6feedf · claude-code-remote · helper-17
    hash_before: 962f344e022d606cddffaa38b8d6b4be687ad25b
    hash_after: 962f344e022d606cddffaa38b8d6b4be687ad25b
    returns: 3
    why: "| the question reviewing asks | the answer |; |---|---|; | does the branch do what the brief asks | yes, the folders leave and the hold runs |; | is what the diff touches beyond the brief trivial | yes, this round writes this ticket alone |; | what does `./RUNME.sh check` answer | 0 on this commit |; | does a retro stand in the handback | no, the branch's close writes it |; | does every rule the branch adds carry a test | yes, I drove the verb over an open trial and it refused |; | what grade do the findings take | craft, a field of this ticket holds a count that reads false |; I drove `retro audit` over a tree carrying an open trial, and it named the trial; and refused. The Discussion answers the approach row, which stands under a step; no round after it reopens. The `says` chapter stands otherwise: this round held; `implement/tests-green` and wrote its other fields, so that chapter takes the; fix where a reader meets the count.; Findings, one a line:; The `says` chapter writes a count of the closed tickets naming the old folder.; `git grep skills/level1 -- spec/tickets` names a ticket the count leaves out, so it reads false.; This round answers `implement/tests-green` again, so the hand writes that chapter.; Name the command there in place of the count, and leave the Discussion row standing."
---

# Ask

The tree carries what it uses, and each trial leaves on a decision the owner makes.

The level one and pane plugins stand on after their question settles, and hands read them as live.

- The level one and pane plugins leave `.claude/skills`.
- Each experiment carries a ticket with a decide step from its start.
- The retro refuses to close while such a ticket stands open.
- `./RUNME.sh check` exits 0 after the removals.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

An experiment carries a `decide` step from its first day, and the retro holds on it. So the two standing plugins leave by that road, each with its decision named.

| the plugin | the decision | where its code goes |
|---|---|---|
| `.claude/skills/level1` | keep | the pull tool, the judge and the spawn move into `.claude/skills/level0` |
| `.claude/skills/pane` | drop | the editor draws the same widgets, as [[spec/design_output/extension#one-declaration-draws-it]] says |

Level one holds the tool a hand pulls through and the judge reading a hand-back. The tree runs both every session, so the trial ends kept. The pane draws beside the transcript what the sidebar draws already, so the trial ends dropped.

| what changes | how |
|---|---|
| `spec/processes/experiment.yaml` | a route whose last step is `decide` |
| `spec/processes/retro.yaml` | its `audit` step holds while an experiment ticket stands open |
| `.claude/skills/level0/hooks/pull-tool.js` | takes the wrapper's hook module, beside the one level zero holds |
| `.claude/skills/level0/lib/pull.js` | takes the wrapper's library, beside the libraries level zero holds |
| `.claude/skills/level0/hooks/hooks.json` | names the second module in its `modules` list |
| `.claude/skills/level0/.claude-plugin/plugin.json` | keeps its own name, and its description says the pull tool rides here |
| [[spec/design_output/pull]] | names the folder level zero holds as the wrapper's home |
| `.claude/skills/level1` and `.claude/skills/pane` | leave, each under a ticket of the experiment process |
| `test/level0/level1.test.js`, `test/level0/hand.test.js`, `test/contract/tree.test.js` | take the path level zero holds |
| `src/scripts/cli-doors.js` | `LEVEL1` names the folder level zero holds |
| [[spec/design_output/work]] | says what an experiment is, and what each decision does |

The route, one step a row:

| the step | who takes it | what it answers |
|---|---|---|
| ask | anyone | the question the trial answers, and what decides it |
| run | anyone | what the trial does, and what it shows |
| decide | person | keep, drop or grow, with the reason under it |

What each decision does:

| the decision | what follows |
|---|---|
| keep | the code moves into the tree, and the folder under `.claude/skills` goes |
| drop | the code leaves, and the ticket closes on the reason |
| grow | a ticket of its own carries it, and the experiment closes `became` |

**The hold.** The retro's `audit` step carries the checklist item naming every experiment decided. That item is a hand's read, and the hold is the machine's. So the item points at the hold, and the hold owns the rule.

`retro audit` answers `wait` while a ticket of the experiment process stands open, and names each one. A case drives that step over a fake tree holding one open trial, and asserts the wait names it. A second case holds a tree whose trials all close, and asserts the step passes.

**The reach.**

| the reader | what it answers |
|---|---|
| `./RUNME.sh links` | a note reaching a note |
| `git grep skills/level1`, `git grep skills/pane` | a line of code reaching a path |

Each removal runs both before it lands, because the first reader answers a note alone.

The pane's own case file leaves with the folder, because the widgets it drives stand under `src/extension` with cases of their own. The level one cases take the path level zero holds, and stay.

## review

<!-- reads the approach against the ask -->

### verdict

pass

| the question reviewing asks | the answer |
|---|---|
| does the approach answer the ask | yes, each line of the ask meets a row |
| is what the draft touches beyond the ask trivial | yes, the draft writes this ticket alone |
| what does `./RUNME.sh check` answer | 0 on this commit |
| does a retro stand in the handback | no, `./RUNME.sh branch review` reads it absent |
| does every rule the approach adds carry a test | yes, the hold names a case each side |
| what grade do the findings take | design, and none stands open |

The three findings of the last round all land. None stands open.

Findings, one a line:

- The hook manifest merges by name: level zero's module list takes the second module.
- The plugin manifest merges by name: level zero keeps its own, and its description says what rides there.
- The pull note joins what changes, and it names the folder the wrapper leaves.
- Each landing file stands free: the hook module and the library meet no name level zero holds.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/experiment.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The command answers assertion, and each case fails on its own assertion.

| the case | what it holds open |
|---|---|
| the audit names each open trial | `openTrials` stands nowhere |
| the audit step holds over one, and passes over none | the verb answers no `audit` |
| the process a trial names | `EXPERIMENT` stands nowhere |

The hold reads the way `notes` reads the private folder, and that one walks a folder. This one walks the tickets and reads a field, because a trial stands under `spec/tickets` beside every other ticket. So the reader asks the process a ticket names.

That surprises me. The two holds of the retro look alike from the route, and they part at the reader. One asks where a ticket stands, and the other asks what process it runs.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. One case file and this ticket.
- every door the change reaches has a fake. Each case hands the retro its own disk and its own log.
- a comment names the approach the change implements. The file's header names the hold, and each case points at this ticket.

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->
<!-- the form is text -->

One class carries both findings: a closed field holds a fact the work moves past.

| the field | what it says | what stands |
|---|---|---|
| the approach, under design | each folder leaves under a ticket of the experiment process | this one ticket closes both |
| the `says` chapter, under tests-green | a count of the closed tickets naming the old folder | a command answers that count |

A field of a closed step is the record of its round, and the ticket door holds it there. So a correction reaches a reader two ways: the note owning the fact, and the Discussion chapter a hand writes at any time.

The fix for the class is writing the correction where a reader of this ticket meets it. The Discussion takes one line per field, each naming what the field says and what stands. [[spec/design_output/work#an-experiment-decides]] already owns the first fact, so the line points there.

The second finding is the voice rule about a count. A count in prose goes stale, and a command answers it fresh. So the Discussion names `git grep skills/level1` in place of the number, and the line says what the command answers.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. This ticket's Discussion chapter alone.
- every door the change reaches has a fake. The change reaches no door, because it writes prose into a ticket.
- a comment names the approach the change implements. Each line names the field it corrects and the place owning the fact.

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. This ticket's Discussion chapter alone.
- every door the change reaches has a fake. The change reaches no door, because it writes prose into a ticket.
- a comment names the approach the change implements. Each row names the field it corrects and the place owning the fact.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/experiment.test.js test/contract/experiment.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The hold now runs, because a rule the engine reads as a name holds nothing.

| what changes | how |
|---|---|
| the retro's `audit` step | takes `retro audit` as a command its evidence names |
| the notes naming the moved module | point at `pull-tool.js`, the name it lands under |
| the design input's twin page | takes the folder level zero holds |
| `test/contract/experiment.test.js` | reads both routes, and asserts the hold runs |

The round before wrote the hold as a need. `holdsVerb` splits a need and asks the table of verbs, so a need answers whether a box can run a thing. The run itself waits for evidence, and the audit step now carries it beside the `effect` step's own.

A trial minted before this process ends under the ticket closing it, which is what this one does for the two standing trials. [[spec/design_output/work#an-experiment-decides]] says so, and every trial after carries a ticket of the process from its first day.

Three closed tickets still name the old folder in their own record of what stood then. A record names a thing as it stood, so those stay. `git grep skills/level1` over the live half answers nothing.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. The retro's route, the notes naming the moved module, the design input's twin, and one case file.
- every door the change reaches has a fake. The verb's cases hand their own disk, and the route cases read the tree under test/contract.
- a comment names the approach the change implements. The step's evidence says what the verb answers, and the note says what a decided trial leaves.

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->
<!-- the form is files -->

- .claude/skills/level0/.claude-plugin/plugin.json
- .claude/skills/level0/hooks/hooks.json
- .claude/skills/level0/hooks/pull-tool.js
- .claude/skills/level0/lib/pull.js
- .claude/skills/level0/lib/ticket.js
- .claude/skills/level1/.claude-plugin/plugin.json
- .claude/skills/level1/hooks/hooks.json
- .claude/skills/level1/hooks/level1.js
- .claude/skills/level1/lib/pull.js
- .claude/skills/pane/.claude-plugin/plugin.json
- .claude/skills/pane/hooks/hooks.json
- .claude/skills/pane/hooks/pane.js
- .claude/skills/pane/tests/pane.test.ts
- HANDOVER.md
- spec/design_input/the-agent-pulls-tickets.html
- spec/design_input/the-agent-pulls-tickets.md
- spec/design_output/pull.md
- spec/design_output/work.md
- spec/guidance/review/reviewing.md
- spec/processes/experiment.yaml
- spec/processes/retro.yaml
- spec/tickets/agent-pulls-ticket.md
- spec/tickets/an-experiment-ends-decided.md
- spec/tickets/the-agent-pulls-a-ticket.md
- spec/tickets/the-group-leaves-at-todo.md
- spec/tickets/the-hand-carries-the-session.md
- spec/tickets/the-judge-reads-answer-rules.md
- spec/tickets/the-runtime-files-stand-apart.md
- spec/tickets/the-session-file-proves-itself.md
- spec/tickets/the-spawn-takes-a-step.md
- spec/tickets/verbs-read-two-roots.md
- src/scripts/cli-check.js
- src/scripts/cli-doors.js
- src/scripts/pull-chapter.js
- src/scripts/pull-route.js
- src/scripts/pull-writes.js
- src/scripts/retro.js
- test/contract/experiment.test.js
- test/contract/tree.test.js
- test/level0/experiment.test.js
- test/level0/hand.test.js
- test/level0/level1.test.js
- test/level0/pull-leaves.test.js

## verdict

<!-- pass or fail, findings one a line -->
<!-- the form is verdict -->

fail

| the question reviewing asks | the answer |
|---|---|
| does the branch do what the brief asks | yes, the folders leave and the hold runs |
| is what the diff touches beyond the brief trivial | yes, this round writes this ticket alone |
| what does `./RUNME.sh check` answer | 0 on this commit |
| does a retro stand in the handback | no, the branch's close writes it |
| does every rule the branch adds carry a test | yes, I drove the verb over an open trial and it refused |
| what grade do the findings take | craft, a field of this ticket holds a count that reads false |

I drove `retro audit` over a tree carrying an open trial, and it named the trial
and refused. The Discussion answers the approach row, which stands under a step
no round after it reopens. The `says` chapter stands otherwise: this round held
`implement/tests-green` and wrote its other fields, so that chapter takes the
fix where a reader meets the count.

Findings, one a line:

- The `says` chapter writes a count of the closed tickets naming the old folder.
- `git grep skills/level1 -- spec/tickets` names a ticket the count leaves out, so it reads false.
- This round answers `implement/tests-green` again, so the hand writes that chapter.
- Name the command there in place of the count, and leave the Discussion row standing.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact the change adds stands in one place. [[spec/design_output/work#an-experiment-decides]] owns the decision and the hold. The route, the verb and the cases point there, and the Discussion takes the approach row there. The `says` chapter keeps a count of its own, which the findings name.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

Two closed fields of this ticket hold a fact the work moved past. The door keeps
a closed field as the record of its round, so the correction stands here.

| the field | what it says | what stands |
|---|---|---|
| the approach, under design | each folder leaves under a ticket of the experiment process | this one ticket closes both, as [[spec/design_output/work#an-experiment-decides]] says |
| the `says` chapter, under tests-green | a count of the closed tickets naming the old folder | `git grep skills/level1 -- spec/tickets` answers it |

A closed ticket names a folder as it stood in its own round, so each of those
rows stays. The live half of the tree names the folder nowhere.
