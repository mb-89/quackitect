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
step: verdict
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
  - step: design/review
    hand: box 099c2ec7708d · claude-code-remote · helper-4
    hash_before: ddc4302a55ac99ea5ef319c90223c61472261205
    hash_after: ddc4302a55ac99ea5ef319c90223c61472261205
  - step: implement/tests-red
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 23a2b68cf64070a3e149e90db8128c75dcaf8a82
    hash_after: 23a2b68cf64070a3e149e90db8128c75dcaf8a82
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 4988ef13a92f92a5e06a1871802fda551c9be416
    hash_after: 4988ef13a92f92a5e06a1871802fda551c9be416
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 483e4c136efdb0c8664c87d4e8a6f3fa0412044f
    hash_after: 483e4c136efdb0c8664c87d4e8a6f3fa0412044f
    answered:
      - name: tests
        exit: 0
        said: green, 5 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 099c2ec7708d · claude-code-remote · helper-9
    hash_before: 86465d81f2499b26a0acf2abd6e1299e38eee022
    hash_after: 86465d81f2499b26a0acf2abd6e1299e38eee022
    returns: 1
    why: "`commit-verb.js` prints the check's last `stdout` line on red, and the check writes faults to `stderr`; a red check under the fakes names the server line as its reason, and the fault reaches nobody; fix: print the check's `stderr` beside its `stdout`, so a red check names itself; `commit-verb.test.js` teaches the red case a fault on `stdout`, which agrees with the code; fix: teach that case `stderr`, and assert the verb prints what the check refuses; `## One verb feeds that stamp` lands mid-chapter, so two stamp paragraphs fall under it; fix: move that heading under the paragraph naming the two push doors; every header points at `#the-battery-answers-first`, so the new chapter takes no inbound link; a failing `git add -A` answers \"git staged nothing\", which names the wrong fault; a clean tree answers \"The commit door refuses this commit\", and git says nothing stands to commit; holds: the verb refuses a live bad message, names three findings at once, and stages nothing; holds: `./RUNME.sh check` answers exit 0 on 86465d81; holds: five cases pass over fake doors, and `fakeGit` drives the real git door; holds: `messageFaults` keeps the path, the trailer strip and the findings read in one place; holds: `branch review` answers \"retro absent from the handback\", so no retro stands there; holds: the diff touches the verb, the verbs map, the shared read, the cases and two notes"
  - step: implement/reflect
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: f9c2ced188a30fa11e12cc7554ee592e32e02a09
    hash_after: f9c2ced188a30fa11e12cc7554ee592e32e02a09
  - step: implement/change
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: a4f4373c3135533065859cd2e865427a90bc65c8
    hash_after: a4f4373c3135533065859cd2e865427a90bc65c8
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 5827d0f8bbc165513151ffaa37c22e5228ec4087
    hash_after: 5827d0f8bbc165513151ffaa37c22e5228ec4087
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
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

pass

- `commitVoice`, `level0-commit.md`, `withoutTrailers` and `readsProse` each stand where the approach puts them
- `landed`, `STAMP` and `prepush.js` stand where it names them too
- the redraft answers every finding the record carries, down to the commit half and the case file
- `commitVoice` stays unexported, and it parses a shell command, so the verb lifts that read behind a seam
- the approach names the path, the strip and the findings reader, so that seam lands in one behavior
- one owner stands on each thing it adds: the verb file, the verbs map, the case file, the chapter
- [[spec/design_output/work#the-battery-answers-first]] resolves, and that chapter owns the stamp and both push doors
- `./RUNME.sh check` writes the stamp on the new commit, so the push meets no stale stamp
- `test/level0/commit-verb.test.js` fits the names beside `landed.test.js` and `prepush.test.js`
- link [[spec/design_output/bash#a-commit-message-meets-voice]], which owns the path and the strip, and drop the why-it-matters column


# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/commit-verb.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Four cases go red on their own assertions. `commitVerb` answers zero and reaches no door, so each case reads back a tree nothing touched.

What surprises:

- the fifth case passes already, because it asserts a push nobody makes
- a case holding a promise where it wants a code reads as a build fault
- so the gate says build where every failure is an assertion, and awaiting the call clears it

The door's own read moves to `messageFaults` in the same hunk. `commitVoice` parses a shell command, and the verb holds a message string. One export serves both, so the path and the trailer strip stay in one place.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the cases land in `test/level0/commit-verb.test.js`, beside the cases over `landed` and the push door
- git, the disk, the process and Vale each reach the verb as a door, and the fakes drive all four
- the header of `messageFaults` points at the chapter owning the message read

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->
<!-- the form is text -->

Each line names a fault out of a guess. The verb guesses what stands wrong, and the case teaches that guess back to it.

| what the verb says | what stands |
|---|---|
| the check's last `stdout` line | the check writes its faults to `stderr` |
| `git staged nothing` | `git add` refusing names its own reason |
| `The commit door refuses` | a clean tree makes git say nothing stands to commit |

The fix for the class runs in two moves:

- read what the run answers, on both streams, and print that in place of a guess
- teach each case the stream the real thing writes to, so the case refuses the guess

The chapter carries the same shape. `One verb feeds that stamp` lands mid-chapter, so the paragraphs above it fall under a heading they predate. It moves under the last of them, and each header pointing at the old anchor takes the new one.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the fix touches the verb, its cases and the chapter, each a file the change already reaches
- git, the process and Vale reach the verb as doors, and the cases drive each
- the class above names the approach each hunk follows

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the verb, the read it shares, the verbs table and the chapter the approach names
- git, the disk, the process and Vale each reach the verb as a door, and the fakes drive all four
- each header points at the chapter the approach names, and that chapter owns the table

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/commit-verb.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`./RUNME.sh commit "<message>"` reads the message, lands the commit, runs the check, and pushes on green.

| the step | what it runs | what it answers on red |
|---|---|---|
| the message | `messageFaults`, exported from `src/bridge/bash.js` | every finding at once, and no commit |
| the commit | `git add -A` and `git commit`, in the verb | what git says, with the staging back |
| the check | `./RUNME.sh check`, which writes the stamp | what the check says, and no push |
| the push | `git push origin`, which the pre-push door reads | what that door says |

One read serves both. `commitVoice` held the trailer strip and the lint inline, and both move to `messageFaults`. The door parses a shell command and the verb holds a message string, so the path and the strip stay in one place.

Each step prints what its run answers, on both streams. The check writes its faults to the error stream, so a read of one stream alone names a line standing clean.

What the run leaves behind:

- nothing stages before the message reads clean, so a refused message leaves the tree standing
- the push door reads the stamp this run writes, so no stale stamp stops a clean commit
- `landed` under `src/scripts/landed.js` stands as it stands, because it writes a ticket and names its own message
- `--no-push` leaves the branch where it stands

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact the change adds stands in one place, and the chapter owns the table
- the message read takes a string and a box, so the cases touch memory
- each header says what its file is for, and counts nothing

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->
<!-- the form is files -->

- spec/tickets/the-commit-verb-lints-messages.md
- spec/tickets/the-verbs-take-the-shell.md
- spec/design_output/work.md
- src/bridge/bash.js
- src/scripts/commit-verb.js
- src/scripts/cli.js
- src/scripts/cli-check.js
- src/scripts/cli-doors.js
- src/doors/git.js
- src/doors/vale.js
- src/doors/fake/git.js
- test/level0/commit-verb.test.js
- RUNME.sh

## verdict

<!-- pass or fail, findings one a line -->
<!-- the form is verdict -->

fail

- `commit-verb.js` prints the check's last `stdout` line on red, and the check writes faults to `stderr`
- a red check under the fakes names the server line as its reason, and the fault reaches nobody
- fix: print the check's `stderr` beside its `stdout`, so a red check names itself
- `commit-verb.test.js` teaches the red case a fault on `stdout`, which agrees with the code
- fix: teach that case `stderr`, and assert the verb prints what the check refuses
- `## One verb feeds that stamp` lands mid-chapter, so two stamp paragraphs fall under it
- fix: move that heading under the paragraph naming the two push doors
- every header points at `#the-battery-answers-first`, so the new chapter takes no inbound link
- a failing `git add -A` answers "git staged nothing", which names the wrong fault
- a clean tree answers "The commit door refuses this commit", and git says nothing stands to commit
- holds: the verb refuses a live bad message, names three findings at once, and stages nothing
- holds: `./RUNME.sh check` answers exit 0 on 86465d81
- holds: five cases pass over fake doors, and `fakeGit` drives the real git door
- holds: `messageFaults` keeps the path, the trailer strip and the findings read in one place
- holds: `branch review` answers "retro absent from the handback", so no retro stands there
- holds: the diff touches the verb, the verbs map, the shared read, the cases and two notes

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `messageFaults` owns the message read, and the chapter points at the bash note for the rules

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
