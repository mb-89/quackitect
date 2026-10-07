---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: level0-tests-move-to-plugin-test/gate
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
group: level-zero-becomes-a-typed-mod
parent: level0-tests-move-to-plugin-test
record:
  - step: do
    hand: box eabbd46a6a23 · claude-code-remote
    hash_before: d54f3d9fcf3ece71665f83ea7c7daab3d12659cf
    hash_after: b6f5775ea1e028896c7d93fee4c2fd36b2f595be
    answered:
      - name: tests
        exit: 0
        said: green, 34 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "  112.1  in all"
    inputs:
      - name: ask
        hash: 20a5f751219c11ba
        size: 184
    def: 40566c660b68007f
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

size lists spec/design_output/level0.md while the approach names no change there; the implementer writes the plugin-tests part beside the plugin part there, or drops the file from size

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/probe-cold.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The level0 note gains a paragraph beside the validate line. It says the check's plugin-tests part runs claude plugin test over the kit under .claude/skills/level0/tests, passes with a line where claude stands nowhere, and fails where the test lines outrun the modules the hooks manifest reaches. The size list of level0-tests-move-to-plugin-test names this note, and now the note carries the change. Commit b6f5775ea.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: it takes the first road, the part written beside the plugin line, since no other note lists the check's parts.
The change reveals no cleanup. The sibling ticket rewrites the validate line itself, so this paragraph stands apart from it.
The part's behavior stands in this note alone, and src/quack/check.go owns the code.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
