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
group: the-verbs-take-the-shell
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/review
record:
  - step: design/draft
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 1cc2ba86c7674ef65392e0200cc8a6314772a7d7
    hash_after: 1cc2ba86c7674ef65392e0200cc8a6314772a7d7
  - step: design/review
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 771b790943eb27386b78dd3de6e672d0229d3616
    hash_after: 771b790943eb27386b78dd3de6e672d0229d3616
    returns: 1
    why: "the message read stands already: `commitVoice`, under `src/bridge/bash.js`, which the bash door calls; it lints under the path `level0-commit.md`, and the approach names no path, so a second reader picks another; it calls `withoutTrailers` first, so a reader missing that lints the co-author lines a commit carries; `landed` composes its own message as the ticket name and its changes, so a free message reaches it nowhere; say whether the commit half comes out of `landed`, or the verb runs its own commit and leaves it standing; the ask names `./RUNME.sh test`, and the approach names no case file the refusal and the push land in; what holds: `STAMP` under `runs.js` carries the check, and `prepush.js` behind the push door reads it"
  - step: design/draft
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 56e10c5ec0b9914077c061757367e69ee2547f75
    hash_after: 56e10c5ec0b9914077c061757367e69ee2547f75
---

# Ask

A commit lands in one call, with its message clean and the battery green behind it.

Each commit costs three rounds at the door, and every push on main meets a stale stamp.

- `./RUNME.sh commit "<message>"` reads the message through the voice rules first.
- The verb names every finding at once, and git sees the message once it reads clean.
- The verb runs `./RUNME.sh check` after the commit, and pushes on green.
- `./RUNME.sh test` covers a refused message and a green push.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

`./RUNME.sh commit` reads the message through the read the bash door runs, lands it, runs the check, and pushes on green.

| the step | what it runs | what it answers on red |
|---|---|---|
| the message | `commitVoice`, under `src/bridge/bash.js` | every finding at once, and no commit |
| the commit | git, through the verb's own call | what the pre-commit door says |
| the check | `./RUNME.sh check`, which writes the stamp | the check's own findings, and no push |
| the push | git, which the pre-push door reads | what that door says |

The message read stands already, and the verb calls that one:

| what the read carries | why it matters |
|---|---|
| the path `level0-commit.md` | Vale scopes on a path, and this one names the message's rules |
| `withoutTrailers`, under `.claude/skills/level0/lib/bash.js` | a co-author line reads as prose otherwise |
| `readsProse` | it keeps the findings a note keeps |

`landed` under `src/scripts/landed.js` stays as it stands, because it writes a ticket and composes its own message. The verb runs its own `git add` and `git commit`, and puts the tree back where the pre-commit door refuses.

What the run leaves behind:

- nothing stages before the message reads clean, so a refused message leaves the tree standing
- `STAMP` under `.claude/skills/level0/lib/runs.js` carries the check this run writes
- `src/scripts/prepush.js` behind the push door reads that stamp, so no stale stamp stops a clean commit

Where each thing stands after:

- `src/scripts/commit-verb.js` holds the verb, and `src/scripts/cli.js` names it in the verbs map
- `test/level0/commit-verb.test.js` holds the cases, over fake doors
- one case drives a message the rules refuse to the findings, with no commit
- one case drives a clean message through the commit, the check and the push
- [[spec/design_output/work#the-battery-answers-first]] takes the verb beside the door it feeds

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

fail

- the message read stands already: `commitVoice`, under `src/bridge/bash.js`, which the bash door calls
- it lints under the path `level0-commit.md`, and the approach names no path, so a second reader picks another
- it calls `withoutTrailers` first, so a reader missing that lints the co-author lines a commit carries
- `landed` composes its own message as the ticket name and its changes, so a free message reaches it nowhere
- say whether the commit half comes out of `landed`, or the verb runs its own commit and leaves it standing
- the ask names `./RUNME.sh test`, and the approach names no case file the refusal and the push land in
- what holds: `STAMP` under `runs.js` carries the check, and `prepush.js` behind the push door reads it

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
