---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change with tests covering every rule of the ask, commits both on a clean tree, and stops once they pass
    from: hooks-v1-hold-the-line/accept
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "stop when the tests cover every rule of the ask and pass, and leave working code alone"]
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
process_hash: 2a00b62f7c4bc60b
group: hooks-v1-hold-the-line
parent: hooks-v1-hold-the-line
record:
  - step: do
    hand: box f9a277082525 · claude-code-remote
    hash_before: dc091450aa4833bd17f4970dfc16b86929401ccc
    hash_after: 2011a72037dadaddfc449573b372e74f88634813
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "  100.8  in all"
    inputs:
      - name: ask
        hash: 4e4e96d119f8ad33
        size: 148
    def: 0fb8708642fa5971
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`BlessGuard` and `readsSecret` match the literal `person.json` alone. A `cat .se/.runtime/*` or a Grep on the runtime folder still reads the secret.

# do

<!-- makes the change with tests covering every rule of the ask, commits both on a clean tree, and stops once they pass -->

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

`SecretName` in `src/modules/hooks/command/guards.go` reads three spellings: the secret's name, a glob inside the runtime folder, and the runtime folder or `.se` named whole. The Bash guard and the Read, Grep and Glob door read it. A command naming one file of the folder, as `tools.json` or the index's binary, still passes. A recursive read over the whole root stays outside the guard, so the guard slows an agent, and the secret rests on the doors standing. The change landed in 2011a7203, with the probe's own origin it needed to land.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: `TestTheBlessGuardReadsTheBlessAndTheHand` refuses five reaches and passes four named files, and the hook door refuses a Grep path and a Glob pattern
- the cleanup the change reveals: the probe's clone takes a bare origin of its own, which retires the note `cold-probe-pushes-into-its`
- the pattern stands once, as `SecretName`
- the tests cover each spelling the ask names, and the working guard for named files stands as it was

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
