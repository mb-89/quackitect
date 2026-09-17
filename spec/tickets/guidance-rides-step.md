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
step: implement/tests-green
record:
  - step: design/draft
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: daad33433eb3bbd269f48595ccb852dcc78f76ce
    hash_after: daad33433eb3bbd269f48595ccb852dcc78f76ce
  - step: design/review
    hand: box 0fc2b4132f94 · claude-code-remote · helper-2
    hash_before: 1671435b8e08c775f38f44257ff0d4f0e48d3931
    hash_after: 1671435b8e08c775f38f44257ff0d4f0e48d3931
    returns: 1
    why: Four pieces of the ask go unanswered, and the ceiling claim breaks.; | the question reviewing asks | the answer |; |---|---|; | does the approach do what the ask asks | no, and four pieces of the ask go unanswered |; | is what the diff touches beyond the ask trivial | yes, and the commit touches this ticket alone |; | what does `./RUNME.sh check` answer | 1, on the health probe alone, and every test passes |; | does a retro stand in the handback | no, and the route puts the retro after the verdict phase |; | does every rule carry a test proving it fires | no, and the re-hand's compaction and moved hash carry none |; The findings, one a line:; The ceiling claim breaks. `wc -l src/scripts/pull.js src/scripts/work.js` answers past `code.fileLines`. The size rule refuses a growth on a file already past its ceiling. Name the split that takes the hand-out, the refusal, the material and the dispatch.; Two files hold one fact. The handed file and the hold both remember the notes. The ask names the hold alone, by name and hash. Say which one answers the ask.; The reads of a leaf go unanswered. Say that a leaf's reads and its phases' add up. Name the test claiming it.; The `work` answer goes unanswered. Say that it carries the notes' actionables inline, and the checklist with them.; The re-hand carries one test of three. The refusal stands, and the compaction and the moved hash stand untested.; The verb wears two names. The ask writes `branch guidance` in its bullet and `work guidance` in its table. The approach writes the first and places the second. Name one surface.; The judge's piece names work that stands. `./RUNME.sh config` answers no `judge.warmupWrites` and no `judge.thenEveryNth`. The level one wrapper judges every hand-back today. Say the piece stands.; What the agent needs:; | number | need | status |; |---|---|---|; | 1 | the draft hand names the split keeping every file it writes under `code.fileLines` | open |; | 2 | the draft hand answers the four pieces this verdict names | open |; | 3 | the draft hand names a test per re-hand trigger | open |; | 4 | the review hand reads the approach again | open |
  - step: design/draft
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: b3a754ecef8f358aeeb40e93e1d3fadf581c6af6
    hash_after: b3a754ecef8f358aeeb40e93e1d3fadf581c6af6
  - step: design/review
    hand: box 0fc2b4132f94 · claude-code-remote · helper-4
    hash_before: cb30d57a7469f428507f5284843930076e841d85
    hash_after: cb30d57a7469f428507f5284843930076e841d85
  - step: implement/tests-red
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: 765a99d1820faae2c12dc3ab598eb70f7c4bfaae
    hash_after: 765a99d1820faae2c12dc3ab598eb70f7c4bfaae
    answered:
      - name: tests
        exit: 1
        said: assertion, 9 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: 19065b18e8c89df14d2130ff14aaee28ff2674a7
    hash_after: 19065b18e8c89df14d2130ff14aaee28ff2674a7
    answered:
      - name: lint
        exit: 0
        said: 65 stand at warning, which the panel draws and check allows.
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
| how a hand gets a step's notes once | the pull hands them, and the hold remembers them per hand and step |
| how they come again | a refusal, a compaction and a moved hash each hand them again |
| how the engine keeps the arrival | the hold names each note by name and hash, and the log takes a row per note |
| how a hand asks for them | one verb, `./RUNME.sh branch guidance`, named or unnamed |
| what the standing layer keeps | the notes no step reads |
| where the change lands | new modules, because the write door refuses a growth on a file past its ceiling |

TL;DR:

- The hold answers the ask alone, and no second store stands beside it. For details, see [[spec/design_output/pull#the-hand-and-the-hold]].
- Part of the hand-out stands already, and the table below splits that part from what waits.
- A file split lands first, as a sibling ticket, because three files this change touches stand past `code.fileLines`.
- One surface carries the verb, and the ask's second wording for it drops.
- The judge reads every hand-back unsampled today, so this ticket writes none of that piece.

What stands, and the test claiming it:

| the piece the ask names | stands | the test claiming it |
|---|---|---|
| a leaf's reads and its phases' add up | yes | the pull test on a leaf inheriting from its phases |
| the work answer carries the actionables inline, with the checklist | yes | the pull test on the answer's Reads chapter |
| the hold names every note by name and hash | yes | the pull test reading the hold's reads |
| the judge reads every hand-back, unsampled | yes | the wrapper's own test |
| the verb `branch guidance` | no | none |
| a log row per note handed over | no | none |
| the re-hand on a refusal, a compaction or a moved hash | no | none |
| the standing layer drops a note a step reads | no | none |

The sibling ticket the split needs, which lands before this one:

| the file | what leaves it | why |
|---|---|---|
| the pull script | the hand-back's checks | it stands past the ceiling, so the door refuses a growth |
| the work script | the branch verbs and their table | the verb's dispatch grows it |
| the pull test | the hand-out's cases | the new cases grow it |

| the piece that waits | its home after the split |
|---|---|
| the verb, the re-hand and the note hashes | a new guidance script |
| the log row | the log library under level zero |
| the compaction | the level one wrapper |
| the layer a named note leaves | the guidance library under level zero |

| test | claim |
|---|---|
| the guidance verb test | named and unnamed, the verb answers through the fake doors |
| the log test | a row lands per note the pull hands over |
| the refusal test | a refusal hands the notes again |
| the compaction test | a compaction hands the notes again |
| the moved hash test | a note whose hash moved hands again, and an unmoved one does not |
| the layer test | a note a step reads leaves the standing layer |

| words | where |
|---|---|
| the chapter Guidance rides the step | the pull's design output |
| the layer a named note leaves | the level zero design output, under the standing layer |
| one actionable naming the verb | the tickets guidance |

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | the group's split mints the sibling ticket carrying the file split | open |
| 2 | this ticket names that sibling under depends_on | open |
| 3 | the review hand reads this approach against the ask | open |
| 4 | a pass moves this ticket to the implement phase | open |

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

| the question reviewing asks | the answer |
|---|---|
| does the approach do what the ask asks | yes, and every bullet of the ask carries a home and a test |
| is what the diff touches beyond the ask trivial | yes, and the commit touches this ticket alone |
| what does `./RUNME.sh check` answer | 0 |
| does a retro stand in the handback | no, and the route puts the retro after the verdict phase |
| does every rule carry a test proving it fires | yes, and the moved hash test asserts an unmoved note hands nothing |

TL;DR:

- The approach answers every bullet of the ask, and each finding the last verdict names lands.
- `./RUNME.sh check` exits 0 on the branch tip.
- The findings below stand open, and each one waits for the implement phase.

Where the last verdict's findings land:

| the finding | where it lands |
|---|---|
| the ceiling claim breaks | the split lands as a sibling ticket, and `wc -l` reads each file it names past `code.fileLines` |
| two files hold one fact | the approach says the hold answers the ask, and no second store stands beside it |
| the reads of a leaf go unanswered | the approach claims it stands, and the pull test on a leaf's inheritance backs it |
| the `work` answer goes unanswered | the approach claims it stands, and the pull test on the answer's Reads chapter backs it |
| the re-hand carries one test of three | a test stands per trigger, and the moved hash test asserts the unmoved note too |
| the verb wears two names | one surface stands, `./RUNME.sh branch guidance`, named and unnamed |
| the judge's piece names work that stands | the approach says the piece stands, and writes none of it |

The findings, one a line:

- The standing verb carries no test row. The layer test reads the library, and the verb reads that library too.
- The log test names no fake log. The ask asks for a test the fake log drives.
- The sibling ticket stands unminted. The `depends_on` link waits on that mint.

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | the group's split mints the sibling ticket the approach names | open |
| 2 | this ticket names that sibling under `depends_on` | open |
| 3 | the implement hand drives the log test from the fake log | open |
| 4 | the implement hand reads `./RUNME.sh standing` after a note leaves the layer | open |

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh branch test

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

The tests stand in a new file, `test/level0/guidance.test.js`, so no file past its ceiling grows.

| what the test drives | how it fails today |
|---|---|
| a log row per note the pull hands over | no row carries a note |
| the verb, unnamed, answering the step's notes and the always-on ones | the usage text answers instead |
| the verb, named, answering one note | the usage text answers instead |
| the verb with no hold standing | the usage text answers instead |
| a second hand-out naming the verb, handing no note again | the short line names the verb nowhere |
| a refusal on the hold handing the notes again | the short line answers instead |
| a compaction, which empties the hold's reads, handing them again | the short line answers instead |
| a moved hash handing that note again | the short line answers instead |
| the standing layer dropping a note the step reads | the layer takes no second argument |

What surprises me:

- The hold already names every note by hash. That piece of the ask stands, and its test passes today.
- The log door answers a promise, so a verb carrying a log answers one too.
- The older pull tests set no log, which is why they read as plain numbers.
- The write door refuses a shell heredoc into a tracked file, so every write here goes through an editing tool.

### checked

- the change touches no file the ask leaves out: the tests stand in one new file
- every door the change reaches has a fake: the disk, git, the clock and the log all run fake
- a comment names the approach the change implements: the file heads with what it drives

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

./RUNME.sh lint

### checked

- the change touches no file the ask leaves out: the pull, the work verb, the layer and three new modules
- every door the change reaches has a fake: the disk, git, the clock and the log all run fake
- a comment names the approach the change implements: each new file heads with what it does

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
