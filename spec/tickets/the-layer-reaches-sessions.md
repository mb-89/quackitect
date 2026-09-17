---
kind: [[ticket]]
state: closed
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
group: guidance-rides-the-step
step: verdict
record:
  - step: design/draft
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: ce48a7b824a94ba3ffcd7ad9867f488112e28876
    hash_after: ce48a7b824a94ba3ffcd7ad9867f488112e28876
  - step: design/review
    hand: box 0fc2b4132f94 · claude-code-remote · helper-2
    hash_before: dcc573eb0a7765e6d259cd5f5502223ee4b2180d
    hash_after: dcc573eb0a7765e6d259cd5f5502223ee4b2180d
    returns: 1
    why: "| the question reviewing asks | the answer |; |---|---|; | does the approach answer the ask | no, and the box claim breaks |; | is what the diff touches beyond the ask trivial | yes, the commit writes this ticket alone |; | what does `./RUNME.sh check` answer | 0 |; | does a retro stand in the handback | no, and no handback stands on the branch |; | does every claim the approach makes carry a test | no, one road carries none |; TL;DR:; The drop reads right. One helper answers the held step's notes, and both roads call it.; The ceiling claim holds. `wc -l` reads both roads under `code.fileLines`.; The helper mints a box and writes it, so the third test's claim breaks.; Each road hands the helper a box the helper does not read, and the approach names no fix.; The findings, one a line:; The box claim breaks. `handOf` mints a box id and writes it where none stands.; The third test asserts the box file stays absent, and the helper writes it. Name what the road does instead.; The bridge hands no `join` and no `git`, which the helper's path reaches. Name what each road passes.; The trees split. The bridge reads its notes off the vehicle tree, and the hold stands under the worked tree. Name the root each road passes.; The hand name finds the hold. Name the hand each road reads, because the pull keys the hold by that name.; The bridge builds two layers, `standing` and `helper`, and the approach names one. Say what a spawned helper carries.; The counts answer every note, and the sentence a session reads says those numbers. Say what they answer once a note leaves.; The runtime road carries no test. Say what claim stands there, and how a reader reads it.; What the agent needs:; | number | need | status |; |---|---|---|; | 1 | the draft hand says what the box write does on a tree holding none | open |; | 2 | the draft hand names what each road passes, and off which root | open |; | 3 | the draft hand names the hand each road reads | open |; | 4 | the draft hand says what the helper layer and the counts carry | open |; | 5 | the review hand reads the approach again | open |"
  - step: design/draft
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: 8bb611210d85d2bdba305a86bde78a04158fced1
    hash_after: 8bb611210d85d2bdba305a86bde78a04158fced1
  - step: design/review
    hand: box 0fc2b4132f94 · claude-code-remote · helper-4
    hash_before: daa9099594b03d038576790c4310a27437faa6cc
    hash_after: daa9099594b03d038576790c4310a27437faa6cc
  - step: implement/tests-red
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: 37c5ef1b2aa59abbf8c7f6744906b264313db543
    hash_after: 37c5ef1b2aa59abbf8c7f6744906b264313db543
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: 073b5a643fc819053bb0be8f1a1b0cc46b12b3a2
    hash_after: 073b5a643fc819053bb0be8f1a1b0cc46b12b3a2
    answered:
      - name: lint
        exit: 0
        said: 67 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: 2b01c6ae60938fb319287c70c6eb8fbc678f6b4a
    hash_after: 2b01c6ae60938fb319287c70c6eb8fbc678f6b4a
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 67 stand at warning, which the panel draws and check allows.
  - step: verdict
    hand: box 0fc2b4132f94 · claude-code-remote · helper-9
    hash_before: d086c3e3a78042dfa23110b47a86bdf6181c6a6f
    hash_after: d086c3e3a78042dfa23110b47a86bdf6181c6a6f
    returns: 1
    why: "| the question reviewing asks | the answer |; |---|---|; | does the branch do what the ask calls for | yes, both roads drop the note the held step hands |; | is what the diff touches beyond the ask trivial | yes, one sibling ticket's own commit rides along |; | what does `./RUNME.sh check` answer | 0 |; | does a retro stand in the handback | no, the handover stands nowhere yet |; | does every rule the branch adds carry a test | the branch adds no door rule, and six rows drive the bridge |; TL;DR:; Both roads drop the held step's note, and the counts follow the layer they draw.; The rows cover a hold standing, no hold, no box, the counts and the helper layer.; One fact stands twice: the drop test reads the same in the bridge and in the library.; The checklist asks each fact to stand in one place, so this verdict reads fail.; The findings, one a line:; `carried` in the bridge says again what `dropsHere` in the library already says. Hand the library one out, and call it.; The library cuts a markdown tail off each name it reads, and the bridge one leaves it. The two drift the day a name carries one.; `rulesIn` in the copilot road counts what `countsOf` in the library already counts. Call `countsOf` and read its rules.; `rulesIn` stands between two imports. Move it under the last one.; The copilot road carries the drop and no row drives it. Add one with a hold standing.; What the agent needs:; | number | need | status |; |---|---|---|; | 1 | the drop test stands in the library alone, and both roads call it | open |; | 2 | the count reads `countsOf`, and `rulesIn` leaves the copilot road | open |; | 3 | a row drives the copilot road with a hold standing | open |; | 4 | the branch hand writes a retro into the handover before done | open |"
  - step: implement/reflect
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: ca04878eaef95ba7fd41d91410927887a9e8fe8a
    hash_after: ca04878eaef95ba7fd41d91410927887a9e8fe8a
  - step: implement/change
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: 2cf2edb74c668c8f0a13f586f312ad3b6d118b44
    hash_after: 2cf2edb74c668c8f0a13f586f312ad3b6d118b44
    answered:
      - name: lint
        exit: 0
        said: 67 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: ed61d6b8e3f607f0784689d208d6d6da0d69aac0
    hash_after: ed61d6b8e3f607f0784689d208d6d6da0d69aac0
    answered:
      - name: tests
        exit: 0
        said: green, 17 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: 67 stand at warning, which the panel draws and check allows.
  - step: verdict
    hand: box 0fc2b4132f94 · claude-code-remote · helper-13
    hash_before: 689d5398b9aa8546550fde546211ac7438f26362
    hash_after: 689d5398b9aa8546550fde546211ac7438f26362
reason: done
---

# Ask

The layer a session opens with drops the notes its held step already hands it.

A session carries every note today, and its step hands some of them over again. The library already drops what a step reads, and the standing verb already asks it to. The road into a session does not.

What breaks where nobody does it: the branch's headline outcome reaches no session. The notes ride the step and the layer both, so a session opens holding each of them twice.

- `src/bridge/guidance.js` reads the held step's notes, and hands the layer without them
- `.claude/skills/level0/lib/copilot-runtime.js` reads the same list
- a test drives the bridge over fake doors, with a hold standing and without one
- a session with no hold standing carries the layer whole, as it does today
- `./RUNME.sh check` exits 0 on the branch

For the library that already drops them, see [[spec/tickets/guidance-rides-step]].

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

| the ask asks | the approach answers |
|---|---|
| what a session carries | the layer, without the notes its held step hands it |
| where the drop happens | the two roads into a session, each of which calls the layer |
| how each road reads the hold | a reader minting nothing, which takes the doors a road holds |
| which tree holds the hold | the worked tree, which the box names beside the vehicle one |
| what a session with no hold carries | the layer whole, as it carries it today |
| what the counts answer | the notes the layer carries, so the sentence reads true |

TL;DR:

- The reader mints no box. Where the box file stands nowhere, it answers an empty list.
- So this ticket adds a reader beside the one the standing verb calls, and that one keeps minting.
- Each road passes the worked tree, the disk it holds, and a path joiner, and takes no new door.
- A spawned helper keeps the layer whole, because its own hold stands elsewhere.

| piece | home |
|---|---|
| the reader minting nothing | the guidance hand module, beside the reader the verb calls |
| the layer the bridge hands a session | the bridge's guidance module |
| the layer the runtime hands a session | the level zero copilot runtime |

What each road passes the reader:

| the road | the tree | the disk | the hand |
|---|---|---|---|
| the bridge | the worked tree the box names | the box's own disk | the same name the pull writes |
| the runtime | the same tree, off the same box | the disk it already reads with | the same name |

What stays as it stands:

- The helper layer stays whole, because a spawned hand reads its own hold, not this one.
- The counts read the notes the layer carries, so the sentence a session opens with reads true.
- A session off a work branch holds nothing, so it carries the layer whole.

| test | claim |
|---|---|
| the bridge test, a hold standing | the note the held step reads leaves the layer |
| the bridge test, no hold standing | the layer stands whole |
| the bridge test, no box file | the layer stands whole, and the reader mints nothing |
| the bridge test, a hold standing | the counts read the notes the layer carries |
| the runtime test | the same drop reaches the context a session opens with |

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | the review hand reads this approach against the ask | open |
| 2 | a pass moves this ticket to the implement phase | open |

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

| the question reviewing asks | the answer |
|---|---|
| does the approach answer the ask | yes, and every finding of the last round closes |
| is what the diff touches beyond the ask trivial | yes, the commit writes this ticket alone |
| what does `./RUNME.sh check` answer | 0 |
| does a retro stand in the handback | no, and the branch hand owes one at done |
| does every claim the approach makes carry a test | no, the helper layer claim carries none |

TL;DR:

- The approach answers the ask. The drop reaches both roads, and a session with no hold keeps the layer.
- The new reader mints nothing, so the box finding of the last round closes.
- Each road passes a tree, a disk and a path joiner, and names the worked tree.
- The counts and the helper layer each get a line, so every need of the last round closes.

The findings, one a line:

- The reader claim reads true. `heldReads` mints a box through `handOf`, and the standing verb alone calls it.
- The tree claim reads true. The bridge reads its notes off the vehicle tree, and the box names the worked one beside it.
- The door claim reads true. Both roads already hold a disk, a tree and a path joiner.
- The helper line stands without a test. Add a row: the helper layer keeps the note the session layer drops.
- The hand column names the pull's name. Say that a session reads the hold its own pull writes, and a helper reads its own.

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | the implement hand tests the helper layer beside the session one | open |
| 2 | the implement hand reads the hold the session's own pull writes | open |
| 3 | the branch hand writes a retro into the handover before done | open |

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

The tests stand in a new file, `test/level0/session-layer.test.js`, over a fake disk alone.

| what the test drives | how it stands today |
|---|---|
| a hold standing drops its step's note from the layer | fails, the layer carries the note |
| the counts read the notes the layer carries | fails, the counts read every note |
| no hold standing leaves the layer whole | passes, and it must go on passing |
| no box file leaves the layer whole, and mints none | passes, and it must go on passing |
| a spawned helper carries the layer whole | passes, and it must go on passing |
| the reader answers the held step's notes | passes, because the reader lands with these tests |

What surprises me:

- The reader had to land with the tests. Without its export the file breaks on load, and a load break is no assertion.
- The two trees split further than the approach said. The notes come off the vehicle tree, and the box and the hold off the worked one.
- The bridge takes the worked tree as a new argument, because nothing it holds names that tree.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

- the change touches no file the ask leaves out: the two roads, the reader, and one new test file
- every door the change reaches has a fake: the disk is the only door here, and it runs fake
- a comment names the approach the change implements: the reader and the test file each head with what they do

<!-- the form is checklist -->

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

One class carries every finding: the caller rewrote what the library already says.

| the class | what it is | the fix for the class |
|---|---|---|
| a caller says it again | a road writes its own copy of a rule the library owns | the library exports the rule, and every road calls it |

Where each finding lands:

- The drop test standing twice is the class, and the library owns that rule.
- The name each side cuts drifts for the same reason, and one owner ends the drift.
- The rule counting the rules is the class again, and the library counts them.
- The untested road and the import out of order each take their own fix.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out: the two roads, the library, the reader and one test file
- every door the change reaches has a fake: the disk is the only door here, and it runs fake
- a comment names the approach the change implements: the library heads the rule it now owns alone

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out: the two roads, the reader, and one new test file
- every door the change reaches has a fake: the disk is the only door here, and it runs fake
- a comment names the approach the change implements: each road heads its drop with the line saying why

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A session now opens with the layer minus the notes its held step already hands it.

| what changed | where |
|---|---|
| a reader minting no box, which answers the held step's notes | the guidance hand module |
| the layer and the counts a session opens with | the bridge's guidance module |
| the layer and the count the copilot runtime hands | the level zero copilot runtime |
| the claims, over a fake disk | a new session layer test |

Why it reads as it does:

- The reader answers an empty list where the box file stands nowhere, so a session start mints nothing.
- The notes come off the vehicle tree, and the box and the hold off the worked one. Each road passes both.
- The counts read the notes the layer carries, so the sentence a session opens with reads true.
- A spawned helper keeps the layer whole, because it reads a hold of its own.
- The runtime already held a name `read`, so the list here takes the name `handed`.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out: the two roads, the reader, and one new test file
- every door the change reaches has a fake: the disk is the only door here, and it runs fake
- a comment names the approach the change implements: each road heads its drop with the line saying why

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- src/bridge/guidance.js
- .claude/skills/level0/lib/guidance.js
- .claude/skills/level0/lib/copilot-runtime.js
- src/scripts/guidance-hand.js
- src/scripts/hand.js
- src/scripts/pull.js
- src/scripts/work.js
- test/level0/session-layer.test.js
- test/level0/copilot-runtime.test.js
- spec/tickets/the-layer-reaches-sessions.md
- spec/tickets/guidance-rides-the-step.md
- spec/tickets/the-pull-splits-by-topic.md

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass

| the question reviewing asks | the answer |
|---|---|
| does the branch do what the ask calls for | yes, both roads drop the note the held step hands |
| is what the diff touches beyond the ask trivial | yes, two sibling tickets ride their own commits |
| what does `./RUNME.sh check` answer | 0 |
| does a retro stand in the handback | no, the handover stands nowhere yet |
| does every rule the branch adds carry a test | yes, the bridge rows and one runtime row drive it |

TL;DR:

- The drop stands once. `carried` lives in the library, and every road calls it.
- The count reads `countsOf`, and `rulesIn` stands nowhere in the tree.
- A runtime row holds a note and reads the layer without it, so the drop fires.
- Every need of the last round closes, and the tests and the check run green.

The findings, one a line:

- `carried` filters the notes, and the standing verb, the bridge and the runtime each call it.
- One reader cuts the markdown tail, so both roads read a name the same way.
- The runtime row names a note in its hold, and the layer hands that note no second time.
- The reader reads the box file first, so a session start mints none.
- The handover stands nowhere, so the branch hand still owes a retro.

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | the branch hand writes a retro into the handover before done | open |
| 2 | the branch hand takes the next leaf of this group | open |

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- each fact in one place: the library owns the drop and the count, and both roads call them

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

A second verdict hand read the same diff, and the close landed first. One finding of that read stands open here.

| what the branch does | what the note owning it says |
|---|---|
| the bridge counts `carried(session, read)`, so a styled note leaves the sentence | the canary counts every note, because the style holds the session too |

Where it stands:

- `guidanceHere` in `src/bridge/guidance.js` counted the notes binding here before this branch.
- The chapter The style carries a note, under [[spec/design_output/level0]], carries the row.
- No row drives the count over a styled note, so the change fires untested.
- A reader sees it live: the example sentence under that chapter and the one this tree hands disagree.

What a person decides: whether the count reads every note binding here, or the design note drops that row.
