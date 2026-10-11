---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process_hash: 2b5ab398855a1aba
group: hooks-v1-hold-the-line
step: do
record:
  - step: do
    hand: box f9a277082525 · claude-code-remote
    hash_before: 71238861b2f051c550994cb1a8d376886466bd94
    hash_after: 71238861b2f051c550994cb1a8d376886466bd94
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks/command passes; green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "   80.3  in all"
    inputs:
      - name: ask
        hash: db6189141f79fc0b
        size: 574
    def: df12650931d480c9
reason: done
---

# Ask

The version guard and the git-write rows read the verb past git's global options and their values. The pre-push door refuses a version ref's rewrite beside its delete.

A force push to a version branch spelled with `--git-dir` and its value after a space passes both doors: `src/modules/hooks/command/guards.go:140`, finding 7.

- `./RUNME.sh test src/modules/hooks/command` refuses a force push and a delete spelled with `--git-dir` and `--work-tree`
- `./RUNME.sh test src/modules/hooks` passes a `PrePush` case refusing a version ref's rewrite
- `./RUNME.sh check` passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/hooks/command/guards_test.go src/modules/hooks/command/trunk_test.go src/modules/hooks/githooks_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`afterGit` reads past git's global options and the value each one takes, as `gitValued` names them. The version guard, the git-write rows, the trunk guard and `verbsOf` now share it. A force push or a delete of a version branch spelled with `--git-dir`, `--work-tree` or `--namespace` meets the version refusal. The pre-push door refuses a version ref the push moves off the remote's tip, read through `merge-base`, as a rewrite. A rewrite beside a delete reads as the delete. The code landed in d521550e7.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: `TestTheVersionGuardReadsEveryVersionWrite` refuses three spellings past valued options, and `TestPrePushRefusesAVersionRewrite` refuses a rewrite, passes a fast-forward, and names a rewrite beside a delete as the delete
- the cleanup the change reveals: `verbsOf` and the push parse read through `afterGit` in place of their own loops
- git's valued options stand once, as `gitValued` in `src/modules/hooks/command/trunk.go`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
