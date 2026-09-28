---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: sessions-boot-from-the-repo/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-cloud-works-its-queue
parent: sessions-boot-from-the-repo
record:
  - step: do
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: f4e950b3a64a98e6f00e9214b6fa6aaf93e77dbd
    hash_after: fe61f3aac10eecfc3494ad3bb6d874e4f91a1d53
    answered:
      - name: tests
        exit: 0
        said: green, 11 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-bridge-outlives-its-starter.md:327:275: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 25ee57edd4db8e72
        size: 537
    def: 96460415736d4305
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the SessionStart hook in .claude/settings.json names no timeout, while the START road in level0.js allows STARTING of 180000 ms for the same install.sh on a fresh clone. A hook the client cuts short leaves the install half done, and brand.js writes the manifest last, so the next session boots with no cage again. Name a span on the hook to match STARTING, or add a probe to the boot hook section saying the client waits the install out. The client default span is unchecked here, and the 180000 ms the start road allows backs the doubt.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/hooks.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The SessionStart hook named no timeout, while the start road allows STARTING for the same install.sh on a fresh clone. A client that cuts the hook short leaves the install half done, and brand.js writes the manifest last, so the next session boots with no cage again. The hook now carries a timeout in seconds matching STARTING, and a case holds the two together. The client default span stays unchecked, and the match makes it moot.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the hook names a span matching STARTING
the cleanup the change reveals stands in it: the $hooks comment in the settings drops the modules, which the start road now owns
the span stands once, as STARTING in level0.js, and the case, the settings comment and the note point at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
