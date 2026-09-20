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
group: the-rules-hold-themselves
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/review
record:
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 57005e0893d436fc164ecbaafdff228c38b608bb
    hash_after: 57005e0893d436fc164ecbaafdff228c38b608bb
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-2
    hash_before: 1674b8341abf3251dda3e726d5336b8e8f823ed4
    hash_after: 1674b8341abf3251dda3e726d5336b8e8f823ed4
    returns: 1
    why: "| the finding | what to do |; |---|---|; | `matches: explains` in the rationale schema owns the star-to-chapter rule | Read that key in `underFaults`, and drop `StarNeedsSection` |; | The paragraph schema names no bad word, by its own header | Put the `History` markers beside `Antithesis.yml` |; | `.vale.ini` switches `PastTense` off over `spec/rationales` | Switch `History` off there the same way |; | `RuleNamesItsFailure` reads one buffer, and `tree.js` holds the pair rules | Put it beside `GuidanceChapter` under `VoiceShape` |; | Four notes star a rule whose rationale opens no chapter | Name the landing for each, below |; | `fault()` writes severity error | Say where the warning stage lives, or drop the stage |; | The failure rule answers rule twelve | Keep rule twelve in the note |; The drift the star rule finds, which the lint at zero wants cleared:; | the note | the starred rule standing with no chapter |; |---|---|; | `spec/guidance/cloud.md` | ten, fourteen, fifteen |; | `spec/guidance/tickets.md` | eight, nine, ten |; | `spec/guidance/working.md` | six, eleven |; | `spec/guidance/code/code.md` | ten |"
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: b2a3a5a306aa40d668642ebfac3793625ecdd8d8
    hash_after: b2a3a5a306aa40d668642ebfac3793625ecdd8d8
---

# Ask

The notes hold the rules they set, so a reader trusts a rule's own note.

Section numbers drift from rule numbers, history sits outside the rationales, and rule 12 stands unheld.

- A lint matches each starred rule to a rationale section of its number.
- A rule refuses history markers outside `spec/rationales`.
- Rule 12 carries a check, or it leaves the guidance note.
- `./RUNME.sh lint spec/guidance spec/rationales` exits 0.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Each of the three checks goes to the owner already standing for its reading:

| the check | where it lands | what it reads |
|---|---|---|
| a starred rule wants its chapter | `underFaults` in `.claude/skills/level0/lib/schema.js` | the guidance note, and the rationale its frontmatter names |
| a history marker stands off the rationales | `spec/config/styles/VoiceVale/History.yml` | one buffer, with `.vale.ini` switching it off over `spec/rationales` |
| a rule names the failure it prevents | `spec/config/styles/VoiceShape/RuleNamesItsFailure.yml` | the `Actionables` list of one guidance note |

`spec/schemas/rationale.schema.yaml` already declares the first check, as
`matches: explains` under `subsections`. The schema checker reads `numbered` and
`order` beside it, and passes over `matches`. So the work is that key's reader,
and the schema stays the one place saying the rule.

The two others read one buffer each, so Vale holds them the way it holds
`Antithesis` and `GuidanceCap`. A style file of its own carries each, because
the projection writes the register the paragraph schema owns.

The lint at zero wants the drift cleared, so the implement step writes the
chapter each starred rule lacks:

| the note | the starred rules wanting a chapter |
|---|---|
| `spec/guidance/cloud` | 10, 14, 15 |
| `spec/guidance/tickets` | 8, 9, 10 |
| `spec/guidance/working` | 6, 11 |
| `spec/guidance/code/code` | 10 |

Rule twelve of the guidance note is the one the failure check holds, so it stays
where it stands. Each new rule opens at error, because the drift it names goes
in the same change.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

| the finding | what to do |
|---|---|
| `matches: explains` in the rationale schema owns the star-to-chapter rule | Read that key in `underFaults`, and drop `StarNeedsSection` |
| The paragraph schema names no bad word, by its own header | Put the `History` markers beside `Antithesis.yml` |
| `.vale.ini` switches `PastTense` off over `spec/rationales` | Switch `History` off there the same way |
| `RuleNamesItsFailure` reads one buffer, and `tree.js` holds the pair rules | Put it beside `GuidanceChapter` under `VoiceShape` |
| Four notes star a rule whose rationale opens no chapter | Name the landing for each, below |
| `fault()` writes severity error | Say where the warning stage lives, or drop the stage |
| The failure rule answers rule twelve | Keep rule twelve in the note |

The drift the star rule finds, which the lint at zero wants cleared:

| the note | the starred rule standing with no chapter |
|---|---|
| `spec/guidance/cloud.md` | ten, fourteen, fifteen |
| `spec/guidance/tickets.md` | eight, nine, ten |
| `spec/guidance/working.md` | six, eleven |
| `spec/guidance/code/code.md` | ten |

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
