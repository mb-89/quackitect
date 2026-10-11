---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change with tests covering every rule of the ask, commits both on a clean tree, and stops once they pass
    from: anyone
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "stop when the tests cover every rule of the ask and pass, and leave working code alone"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
process: [[spec/processes/trivial]]
process_hash: 2a00b62f7c4bc60b
step: do
group: loose-fixes-07307ae
record:
  - step: do
    hand: box eadcbe7c1a3d · claude-code-remote
    hash_before: e5fe2a645c353737ed4118e6667d83aab8682ef4
    hash_after: e5fe2a645c353737ed4118e6667d83aab8682ef4
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "   64.6  in all"
    inputs:
      - name: ask
        hash: bb2c432935a6fbe4
        size: 467
    def: 56b47f508ed740df
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The check on Windows reads the run's secret and the standing file as written, so pull request 155 lands green there.

Windows keeps no owner-only mode, so a file written at 600 reads back at 666, and `TestTheStandingAndTheSecretStandAtOwnerMode` turns the Windows check red.

- `./RUNME.sh test src/index` holds the mode at 600 where the system keeps permission bits, and holds both files standing on Windows
- the check on `windows-latest` passes on pull request 155

# do

<!-- makes the change with tests covering every rule of the ask, commits both on a clean tree, and stops once they pass -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/index

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Commit 7dd2535a1 on main already holds the fix: the mode case in src/index/secret_test.go asserts 600 where runtime.GOOS keeps permission bits, and on Windows asserts that both files stand. Pull request 155 merged with check (windows-latest) green. This step records that evidence; no code changes.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: both done lines hold on main
- no cleanup surfaced
- no new fact added
- stops here: tests cover the ask and pass, and the working code stays alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
