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
group: guidance-rides-the-step
step: design/review
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

fail

| the question reviewing asks | the answer |
|---|---|
| does the approach answer the ask | no, and the box claim breaks |
| is what the diff touches beyond the ask trivial | yes, the commit writes this ticket alone |
| what does `./RUNME.sh check` answer | 0 |
| does a retro stand in the handback | no, and no handback stands on the branch |
| does every claim the approach makes carry a test | no, one road carries none |

TL;DR:

- The drop reads right. One helper answers the held step's notes, and both roads call it.
- The ceiling claim holds. `wc -l` reads both roads under `code.fileLines`.
- The helper mints a box and writes it, so the third test's claim breaks.
- Each road hands the helper a box the helper does not read, and the approach names no fix.

The findings, one a line:

- The box claim breaks. `handOf` mints a box id and writes it where none stands.
- The third test asserts the box file stays absent, and the helper writes it. Name what the road does instead.
- The bridge hands no `join` and no `git`, which the helper's path reaches. Name what each road passes.
- The trees split. The bridge reads its notes off the vehicle tree, and the hold stands under the worked tree. Name the root each road passes.
- The hand name finds the hold. Name the hand each road reads, because the pull keys the hold by that name.
- The bridge builds two layers, `standing` and `helper`, and the approach names one. Say what a spawned helper carries.
- The counts answer every note, and the sentence a session reads says those numbers. Say what they answer once a note leaves.
- The runtime road carries no test. Say what claim stands there, and how a reader reads it.

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | the draft hand says what the box write does on a tree holding none | open |
| 2 | the draft hand names what each road passes, and off which root | open |
| 3 | the draft hand names the hand each road reads | open |
| 4 | the draft hand says what the helper layer and the counts carry | open |
| 5 | the review hand reads the approach again | open |

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
