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
step: design/review
record:
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: 5fa1e2fec704611d5375b260d9342d4ea9731a72
    hash_after: 5fa1e2fec704611d5375b260d9342d4ea9731a72
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

<!-- the form is text -->

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

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
