---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-split-deployment-takes-over/gate
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
group: module-processes-switch-over
parent: the-split-deployment-takes-over
record:
  - step: do
    hand: box 09eeff3afa7c · claude-code-remote
    hash_before: f04e97555f64ac78f63f05092ce6fd1dcc099051
    hash_after: 83ae2be1d16661edbe47c1f1d85cc3b46fa29e2b
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/the-split-deployment-takes-over.md:293:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: a816099fbe3a5722
        size: 186
    def: 3134c855268208f1
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

TestAKilledPlacedProcessLeavesTheOthersAnswering stood green before the switch and drives index.Placements alone. No case kills one process under ioProcesses with the wiring's placements

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A case in src/quack/split_test.go drives the live split through ioProcesses with a wiring of its own: watch and git in quack io, tickets and guidance each in a module process of its own off placementsOf. It kills the guidance process, reads guidance/steps not provided, writes a second ticket to disk, and reads tickets/all listing it from the tickets process that never restarted. A TestMain routes the io and module verbs to main, so the test binary stands in for quack, and each spawn leaves its pid under QUACK_TEST_PIDS. A kill of the tickets process in its place turns the case red. The pid check keeps a crash that takes every process down, then restarts them, from reading green.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the case kills one process under ioProcesses with placements the wiring hands placementsOf
- the cleanup: none revealed; the helpers stand local to the case, since the index package's until and kills sit behind a package boundary
- one place: the wiring and the pid folder stand once, as constants in the test file

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
