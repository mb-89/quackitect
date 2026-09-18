---
kind: [[ticket]]
state: open
urgency: now
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
    hash_before: 008a818f05e194cce9e1d41591390bf35caa5a4a
    hash_after: 008a818f05e194cce9e1d41591390bf35caa5a4a
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->

A retro reads the box whole, because one command drains it into a folder git keeps:

- the take is a deny list, so a file of a kind nobody plans for lands in the retro
- the manifest names every line it takes, and the unread leaf reads that manifest
- a drain has no undo, so the verb refuses while a hand holds a ticket

<!-- breaks, as text: what breaks if it is never done -->

The record dies with the box. A retro then reads what a hand remembers, and the log, the transcripts, the scripts and the notes reach nobody.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- `./RUNME.sh retro collect` writes a retro folder holding every file the deny list leaves standing
- the deny list stands in the config, and it names the retro's own folders and the runtime half
- the manifest holds one line per thing taken, and a case reads it back
- the verb refuses while a hold stands, and a case drives that refusal
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

`retro collect` walks the private folder, copies what the deny list leaves standing into the retro's own folder, and writes a manifest beside it.

| the step | what it does |
|---|---|
| refuses | a hold standing under the private folder stops the verb, because a hand mid-step writes files a copy tears |
| rotates | the log's open file closes, so the copy holds whole lines |
| walks | every path under the private folder, deepest first |
| keeps | a path the deny list leaves standing |
| copies | that path into the retro folder, at the same relative place |
| writes | one manifest line a path, with its size and where it comes from |

The verb copies and removes nothing. A drain that deletes leaves a box with no record where the retro fails half way, and the retro folder is the copy git keeps.

| where the deny list stands | `retro.deny` under the config |
|---|---|
| what it holds | a glob a line, read against the path relative to the private folder |
| what the default names | the retro's own folders, the runtime half, and the binaries |
| who adds to it | the owner, in the config, and a box through its own layer |

A deny list takes a file of a kind nobody plans for. The `unread` leaf reads the manifest against what every other leaf reads, so a file nobody reads stands as a finding.

The transcripts stand outside the private folder, in the harness's own files. The verb takes them by their own path, and the manifest names them as it names the rest.

| what the folder reads | `.se/retro/<ticket>/` |
|---|---|
| what stands inside | the copies, at their relative paths, and the manifest |
| what a second run does | it refuses, because a folder standing there holds a run already |

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
