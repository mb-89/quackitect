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
    hash_before: bcc5748289f322357a809c4b7d755867ff192d7d
    hash_after: fd576c9caa2335f5a4a93102c264aae2fddedce7
    answered:
      - name: tests
        exit: 0
        said: green, 10 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-bridge-outlives-its-starter.md:327:275: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 40e6f4adecce82b6
        size: 360
    def: 96460415736d4305
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft drops the trust claim, and leaves open the question the earlier gate asked: whether a clone carrying no trust runs a project SessionStart hook at all. The ask says this ticket finds whether a cloud session still needs the trust flag and the mode. Name the probe on a fresh clone in the level zero note, beside the probe that retires the install line.

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

The level zero note already names the probe on a fresh clone with no trust, beside the probe that retires the install line, in its boot hook section. An earlier pass of sessions-boot-from-the-repo wrote it there, so the ask needs no edit, and the boot cases stand as the nearest tests. The check stood red on two list items of the-bridge-outlives-its-starter past the word cap, and each splits in two.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the probe stands named in the boot hook section, beside the install probe
the cleanup the check revealed stands in the change: the two long list items split
the probe stands once, in the boot hook section, and the draft of sessions-boot-from-the-repo points at that section

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
