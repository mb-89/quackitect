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
group: the-check-runs-fast-again
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Every agent push and every hand-back waits on `./RUNME.sh check`, so its length sets the pace of all work. The rules part costs the most, and it spends that time twice over: one quack spawn a prose file for the tense reader, and Vale over every file whether it changed or not. This ticket cuts the rules part to the files that changed, keeps the findings it prints the same, and prints the parts at the end of the check with a budget, so a slow part shows the next time it grows.

- gain: a warm check spends seconds on the rules part, so a push waits on the tests alone
- breaks: every push waits minutes on a lint whose answer it already holds
- done_when: `./RUNME.sh check` twice on one box, and the second run's `battery.parts.rules` in `.se/.runtime/check.json` reads a small share of the first
- done_when: `./RUNME.sh branch test test/contract/vale-cache.test.js` passes, and its cases hold that a cached reading equals a fresh one

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

The measure, on a fresh clone of main at e63f74c in a cloud box with four cores. The parts come off `battery.parts` in `.se/.runtime/check.json`, in milliseconds. The cold run shared the box with a Vale run of mine for its first minute.

| part | cold | warm |
|---|---|---|
| rules | 91416 | 89476 |
| tests | 103854 | 40423 |
| go | 65234 | 4879 |
| level0 | 19507 | 19382 |
| plugin | 1030 | 1080 |
| projections | 128 | 114 |
| server | 84 | 64 |
| doors | 2 | 2 |
| total | 281255 | 155420 |

The rules part over the whole tree, timed piece by piece on the warm box:

| piece | ms |
|---|---|
| Vale over the tree | 28289 |
| the tense reader, one quack spawn a prose file | 60707 |
| the quack sweep | 15 |
| biome | 5085 |

The calls I took, with nobody to ask:

- The route is trivial, because the coordinator names the do chapters of that route. The work splits into tickets by payoff, and this one takes the rules part and the guard.
- The tense reader takes every prose file in one quack call. The prose topic takes a list of docs already, so the findings stay the same and the spawns drop to one.
- Vale's rows cache by file content in place of a diff against the merge base. A content key answers the same rows a fresh run answers, on any branch and any base, so the stamp's warnings and its clean flag read as before. A key over the rule config, the styles and the Vale binary empties the cache where a rule changes.
- The Go part caches already: a warm run reads every package cached. Its cold cost is a fresh clone's compile, which a box pays once.
