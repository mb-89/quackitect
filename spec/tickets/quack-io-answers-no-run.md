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
    hash_before: e037a794ce267b8d9163624b089a267e1b72cf83
    hash_after: 00dd294c8195e482f74218e2e149bf9ae2f1e2e0
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/the-split-deployment-takes-over.md:293:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: c920c109779b08ab
        size: 215
    def: 3134c855268208f1
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

quack io commits once a start and answers no run.<instance>, so an IO instance wired to an input holds every reader for answerWait. Watch, clock, env and git read no wire today, so a case or a guard should hold that

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/io_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

ioProcesses in src/quack/io.go now refuses to start where an IO instance reads a wired name, and names each one. quack io commits once a start and answers no run, so such an instance holds every reader settling the placements for answerWait. wiredIO reads the inputs the store holds for each IO instance. One case holds that an IO instance reading a wire reads as wired and one reading nothing does not. A second holds the tracked wiring clean. I take a guard over a run answer in quack io: no IO module reads a wire today, and a refusal at the start names the fault where a silent wait hides it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: a guard at the start and a case over the tracked wiring
- the cleanup: none revealed
- one place: wiredIO stands once in io.go, and the reason links the ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
