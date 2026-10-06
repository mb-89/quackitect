---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-check-ends-what-it-drops/gate
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
group: level-zero-smoke
parent: the-check-ends-what-it-drops
record:
  - step: do
    hand: box a694567529c5 · claude-code-remote
    hash_before: b1131c7cda2b57bfdbd475695ee3ed3470f5aaf7
    hash_after: 7326362b5379b89a95e11a73e02b1ac40c11d6de
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   94.1  in all"
    inputs:
      - name: ask
        hash: 78d2853b43624499
        size: 280
    def: d64616f2defc493a
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the case drives endsWhole over sh and never the Vale road, so no test decides that heardIn, gitRead, reviewOver and realRun wrap their child in endsWhole; the implementer wraps all four in place and names in the says field that a missed caller leaves that call's children orphaned

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/hooks_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The Vale call in heardIn, gitRead, the review gathering in reviewOver, and realRun where a run carries a span and inherits no terminal now wrap their child in endsWhole. So when the span ends, the child and every process it started end with it, and no orphan holds a pipe, a port or a lock. A run inheriting the terminal keeps the terminal group, so a Ctrl-C there still reaches the child. The hooks tests drive gitRead through the wrap against real git. No case proves the wrap on the four callers: the case in ending_test.go proves endsWhole itself. A caller that misses the wrap leaves the children of that call orphaned when its span ends.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: all four callers wrap in place, and says names the orphan risk
the cleanup: none revealed
the inherit rule stands once, in the comment over realRun

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

No case drives the four callers, as the gate says. The case covering `endsWhole` itself stands in `src/quack/ending_test.go`:

    grep -n endsWhole src/quack/ending_test.go
