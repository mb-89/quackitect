---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: doors-read-what-commands-do/design/review
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
group: the-verbs-land-whole
parent: doors-read-what-commands-do
record:
  - step: do
    hand: box d1fe1ca62214 · claude-code-remote
    hash_before: 35b8335a4897db6b44ebbbaa3862ed21f4b59449
    hash_after: 35b8335a4897db6b44ebbbaa3862ed21f4b59449
    answered:
      - name: tests
        exit: 0
        said: green, 13 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-verbs-need-no-wrapper.md:184:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the `env` key on `$.process.run` stands unchecked against the engine, and the `level1.test.js` case fakes it, so that done_when line passes while the real tool still runs with no harness env; check the engine surface first, or have the verb read `--tool` input carrying the agent

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/level1.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The engine surface is checked in the client bundle: `process.run` takes `env` beside `cwd`, `stdin` and `timeoutMs`, and it merges that env over its own. The hook now reads the harness keys through `$.env.get`, with the process env as a fallback. It hands them to the verb. A case in `test/level0/level1.test.js` fakes `$.env.get` and holds the copy of the keys equal to `HARNESS`.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask, and reads the engine surface first
- the keys stand copied in the hook, and the level1 case holds the copy equal to `HARNESS` in src/scripts/pull-hand-of.js
- the copy says beside it why a hook holds one

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
