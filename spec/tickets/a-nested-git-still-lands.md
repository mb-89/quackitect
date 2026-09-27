---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: doors-read-what-commands-do/design/review
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
step: do
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-verbs-land-whole
parent: doors-read-what-commands-do
record:
  - step: do
    hand: box d1fe1ca62214 · claude-code-remote
    hash_before: 65e0a3f5f4f558412a4d4ee290d6ccb62938ade0
    hash_after: 65e0a3f5f4f558412a4d4ee290d6ccb62938ade0
    answered:
      - name: tests
        exit: 0
        said: green, 61 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-verbs-need-no-wrapper.md:184:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`touchesGit` reading git as the command word misses `bash -c "git push origin main"` and `xargs git commit`, which `GIT_VERB` catches today, so `trunkGuard` in `src/bridge/bash.js` and `landsOnTrunk` in `lib/copilot-runtime.js` pass a trunk push; read into a `SHELLS` `-c` body the way `writesAPath` in `lib/bash.js` does, and add a `trunk.test.js` case

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/trunk.test.js test/level0/bash.test.js test/level0/copilot-runtime.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`touchesGit` in `lib/trunk.js` reads git as the command word of each segment. So a grep quoting `git push` touches no git. A `sh -c` body reads as a command of its own. Prefixes such as `xargs` and `env` pass to the word behind them. So `bash -c "git push origin main"` still meets the trunk guard. Two cases in `test/level0/trunk.test.js` hold both sides.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask, and it lands the first approach step of `doors-read-what-commands-do` with it, because the nested read has no command word reading to sit in until then
- the cleanup: a prefix flag taking a value, as `xargs -I {}`, still hides the git behind it, and the parent's implement step owns that case
- the reading lives in `touchesGit` alone, and `landsOnTrunk` calls it, so no second copy stands

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
