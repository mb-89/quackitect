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
step: design/draft
record:
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: e2e77e89159f57d7cf228ad1a44cbd910c6959ea
    hash_after: e2e77e89159f57d7cf228ad1a44cbd910c6959ea
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-2
    hash_before: 6a13ae8d7f28100b1d965bdbe2a123cb63564677
    hash_after: 6a13ae8d7f28100b1d965bdbe2a123cb63564677
    returns: 1
    why: "The call site sits where a named path skips it. [[spec/design_output/tree#when-the-sweep-runs]]; `./RUNME.sh lint spec` runs Vale alone, and the ask wants that verb to name every place.; Name the file holding `restatedFaults`, because `tree.js` stands near the ceiling `code.fileLines` sets.; Name each bound's key, and its entry in `spec/config/level0.schema.json`, which every control takes.; The script rule blanks inside the projection, so name the JavaScript this rule blanks with.; Say which reading Vale keeps, because a paragraph against its own table reads one buffer."
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 48ee2a38e214aa067dd910d91e9302fcccf09095
    hash_after: 48ee2a38e214aa067dd910d91e9302fcccf09095
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-4
    hash_before: 28fdafe3de7d68163d1f9e4d439ee1768431ca0f
    hash_after: 28fdafe3de7d68163d1f9e4d439ee1768431ca0f
    returns: 2
    why: A named path asks the checker under `src/lsp`, and the module stands outside that road.; Say which checker holds each rule, because the editor and the check read the one under `src/lsp`.; Name the JavaScript the module blanks with, because `blanked` stands inside the projection.; Say the scope `RestatedTable` reads, and the rule file it lands in.; Name the level `RestatedTable` lands at, because the projection writes a level into every rule file.
---

# Ask

One place owns each fact, so a reader follows the pointer and finds it current.

A sentence counts its own table, a header retells its pointer, and the copies drift apart.

- A check finds a sentence restating the table under it.
- The check finds a header retelling the note its pointer names.
- The check finds a rule standing in two guidance notes.
- `./RUNME.sh lint spec` names every place the check finds today.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

One measure answers the three: the longest run of words two places share. Each
rule lands where its reading belongs, because Vale hands a rule one buffer:

| the finding | where it lands | what it reads |
|---|---|---|
| `RestatedTable` | the paragraph schema, projected into Vale | a paragraph and the table touching it, in one buffer |
| `RestatedPointer` | `restatedFaults` in `.claude/skills/level0/lib/restated.js` | a heading, and the heading its pointer names in another note |
| `RestatedRule` | the same module | a rule line, against every rule line of another guidance note |

The two reading a pair of notes stand in a module of their own, because
`tree.js` stands near the ceiling `code.fileLines` sets.

The pieces:

- `sharedRun(a, b)` answers the longest run two texts share, and each rule reads its own bound
- the module blanks a code span, a link and a fence, the way `blanked` reads beside the prose reader
- a pointer resolves through the slug the vocabulary note names, so it reads the heading a reader clicks
- a rule line reads as the text after its number, so the mark before it counts for nothing

The lint calls it for a named path too. The tree rules run over the whole tree
alone today, so this one takes the paths in hand and reads the notes under
them. [[spec/design_output/tree#when-the-sweep-runs]]

Each bound takes a key, and each key an entry in `spec/config/level0.schema.json`:

| key | what it bounds |
|---|---|
| `restated.table` | the run a paragraph shares with the table touching it |
| `restated.pointer` | the run a heading shares with the heading its pointer names |
| `restated.rule` | the run two rule lines of two notes share |

The two rules in JavaScript land at warning, and the implement step lists what
they name over the tree. The ticket cleaning those places turns them to error.
So this one leaves no fault standing behind a green check.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- A named path asks the checker under `src/lsp`, and the module stands outside that road.
- Say which checker holds each rule, because the editor and the check read the one under `src/lsp`.
- Name the JavaScript the module blanks with, because `blanked` stands inside the projection.
- Say the scope `RestatedTable` reads, and the rule file it lands in.
- Name the level `RestatedTable` lands at, because the projection writes a level into every rule file.

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
