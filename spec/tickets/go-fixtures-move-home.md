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
group: code-is-pure-tests-behave
depends_on: [fixture-home-guard-reports]
step: do
record:
  - step: do
    hand: box 7b5a2726379b · claude-code-remote
    hash_before: 06d2ea3560215e925a4e21b39b5ae09013c5a90c
    hash_after: 17f1ce14f0d0f9f1038dbb040a464d9f5b5dcf3a
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes; green, src/imports passes; green, src/index passes; green, src/quack passes
      - name: check
        exit: 0
        said: "  105.0  in all"
    inputs:
      - name: ask
        hash: 292e43a2bb06f45f
        size: 521
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The slowest Go packages build each fixture once, in their `TestMain` or a `src/q/qtest` builder, and the fixture baseline shrinks.

<!-- breaks, as text: what breaks if it is never done -->
The slow packages pay a fixture per case, and the guard holds new cases alone.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the fixture baseline names no case of `src/imports` and `src/index`, and each case left in `src/branches` and `src/quack` stands either moved or named in the Discussion with the sibling group's ticket moving it
- `./RUNME.sh check` stands green, and the Discussion holds each package's time before and after

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The tests of src/imports and src/index build each fixture they share once, in a main_test.go, through qtest.Shared builders. A case writing its own tree, index, door or repository carries the FixtureOutsideHome marker with that reason, so the fixture baseline names no case of either package. Every in-package test file there and in src/branches and src/quack names why it stands inside its package. The Discussion holds the times and why the branches and quack fixture cases stay.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and the Discussion says why the branches and quack fixture cases stay in the baseline
- the cleanup the change reveals, the dead helpers of imports_test.go, leaves in the change
- the case tree file list stands once, in plantTree in src/index/main_test.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

## What moves

- `src/imports`: every case reads one of two trees `qtest.Shared` builds once in `main_test.go`, and no case stays in the baseline.
- `src/index`: each case reading a shared fixture reads it from `main_test.go`, and each case writing its own tree carries the marker with that reason.

## The times

One run of `go test -count=1` over the four packages together, on this box, before and after:

| the package | before | after |
|---|---|---|
| `src/imports` | 9.9s | 8.6s |
| `src/index` | 4.3s | 3.6s |
| `src/branches` | 42.3s | 31.4s |
| `src/quack` | 32.3s | 26.3s |

The `src/branches` and `src/quack` cases moved nothing, so their drop reads as the box's noise between runs, and the fixture move in `src/imports` and `src/index` saves little next to the analysis loads and the door starts.

## What stays, and why

The fixture cases of `src/branches` and `src/quack` stand in the baseline: `grep -c '^src/branches/' src/imports/baseline/fixture.txt` and the same for `src/quack` count them. Each one writes its own repository or tree: a `git commit` into a clone, a push remote, a collect into a home folder. A shared read-only home serves none of them, so each moves when it runs on the fake of the git door or the disk door instead.

That move belongs to the tests-meet-the-doors-once group, as the group ask says. Its branch closes every ticket, and none of them moves these cases, so no sibling ticket stands to name. The guards refuse from the-test-guards-refuse on, so this baseline only shrinks, and a new case building its own tree takes the marker with its reason.
