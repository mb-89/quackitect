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
group: the-review-lands-overnight
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/draft
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
| the subjects | `src/bridge/bash.js` | `findings` takes `it.subjects(revs)`, which runs `git log --format=%s` over them, the way `it.script` reads a file |
| the pull commit | `lib/bash.js` | a subject opening on `<name>:` where `<name>` names a ticket under `spec/tickets` or `.se/tickets` |
| the refusal | the same | `PullCommitStands` names `./RUNME.sh ticket pull <name> --back <leaf>`, the leaf read off the subject |
| the leaf | the same | `passes <leaf>` and `fails <leaf>` name it, and a subject naming none says `<leaf>` bare |
| what passes | the same | a `git revert` or a `git reset` whose commits carry no ticket subject |
| the design | `spec/design_output/bash.md` | a row in the parse table names the rule and its refusal |

The field half stays with [[spec/tickets/the-engine-restores-its-fields]].

The cases, in `bash.test.js`:

- `git revert <sha>` over a subject `a-child: passes design/draft` refuses, and names `--back design/draft`
- `git reset --hard HEAD~2` over the same commit in range refuses
- `git revert <sha>` over `fix the lint` passes, and a bare `git reset` passes

The callers:

- `commandRules` in `src/bridge/bash.js` runs `findings` for every Bash call, so it hands `subjects` in
- the CLI makes its own commits off this door, so the pull and the merge meet no row

The cost: each `git revert` and `git reset` runs one `git log` at the door.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail
- design: `git log --format=%s <sha>` walks every commit under the sha. So `git revert` of any commit reads old pull subjects, and refuses.
- design: that breaks the third ask line, and the cases feed a fake `subjects`, so no case shows it.
- design fix: read each `git revert` revision with `--no-walk`, and `<rev>..HEAD` for a reset. Add a case running the real git read.
- craft: `git revert -m 1 <sha>` hands `1` to the parse as a revision, so `-m` takes its value.
- craft: `pull-hand.js` writes `<leaf> fails back to <back>`, and the leaf parse reads that form too.
- craft: a take-back subject reads `<hand> takes <leaf> back`, and the parse reads that leaf as well.
- craft: `verbLine` names what level zero refuses, and the new row belongs in it.
- craft: the stated cost holds once the read walks one commit a revision, plus one read of the ticket folders.
- the parse holds on `git log --oneline -30`: each ticket subject names a ticket under `spec/tickets`.
- a subject like `the funnel note:` or `work/<group>:` names no ticket, so it passes.
- `commandRules` is the one caller of `findings`, and the CLI resets through `it.git.run` off the door.

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
