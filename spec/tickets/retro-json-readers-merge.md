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
group: tickets-keep-their-chapters
step: do
record:
  - step: do
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: e363cfab58a8391e8f2043efc57f959db66632c3
    hash_after: 2baf00e235c68186618a24f8be3c852d57d7aed3
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   65.1  in all"
    inputs:
      - name: ask
        hash: 71045523b6f77153
        size: 448
    def: df12650931d480c9
reason: done
---

# Ask

One ordered-JSON reader and one front-field reader serve the retro verbs, and retro audit reads a short experiment process link, so a fix to one reader reaches every retro verb.

Three ordered-JSON readers and two front-field readers drift apart, and retro audit misses a ticket whose process reads as a short link.

- go test ./src/quack -run TestRetroAudit passes a case counting a ticket under process: [[experiment]]
- ./RUNME.sh check is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/retro_audit_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The retro verbs read JSON through `retroJSParse` alone. The mint and collect readers keep their value shapes through an adapter over its output, so their two decoders leave. One front reader, `retroFrontField`, serves every retro verb, and `retroProcessOf` reads a process by the last part of its link. Retro audit and the group check share it, so a short `[[experiment]]` link counts as a trial. The deleted code tightened the test ratio of `src/quack`, so two test helpers fold into the shared seeded tree and base reader, and two pairs of cases sharing one setup fold into one case each.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- the cleanup the ratio guard asked for rides in the change, and the fixture baseline drops the folded case
- the parse, the front read and the process read each stand once

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
