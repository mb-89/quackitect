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
    hash_before: f47aad74858bba92290ad23b86b03f90612c29ee
    hash_after: f47aad74858bba92290ad23b86b03f90612c29ee
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-2
    hash_before: 508497e79c37bfb21587a55e64c588b165a3d343
    hash_after: 508497e79c37bfb21587a55e64c588b165a3d343
    returns: 1
    why: "| the finding | the fix |; |---|---|; | The import rule lands red. Modules under `src/bridge` stand with a test naming none of them | Name the route to green: the tests to write, or a rule firing on a changed module alone |; | The exception has no reader. `.githooks/pre-commit` hands the door the staged delta alone | Put the exception where a door already reads, or name the door reading the message |; | The first reading and the door disagree. `src/scripts/precommit.js` reads the staged delta, and the approach wants the branch against trunk | Say which text the hook and the check both read, because one text answers both |; | `.claude/skills/level0/lib/tree.js` stands near the bound `code.fileLines` sets | Name where the import rule lands, and what moves out to make room |; | `spec/design_output/tree.md` owns the table naming every tree rule | Add the row for the import rule, and link the note from the approach |; | `spec/design_output/doors.md` owns \"door\" for a thing under `src/doors` | Name the thing under `src/bridge` by its own word, so one word holds one thing |; What holds:; Rule five of [[spec/guidance/code/testing]] is the rule the ask points at.; A tree rule is the place for a rule weighing two files. [[spec/design_output/tree]]; `behaves` stands nowhere yet, so the third program writes it."
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 3a1ce80be7534909ad81d02232a9ab310fd74e5c
    hash_after: 3a1ce80be7534909ad81d02232a9ab310fd74e5c
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-4
    hash_before: d96e6e0801486d05a93bb86eb8cf4fc2c6ab7918
    hash_after: d96e6e0801486d05a93bb86eb8cf4fc2c6ab7918
    returns: 2
    why: "| the finding | the fix |; |---|---|; | A tree rule reads no delta. The reader answers `read`, `exists`, `names`, `paths`, `words`, `node` and `box`, and the import rule wants the modules the delta touches [[spec/design_output/tree#the-tree-handed-in]] | Read the whole tree and say what turns the red green, or name a door that holds a delta and land the rule there |; | A whole-tree import rule lands red, and the work carrying the modules stands nowhere. No ticket under `spec/tickets` holds them | Mint that ticket before this one lands, or carry the modules here |; | The commit door is two, and the table names one. `lib/bash.js` with the hook takes a session, `.githooks/pre-commit` takes a person [[spec/design_output/private#two-doors-one-check]] | Name the one module both doors call, the way `privateNow` holds the private rule for both |; | Each door has its fake beside it under `src/doors/fake`, and `behaves` is a fake of no door [[spec/design_output/doors#a-fake-behaves]] | Land `behaves` where a helper over the fakes stands, and link the chapter owning the rule |; | The module count and its table stand in prose, and the first test written drifts them [[spec/guidance/voice]] | Name the command answering the count, and cut the table |; What holds:; The modules the table names are exactly the `src/bridge` modules no test imports today.; The staged delta answers the hook and the Bash check both, so the second finding of the last round lands.; The delta carries the whole answer, so no exception rides on the commit message.; The row and the link land on the note owning every rule over two files. [[spec/design_output/tree#the-rules-over-two-files]]"
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 67bc57fc48bc53560785cd24489b2b7a943b65d7
    hash_after: 67bc57fc48bc53560785cd24489b2b7a943b65d7
---

# Ask

A change and the test proving it land together, so the next hand reads what holds.

Code lands with the test behind it or missing, and the live session finds the break.

- The check refuses a commit changing `src` where no test lands before or beside it.
- The check refuses a door under `src/bridge` where no test imports it.
- A fake answers a call it lacks by throwing, so a door test passes on nothing.
- `./RUNME.sh check` holds the rule that `spec/guidance/code/testing.md` names.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Three programs stand, one for each line the ask names:

| what holds it | where it lands | what it reads |
|---|---|---|
| a reading both commit doors call | `.claude/skills/level0/lib/tested.js` | a staged delta, and the test files standing in it |
| a rule over a pair | the same module, in the tree rules | every module of the server, against the paths the tests import |
| a fake's own guard | `src/doors/fake/behaves.js` | a call the fake lacks, which throws in place of answering nothing |

The readings:

- a change touching a tracked `.js` under `src` wants a test file in the same delta
- the delta reading skips the fakes and every projection target
- the import rule reads a test naming a module by path, so a module nobody drives comes back named
- `behaves(fake, name)` wraps a fake in one place, and every door's fake takes it there

The delta carries the whole answer, so no exception rides on the commit message.
A hand meeting the refusal writes the test, and the door names the rule and the
file it stands on.

Two doors take the commit, and both call the one reading, the way both call
`privateNow` today. [[spec/design_output/private#two-doors-one-check]]

| the door | who meets it |
|---|---|
| `.claude/skills/level0/lib/bash.js` | a session |
| `src/scripts/precommit.js`, behind `.githooks/pre-commit` | a person at a terminal |

A tree rule reads the tree and no delta, so the import rule reads every module
of the server. It lands red on the modules no test names, and the implement step
writes a test for each. `./RUNME.sh lint` answers how many stand today, and the
rule names each one.

| what moves | where it lands |
|---|---|
| the delta reading and the import rule | a module beside `tree.js`, which stands near the bound `code.fileLines` sets |
| the row naming the new rule | the table the tree note holds [[spec/design_output/tree#the-rules-over-two-files]] |
| the guard a fake takes | `src/doors/fake/behaves.js`, beside the fake of each door |
| the line saying what a fake owes | the chapter the doors note holds [[spec/design_output/doors#a-fake-behaves]] |

Rule five of [[spec/guidance/code/testing]] is the rule these hold. So that line
points at the check, and no reader holds the rule in memory.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

| the finding | the fix |
|---|---|
| A tree rule reads no delta. The reader answers `read`, `exists`, `names`, `paths`, `words`, `node` and `box`, and the import rule wants the modules the delta touches [[spec/design_output/tree#the-tree-handed-in]] | Read the whole tree and say what turns the red green, or name a door that holds a delta and land the rule there |
| A whole-tree import rule lands red, and the work carrying the modules stands nowhere. No ticket under `spec/tickets` holds them | Mint that ticket before this one lands, or carry the modules here |
| The commit door is two, and the table names one. `lib/bash.js` with the hook takes a session, `.githooks/pre-commit` takes a person [[spec/design_output/private#two-doors-one-check]] | Name the one module both doors call, the way `privateNow` holds the private rule for both |
| Each door has its fake beside it under `src/doors/fake`, and `behaves` is a fake of no door [[spec/design_output/doors#a-fake-behaves]] | Land `behaves` where a helper over the fakes stands, and link the chapter owning the rule |
| The module count and its table stand in prose, and the first test written drifts them [[spec/guidance/voice]] | Name the command answering the count, and cut the table |

What holds:

- The modules the table names are exactly the `src/bridge` modules no test imports today.
- The staged delta answers the hook and the Bash check both, so the second finding of the last round lands.
- The delta carries the whole answer, so no exception rides on the commit message.
- The row and the link land on the note owning every rule over two files. [[spec/design_output/tree#the-rules-over-two-files]]

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
