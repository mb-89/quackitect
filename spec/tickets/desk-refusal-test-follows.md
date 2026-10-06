---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-twins-leave-whole/gate
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
group: failures-stand-registered
parent: the-twins-leave-whole
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 980427526dc505ed29dc9033f36ba436eb8bbe23
    hash_after: 980427526dc505ed29dc9033f36ba436eb8bbe23
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks/command passes
      - name: check
        exit: 0
        said: "  118.0  in all"
    inputs:
      - name: ask
        hash: f2be81d1d008bc6f
        size: 242
    def: b3995cb871db2080
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

dropping DeskRefusal from src/modules/hooks/command/trunk.go breaks TestDeskSaidBuildsTheMessageTheDeskRefusalOpensOn in trunk_test.go, which calls it. Neither size nor callers names that file. The builder rewrites that case to DeskSaid alone

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/hooks/command/trunk_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The trunk test read DeskRefusal to show the desk refusal opens on DeskSaid. The-twins-leave-whole drops DeskRefusal, since the node desk-works-on-trunk holds the remedy, so the case now checks DeskSaid alone, under a name that says so. The check also stood red on a red case of the-hooks-feed-the-sentinel, which ran alone in a slow package, so it now calls t.Parallel at its top.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the case reads DeskSaid alone
the cleanup stands in the change: the case's name drops the refusal it no longer reads, and the unused import leaves
the fact stands once: the remedy text lives on the node, and the case points at the ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
