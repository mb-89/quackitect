---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: vale-leaves-the-tree/gate
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
group: lint-without-vale
parent: vale-leaves-the-tree
record:
  - step: do
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: efaf5971f9959a98b553902972ab1ce56971c091
    hash_after: d44a9a0f7ed96be6975f08d9563abc2003365df4
    answered:
      - name: tests
        exit: 0
        said: green, src/voice passes
      - name: check
        exit: 0
        said: "   78.5  in all"
    inputs:
      - name: ask
        hash: b5d7e59215788e7c
        size: 425
    def: 13b5025d6d00f771
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the ask's grep holds no testdata exclusion, while the approach says it does. Four goldens answer it today: src/modules/check/testdata/vale.golden.json and vale.out, src/modules/queue/testdata/queue.golden.json and src/quack/testdata/tree.golden.json. The check's pair leaves with the Vale twin. The queue and tree goldens snapshot ticket names and asks, so the done_when line gains a `:!*testdata*` pathspec, or it stays red.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/voice/pure_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The first done_when line of vale-leaves-the-tree now reads with the pathspec ':!*testdata*', so the snapshot goldens, which name tickets such as vale-ls-on-windows and run nothing, leave the grep. The door holds an open ticket's ask, and no verb rewrites it, so the line stands under that ticket's Discussion, which the change step reads. The check then read src/voice red, since the tests-red commit touched it: voice.go and voice_test.go now split by topic under the file ceiling, and voice.go names its numbers. The code moves verbatim, and the voice tests answer as before.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask's pathspec, and departs on where it stands: under Discussion, since the door refuses the ask
the cleanup the change reveals: the voice files' faults, split and named in this change
the corrected line stands once, under the parent's Discussion, and points at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
