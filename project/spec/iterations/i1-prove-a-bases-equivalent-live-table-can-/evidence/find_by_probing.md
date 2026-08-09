---
form: find_by_probing
by: agent
signed_off: 2026-08-09T11:40:30.770Z
authors: agent
files:
---

# Evidence form / find_by_probing

## current_situation

Two probes ran against questions written before they started. One answered and produced an option. One hit a dead end with a named cause.

Three more probes ran earlier today outside this state, against the engine rather than the design. They are recorded below because a probe that already happened is evidence whether or not it was filed under this heading.

## applies

yes

## probes

| the corpus load | is the trace corpus small enough to derive every view on every look, or must a view be stored | loadTrace over the live corpus, timed cold and warm | 322 nodes, 465 ms cold, 119 ms warm — viable against the one-second budget, with the cold number already half of it |
| the call log size | how large is the append-only log, and what does reading it cost | statSync plus a module import, from the bound state | DEAD END — the shell runs in the record's worktree and the log lives at the root, so the path does not exist from here |
| the green-branch join | can a busbar count a green branch as satisfied without breaking a real fan | changed activatePowered, wrote three tests, proved the wiring test red by dropping the thunk | it holds — 78 of 78 green, and the live walk went ten states in one pull where it had refused three times |
| the row reference reader | is the reader's shape decided by the editor name or by the line grammar | changed it to read line_pattern, ran the six neighbouring suites | 130 of 130 green, and the dsm form submitted on the next attempt |
| the standing form at depth | is a missing form inside a sub-machine a nesting problem | changed the check from position to membership, ran eight suites | 63 of 63 green, and the finder forms have submitted ever since |

## options

- opt-derive-every-view-on-every-look

## dead_ends

- THE CALL LOG COULD NOT BE MEASURED FROM HERE. `se_run` executes in the bound record's worktree, and `.se/calls.jsonl` lives at the project root. The probe returned ENOENT rather than a number. That is worth more than a guess: it also means no probe run from inside a record can measure anything the record does not contain.
- THE DERIVATION COST WAS NOT MEASURED, only the load. `recordDone` walks the graph to a fixed point on top of the read, and that walk is where the cost would actually bite. The probe named what it faked rather than letting 119 ms stand for the whole answer.
- THE CORPUS IS ONE ITERATION OLD. 322 nodes is the end of i1 of the first product. Nothing here says what 3,000 nodes cost, and the cold number suggests the answer matters.

## follow_up

- THE PROBE THAT MATTERS MOST WAS NOT RUN. Nothing measured what a view costs to DERIVE, only what the corpus costs to read. `recordDone` walks to a fixed point, and that is the number the derive-on-every-look option actually stands or falls on.
- A RECORD CANNOT PROBE OUTSIDE ITSELF. The shell runs in the bound worktree, so anything at the project root is unreachable from a bound state. That silently narrows what this finder can ever answer, and nothing in the method card says so.
- THREE PROBES WERE ENGINE FIXES, NOT DESIGN PROBES. The join rule, the row reader and the standing form all followed the shape — one question, a runnable change, a red proved before the green — but each settled whether the machinery works rather than whether an option exists. They are recorded as probes because they were, and the distinction is worth keeping.
- SCALE IS UNTESTED. Every number here comes from a 322-node corpus at the end of one iteration.

## anything_else

