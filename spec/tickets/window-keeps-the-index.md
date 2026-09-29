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
step: do
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
