---
kind: [[ticket]]
state: open
depends_on:
  - the-runtime-files-stand-apart
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
group: the-warnings-feed-a-refactorer
step: design/draft
record:
  - step: design/draft
    hand: box dd2a59294365 · claude-code-remote
    hash_before: e57e5cc551b18d6c44ea86dbfbc9e030cc3eca46
    hash_after: e57e5cc551b18d6c44ea86dbfbc9e030cc3eca46
  - step: design/review
    hand: box dd2a59294365 · claude-code-remote · helper-2
    hash_before: 9f5de1e36173176d7bf67664279cadd59b1e4564
    hash_after: 9f5de1e36173176d7bf67664279cadd59b1e4564
    returns: 1
    why: "`MagicNumber` and `Schema.Placeholder` read `warning` today, so the claim that every rule reads `error` fails.; Warnings stand today under `./RUNME.sh check`, so a push door refusing on one refuses every push.; The approach names `src/scripts/prepush.js` alone, and the session push door in `src/bridge/bash.js` stands unnamed.; The generated `level` line comes from `.claude/skills/level0/lib/paragraph.js` and `snippets.js`, which the approach leaves out.; `spec/schemas/paragraph.schema.yaml` holds layers, and the projection writes many rules a layer, so a field a rule needs a new key.; Rules under `VoiceVale`, `VoiceShape` and `VoiceScript` carry no `level` line today, so Vale reads them at its default.; The approach writes `lib/tree.js`, and the file stands at `.claude/skills/level0/lib/tree.js`.; A write the door refuses at `error` still records its warnings, so the record describes text no file holds.; `voiceDoor` stands last in `src/bridge/write.js`, so an earlier door's refusal records nothing."
---

# Ask

**The gain.** Each rule says whether its break refuses a write or joins the warnings. One list then feeds the panel, the refactoring hand and the push door.

**What breaks otherwise.** Every break refuses a write. A hand fixing a hedge stops the work it stands inside, and the session spends its turns on words in place of code.

Every rule stands at error when this lands, so the tree behaves as it behaves today. A later ruling moves one rule at a time.

- every rule carries its side, and each one reads error
- the write door refuses a break at error, and records one at warning
- the push door refuses a push while a warning stands
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The side is the word a finding already carries: `severity`, reading `error` or `warning`. This change adds no word. It gives every rule one, and makes the two doors read it.

| what stands today | where |
|---|---|
| the split on the word | `./RUNME.sh lint`, in `src/scripts/cli-read.js` |
| the ruling on what each side means | [[spec/design_output/schema#warning-now-and-error-later]] |

**Where a side stands.** Every rule names its side in the file a reader edits:

| rule family | where the side stands | who writes the finding |
|---|---|---|
| the paragraph rules | `spec/schemas/paragraph.schema.yaml`, one field a rule | Vale, off the projected `level` |
| the hand-written rules under `VoiceScript`, `VoiceShape` and `VoiceVale` | the rule's own `level` | Vale |
| the rules over two files | the `fault` call in `lib/tree.js` | the check and the panel |
| the shape rules | the Go rules under `src/lsp` | the language server |

Vale's `level` is the side for a Vale rule, so no second field stands beside it. The projection carries the schema's field into the generated `level`, and a rule naming none reads `error`.

**Every rule reads error when this lands.** The projection writes `error` where the schema names nothing, and `fault` stamps `error` today. So the tree behaves as it behaves today, and a later ruling moves one rule by editing one field.

**The write door.** `voiceDoor` in `src/bridge/write.js` refuses on any finding Vale keeps. It splits:

| what the door reads | what it does |
|---|---|
| a finding at `error` | refuses the write, as today |
| a finding at `warning` | lets the write land, and records the finding |
| both | refuses, and records the warning beside it |

**The record.** The warnings stand in one file under the runtime folder, whose name `.claude/skills/level0/lib/folders.js` owns. It holds one entry a finding: the file, the line, the rule and the message. A write to a file rewrites that file's entries, so the record says what stands now.

**The two readers.**

| reader | what it does with the record |
|---|---|
| the push door, `src/scripts/prepush.js` | refuses the push while an entry stands, and names the files |
| the problems panel | draws the entries beside the doors' own findings |

**What the refactoring hand reads.** The same record. [[spec/tickets/the-hook-spawns-a-refactorer]] takes the spawn, and this ticket writes the list it reads. So one list feeds the panel, the hand and the push door, and every reader counts off it.

**The cases.**

- a finding at `warning` alone lets a write land, and the record holds it
- a finding at `error` refuses, whatever the warnings beside it say
- a second write to one file replaces that file's entries
- the push door refuses while an entry stands, and passes on an empty record
- the projection writes `error` for a rule naming no side, and the named side otherwise

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- `MagicNumber` and `Schema.Placeholder` read `warning` today, so the claim that every rule reads `error` fails.
- Warnings stand today under `./RUNME.sh check`, so a push door refusing on one refuses every push.
- The approach names `src/scripts/prepush.js` alone, and the session push door in `src/bridge/bash.js` stands unnamed.
- The generated `level` line comes from `.claude/skills/level0/lib/paragraph.js` and `snippets.js`, which the approach leaves out.
- `spec/schemas/paragraph.schema.yaml` holds layers, and the projection writes many rules a layer, so a field a rule needs a new key.
- Rules under `VoiceVale`, `VoiceShape` and `VoiceScript` carry no `level` line today, so Vale reads them at its default.
- The approach writes `lib/tree.js`, and the file stands at `.claude/skills/level0/lib/tree.js`.
- A write the door refuses at `error` still records its warnings, so the record describes text no file holds.
- `voiceDoor` stands last in `src/bridge/write.js`, so an earlier door's refusal records nothing.

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
