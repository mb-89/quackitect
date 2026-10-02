---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: node-leaves-the-boxes/accept
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
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: node-leaves-the-boxes
parent: node-leaves-the-boxes
record:
  - step: do
    hand: box 3f5d7b2a1399 · claude-code-remote
    hash_before: 2e94329e907143245b621c9bf41ca381a65dc778
    hash_after: 685afe12b89e2616e8cf8a4b5e0d14a2c1fb5c14
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "   91.5  in all"
    inputs:
      - name: ask
        hash: 0e4f5cd1d9a6e680
        size: 149
    def: 22963c491c71f419
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the proc door spawns with shell false, so on Windows the npm, npx and code calls in setup.js reach no cmd shim. The setup resolves the shim on win32.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/setup.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Windows ships the package manager, its runner and the editor command as cmd shims, and the proc door spawns with no shell. So on Windows the setup wraps those three in cmd, the way copilot.js reaches the editor. Node itself runs as it stands.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the point the accept gate names
- the change reveals no cleanup past itself
- the shim list stands once, at the top of the setup verb

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
