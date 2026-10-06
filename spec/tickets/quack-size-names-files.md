---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: quack-reaches-the-box-through-doors/gate
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
point: gate
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: doors-declare-what-they-own
parent: quack-reaches-the-box-through-doors
record:
  - step: do
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 1b673322ebf99a1140b674c00f32ed4b2908ee27
    hash_after: 0ae65a9489b2139efdd5a6833f56b553e8818991
    answered:
      - name: tests
        exit: 0
        said: green, src/owns passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: 12e074025430418c
        size: 191
    def: 6a55bc0a7781afef
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

size names every verb file in place of the files; ./RUNME.sh doors lists the root files walking around os, os/exec, net, net/http and syscall, and the implement step names each one it touches

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/owns/quack_tree_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The parent ticket stands closed, and the engine owns its size field, so the change writes under its Discussion. The line names the git command listing every file the implement step touched, and the doors verb listing each root file still walking around os, os/exec, net, net/http or syscall. Git and the verb own those lists, so the ticket points at them in place of a copy that drifts.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change departs from the ask on one point: it names the commands that list the files in place of copying the list into a closed field the engine owns
the change reveals no cleanup past the line itself
the file list stands once, in git, and the doors verb answers the walk-arounds, so the ticket points at both

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
