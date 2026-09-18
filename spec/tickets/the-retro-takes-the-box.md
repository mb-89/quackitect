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
  - step: design/review
    hand: box d42624a67d18a8 · claude-code · helper-2
    hash_before: 84e30870a745232f06e9ff8631995d88f33a8fde
    hash_after: 84e30870a745232f06e9ff8631995d88f33a8fde
    returns: 1
    why: name every line of the default deny list, because a hand takes an abstract default by guess; add the handover to that default, which [[spec/design_input/the-agent-pulls-tickets]] names beside the bin; keep the log archive under the private folder, because a rule over binaries drops the record; say which path the deny globs read for the transcripts, which stand outside the private folder; add `retro.deny` to `spec/config/level0.schema.json`, where every knob carries its type and its help; say where the retro folder stands, because the ask names a folder git keeps and git ignores `.se/`; name what lets a second collect run, because a half run leaves a folder standing; drop the deepest-first walk, or say what it serves, because the verb removes nothing
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: bc9ed22234501c5c8406e075ea65a5addbc5ecab
    hash_after: bc9ed22234501c5c8406e075ea65a5addbc5ecab
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

The verb copies and removes nothing. A drain that deletes leaves a box with no record where the retro fails half way. The walk takes any order, because nothing moves.

| where the deny list stands | `retro.deny` under the config, with its type and its help in the schema |
|---|---|
| what it holds | a glob a line, read against the path relative to the private folder |
| who adds to it | the owner, in the config, and a box through its own layer |

The default names every line, so a hand reads what it takes without guessing:

| the glob | why it stands outside the take |
|---|---|
| `retro/**` | the retro's own folders, which a take of a take doubles |
| `bin/**`, `lnav/**`, `*.pdf` | tools and reference, which no hand writes here |
| `hold/**` | the hold a hand writes as it works |
| `index.db*` | the index, which a copy tears while a writer holds it |
| `tmp/**`, `undo/**` | scratch and the write journal, which the tree derives again |
| `config.json`, `copy.json`, `box.json` | the box's own identity and its config layer |
| `show-panel` | a flag the editor reads and drops |
| `HANDOVER.md` | the brief, which git carries on the branch already |

The log archive stays inside the take. It carries the record of earlier runs, and a rule over binaries drops exactly what a retro reads.

A deny list takes a file of a kind nobody plans for. The `unread` leaf reads the manifest against what every other leaf reads, so a file nobody reads stands as a finding.

The transcripts stand outside the private folder, in the harness's own files. The verb reads their folder off the environment the harness sets, takes every session file, and names each in the manifest. The deny list covers the private folder alone.

| what the folder reads | `.se/retro/<ticket>/` |
|---|---|
| what git does with it | it ignores the whole private folder, and the retro ticket is what git keeps |
| what stands inside | the copies, at their relative paths, and the manifest |
| what a second run does | it refuses where a manifest stands, because that folder holds a whole run |
| what a torn run does | the verb replaces a folder carrying no manifest, because nothing finished there |

<!-- the form is text -->

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

fail

- name every line of the default deny list, because a hand takes an abstract default by guess
- add the handover to that default, which [[spec/design_input/the-agent-pulls-tickets]] names beside the bin
- keep the log archive under the private folder, because a rule over binaries drops the record
- say which path the deny globs read for the transcripts, which stand outside the private folder
- add `retro.deny` to `spec/config/level0.schema.json`, where every knob carries its type and its help
- say where the retro folder stands, because the ask names a folder git keeps and git ignores `.se/`
- name what lets a second collect run, because a half run leaves a folder standing
- drop the deepest-first walk, or say what it serves, because the verb removes nothing

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
