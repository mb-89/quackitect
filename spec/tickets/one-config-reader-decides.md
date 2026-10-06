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
    hash_before: 9515148127a0b842b2892e4fb3cbc7616df0f1fd
    hash_after: ddef4063fa37a911cd1b727e38ef5a719a61f22f
    answered:
      - name: tests
        exit: 0
        said: green, src/q passes; green, src/config passes; green, src/modules/config passes; green, src/modules/check passes; green,
      - name: check
        exit: 0
        said: "  101.0  in all"
    inputs:
      - name: ask
        hash: 9e3ec7bc739118aa
        size: 643
    def: df12650931d480c9
reason: done
---

# Ask

One Go config reader decides which source wins for every key, so `answer.words` and `migration.opentasks` read the same value on every path. go.mod lists nats-server and nats.go as direct, since the code imports them.

src/config and src/modules/config disagree on the winning source for `answer.words` and `migration.opentasks`. One verb then reads one value, and another verb reads another.

- one reader stands, and the other calls it or leaves
- a test shows the precedence for `answer.words` and `migration.opentasks`
- `go mod tidy` leaves go.mod unchanged, and go.mod lists nats-server and nats.go as direct
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/q src/config src/modules/config src/modules/check src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The order of a key's layers stands in q, in the function q.AtRest: the environment beats the local file, the local file beats the tracked one, and a shared key reads the tracked file alone, as spec/design_output/model#a-keys-layers names it. src/config.Where calls q.Settled, which adds the built-in and reads the shared mark the schema now carries. The config module adds override and context over q.AtRest, and the check sweep counts through q.Settled, so no Go reader keeps an order of its own. answer.words now reads SE_ANSWER_WORDS over the local file, and migration.opentasks reads the tracked file alone on every path. A variable reads as its JSON value, and a blank variable stands unset. go mod tidy lists nats-server and nats.go as direct and drops automaxprocs, which nothing imports.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: one order stands in q, src/config and the module both call it, src/q/layers_test.go and src/config/config_test.go show the order for answer.words and migration.opentasks, tidy leaves go.mod unchanged, and the check is green.
The cleanup the change reveals is in the change: the third copy in src/modules/check/sweep.go calls q now. The JavaScript resolver still sets the local file over the environment, parked as the note js-config-resolver-takes-one.
Every fact stands in one place: q owns the file names and the order, the module, src/config and the sweep point at q, and config.md points at model.md for the order.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
