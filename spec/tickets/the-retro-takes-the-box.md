---
kind: [[ticket]]
state: open
urgency: now
step: verdict
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: person-1
        does: answers the question the engine asks
        by: person
        to: engine
        asks: "design/review failed back 2 times: The earlier findings close, apart from the walk's order. These stand:; close the walk's order: the table says deepest first, and the prose says any order; name the runtime files the default leaves standing: `index.json`, `level0.stamp`, `level0.health`; say how a list knob passes `./RUNME.sh config`, which writes one command a knob taking one typed value; fix the handover's reason: the glob matches the private handover, which stands outside git [[spec/design_output/work]]; `./RUNME.sh check` exits 0 on this branch."
        evidence:
          - name: answer
            form: text
            says: the answer, which the step behind this one reads
      - name: person-2
        does: answers the question the engine asks
        by: person
        to: engine
        asks: "design/review failed back 3 times: The owner's ruling closes every earlier finding. One gap stands, and a second beside it:; the log moves to `.se/runtime` [[spec/tickets/the-runtime-folder-holds-state]], and the skips row passes that folder; say how the log reaches the retro, because the rotates row prepares a file collect leaves standing; name the scratchpad, which [[spec/design_input/the-agent-pulls-tickets]] gives as the second source the `scripts` leaf reads; The rest answers the ask: the two skips, the manifest, the hold refusal, the transcripts, the second run.; `./RUNME.sh check` exits 0 on this branch."
        evidence:
          - name: answer
            form: text
            says: the answer, which the step behind this one reads
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
  - step: design/review
    hand: box d42624a67d18a8 · claude-code · helper-4
    hash_before: 30da2f2da97abe3d0bd07bb579a3a7f59a5eea6b
    hash_after: 30da2f2da97abe3d0bd07bb579a3a7f59a5eea6b
    returns: 2
    why: "The earlier findings close, apart from the walk's order. These stand:; close the walk's order: the table says deepest first, and the prose says any order; name the runtime files the default leaves standing: `index.json`, `level0.stamp`, `level0.health`; say how a list knob passes `./RUNME.sh config`, which writes one command a knob taking one typed value; fix the handover's reason: the glob matches the private handover, which stands outside git [[spec/design_output/work]]; `./RUNME.sh check` exits 0 on this branch."
  - step: design/person-1
    hand: box d42624a67d18a8 · claude-code · the owner says so
    hash_before: 28011a9a0b2a4bd1951288fe25d94d2e17c784e0
    hash_after: 28011a9a0b2a4bd1951288fe25d94d2e17c784e0
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: 364774fdc247f3c43e5a79d65f518880ad65696f
    hash_after: 364774fdc247f3c43e5a79d65f518880ad65696f
  - step: design/review
    hand: box d42624a67d18a8 · claude-code · helper-7
    hash_before: ceb222f5e7e499abef1471ce06e4e2adf9706a3f
    hash_after: ceb222f5e7e499abef1471ce06e4e2adf9706a3f
    returns: 3
    why: "The owner's ruling closes every earlier finding. One gap stands, and a second beside it:; the log moves to `.se/runtime` [[spec/tickets/the-runtime-folder-holds-state]], and the skips row passes that folder; say how the log reaches the retro, because the rotates row prepares a file collect leaves standing; name the scratchpad, which [[spec/design_input/the-agent-pulls-tickets]] gives as the second source the `scripts` leaf reads; The rest answers the ask: the two skips, the manifest, the hold refusal, the transcripts, the second run.; `./RUNME.sh check` exits 0 on this branch."
  - step: design/person-2
    hand: box d42624a67d18a8 · claude-code · the owner says so
    hash_before: a1ce0cf0d6e9f8836af5c716406369d4ee4d963c
    hash_after: a1ce0cf0d6e9f8836af5c716406369d4ee4d963c
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: 54f61c4bd478405246131a56d3f14c73b690abbd
    hash_after: 54f61c4bd478405246131a56d3f14c73b690abbd
  - step: design/review
    hand: box d42624a67d18a8 · claude-code · helper-10
    hash_before: 171638bd5de07979e10a3830d238fc5cb0cde336
    hash_after: 171638bd5de07979e10a3830d238fc5cb0cde336
  - step: implement/tests-red
    hand: box d42624a67d18a8 · claude-code
    hash_before: 8a44665ca2f54928ba288083442591b5b0f61455
    hash_after: 8a44665ca2f54928ba288083442591b5b0f61455
    answered:
      - name: tests
        exit: 1
        said: assertion, 6 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box d42624a67d18a8 · claude-code
    hash_before: 48e66d02651218cc7b798e2fb6c4c7d5fa3f4042
    hash_after: 48e66d02651218cc7b798e2fb6c4c7d5fa3f4042
    answered:
      - name: lint
        exit: 0
        said: 73 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box d42624a67d18a8 · claude-code
    hash_before: 2980e46d8778e98048c28096640c45beacb829fa
    hash_after: 2980e46d8778e98048c28096640c45beacb829fa
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 73 stand at warning, which the panel draws and check allows.
group: the-retro-runs
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

## person-1

<!-- answers the question the engine asks -->

### answer

The owner rules the whole question away. A runtime folder holds the state a box keeps while it works, and collect skips that folder.

| what the owner says | what it settles |
|---|---|
| the index, the stamp, the health and the lint output stand in the runtime folder | the list of runtime files goes |
| collect skips the runtime folder and the retro's own | the glob list goes, and the config knob with it |
| a folder says what its files are for | a reader tells the kinds apart by where they stand |

So three of the four questions fall away:

- the order files copy in carries no meaning, because collect removes nothing
- the handover needs no line of its own, because its folder decides it
- a glob list reaches the config nowhere, because no glob list stands

This ticket waits on [[spec/tickets/the-runtime-files-stand-apart]], which cuts that folder.

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

## person-2

<!-- answers the question the engine asks -->

### answer

The owner rules the log out of the runtime folder, because the retro collects it.

| what the owner says | what it settles |
|---|---|
| the log stands outside the runtime folder | collect copies it, because the skip passes it by |
| the runtime folder holds what dies with the box | a record a reader reads later stands outside it |
| a hand writes scripts in two places | collect searches the scripts folder and the scratchpad |

The owner wants the scripts read, and a hand still writes them under the scripts folder.

- [[spec/tickets/the-runtime-folder-holds-state]] moves the log into the runtime folder
- The owner rules that wrong, and this session corrects that ticket

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

## draft

<!-- writes the approach the ask calls for -->

### approach

`retro collect` copies the private folder into the retro's own folder, and writes a manifest beside it.

| the step | what it does |
|---|---|
| refuses | a hold standing under the private folder stops the verb, because a hand mid-step writes files a copy tears |
| rotates | the log's open file closes, so the copy holds whole lines |
| copies | every path under the private folder, at the same relative place |
| skips | the runtime folder, and the retro's own folder |
| writes | one manifest line a path, with its size and where it comes from |

The owner rules the skip a folder and no list. A folder says what its files are for, so a reader tells the kinds apart by where they stand.

| the folder | why collect passes it |
|---|---|
| the runtime folder | it holds the state a box keeps while it works, which dies with the box |
| the retro folder | it holds a copy already, and a copy of a copy doubles it |
| the log, which the owner rules out of the runtime folder | a retro reads it most, so collect copies it |

Everything else comes across. A file of a kind nobody plans for lands in the retro that way. The `unread` leaf reads the manifest against what the other leaves read.

The verb copies and removes nothing. A drain that deletes leaves a box with no record where the retro fails half way. The order of the copies carries no meaning.

Two things a retro reads stand outside the private folder:

| what stands outside | where the verb reads it |
|---|---|
| the transcripts, thoughts and all | the harness's own folder, off the environment it sets |
| the scripts a hand writes there | the scratchpad, beside the scripts folder inside |

The verb copies each of the two, and names each line in the manifest. A hand still writes scripts under the scripts folder, so collect searches both.

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

pass

The approach answers the ask, and the owner's three rulings close every earlier finding:

- the skip is two folders, the runtime one and the retro's own, and no glob list stands
- the log stands outside the runtime folder, so collect copies it
- the `scripts` leaf reads two sources, the scripts folder and the scratchpad
- the manifest holds one line a path, and the `unread` leaf reads it back
- a hold under the private folder stops the verb, and a torn run replaces itself

One caution for the implement hand: the log's row stands in the table of folders collect passes, and that row says collect copies it.

`./RUNME.sh check` exits 0 on this branch.

<!-- the form is verdict -->

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

    ./RUNME.sh branch test test/level0/retro-collect.test.js

<!-- the form is command -->

### seen

Six cases stand, and each one fails on its own assertion.

| the case | what it asks of the verb |
|---|---|
| a hold stands | it answers one, writes nothing, and names the hand holding a ticket |
| the copy | a note and a probe come across, and the runtime folder and its own stay |
| the log | it comes across whole, because the owner rules it outside the runtime folder |
| the scripts | the folder inside and the scratchpad outside both come across |
| the manifest | a line a path, with a size and where it comes from, and no skipped folder |
| the second run | it refuses where a manifest stands, and goes again where none does |

What surprises me is the shape of the refusal. The verb answers usage today and returns two, so every case reads its own assertion and no crash.

The scratchpad reaches the verb as a door, off `it.scratch`. The command line fills it from the environment, so a case hands it a path and touches no real folder.

### checked

- the change touches no file the ask leaves out. One case file lands, and nothing else moves.
- every door the change reaches has a fake. The cases drive the fake disk, the fake git and the fake clock.
- a comment names the approach the change implements. The header points at the retro chapter of the design input.

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

    ./RUNME.sh lint

<!-- the form is command -->

### checked

- the change touches no file the ask leaves out. One file lands, and the verb table and the need list each take a line.
- every door the change reaches has a fake. The verb reads the disk through the door alone, and the cases drive the fake.
- a comment names the approach the change implements. Each function points at the chapter ruling it.

<!-- the form is checklist -->

## tests-green

<!-- makes the tests pass -->

### tests

    ./RUNME.sh branch test test/level0/retro-collect.test.js

<!-- the form is command -->

### check

    ./RUNME.sh check

<!-- the form is command -->

### says

`./RUNME.sh retro collect <ticket>` stands, and the six cases over it pass.

| what lands | where |
|---|---|
| the verb itself | `src/scripts/retro-collect.js` |
| the verb table, so the retro route reads the need | `src/scripts/pull-route.js` |
| the dispatch beside the note drain | `src/scripts/retro.js` |

The verb reads the disk through its door alone, so a case drives it in memory. It copies and removes nothing, and it writes the manifest last. A run that stops half way leaves a folder carrying no manifest, and the next run replaces that folder.

One case moves beside the change. `holdsVerb` reads `retro collect` as absent, and the verb table now names it, so that line reads the verb standing.

| what the verb reaches on this box | what it does |
|---|---|
| the private folder | it copies every path the two skips leave standing |
| the scratchpad and the transcripts | it reads each off a door, and passes where the door stands empty |

No variable on this box names the scratchpad or the transcript folder. The verb takes each as a door and skips a door standing empty, so the two wait on the ticket that finds their paths.

### checked

- the change touches no file the ask leaves out. The verb, its dispatch, its need, and the one case the verb table moves.
- every door the change reaches has a fake. The verb reads and writes through the disk door, and the cases drive the fake.
- a comment names the approach the change implements. Each function points at the chapter ruling it.

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

- The owner answers `design/person-1` in the chat, and rules the runtime folder the skip.
- The owner then tells this session to record that answer and run the hand-back.
- So the record names an agent a person tells, and the words under it are the owner's own.
