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
step: do
record:
  - step: do
    hand: box d858e079edd6 · claude-code-remote
    hash_before: 80417b35dbe95c6cca71c3a3b8aa9751ca5f15fd
    hash_after: 80417b35dbe95c6cca71c3a3b8aa9751ca5f15fd
    answered:
      - name: tests
        exit: 0
        said: green, 3 test(s) pass in 1 file(s); green, src/quack passes; green, src/modules/queue passes; green, src/modules/git pas
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 6ae28a85b72a72d6
        size: 771
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The Go queue orders the tickets the way cli.js does, so the verbs shadow names no mismatch. The coordinator can then turn `migration.phase4switch` on. The Go queue scored every ticket at zero. It read its weights under `queue.*`, which no config file set. And `queue.stood` stood built-in, so it knew no ticket's age. Every tie then fell to the name.

Left undone, `ticket yours` and `branch list --queue` write a shadow row on every run, and phase 4 cannot switch.

- `./RUNME.sh test src/quack/queue_wiring_test.go` passes, and fails on the wiring `main` holds
- `./RUNME.sh log --kind shadow` names no verbs row stamped after a run of the four verbs:
  - `ticket yours`
  - `ticket yours --next`
  - `branch list --queue`
  - `retro notes`
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack src/modules/queue src/modules/git test/contract/one-config.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The Go queue replays a captured cli.js run place for place, so the order rule matches. The inputs differ on the served index:

| input | cli.js | served Go queue before | now |
|---|---|---|---|
| weights | `work.*Score` | `queue.*`, which no file set | `queue.block`, `queue.day` and `queue.fail`, read by both |
| weights, served | the file | 0, since the served index reads no loaded projection | built-ins holding the file's values |
| ages | the git log over `spec/tickets` | `built-in`, an empty map | `git/stood`, off the same log |

The block weight carries the order here, since tickets depend on the-editor and loose-fixes. The served ages keyed on HEAD alone missed a fetch that fills in a shallow clone, so the key takes the shallow file too. After a run of the four verbs, `./RUNME.sh log --kind shadow` names no row stamped past the start:

- `ticket yours`
- `ticket yours --next`
- `branch list --queue`
- `retro notes`

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the served queue orders as cli.js does, and the verbs shadow stays quiet
- the cleanup it reveals: the empty served config stays with index-reads-loaded-projections, and each built-in weight points there
- every fact stands once: the file owns each weight, and the built-ins stand until that ticket lands

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
