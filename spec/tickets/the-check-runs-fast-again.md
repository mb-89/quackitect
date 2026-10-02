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
group: the-check-runs-fast-again
step: do
record:
  - step: do
    hand: box 806847876737 · claude-code-remote
    hash_before: b6e95acbfab891ab9cbb4f70b473794de299b4cd
    hash_after: b6e95acbfab891ab9cbb4f70b473794de299b4cd
    answered:
      - name: tests
        exit: 0
        said: green, 62 test(s) pass in 8 file(s); green, src/modules/settings passes
      - name: check
        exit: 0
        said: "  100.9  in all"
    inputs:
      - name: ask
        hash: 3e7e9b9965733d3a
        size: 939
    def: df12650931d480c9
reason: done
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

./RUNME.sh branch test test/level0/vale-rows.test.js test/level0/battery.test.js test/level0/check-verb.test.js test/level0/cli-read.test.js test/level0/topic-readers.test.js test/level0/findings.test.js test/contract/disk.test.js test/contract/one-reading.test.js src/modules/settings/settings_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The rules part of the check read the tree in two costly ways. The tense reader spawned quack once a prose file, and Vale read every file whether it changed or not. `readsTexts` in `src/bridge/findings.js` hands every file carrying a Vale row to one `quack prose` call through `keptOfAll`, and keeps the rows the call a file keeps. `src/bridge/vale-rows.js` keeps Vale's rows a file under the file's content hash, beside a key over the config, the styles and the Vale binary. A lint hands Vale the files whose hash moved, by name, and walks the paths asked where the names outgrow a command line. The disk door answers the hash, and its contract holds the fake to it. A run over the tree named every row the same with no cache, a cold cache and a warm one. The check prints its parts last, and `battery.budget` names the slowest part and cases where a run passes it. On this box the rules part reads in seconds where it took a minute and a half.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the cache keys on content in place of a diff against the merge base, and the Discussion says why
- the cleanup: `keptOf` reads through `keptOfAll`, so one function parses the prose topic
- one place: the parked folders in `src/bridge/vale-rows.js` point at `PARKED` in `src/bridge/findings.js`

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
