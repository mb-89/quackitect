---
kind: [[ticket]]
state: closed
urgency: now
depends_on: [the-retro-takes-the-box]
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
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
group: the-retro-runs
step: verdict
record:
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: 5fa1e2fec704611d5375b260d9342d4ea9731a72
    hash_after: 5fa1e2fec704611d5375b260d9342d4ea9731a72
  - step: design/review
    hand: box d42624a67d18a8 · claude-code · helper-21
    hash_before: dee2aea25f40ed5727268f1b7c2f502381ca8e81
    hash_after: dee2aea25f40ed5727268f1b7c2f502381ca8e81
    returns: 1
    why: Two gaps stand, and the rest of the approach answers the ask:; | the gap | the fix |; |---|---|; | the collect step of [[spec/processes/retro]] reads as a keep list today | write the deny list into that step, and move the hash with it |; | the earlier retros reach no file, and the `score` step reads them | name the file they land in, beside the leaves' own |; | what answers the ask | where |; |---|---|; | one file a leaf under the retro folder, named for the leaf | the leaves table |; | the nine leaves, with `chapters` and `worker` reading live | the leaves table and the two-leaf line |; | the three takes off git, with the tickets and their records | the git table |; | the manifest naming a layout beside a copy, which `unread` reads | the manifest line |; `./RUNME.sh check` exits 0 on this branch.
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: a31ca19ab697013c347bdfe3c3d7a4396cf2e4c6
    hash_after: a31ca19ab697013c347bdfe3c3d7a4396cf2e4c6
  - step: design/review
    hand: box d42624a67d18a8 · claude-code · helper-24
    hash_before: f03adf352b9473f944a583dbcde10dbeb5dcf89c
    hash_after: f03adf352b9473f944a583dbcde10dbeb5dcf89c
  - step: implement/tests-red
    hand: box d42624a67d18a8 · claude-code
    hash_before: 74d207944b7ebe1cc3b1f8da9b5249b66d78304d
    hash_after: 74d207944b7ebe1cc3b1f8da9b5249b66d78304d
    answered:
      - name: tests
        exit: 1
        said: assertion, 5 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box d42624a67d18a8 · claude-code
    hash_before: f1f500f0fce809c20bf5e5a5f8e3ad482a9f8b9b
    hash_after: f1f500f0fce809c20bf5e5a5f8e3ad482a9f8b9b
    answered:
      - name: lint
        exit: 0
        said: 75 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box d42624a67d18a8 · claude-code
    hash_before: 4bc7ca556daef3c3f80151ddd06309fd45c46d35
    hash_after: 4bc7ca556daef3c3f80151ddd06309fd45c46d35
    answered:
      - name: tests
        exit: 0
        said: green, 5 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 75 stand at warning, which the panel draws and check allows.
  - step: verdict
    hand: box d42624a67d18a8 · claude-code · helper-30
    hash_before: 5aad3cd4a056b75d89eb0ab1e2e57eef07e9e1cb
    hash_after: 5aad3cd4a056b75d89eb0ab1e2e57eef07e9e1cb
    returns: 1
    why: Three gaps stand, and the rest of the change answers the ask.; | the gap | the fix |; |---|---|; | no case drives a merged group, so the `runs` filter fires nowhere and the file reads empty | give the fake git a closed group ticket, and read the `runs` file back |; | the `method` leaf takes a row in the approach, and collect writes it no file | write the file, or say in the approach why that leaf takes none |; | the file the `score` step reads lands as `retros`, and the ask asks for the leaf's name | name it for the leaf that reads it |; | what answers the ask | where |; |---|---|; | the takes off git land in the folder | `closedIn`, `mergedIn` and `standingRetros` in `src/scripts/retro-leaves.js` |; | the manifest names each layout | the row each leaf file pushes, which the case reads back |; | the collect step reads as the folders it skips | `spec/processes/retro.yaml`, and the hash moves on the open retro |; | a case reads the closed ticket back | the tickets leaf case, which finds the ticket as its commit leaves it |; | what the reviewing guidance asks | what stands |; |---|---|; | the diff beyond the brief | the siblings' own work, which this branch carries alongside |; | a retro handback | none stands, because this ticket runs at the desk |; `./RUNME.sh check` exits 0 on this branch, and `node --test` passes over the two test files.
  - step: implement/reflect
    hand: box d42624a67d18a8 · claude-code
    hash_before: 4d479861946774706368d40d790c568ae4c7585a
    hash_after: 4d479861946774706368d40d790c568ae4c7585a
  - step: implement/change
    hand: box d42624a67d18a8 · claude-code
    hash_before: 87bd596646f07ccbfca684d81235f35a546150d4
    hash_after: 87bd596646f07ccbfca684d81235f35a546150d4
    answered:
      - name: lint
        exit: 0
        said: 75 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box d42624a67d18a8 · claude-code
    hash_before: 55f4d825fa2a0ba0885a973b2893d81a403cc612
    hash_after: 55f4d825fa2a0ba0885a973b2893d81a403cc612
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 75 stand at warning, which the panel draws and check allows.
  - step: verdict
    hand: box d42624a67d18a8 · claude-code · helper-34
    hash_before: b331fd609ae91ffce200aef042c1c12113621171
    hash_after: b331fd609ae91ffce200aef042c1c12113621171
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->

Every leaf of the retro's own reading opens a file holding what that leaf reads:

- the tickets closing in the window arrive with their records, out of git
- the retro leaves of the groups merging in the window arrive beside them
- the earlier retros arrive, so the score step reads what it scores

<!-- breaks, as text: what breaks if it is never done -->

The route stalls at its own reading. A leaf asks a question, the material stands nowhere, and the hand answers off what it can reach by hand.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- `./RUNME.sh retro collect` writes one file a leaf under the retro folder, named for the leaf
- the takes off git land in the retro folder, and the manifest names each one
- the collect step of the retro process reads as a deny list, and the hash moves with it
- a case drives a window holding a closed ticket and a merged group, and reads both files back
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

Collect writes one file a leaf under the retro folder, holding what that leaf reads.

| the leaf | what its file holds |
|---|---|
| `shell` | every shell command the log carries, grouped by the job, with a count and one example |
| `refusals` | every refusal row, by the rule that fires it |
| `tickets` | the record of each ticket closing in the window, off git |
| `scripts` | every script the copy takes, with where it comes from |
| `runs` | the retro leaves of the groups merging in the window, off git |
| `unread` | the manifest itself, which the leaf reads against the others |
| `method` | this retro's own run, which the hand fills as it goes |
| `score` | the earlier retros, so the step scoring them reads a file and no git |

Three of the takes come off git and no box:

| what it reads | how |
|---|---|
| the tickets closing in the window | the commits touching the tickets folder, and each ticket as that commit leaves it |
| the retro leaves of merged groups | the group tickets those commits close, and the chapters under their retro |
| the earlier retros | the closed retro tickets standing in the tree |

Two leaves read what stands only later. `chapters` reads the closed readers, and `worker` reads their counts. Both stand once the `readers` step closes, so each reads the chapter tickets live at its own turn.

Collect names every file it lays out in the manifest, beside the copies. So the `unread` leaf reads one list and finds every line, whether a copy or a layout puts it there.

| what a leaf's file reads | `.se/retro/<ticket>/leaves/<leaf>.jsonl` |
|---|---|
| what a row holds | one thing the leaf reads, as the leaf wants it |
| what an empty file says | the window holds none of that thing, and the leaf says so |

The route's own collect step reads as a keep list today. It says the verb takes what it names, and takes nothing it does not name. The owner rules the skip a folder, so that step's words move with this change.

| what the step says today | what it says after |
|---|---|
| takes what it names under the private folder | copies the private folder past the folders it skips |
| takes nothing it does not name | skips the runtime folder and the retro's own |

The process hash moves with those words. No retro ticket stands open past this branch, so `./RUNME.sh ticket update` reaches the one open retro and takes the new route.

<!-- the form is text -->

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

pass

Both gaps close, and the approach answers the ask.

| the gap the first round names | what closes it |
|---|---|
| the collect step reads as a keep list | the step's two lines move to the skip, and the hash moves with them |
| the earlier retros reach no file | `score` takes a row in the leaves table, and a file beside the rest |

| what the ask asks | what the approach answers |
|---|---|
| one file a leaf, named for the leaf | the leaves table, and the path holding each |
| the takes off git land in the folder | the git table, with the tickets, the merged groups and the earlier retros |
| the manifest names each one | a layout takes a line beside a copy, so `unread` reads one list |
| the nine leaves stand answered | seven take a file, and `chapters` and `worker` read the closed readers live |

`./RUNME.sh check` exits 0 on this branch.

<!-- the form is verdict -->

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

    ./RUNME.sh branch test test/level0/retro-leaves.test.js

<!-- the form is command -->

### seen

Five cases stand, and each one fails on its own assertion.

| the case | what it asks |
|---|---|
| a file a leaf | seven leaves take a file, and a window holding nothing leaves it empty |
| the shell leaf | a job takes a row, with its count and one example |
| the refusals leaf | a rule takes a row, with how often it fires |
| the tickets leaf | a ticket closing in the window arrives as that commit leaves it |
| the manifest | every leaf file takes a line, so the unread leaf finds them |

What surprises me is how much the log already carries. The rows name a kind, a level and a line, so the shell and the refusals leaves read one file and no transcript.

The takes off git reach the retro folder as rows, so no leaf runs git itself. A leaf then reads one file, and a reader repeats the reading without the tree beside them.

### checked

- the change touches no file the ask leaves out. One case file lands, and nothing else moves.
- every door the change reaches has a fake. The cases drive the fake disk and the fake git, and reach no real door.
- a comment names the approach the change implements. The header points at the retro chapter of the design input.

<!-- the form is checklist -->

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

The class is one: the code answers the approach in part, and the cases cover the part it answers.

| the finding | what the approach says |
|---|---|
| no case drives a merged group | the `runs` leaf reads the groups closing in the window |
| the `method` leaf takes no file | every leaf of the retro's own reading opens a file |
| the file reads `retros` | each file takes the name of the leaf reading it |

Each line is the same move. The approach lists the leaves, and the code writes the ones with a reader already and passes the rest.

The fix for the class is to read the approach as a list and answer every row. A leaf with nothing to hold opens an empty file, because an empty file says the window holds none of that thing.

The name is the same move once more. A reader opens the file named for the leaf they stand on, so the name follows the step and no other word.

### checked

- the change touches no file the ask leaves out. The leaves module and its cases, and one stale pointer the earlier move leaves behind.
- every door the change reaches has a fake. The cases drive the fake disk and the fake git alone.
- a comment names the approach the change implements. The empty leaf says why collect opens it and writes nothing.

<!-- the form is checklist -->

## change

<!-- makes the change -->

### lint

    ./RUNME.sh lint

<!-- the form is command -->

### checked

- the change touches no file the ask leaves out. The leaves module, its cases, and one stale pointer the earlier move leaves behind.
- every door the change reaches has a fake. The module reads the disk and git through their doors alone.
- a comment names the approach the change implements. The empty leaf says why collect opens it and writes nothing.

<!-- the form is checklist -->

## tests-green

<!-- makes the tests pass -->

### tests

    ./RUNME.sh branch test test/level0/retro-leaves.test.js

<!-- the form is command -->

### check

    ./RUNME.sh check

<!-- the form is command -->

### says

Collect lays out one file a leaf, under a folder of their own beside the copies.

| the leaf | what its file holds |
|---|---|
| `shell` | a job a row, with its count and one example |
| `refusals` | a rule a row, with how often it fires |
| `tickets` | a ticket closing in the window, as that commit leaves it |
| `scripts` | every script the copies carry |
| `runs` | the groups closing in the window, off the same commits |
| `score` | the retro tickets standing, so the step scoring them reads a file |
| `method` | empty, because the retro's own hand fills it as the run goes |
| `unread` | every line the manifest names, for the leaf reading the rest |

The shell and the refusals leaves read the log the copies carry. A row names its kind and its level, so one file answers both without a transcript.

The takes off git read the commits touching the tickets folder since the window opens. Each one answers as that commit leaves it, so a reader repeats the reading with no tree beside them.

The verdict sends the first cut back for three gaps, and each one closes:

| the gap | what closes it |
|---|---|
| no case drives a merged group | a case reads the group's row and the two tickets beside it |
| the `method` leaf takes no file | it opens empty, because the hand fills it as the run goes |
| the file reads `retros` | it reads `score`, which is the step reading it |

The route's collect step moves with the owner's ruling. It reads as the folders it skips now, and the open retro takes the new route through `ticket update`.

### checked

- the change touches no file the ask leaves out. The leaves module, the call inside collect, the route, and the open retro the update reaches.
- every door the change reaches has a fake. The module reads the disk and git through their doors alone.
- a comment names the approach the change implements. The module's header says why a leaf reads one file and runs nothing.

<!-- the form is checklist -->

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

- .claude/commands/se-config-work-retroCap.md
- .claude/commands/se-config-work-retroReaders.md
- .claude/commands/se-retro.md
- .claude/skills/level0/lib/projection-owner.js
- .claude/skills/level0/lib/projection.js
- HANDOVER.md
- spec/config/level0.json
- spec/config/level0.schema.json
- spec/config/projections.json
- spec/design_output/projection.md
- spec/processes/retro.yaml
- spec/tickets/a-retro-mints-itself.md
- spec/tickets/retro-018ba26.md
- spec/tickets/the-retro-cuts-its-window.md
- spec/tickets/the-retro-lays-its-leaves.md
- src/scripts/pull-route.js
- src/scripts/retro-collect.js
- src/scripts/retro-leaves.js
- src/scripts/retro-new.js
- src/scripts/retro-window.js
- src/scripts/retro.js
- test/level0/projection.test.js
- test/level0/retro-leaves.test.js
- test/level0/retro-new.test.js
- test/level0/retro-window.test.js

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

pass

Each gap the earlier verdict names closes, and the change answers the ask.

| the gap it names | what closes it |
|---|---|
| no case drives a merged group | a group ticket closes in the fake git, and a case reads its `runs` row |
| the `method` leaf takes no file | `method` opens empty, and a case asserts the file |
| the file reads `retros` | it reads `score`, which is the step reading it |

| what the ask asks | where it stands |
|---|---|
| one file a leaf, named for the leaf | `leavesOut` in `src/scripts/retro-leaves.js` |
| the takes off git land in the folder | `closedIn`, `mergedIn` and `standingRetros` |
| the manifest names each one | the row each leaf file pushes, which the `unread` leaf reads |
| the collect step reads as the folders it skips | `spec/processes/retro.yaml`, and the hash moves on the open retro |
| a case drives a closed ticket and a merged group | the tickets case and the runs case, which read both files back |

| what the reviewing guidance asks | what stands |
|---|---|
| the branch does what the brief asks | every line of the ask lands |
| the diff beyond the brief | the siblings' work on this shared branch, and one duplicate comment the earlier move leaves |
| every rule carries a case that fires | six cases drive the leaves, each reading a file back |
| a case feeds something bad | the empty window case, which asserts the empty file |
| a retro handback | none stands, because this ticket runs at the desk |

`./RUNME.sh check` exits 0 on this branch, and the leaves cases answer green over six.

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

- the leaves table stands once in the ticket, and each comment points at the design chapter

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
