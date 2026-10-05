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
group: the-verbs-run-in-go
step: do
---

# Ask

gain: The landing verbs run in Go on Windows as on Linux, so pull request #93 lands on main and the node road can close.

breaks: The `check (windows-latest)` job stays red on #93, auto-merge never fires, and `the-node-road-closes` waits on this group forever.

done_when:
- `./RUNME.sh check` exits 0 on the branch
- the `check (windows-latest)` job of #93 is green on its head
- a test beside the fix fails without it on a Windows spelling: separator, `.exe` name, CRLF or a held file

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The evidence of `do` stands here, because the group ticket stands closed, the pull hands out no leaf on its branch, and a pass by name answers that nothing stands in hand.

- tests: `cd src && go test ./quack -run 'Landing|Commit|Push|Rename' -count=1`, green
- check: `./RUNME.sh check`, green on the commit that takes main in
- says: The Windows job of pull request 93 failed in `TestCommitVerbMoves`. A push into the test's bare origin answered `Filename too long`, as the job log names. `t.TempDir` names its folder after the whole case name, and on Windows that folder plus the origin's incoming object path runs past the path limit. `landingRepo` now makes both folders through `shortDir`, a temp folder under a short fixed prefix. `TestLandingRepoStandsUnderAShortFolder` runs a case named past the limit, and fails where the case name reaches the repository path.
- merge: Two contract tests conflicted, and the branch's side stands.
- group: This ticket moves from `landing-verbs-run-in-go` to its parent `the-verbs-run-in-go`, since its group closed with it open. The parent's branch passes `do` through the pull on the evidence above, and closes it before the parent closes. Its program test reads the verbs folder, so a port deletes a program and touches no line of the test. Main's side lists every program by hand, and it still names the three programs this group deletes. Main brought a second `runsTwin`, and the landing test now uses that one.
