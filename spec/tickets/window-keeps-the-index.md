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
step: do
record:
  - step: do
    hand: box d85a88b3d2d5 · claude-code-remote
    hash_before: 27ee56d535159d91805e2096f1196a2de6dd98de
    hash_after: 27ee56d535159d91805e2096f1196a2de6dd98de
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes; green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/lsp-door-switches-over.md:195:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 5a98d8706cce7ddf
        size: 779
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A client binary, the window among them, reaches the running index and leaves it standing. The phase 6 shadow then runs, and the coordinator judges the phase 6 flip on its rows. The hooks door and the cage shadow stay up while the window reads.

Left undone, every window read stops the index, the window reads nothing, and the phase 6 shadow writes no row. For the trace, see `spec/tickets/shadow-evidence-5-6.md` on the branch `claude/shadow-evidence-5-6`, under Phase 6, the window.

- `./RUNME.sh test src/index` passes, with a case where a caller from another build meets a fresh door and keeps it
- a live run of the window over a seeded session log leaves the index pid standing
- `./RUNME.sh log --kind shadow` gains window rows after that run
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/index src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A caller from another build, the window among them, now keeps the door the index stands. The standing file names the build that stands the door under `bin`, and `stands` reads that build's stamp on disk. So a caller from another build stops no fresh door. A start from a client runs the index beside it, else the tree's `se-index`, and never the caller with `serve`. The index alone runs itself, which `Serving` in `Main` marks. A rebuilt index still leaves its old door stale, and `src/index/reach_test.go` holds each case.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the window reaches the live index and leaves it standing, as the live run under Discussion shows. The verb criterion departs, and the discussion says why.
- the cleanup: `stampHere` goes, `stampOf` reads any build, and the spawn is one function a case fakes.
- one place: the comment on `indexBinary` names `folders.js` and `lib/index.js` as the owners of its path.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

**The live run.** The window built as `./RUNME.sh tui` builds it, at
`.se/.runtime/bin/logview` beside `se-index`, drawn in a pseudo-terminal at
120x40 by a driver under `.se/scripts`. The index stood before every run.

| start | log the window reads | index pid before, after | window rows |
|---|---|---|---|
| `23:23:01` | a seeded copy under `.se/.log/old` | 7326, 7326 | none: the window's root reads three folders up, so the config it read stood at `.se` and the mode read old |
| `23:23:43` | a seeded copy at `.se/.log/seed.jsonl`, its first row apart from `log/rows` | 7326, 7326 | one, at `23:23:48.888`, naming the seeded first row on the tail against the index's |
| `23:25:33` | the session log itself | 7326, 7326 | none, and none owed: the tail and `log/rows` read one file |

The index stays up, and the window's compare reaches `/v1` and writes its row.
The phase 6 path now runs on this tree.

**Where the ask departs.** The ask asks that `./RUNME.sh log --kind shadow`
gain window rows after the run, and on this tree no honest run can meet it:

- `migration.log` stands at new, so the verb reads `quack log`, which reads `.se/.log/session.jsonl` alone
- `log/rows` reads that same file, and follows an edit to it at once, which a trial here showed
- the window writes a shadow row into the log it reads. A row reaches the verb only where the window reads the session log.
- there, the two readers must read the log apart, and they map every field alike. A seed there reads equal on both sides.

The seeded copy carries the proof, and the verb criterion waits on the coordinator's reading of the phase 6 shadow. The run forced no mismatch into the live log.

For the coordinator: `phase6=window-reaches-the-index(1 seeded row, 0 rows over the live log)`, with `migration.phase6switch` left as it stands.
