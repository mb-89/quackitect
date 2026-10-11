---
kind: [[ticket]]
state: closed
point: gate
todo: false
step: do
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: v1-takes-a-run-secret/gate
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
process_hash: 2a00b62f7c4bc60b
group: hooks-v1-hold-the-line
parent: v1-takes-a-run-secret
record:
  - step: do
    hand: box f9a277082525 · claude-code-remote
    hash_before: c34f092ab3ae5f8a46a2947368ce01c45a6ebd6b
    hash_after: c34f092ab3ae5f8a46a2947368ce01c45a6ebd6b
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "  101.5  in all"
    inputs:
      - name: ask
        hash: df4852813972f1bf
        size: 96
    def: be9d938c0443b338
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`os.WriteFile` keeps an old file's mode, so an existing `index.json` stays 0644 without a chmod.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/index

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`writesOwned` in `src/index/secret.go` writes a file at 600 and sets the mode again. A write keeps the mode of a file that stands. The standing file and the secret's file go through it. `TestTheStandingAndTheSecretStandAtOwnerMode` seeds a standing file at 644 first, and wants 600. The change landed in 9e5aadc17 and 411abd680.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the case starts its door over a 644 standing file
- the cleanup the change reveals: `chmodOf` joins the index's file helpers in `door.go`
- the owner's mode stands once, as `ownerMode`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
