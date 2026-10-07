---
kind: [[ticket]]
state: open
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
step: do
group: loose-fixes-911f4ea
---

# Ask

gain: the doors-declare-what-they-own pull request goes green on the Windows runner and lands on main.

breaks: `check (windows-latest)` stands red on the group's pull request, and auto-merge never lands it.

done_when:

- `./RUNME.sh check` answers 0 on the Ubuntu and the Windows runner of the group's pull request
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

./RUNME.sh check

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

./RUNME.sh check

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

The Windows runner hung `go test ./src/quack/` at its timeout in `TestAChildTheCheckGivesUpOnEndsWithItsTreeOnWindows`, blocked on reading the child's pipe. The case's cmd line ran two `waitfor` on one signal name. The second exits once the first holds the name, so cmd ends before the span cuts it, `taskkill /T` finds no tree, and the orphan grandchild holds the pipe open. Each process now waits on a signal name of its own with no timeout, so cmd stands until taskkill ends both. Main merges in. Its serve, cage and plugin-tests code reaches the box through the doors, and its scripts keep the http and clock doors.

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The fix stands in f9309d464 on work/doors-declare-what-they-own, and the main merge beside it in 2423ff8f7. The group stood closed when the box minted this ticket, so the branch pulls it nowhere. The first pull on main passes `do` once `check (windows-latest)` stands green on #131.
