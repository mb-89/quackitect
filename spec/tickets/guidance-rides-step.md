---
kind: [[ticket]]
state: open
urgency: soon
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
    needs: ["work test"]
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
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
process: [[standard]]
group: guidance-rides-the-step
step: design/draft
---

# Ask

The pull hands a leaf out with the notes its step reads. The hand holds the guidance the moment it holds the step, and the standing layer shrinks to the notes binding every session.

Without it every session carries every note on every turn. A refresher on every pull costs tokens, and the engine records nothing of what reaches a hand.

- `./RUNME.sh branch guidance` answers the held step's notes and the always-on ones, and `branch guidance <note>` answers one note
- one log line lands per note the pull hands over, and a test on the fake log drives it
- the hold names every note by name and hash
- a second hand-out at one step hands the notes again on a refusal, a compaction or a moved hash alone
- a note a step names leaves the standing layer, and `./RUNME.sh standing` shows it
- `./RUNME.sh check` exits 0 on the branch

Where it stands today: the design input `spec/design_input/the-agent-pulls-tickets.md` says what the
owner asks for, and the page beside it draws it. Read the note first. It
stands on the branch `claude/relaxed-knuth-f0uk4d` until the owner merges it,
so take that branch in where `work sync` leaves it absent.

The pull hands a leaf out already. This branch hands the guidance with it.
Its chapter is Guidance rides the step.

| what stands today | where |
|---|---|
| the standing layer, which hands every session the same notes | `.claude/skills/level0/lib/guidance.js` |
| the guidance notes, with actionables per chapter | `spec/guidance/` |
| the judge's sampling over the write door | `spec/config/level0.json`, `judge.warmupWrites` and `judge.thenEveryNth` |
| the hold per hand | the pull branch |

What waits, piece by piece:

| the piece | where | proves it |
|---|---|---|
| the reads of a leaf | `work.js` | a leaf's reads and its phases' add up |
| the `work` answer | `work.js` | it carries the notes' actionables inline, and the checklist |
| `work guidance [note]` | `work.js` | named, it answers one note, and unnamed, the current step's and the always-on ones |
| the log line | `lib/log.js` | one row per note handed over |
| the arrival | the hold file | the notes this hand holds for this step, by name and hash |
| the re-hand | `work.js` | a `refused` answer, a compaction, and a moved hash hand the notes again |
| the standing layer shrinks | `lib/guidance.js` | a note a step names leaves the layer |
| the judge on every hand-back | the plugin wrapper | no sampling reaches the pull's fifth check |

The rules to hold:

- Level one carries no reading probe. The proof of application is the hand-back.
- A refresher on every pull costs tokens and buys nothing the hold does not know.
- If the judge's findings on hand-backs run at three in four, the hash-keyed probe returns. Count them in the retro.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

| the ask asks | the approach answers |
|---|---|
| how a hand gets a step's notes once | the pull hands them, and a handed file remembers them per hand, step and session |
| how they come again | a refusal prints them, a compaction empties the handed file, and a moved hash reads as new |
| how the engine keeps the arrival | the hold names each note by name and hash, and the log gets one row per note |
| how a hand asks for them | the verb `branch guidance`, named or unnamed |
| what the standing layer keeps | the notes no step reads |

TL;DR:

- The handed file lives beside the hold, because the hold drops at the hand-back. For details, see [[spec/design_output/pull#the-hand-and-the-hold]].
- A note prints whole where the handed file holds no such hash, and one line names the verb otherwise.
- The wrapper judges every hand-back whole, and the material lays the payload over the ticket first. For details, see [[spec/design_output/pull#the-checks]].
- The verb and the handed file get a module of their own, so every file stays under the ceiling. For details, see [[spec/design_output/config#the-magic-numbers-take-names]].
- The terms here stand in the vocabulary, each with its note. For details, see [[spec/vocabulary/terms.yml]].

| piece | home |
|---|---|
| the handed file and the verb | a new guidance script beside the pull script |
| the hand-out, the refusal and the judge's material | the pull script |
| the compaction hook | the level one wrapper |
| the verb's dispatch | the work script |
| the layer a named note leaves | the guidance library under level zero, read by the bridge and the standing verb |

| test | claim |
|---|---|
| a new guidance verb test | the handed file, the verb and the log row hold, through the fake doors |
| the guidance test | a note a step reads leaves the layer |
| the pull test | the hand-out logs a row, the second hand-out prints the short line, and the material carries the payload |

| words | where |
|---|---|
| the chapter Guidance rides the step | the pull's design output |
| the layer a named note leaves | the level zero design output, under the standing layer |
| one actionable naming the verb | the tickets guidance |

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | the review hand reads this approach against the ask | open |
| 2 | a pass moves the ticket to the implement phase | open |

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

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

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

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

# Discussion

The box wrote the approach under draft and handed it back five times, and the judge refused every one. The refusal names no rule, counts on no hold and writes no log line, so the person step at five refusals stays out.

A helper read the judge's exact prompt and named what breaks:

| rule | what the helper says |
|---|---|
| 4 | facts stand without a link, so it reads them as facts the hand owns |
| 13 | the text opens with a table and follows with lists, and it wants the TL;DR list |
| 14 | the text closes without the table What the agent needs |
| 15 | the terms hold, pull, verb and wrapper read as jargon, because the vocabulary stands outside the prompt |

The approach above meets all four on its face, and the judge refuses it still. So under this judge the voice rules on a chat answer bind ticket evidence. A person decides what the judge reads. Three ways stand:

- the judge skips a rule on an answer, a stop call or a prompt
- the judge asks per rule and quotes the rules it finds broken, so a hand fixes what it names
- the judge's refusal counts on the hold and writes a log line, so the person step comes at five

The judge's material reads the ticket as it stands and drops the payload. A hand-back with fields shows the judge an empty field. The approach names that fix.
