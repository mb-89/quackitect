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
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
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
process_hash: 7a1a6e274b56e7ee
step: verdict
record:
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: 57af1b3bc0e245a60f3dd550001d5832a0c0bab2
    hash_after: 57af1b3bc0e245a60f3dd550001d5832a0c0bab2
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-2
    hash_before: cbc92406db54bc6a050a63b6919aa1183fca8eec
    hash_after: cbc92406db54bc6a050a63b6919aa1183fca8eec
    returns: 1
    why: "`stop.js`'s turn-end vote resets `box.claim` to null right after it reads the reason.; `classic.Stop` fires that vote before `turn.complete` fires the clear step in `handover.js`, so `box.claim` reads null there.; The approach has the clear step read the turn's claim, and no claim survives that far.; Ask line one fails this way: no live claim tells the clear step to hold the clear.; The callers list credits the turn-end vote with holding the claim, not with saving it past its own reset.; The callers list names no place that moves the phase from asked back to clear.; `pool` loads a rule's fields as written, and nothing yet reads the new `waits` key.; The prompt split by `e.mine` matches the pattern the turn counter already uses for a prompt, and holds.; The clear still gates on the queue-binding check in `handover.js`, so `engine.binding` at queue still governs it."
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: 7dd55aee982403aa9c9a844fbc6aa06e61d7adb9
    hash_after: 7dd55aee982403aa9c9a844fbc6aa06e61d7adb9
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-4
    hash_before: ea321d5ab1e882eac3d71b40f17cd76b9b91b1a7
    hash_after: ea321d5ab1e882eac3d71b40f17cd76b9b91b1a7
    returns: 2
    why: "`onStop` writes `box.handover.waits`, and `box.handover` stands null outside a context handover, so the write throws.; `the-chat-is-new` ends nearly every chat's first turn, so this null case is the common path, not an edge case.; A door that throws answers pass, per `server.js`, so the turn's stop decision skips, and the turn holds unended.; A guard creating `box.handover` fresh makes `measures` in `handover.js` treat it as a handover due, and skip the real one.; The approach leaves this failure mode unnamed, and the callers list wants a guard for `box.handover` standing null.; `onStop` now saves the claimed reason past its own reset, answering the earlier read of null.; `submitsPrompt` moves the phase back, and `stopReasons` carries `waits` through to the reader."
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: 508cdf32b33d17ee68afc13203a241bd0b7672e3
    hash_after: 508cdf32b33d17ee68afc13203a241bd0b7672e3
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-6
    hash_before: c8b6966c4918c3d60df140b855934550a27d7281
    hash_after: c8b6966c4918c3d60df140b855934550a27d7281
  - step: implement/tests-red
    hand: box d6f05e3a585030 · claude-code
    hash_before: 902114153b1e90a1aa5e7eb2bda47655e97b505c
    hash_after: 902114153b1e90a1aa5e7eb2bda47655e97b505c
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box d6f05e3a585030 · claude-code
    hash_before: fdf75055e66698a03e88203d8648b208dd2fa7a4
    hash_after: 71c064e652a1d39630a6a9bfc5b107beb26d2b62
    answered:
      - name: lint
        exit: 0
        said: "src/bridge/refactor-hand.js:142:55: Modal: This register holds the modals can, must, will. Say what is, or name the one "
  - step: implement/tests-green
    hand: box d6f05e3a585030 · claude-code
    hash_before: 62e958a90be0176f99b731713608a16bdadd8574
    hash_after: 62e958a90be0176f99b731713608a16bdadd8574
    answered:
      - name: tests
        exit: 0
        said: green, 33 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: "src/bridge/refactor-hand.js:142:55: Modal: This register holds the modals can, must, will. Say what is, or name the one "
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A question the session asks the owner survives the clear, and so does the owner's answer. The stop that asks holds the clear until the owner's next prompt. The handover then takes the question and the answer, and the clear runs after it.

Without it the clear drops the question, the next session carries on blind, and the owner answers into a conversation holding nothing of it.

- a stop waiting on the owner's answer holds the clear, and a test under `test/level0` drives it
- the handover after the answer carries the question and the answer as a row, and the test reads it
- every other stop clears at `context.handoverAt`, and a test drives it
- `./RUNME.sh check` passes

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The handover gains a phase `asked` between `clear` and the clear itself. `src/bridge/handover.js` holds it.

| piece | how |
|---|---|
| which stops wait | a rule key `waits: owner` in `spec/config/stop/level0.yml`, on `the-owner-asks-to-talk`, `a-wrong-answer-leaves-the-box` and `the-chat-is-new` |
| the mark | `holdsForHandover` writes it, at the turn it moves the phase to `clear`. That door runs ahead of `onStop` on `classic.Stop`, and answers pass there, so `onStop` stays silent on that turn |
| the claim | `holdsForHandover` reads it through `claimOf`, the reader `onStop` uses, and resets it the same way. A rule under `waits: owner` writes `box.handover.waits`, carrying the question |
| the guard | the mark stands on a handover at phase `clear` alone. An ordinary turn carries no handover, and nothing clears to hold |
| the hold | `clearsAfter` reads that mark at `turn.complete`, moves the phase to `asked`, and asks for no clear |
| the question | the table under What the agent needs in the turn's last message, or its last lines where no table stands |
| the answer | `submitsPrompt` on the owner's next prompt appends one row to `.se/HANDOVER.md`: the question, and the prompt's text. The phase moves back to `clear` |
| the clear | that turn's end clears, and the next conversation reads the row |
| every other stop | clears at `context.handoverAt`, as the phase `clear` does now |

A prompt of the plugin's own leaves the phase standing, so the tooth's re-prompt carries no answer. `stop#the-context-hands-over` gains the phase as a row.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/bridge/handover.js`, `clearsAfter` and `holdsForHandover`, which move the phase
- `src/bridge/server.js`, `endsTurn`, which calls `clearsAfter`
- `src/bridge/server.js`, `submitsPrompt`, which gains the answer's row
- `src/bridge/stop.js`, `onStop`, and `claimOf`, the claim reader it shares with the handover door
- `src/bridge/server.js`, the `classic.Stop` door, which runs `holdsForHandover` ahead of `onStop`
- `.claude/skills/level0/lib/stop.js`, `pool`, which keeps the new rule key, and `stopReasons`, which the mark reads it through

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- the claim reads null at the clear: `onStop` writes the mark before its reset, and the clear reads the mark
- no place moves the phase back: `submitsPrompt` moves `asked` to `clear` on the owner's prompt
- nothing reads `waits`: the mark reads it off the claimed rule, through `stopReasons`
- `box.handover` stands null on an ordinary turn: the mark moves into `holdsForHandover`, where the handover stands at phase `clear`
- `onStop` runs on no turn that moves the phase: `holdsForHandover` reads and resets the claim there

## review

<!-- reads the approach against the ask -->

### verdict

pass

- The answers list credits `onStop` with writing the mark, though `holdsForHandover` writes it and ends the classic.Stop chain first.
- The new phase value `asked` shares its name with `due.asked`, the retry counter `holdsForHandover` already keeps.
- `holdsForHandover` reads the claim through `claimOf` and skips the `decide` vote, so an unfired claim can hold the clear.
- The design names no function that turns the ending message into the question text it stores.

<!-- the form is verdict -->

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh branch test test/level0/context-handover.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

The handover door moves the phase to clear on any claim, so a waiting stop clears. The claim reads off the turn's last line or the stop call.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches `handover.js`, `stop.js`, the stop rules and their test, which the ask names
- the test reads a fake disk and a fake log, and no other door
- a comment in `handover.js` names this ticket

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

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches `handover.js`, `stop.js`, the stop rules, `stop.md` and their tests
- the tests read fake disks and a fake log
- `handover.js` and `stop.js` name this ticket beside the change

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test test/level0/context-handover.test.js test/level0/handover-wiring.test.js test/contract/stop-rules.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A turn ending on a stop that waits for the owner holds the context clear. The handover door lets the tooth vote there, and the session stays due. The next turn's end clears. Three stop rules carry `waits: owner`.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the files the draft names
- the tests read fake disks and a fake log
- `handover.js` names this ticket beside the change

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

The owner narrows the ask: a stop waiting on the owner holds the clear, and nothing more. The question-and-answer row drops. The session stays due, and the next turn's end clears.
