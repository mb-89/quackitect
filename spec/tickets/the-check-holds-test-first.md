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
step: implement/tests-green
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
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-6
    hash_before: ffe19ef7e750e438a51333e29248ca0c66a163cb
    hash_after: ffe19ef7e750e438a51333e29248ca0c66a163cb
  - step: implement/tests-red
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 7d46e3bf1dffb011de8cb46942ec752d31f60035
    hash_after: 2156b02e59565ef1786c28d11af66214d2600d7a
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 9b6016ec588e5effe367c554d91e05517d27d6e5
    hash_after: 6d9832536106f23cb2ec64ba47e7c71ba98090ea
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 315427838231412d0beb197ebac644c01b10f1f2
    hash_after: b4ccef58b2b43a00b8eca87b23f6aa793e12b6b8
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 5387e4f82b24 · claude-code-remote · helper-13
    hash_before: 36adad410996928249d857c7708a3ddf4c505106
    hash_after: 36adad410996928249d857c7708a3ddf4c505106
    returns: 1
    why: "| the finding | the fix |; |---|---|; | No fake takes `behaves`, so a door test still reads nothing for a call its fake lacks. The approach hands the guard to every fake | Wrap each fake under `src/doors/fake` in the guard, and let a case prove one throws |; | Rule five of [[spec/guidance/code/testing]] points at no program, and the approach says that line points at the check | Put the link in the rule, the way rule ten points at [[spec/guidance/code/code]] |; | `untestedIn` drops the whole delta once any test file stands in it, so one stale test carries many changed modules | Pair a test with the file it names, or say under `says` what the loose reading buys |; | `test/level0/tools-door.test.js` takes a new subject, and the cases over the session-start survey and the tools block go. No test names them now | Put those cases back under their own name, and leave the new door its own file |; What holds:; `./RUNME.sh check` exits 0 on the commit this verdict stands on.; The change touches the readings, the guard, both doors, two notes and the tests, and nothing outside the brief.; Each rule takes a case feeding it something bad: a module no test imports, and a delta carrying no test.; The two doors read one text, because the hook pipes the staged delta the Bash door builds.; `HANDOVER.md` carries a retro chapter, and it records this ticket at an earlier step."
  - step: implement/reflect
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 64d36e9aaded00447371e86471dbed1604df7512
    hash_after: 64d36e9aaded00447371e86471dbed1604df7512
  - step: implement/change
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 761ff00b48d108501332d790d68d82215460ce33
    hash_after: 0038a31df5626745d50bb402d30070216d484d01
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 8ca5d5197a5e56aebd4536730695c0fd5bae77be
    hash_after: 7aa808ed0a143a1ab424e75e1d005b7529bc2ffb
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 5387e4f82b24 · claude-code-remote · helper-17
    hash_before: 56b19596b10e6b5da0d1a2cc576d2e1bff090def
    hash_after: 56b19596b10e6b5da0d1a2cc576d2e1bff090def
    returns: 2
    why: "| the finding | the fix |; |---|---|; | The `disk`, `proc`, `session` and `bridgehead` fakes take no guard. A door test through one still reads `undefined` for a call the fake lacks | Wrap each of them in `behaves`, and let a case prove the disk fake throws |; | `says` holds that the disk and the process fakes answer through a closure. Each fake here returns an object literal, `clock` among them | Write the reason the code carries, or drop the line as each fake takes the guard |; | `names` reads the import off the whole delta. So a changed module another changed module imports passes on one unrelated test | Read the import off the hunk the test carries, and take a case feeding it that delta |; What holds:; `./RUNME.sh check` exits 0 on the commit this verdict stands on.; `test/level0/tools-door.test.js` stands as it stands on trunk, and the hand tools take their own file.; Rule five of [[spec/guidance/code/testing]] names the commit door and the tree rule.; The `clock`, `git` and `log` fakes take the guard. A case drives the clock into a call it lacks.; Both doors read one text, because the hook pipes the staged delta the Bash door builds.; Each rule takes a case feeding it something bad. A module no test imports, and a delta carrying a stray test.; The change touches the readings, the guard, both doors, the notes and the tests. It reaches nothing outside the brief.; The code answering the last round lands under the reflect commit. The change commit carries the note and the cases.; `HANDOVER.md` carries a retro chapter, and it records this ticket at design/review."
  - step: implement/reflect
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 78e7fe71e262a7482d3f4a989805fa50be1995c9
    hash_after: 78e7fe71e262a7482d3f4a989805fa50be1995c9
  - step: implement/change
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: d8336c89e9f48e164475c3a410f5137ec97a970f
    hash_after: 54bc3d1428169ef82019bff7dbc2c1b3f4ad49a8
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
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

pass

| the finding of the last round | where the draft answers it |
|---|---|
| a tree rule reads no delta | the tree rule reads the whole tree, and the two commit doors hand the delta to the same module |
| the work carrying the untested modules stands nowhere | the implement step writes a test for each, on this branch |
| the commit door is two, and the table names one | the table names both, the way the private note names them [[spec/design_output/private#two-doors-one-check]] |
| `behaves` is a fake of no door | the link to the chapter owning the rule lands |
| the module count and its table stand in prose | the table goes, and `./RUNME.sh lint` answers the count |

What I decide, so the draft moves:

- `src/doors/fake/behaves.js` holds. `doorsHold` in `src/scripts/cli-check.js` reads `src/doors` alone, so a helper beside the fakes changes no count.

What I check:

- `treeOf` answers `read` and `paths`, so the import rule reads each test against every tracked path. [[spec/design_output/tree#the-tree-handed-in]]
- `.claude/skills/level0/lib/tree.js` stands within a few lines of the bound `code.fileLines` sets. So the new rule takes its own module.
- The modules of the server no test imports are the ones the ask's second line names. `./RUNME.sh lint` names them once the rule lands.
- `lib/private.js` reaches nothing and takes a reach. So a reading beside it takes the delta in, and both doors build their own.
- `./RUNME.sh check` exits 0 on the commit this review stands on.

What the implement step decides:

- What the delta reading counts as a test file. A rule passing on any test in the delta asserts little.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/tested.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

- `test/level0/tested.test.js` drives the two readings and the guard a fake takes
- three cases fail on their own assertion, and the stubs answer an empty list
- the quiet cases pass already, because an empty list draws nothing
- the delta case reads the shape `addedIn` reads, so one parser answers both doors

What surprises the hand: a fake answers a call it lacks with nothing today. So a
test driving a door through one asserts on nothing until the guard lands.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the cases touch one test file, one module and the fakes' guard, which the approach names
- the tree case writes its own tree through the disk and git fakes
- each case carries the pointer at the chapter tabling the rules over two files

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

The four findings name three classes, and one of them cost a pair of cases:

| the class | the fault here | the fix for the class |
|---|---|---|
| a piece lands with nobody calling it | `behaves` stood in its own case alone, so every fake answered a missing call with nothing | the change wires each caller, and a case drives one of them |
| a rule passes on the weakest reading | one test file in a delta carried every changed file beside it | each change wants the test naming it, by name or by import |
| a write lands on a file a hand reads as free | `tools-door.test.js` held the survey cases, and a write took them | a new file takes a new name, and a write reads the file first |

The third class is the dear one. A write over a file already standing drops what
it held, and the check says nothing where the cases it drops pass elsewhere.
`test/level0/tools-door.test.js` stands as it stood, and the hand tools take
`test/level0/hand-tools.test.js`.

Rule five of the testing note names no program, which is the first class again:
a rule with no reader. The rule now names the door and the check holding it.

The third round names one class, and the same class twice over:

| the class | the fault here | the fix for the class |
|---|---|---|
| a piece lands halfway, and the note says it lands whole | four fakes take no guard, and the evidence names a difference standing nowhere | every caller takes it, and the evidence says what a hand can read back |
| a reading takes more text than its subject | `names` reads the import off the whole delta, so a source file importing another passes for a test | each file answers off its own hunk, which the delta already holds apart |

The second is the same fault the first round met, one layer down: a rule passing
on the weakest reading. So the delta reading now keys the added lines by file,
and each test answers for itself.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the fixes touch the fakes, the delta reading, the testing note and the two test files
- each fake takes the guard, so a call it lacks throws with the door's name
- each piece points at the chapter saying what it reads

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- this round touches the four remaining fakes, the delta reading and its case
- every fake under `src/doors/fake` takes the guard, so a call it lacks throws
- each piece carries the pointer at the chapter saying what it reads

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/tested.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A change and its test land together, and three programs hold that:

| what lands | where |
|---|---|
| `untestedIn`, over a staged delta | `.claude/skills/level0/lib/tested.js` |
| `everyModuleTested`, over the tree | the same module, in the tree rules |
| `behaves`, the guard a fake takes | `src/doors/fake/behaves.js` |

Both commit doors call the delta reading, the way both call `privateNow`: the
session meets it in `src/bridge/bash.js`, and a person at a terminal meets it
through `src/scripts/precommit.js`.

The import rule asks for the import and no bare path, because a path inside a
string reads as prose. Every module of the server now carries a test naming it,
and the nine that stood without one take the cases this change writes.

| what the notes take | where |
|---|---|
| the row naming the new rule | the table of rules over two files |
| the line saying what the guard does | the chapter on a fake behaving |

The second round answers the verdict:

| the finding | what lands |
|---|---|
| no fake took the guard | the clock, the git and the log fakes take it, and a case drives the clock |
| rule five named no program | the rule names the commit door and the tree rule holding it |
| one stray test carried every change | each change wants the test naming it, by file name or by import |
| a write dropped two standing cases | `tools-door.test.js` stands as it stood, and the hand tools take their own file |

The third round closes the two the second left open:

| the finding | what lands |
|---|---|
| four fakes stood without the guard | every fake under `src/doors/fake` takes it, and the check stays green |
| the evidence named a difference standing nowhere | this table says what a hand reads back |
| the import read off the whole delta | `hunksIn` keys the added lines by file, and each test answers off its own |

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the two readings, the guard, both doors, two notes and the nine tests
- every fake the tests reach comes from `src/doors/fake`, and the guard stands beside them
- each piece carries the pointer at the chapter saying what it reads

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

    .claude/skills/level0/lib/tested.js
    src/bridge/bash.js
    src/scripts/precommit.js
    .githooks/pre-commit
    src/doors/fake/behaves.js
    src/doors/fake/clock.js
    src/doors/fake/git.js
    src/doors/fake/log.js
    src/doors/fake/disk.js
    src/doors/fake/proc.js
    src/doors/fake/session.js
    src/doors/fake/bridgehead.js
    spec/design_output/tree.md
    spec/design_output/doors.md
    spec/design_output/private.md
    spec/guidance/code/testing.md
    spec/tickets/the-check-holds-test-first.md
    test/level0/tested.test.js
    test/level0/hand-tools.test.js
    test/level0/tools-door.test.js
    test/level0/review-door.test.js
    test/level0/window-door.test.js
    HANDOVER.md

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

fail

| the finding | the fix |
|---|---|
| The `disk`, `proc`, `session` and `bridgehead` fakes take no guard. A door test through one still reads `undefined` for a call the fake lacks | Wrap each of them in `behaves`, and let a case prove the disk fake throws |
| `says` holds that the disk and the process fakes answer through a closure. Each fake here returns an object literal, `clock` among them | Write the reason the code carries, or drop the line as each fake takes the guard |
| `names` reads the import off the whole delta. So a changed module another changed module imports passes on one unrelated test | Read the import off the hunk the test carries, and take a case feeding it that delta |

What holds:

- `./RUNME.sh check` exits 0 on the commit this verdict stands on.
- `test/level0/tools-door.test.js` stands as it stands on trunk, and the hand tools take their own file.
- Rule five of [[spec/guidance/code/testing]] names the commit door and the tree rule.
- The `clock`, `git` and `log` fakes take the guard. A case drives the clock into a call it lacks.
- Both doors read one text, because the hook pipes the staged delta the Bash door builds.
- Each rule takes a case feeding it something bad. A module no test imports, and a delta carrying a stray test.
- The change touches the readings, the guard, both doors, the notes and the tests. It reaches nothing outside the brief.
- The code answering the last round lands under the reflect commit. The change commit carries the note and the cases.
- `HANDOVER.md` carries a retro chapter, and it records this ticket at design/review.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the tree note tables the rule and the doors note holds the guard, and each module points at its chapter. The `says` line on the fakes stands against the code

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
