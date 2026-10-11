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
group: hooks-v1-hold-the-line
step: do
record:
  - step: do
    hand: box f9a277082525 · claude-code-remote
    hash_before: 56074cc3a7d6e6f4b9a3d3465debc82332043719
    hash_after: 56074cc3a7d6e6f4b9a3d3465debc82332043719
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks/command passes
      - name: check
        exit: 0
        said: "   75.2  in all"
    inputs:
      - name: ask
        hash: 514d89b193894e7c
        size: 398
    def: df12650931d480c9
reason: done
---

# Ask

A shell write's path reads resolved, so .se/../AGENTS.md reads as AGENTS.md and the shell-write rule holds it.

A free prefix followed by .. lets a shell write land on prose the rule guards (src/modules/hooks/command/writes.go:94, finding 10).

- `./RUNME.sh test src/modules/hooks/command` passes cases for a redirect into `.se/../AGENTS.md` and two more `..` spellings
- `./RUNME.sh check` passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/hooks/command

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`Clean` in `src/modules/hooks/command/tokens.go` folds a path's dot segments, so `.se/../AGENTS.md` reads as `AGENTS.md`. The free paths and the guarded ones then read the path the shell lands on. A `..` after a segment holding a shell name stands, since that segment lands nowhere the door knows. Every reader in the package reads paths through `Clean`, the redirects, `tee`, the copies and the scripts among them. The code landed in d521550e7.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: `TestAShellWriteThroughDotDotLandsOnTheGuardedProse` holds four `..` spellings to their guarded path, and fails with `Clean` as it stood
- the cleanup the change reveals: none past `Clean`, since every reader of the package already calls it
- the folding stands once, as `folds` under `Clean`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
