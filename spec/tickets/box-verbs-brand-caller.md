---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: box-verbs-port-to-go/gate
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
group: box-verbs-run-in-go
parent: box-verbs-port-to-go
record:
  - step: do
    hand: box 8ca46dccf16b · claude-code-remote
    hash_before: 9fe21a1a45eefca6aeaf1308d7957da854af9966
    hash_after: 9fe21a1a45eefca6aeaf1308d7957da854af9966
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   55.2  in all"
    inputs:
      - name: ask
        hash: a3dc9ff01acc1e93
        size: 275
    def: 89146b8ec86d255d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/scripts/work-review.js imports stamps from brand.js (and test/level0/review.test.js reaches it), so deleting brand.js breaks the review verb and done_when 4; the callers list misses it. Implement either points work-review at the Go stamps or keeps brand.js; fix in place.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/brand_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

brand.js stays, since work-review.js stamps a review worktree through its stamps, and only a module nobody imports leaves. The Go setup stamps the brand in process through the new src/quack/brand.go, over src/quack/jsonorder.go, which keeps the keys in the order they stand. On a copy of this tree the Go and the JavaScript stamps write the same bytes. The program entry at the foot of brand.js leaves with the setup port, which removes its last caller.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the ask offers keeping brand.js, and the change keeps it for work-review.js
- the entry block of brand.js leaves in the setup port, which removes the node call to it
- the targets and the shapes stand once in brand.go for Go, and the JavaScript copy leaves when work-review.js ports

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
