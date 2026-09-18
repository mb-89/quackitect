---
kind: [[ticket]]
state: open
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
step: implement/tests-red
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

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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
