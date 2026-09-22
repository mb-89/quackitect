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
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-battery-earns-its-time
step: do
record:
  - step: do
    hand: box 14d41de46d55 · claude-code-remote
    hash_before: 8a5b99d5c489e582470283db5de28069c4601b2e
    hash_after: 8a5b99d5c489e582470283db5de28069c4601b2e
    answered:
      - name: tests
        exit: 0
        said: green, 5 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The outside-in-doors contract proves twelve roots stand off the rule by matching them against the config's own section globs. It spawns Vale once, to prove the rule fires at all.

<!-- breaks, as text: what breaks if it is never done -->
The case spawns Vale thirty-six times, three texts a root, and takes eleven seconds under load.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `test/contract/outside-in-doors.test.js` spawns Vale once, which `grep -c ruledAt test/contract/outside-in-doors.test.js` decides
- the twelve roots match the sections of `.vale.ini` in memory

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/contract/outside-in-doors.test.js

## check

    ./RUNME.sh check

## says

The case reads the sections of `.vale.ini` in memory, through the helper `test/contract/ruled.js`. The helper parses the config into its sections in order. It matches a path against a section head with Vale's own glob, where a star spans a slash and braces name alternatives. The last matching section naming the rule wins. So every root the approach names reads as standing off the rule, with no spawn. The doors, the cases, the Go door files, a note and the extension read the same way.

One case declares the texts the rule refuses, over a module past a root, a Go file and the extension's import guard. The helper runs Vale once over them, on that case. The file spawns Vale once in all.

The change landed under the sibling ticket on the doors, because that ticket's second line needed every rule test on the helper. This record says what the case reads now.

## checked

- the change follows the ask: the roots match the sections in memory, and Vale runs once
- the cleanup it reveals is in the change: the config's section reader stands in the helper
- the doors note holds the section reader's shape, and the case points at it

# Discussion

The first line names a count of `ruledAt` as the decider. The helper took that name's job, so the count answers zero, and the one call of the helper's `proves` is where the spawn stands.
