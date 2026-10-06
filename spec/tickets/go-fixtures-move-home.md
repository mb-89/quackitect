---
kind: [[ticket]]
state: open
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

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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
