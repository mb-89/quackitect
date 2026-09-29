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

The merge coordinator decides `migration.phase5switch` and `migration.phase6switch` on evidence from a live run, and not on the shadow tests alone. Without it, a flip lets through every call the cage refuses today, or turns on a window whose shadow never ran.

- `./RUNME.sh log --kind shadow` is read over a stated window after a spread of ordinary tool work, and every cage row stands on this ticket
- the hooks module's standing file and a live connection prove the cage door ran
- the window is driven against this tree, and its rows, or the reason it wrote none, stand on this ticket
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh log --kind shadow

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

Neither switch should flip. The cage shadow ran and names a mismatch on every refusal: the Go door passes each call the bridge refuses, as [[spec/tickets/cage-rules-port-before-switch]] predicts while no rule stands ported. The window shadow wrote nothing because it cannot run: each read the window makes stops the index, and the index it starts in its place never stands. The empty window log proves nothing. The run, the rows and the cause stand under Discussion. No code changed.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: evidence alone, and no key or code moves
- the cleanup it reveals: the window's stamp fault stands below as a finding for the coordinator, and this branch fixes nothing
- every fact stands once: the rows stand here, and the cage rule work points at its own ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

**The run.** A cloud box ran this on `claude/shadow-evidence-5-6`, cut from `origin/main` at `0de575c`. The window of the run opens at `2026-09-29T22:11:21Z` and closes at `2026-09-29T22:21:37Z`. `./RUNME.sh config` read `migration.cage shadow` and `migration.window shadow` through it.

| command or call | what it put through the cage |
|---|---|
| `./RUNME.sh config`, `./RUNME.sh branch list` | Bash calls the bridge passes |
| Read and Grep over `src/bridge`, `src/modules/hooks`, `src/tui` | reads the bridge passes |
| `mcp__level0__patch` create, then `rm`, of `spec/tickets/_zz-scratch-shadow.md` | a write and a delete the bridge passes |
| `mcp__level0__patch` create of a scratch ticket naming no kind | a write the tool refuses, which the bridge passes at the hook |
| Write of a scratch file | a write the bridge refuses: no ticket field |
| `git commit` behind `;`, then behind `&&` | two Bash calls the bridge refuses: LandingFollowsItsGate, GitWritesThroughAVerb |
| a Bash call naming a ticket while a todo stood in hand | a Bash call the bridge refuses |
| a shell redirection into the scratchpad | a Bash call the bridge refuses: ShellWritesNothing |
| `./RUNME.sh check` | exit 0, warnings alone |
| `.se/.runtime/bin/logview` under `script`, over `.se/.log/session.jsonl` and over a seeded copy | the window, drawn at a set size |
| `./RUNME.sh log --kind shadow` | the rows below |

The raw `git commit` never ran, so the scratch branch took no commit. `./RUNME.sh commit` pushes from a cloud box, so a scratch commit through it would push. The refusals above carry the commit door's traffic instead.

**Phase 5, the cage.** The door ran. `.se/.runtime/hooks.json` stood from `22:11`, written by `se-index serve`. `lsof` named the bridge, node, holding an established connection to `se-index` on the port that file names. Closed connections to that port piled up across the calls.

The rows `./RUNME.sh log --kind shadow` names in the window:

| at | event | tool | bridge | Go door | the refusal behind it |
|---|---|---|---|---|---|
| `22:12:24.079` | tool.call | Bash | refuse | pass | a ticket named outside the todo in hand |
| `22:14:07.406` | tool.call | Write | refuse | pass | a Write naming no ticket |
| `22:14:15.991` | tool.call | Bash | refuse | pass | LandingFollowsItsGate |
| `22:14:19.121` | tool.call | Bash | refuse | pass | GitWritesThroughAVerb |
| `22:18:13.008` | tool.call | Bash | refuse | pass | ShellWritesNothing |

Every refusal the bridge made while the door stood reads apart, and every pass reads alike. The shadow is not clean. It names the gap [[spec/tickets/cage-rules-port-before-switch]] holds, so `migration.phase5switch` waits on that ticket.

The door fell twice in the window, each time the window below ran, and the bridge posts nothing while `hooks.json` names a dead port. The refusals at the start of the session came before the first index stood, so they wrote no row.

**Phase 6, the window.** The window drew its tabs, log, work, index, cli and help, in a pseudo-terminal at a set size. `--frame` runs no compare, since the compare rides the live program's commands. Four runs:

| start | log | index during the run | window rows |
|---|---|---|---|
| `22:15:29` | the session log, through `./RUNME.sh tui` at no size | fell | none, and nothing drawn |
| `22:16:15` | the session log | fell | none |
| `22:18:20` | the session log | stood at the start, gone by the end | none |
| `22:20:23` | a copy with its first row altered | stood, then gone a few seconds in | none |

The seeded copy must read apart from `log/rows`, which `/v1` answered before the run, so its empty result proves the compare never reached the index. The cause, read in the source:

- `src/tui/main.go` reads through `index.V1()`, from `src/index/main.go`
- `V1` calls `reaches`, and `stands` holds the standing stamp against `stampHere()`
- `stampHere()` in `src/index/door.go` stamps the caller's own executable, so inside `logview` it never matches the stamp `se-index` wrote
- `reaches` then posts `stop` to the live index and runs `starts`, which spawns the caller's own executable with `serve`, so `logview serve`
- `logview` takes `serve` as a log path and stands no door, so `V1` errors, and `log.Tab.check` and `work.Tab.check` drop the error

The window's shadow cannot run on this tree, and its log proves nothing. It also stops the index each time it reads, which takes the hooks door and the cage shadow down with it. `migration.phase6switch` waits on a fix that gives the window the index's stamp, or lets `stands` take a client's stamp apart from the server's. The shadow must then run again.

For the coordinator: `phase5=mismatch(5 rows)`, `phase6=mismatch(0 rows)`, where the phase 6 path never ran.
