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
    hash_before: a439e1b3774c0782ae1c81e935b1b199a8582b45
    hash_after: a439e1b3774c0782ae1c81e935b1b199a8582b45
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "  103.4  in all"
    inputs:
      - name: ask
        hash: 7cbd1ab92abcd35c
        size: 83
    def: be9d938c0443b338
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The `Read` test names a relative path, and an agent's `Read` names an absolute one.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/hooks

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`readsSecret` in `src/modules/hooks/secret.go` matches the secret's file name in a Read, a Grep or a Glob, by any path. `TestTheDoorRefusesAReadOfTheRunSecret` holds a relative, an absolute and a Windows path. The change landed in 9e5aadc17 and 411abd680.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the door refuses the absolute path an agent's Read carries
- the cleanup the change reveals: the read refusal moves into `secret.go`, since `hooks.go` stands at its ceiling
- the file's pattern stands once, as `SecretName` in `src/modules/hooks/command/guards.go`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
