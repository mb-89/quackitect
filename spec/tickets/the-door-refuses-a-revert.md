---
kind: [[ticket]]
state: closed
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
group: the-review-lands-overnight
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: verdict
record:
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 04b0535e1d9a768a5831862e65d35e821a1e63c7
    hash_after: 04b0535e1d9a768a5831862e65d35e821a1e63c7
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-2
    hash_before: 5869f2e24660655a8b45f2b1b84438ce63480036
    hash_after: 5869f2e24660655a8b45f2b1b84438ce63480036
    returns: 1
    why: "design: `git log --format=%s <sha>` walks every commit under the sha. So `git revert` of any commit reads old pull subjects, and refuses.; design: that breaks the third ask line, and the cases feed a fake `subjects`, so no case shows it.; design fix: read each `git revert` revision with `--no-walk`, and `<rev>..HEAD` for a reset. Add a case running the real git read.; craft: `git revert -m 1 <sha>` hands `1` to the parse as a revision, so `-m` takes its value.; craft: `pull-hand.js` writes `<leaf> fails back to <back>`, and the leaf parse reads that form too.; craft: a take-back subject reads `<hand> takes <leaf> back`, and the parse reads that leaf as well.; craft: `verbLine` names what level zero refuses, and the new row belongs in it.; craft: the stated cost holds once the read walks one commit a revision, plus one read of the ticket folders.; the parse holds on `git log --oneline -30`: each ticket subject names a ticket under `spec/tickets`.; a subject like `the funnel note:` or `work/<group>:` names no ticket, so it passes.; `commandRules` is the one caller of `findings`, and the CLI resets through `it.git.run` off the door."
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 481e82a6978bfdd716d307607dcf7a6cec661644
    hash_after: 481e82a6978bfdd716d307607dcf7a6cec661644
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-4
    hash_before: ea30c2fcfe241f9edabd5e4d73ab2fbf936e1745
    hash_after: ea30c2fcfe241f9edabd5e4d73ab2fbf936e1745
  - step: implement/tests-red
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 8cef1ea7f5f62b0792d7b74586b163194a963b28
    hash_after: 8cef1ea7f5f62b0792d7b74586b163194a963b28
    answered:
      - name: tests
        exit: 1
        said: assertion, 10 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 1b076e4d0aac44b073d56b2538bd0a1c360c3255
    hash_after: 1b076e4d0aac44b073d56b2538bd0a1c360c3255
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 149431a5bed66689e96958bcee996e3beaac84ce
    hash_after: 149431a5bed66689e96958bcee996e3beaac84ce
    answered:
      - name: tests
        exit: 0
        said: green, 10 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box dcd73916add7 · claude-code-remote · helper-9
    hash_before: b52be05ea814a52cfdcb34af88dbcc6478760799
    hash_after: b52be05ea814a52cfdcb34af88dbcc6478760799
reason: done
---

# Ask

A hand wanting a pull commit undone meets the take-back verb, which restores `step`, `state` and the evidence. [[spec/tickets/the-engine-restores-its-fields]] plans the field-write half, and this ticket takes the shell half.

The hand runs `git revert` or `git reset --hard` over a pull commit to get `step` and `state` back. A reset throws work away, and each undo adds a commit a reader skips.

- a Bash row refuses `git revert` or `git reset` over a commit whose subject opens on a ticket id
- the refusal names `ticket pull <ticket> --back <leaf>`
- `git revert` of any other commit passes the row
- a case under `test/level0` covers each line above
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

A new row in the Bash door reads the commits a `git revert` or a `git reset`
takes back, and refuses where one of them is a pull commit.

| part | the file | what changes |
|---|---|---|
| the parse | `.claude/skills/level0/lib/bash.js` | `undoesIn(command)` answers the revisions each `git revert` names, and the range each `git reset` drops |
| the reset range | the same | `git reset <rev>` drops `<rev>..HEAD`, and a bare `git reset` or one over paths drops nothing |
| the subjects | `src/bridge/bash.js` | `findings` takes `it.subjects(revs)`, the way `it.script` reads a file |
| the read | the same | a `git revert` revision reads through `git log --no-walk --format=%s`, and a reset range through `git log --format=%s <rev>..HEAD` |
| the flags | `lib/bash.js` | a flag and its value stay out of the revisions, so `-m 1` names no commit |
| the pull commit | `lib/bash.js` | a subject opening on `<name>:` where `<name>` names a ticket under `spec/tickets` or `.se/tickets` |
| the refusal | the same | `PullCommitStands` names `./RUNME.sh ticket pull <name> --back <leaf>`, the leaf read off the subject |
| the leaf | the same | `passes <leaf>`, `fails <leaf>`, `<leaf> fails back to` and `takes <leaf> back` name it, and a subject naming none says `<leaf>` bare |
| the description | `verbLine` in `lib/bash.js` | names the new refusal beside the others |
| what passes | the same | a `git revert` or a `git reset` whose commits carry no ticket subject |
| the design | `spec/design_output/bash.md` | a row in the parse table names the rule and its refusal |

The field half stays with [[spec/tickets/the-engine-restores-its-fields]].

The cases, in `bash.test.js`:

- `git revert <sha>` over a subject `a-child: passes design/draft` refuses, and names `--back design/draft`
- `git reset --hard HEAD~2` over the same commit in range refuses
- `git revert <sha>` over `fix the lint` passes, and a bare `git reset` passes
- `bash-commit.test.js`: the real git read over a scratch history refuses a pull commit, and passes a plain one

The callers:

- `commandRules` in `src/bridge/bash.js` runs `findings` for every Bash call, so it hands `subjects` in
- the CLI makes its own commits off this door, so the pull and the merge meet no row


The answers to the earlier review:

- the log walking history: a `git revert` revision reads with `--no-walk`, and a reset reads its range alone
- the cases faking the read: one case runs the real git read
- `-m 1`: a flag's value names no revision
- the second subject forms: the leaf reads off both
- `verbLine`: it names the rule

The cost: each `git revert` and `git reset` runs one `git log` at the door, beside the ticket lookup on disk.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
- The approach answers each finding of the earlier review.
- `--no-walk` reads each `git revert` revision alone, and `<rev>..HEAD` reads a reset range.
- `box.proc.run` answers at once, so `findings` takes `it.subjects` the way it takes `it.script`.
- craft: `bash-commit.test.js` drives a fake proc. A case driving real git belongs in `test/contract`.
- craft: a fake proc answering `--no-walk` apart from a walk keeps the level0 case honest.
- craft: `folders.js` names the private folder as `TICKETS`, and the parse reads that name.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/pulled.test.js test/contract/pulled.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Ten cases fail on their own assertion, and each names the line it proves.

- `test/level0/pulled.test.js` hands `findings` a table of subjects and reads every ask it makes.
- The door cases teach a fake proc to answer `--no-walk` apart from a full walk.
- `test/contract/pulled.test.js` builds a scratch history and runs the real git read.
- `lib/bash.js` stands at 595 lines, so the parse takes a module of its own in `lib/pulled.js`.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The cases stand in two new test files, and no other file moves.
- The proc door takes `fakeProc` in level0, and the real git runs in `test/contract` alone.
- Each test file opens with a pointer at the design section the change writes.

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

    ./RUNME.sh lint .claude/skills/level0/lib/pulled.js .claude/skills/level0/lib/bash.js src/bridge/bash.js spec/design_output/bash.md test/level0/pulled.test.js test/contract/pulled.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The change touches the parse, the bridge and the design note the approach names, plus `lib/pulled.js`.
- The git read goes through `box.proc`, which `fakeProc` stands in for at level0.
- Each new function carries a pointer at `spec/design_output/bash#a-pull-commit-stands`.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/pulled.test.js test/contract/pulled.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The Bash door now refuses a `git revert` or a `git reset` over a pull commit, and names the take-back verb.

- `lib/pulled.js` reads the revisions each `git revert` names and the range each `git reset` drops.
- The bridge reads each subject through `git log`, with `--no-walk` for a named commit.
- A subject opening on a ticket name makes a pull commit, and the refusal names its leaf.
- A plain commit, a bare reset and a reset over paths pass the row.
- `spec/design_output/bash.md` holds the rule under its own section.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The change stays inside the files the approach names, plus the parse module `lib/pulled.js`.
- The level0 cases take `fakeProc`, and one contract case drives the real git.
- Each new function points at `spec/design_output/bash#a-pull-commit-stands`.

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- spec/tickets/the-door-refuses-a-revert.md
- .claude/skills/level0/lib/bash.js
- .claude/skills/level0/lib/pulled.js
- .claude/skills/level0/lib/folders.js
- src/bridge/bash.js
- src/engine/group.js
- spec/design_output/bash.md
- test/level0/pulled.test.js
- test/contract/pulled.test.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass
- The row refuses a `git revert` or a `git reset` over a pull commit, and names the take-back verb.
- A plain commit, a bare reset and a reset over paths pass the row.
- The level0 cases and one contract case cover each line of the ask.
- `./RUNME.sh check` exits 0.
- The cycle between `lib/pulled.js` and `lib/bash.js` holds, since neither module calls the other at load.
- Both load orders import clean, and `findings` answers `PullCommitStands`.
- craft: the approach puts the parse in `lib/bash.js`, and the change moves it to `lib/pulled.js`.
- craft: four helpers in `lib/bash.js` turn public for the new module alone.
- craft: no retro stands in the handback.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The rule stands in `spec/design_output/bash.md`, and each new function points at that section.
- The leaf forms stand in the design note and in `LEAVES`, and the code comment points at the note.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
