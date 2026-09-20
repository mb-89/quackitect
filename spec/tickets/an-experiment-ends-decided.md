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
step: verdict
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
| `.claude/skills/level0/hooks/level1.js` | takes the wrapper's hook module, beside the one level zero holds |
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

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. The process, the retro's route and verb, the two folders, and every file reaching them.
- every door the change reaches has a fake. The audit's cases hand the retro their own disk and log.
- a comment names the approach the change implements. The one module says why it calls the bridgehead, and the note names each decision.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/experiment.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Each trial now ends on a decision, and the retro holds until it does.

| what lands | where |
|---|---|
| the route a trial runs, ending on `decide` | `spec/processes/experiment.yaml` |
| the verb answering the trials standing open | `retro audit` in `src/scripts/retro.js` |
| the need the retro's audit step names | `spec/processes/retro.yaml` |
| what an experiment is, and what each decision does | [[spec/design_output/work#an-experiment-decides]] |

The two standing trials each take their decision:

| the trial | the decision | what follows |
|---|---|---|
| the level one wrapper | keep | its hook and its library move under `.claude/skills/level0` |
| the pane | drop | the editor draws the same widgets, and the folder goes |

The wrapper's move met a rule the approach missed. A plugin's manifest names one hook module, so two entries meet a refusal. The bridgehead imports nothing, which is its own rule, so the moved module imports the bridgehead and calls its register first. One module then carries both.

The audit reads the process a ticket names, where `retro notes` reads the folder a note sits in. A trial stands under `spec/tickets` beside every other ticket, so the folder answers nothing and the process answers it. A case drives the step over an open trial and over none.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. The process, the retro's route and verb, the two folders, and every file reaching them.
- every door the change reaches has a fake. The audit's cases hand the retro their own disk and log.
- a comment names the approach the change implements. The one module says why it calls the bridgehead, and the note names each decision.

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
