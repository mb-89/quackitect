---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: retro-verbs-run-in-go/accept
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
group: retro-verbs-run-in-go
parent: retro-verbs-run-in-go
record:
  - step: do
    hand: box 08f4218ba236 · claude-code-remote
    hash_before: a26e7867d01dbfcec92c85faea3bb2813a78d746
    hash_after: 5a681ec154adad03e6cd6534853cf591b9b7791b
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   48.1  in all"
    inputs:
      - name: ask
        hash: 1d932305155f653b
        size: 131
    def: d18d07ca40f70311
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

collect drops the error of each os.WriteFile, so a failed manifest write exits 0; the verb names the write and exits 1, with a case

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

retro collect dropped the error of each write, so a failed manifest write exited 0 and left no record. Each write and mkdir of the verb now prints one line naming the file and the error, and exits 1, stopping at the first, as the JavaScript throw did. The success output stays byte for byte. TestRetroCollectFailsAndNamesTheManifestWhereItsWriteFails holds it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- the cleanup it reveals: the cloud copy now hands its error up to the verb, in the same change
- the fact stands once: one helper writes and one names the failure

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
