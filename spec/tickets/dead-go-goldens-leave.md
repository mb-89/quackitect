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
group: dead-tests-and-code-leave
cloud: true
step: do
record:
  - step: do
    hand: box d2c15bcb53d2 · claude-code-remote
    hash_before: f77884cd72aef7416d4ffcec323806d0a0ec184e
    hash_after: ede57e52d8d356d5ac9ac122c0218fb29a5bc249
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes; green, src/modules/hooks passes; green, src/modules/queue passes; green, src/modules/ti
      - name: check
        exit: 0
        said: "    2.1  test/contract/index.test.js a stopped index leaves no se-index process past the case"
    inputs:
      - name: ask
        hash: 6f6046344c712704
        size: 675
    def: df12650931d480c9
reason: done
---

# Ask

The Go parity goldens and their tests leave, since every migration phase stands on. Tests of production-dead functions leave with those functions, and tests restating migration switch values leave.

The check keeps comparing a port against a JS twin nobody runs. A reader keeps meeting goldens for the queue, the ticket tree, the config readers, the check twins, guidance, log, drawn and the cage shadow replay.

- the tree holds no Go finding `audit/test-audit-go.txt` marks DELETE, re-verified against the tree, and none of its golden files
- the tree holds no function a deleted test alone called, as `go vet ./...` and `go build ./...` decide
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/check src/modules/hooks src/modules/queue src/modules/tickets src/modules/migration src/config src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Every migration phase stands on, so the Go parity goldens leave with their tests, fixtures and JS writers. The check twins, the ticket tree, the queue, the config readers, guidance, log and drawn goldens all leave. The cage log replay leaves with PostsOf and ReplayLog, and the live shadow path stays, since Hook still calls it. Four Go cases hold the size ceiling in place of the size golden. The live rule already sizes code files alone, as the owner decides, and the golden's prose rows came from the harness. The empty check twin names leave the check module, since nothing reads them. Functions only a test called leave with that test, and so do the tests restating a switch value or a library constant. The recorded cage logs under test/replay/cage stay on disk, unread, because the box's permission check refused their deletion. The write-door logs stay as fixtures.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and the discussion names the recorded cage logs the box left standing
- the cleanup it reveals: the queue's case helpers move beside their readers, and the exports only the harness read leave
- every fact stands once: the size cases name the design note, and the ceilings stand as constants at the top of the test

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
