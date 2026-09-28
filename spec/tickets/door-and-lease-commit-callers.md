---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: commits-name-their-writer/gate
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
group: the-foundation-closes-its-gaps
parent: commits-name-their-writer
record:
  - step: do
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 649355ebaf3b93126aa157ffe4d04d99ee7eec56
    hash_after: 649355ebaf3b93126aa157ffe4d04d99ee7eec56
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes; green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/the-config-module-resolves-layers.md:327:86: Vocabulary: qtest stands outside the words this tree writes. W"
    inputs:
      - name: ask
        hash: 9673e2b220f35172
        size: 192
    def: 10eb0330577be131
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the callers list leaves out `starts` in src/index/door.go and `commit` in src/modules/index/lease.go, which pass a writer to `Commit` and meet the new refusal, so their cases run in the build.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/index src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Both callers already commit as the owner, so the change touches no code.
The door's starts commit each value as hands[instance], the writer the instance's registration hands back in src/quack/main.go.
The dog in lease.go commits its alarms as the writer the manager's Registers hands back.
The door and main cases pass under the new refusal. The lease case in src/modules/index fails at HEAD the same way, and the config ticket's red list holds its file.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The ask asks the two callers' cases to run under the refusal, and they do.
The reading reveals no cleanup.
The change adds no fact, so no note repeats one.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
