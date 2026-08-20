---
form: satellite-process
by: agent
signed_off: 2026-08-14T17:18:23.173Z
authors: agent
files: null
---

# Evidence form / satellite-process

## current_situation

The core stands. It owns trunk, the ledgers, the routing table and the heavy-slot count, and it routes a call by what the PATH is.

What it routes TO did not exist. `route` could answer "satellite" and name one, and nothing on the other end could take the call.

This chunk is the other end.

## built

`project/deliverable/engine/satellite.ts`, two things: the satellite itself, and the real git adapter the supervisor has been waiting for.

THE SATELLITE OWNS ONE RECORD. Its `tree` IS that record's tree, so a relative path it is handed cannot address another record by accident. That is `req-a-write-lands-where-it-is-meant` made STRUCTURAL rather than checked. Nothing has to remember to guard it.

`start(git)` IS ALL-OR-NOTHING. It levels the tree first through `levelRecordTree`, and serves only if the tree came up level. A satellite that started on an unlevelled tree would serve a composition nobody assembled — the mixture `req-entry-levels-the-record-tree` exists to prevent. A stopped satellite answers nothing at all: `serve` throws with the conflict named.

`serve(rel)` RUNS THE RECORD'S COMPOSED MACHINE. Record folder first, trunk second, never both, through `composeForRecord`. Everything the record did not change comes from trunk, which is what keeps its tree thin.

IT RE-REALIZES NOTHING. The walk engine still walks, the test runner still runs tests, the seam still resolves. The satellite owns which TREE they see, and nothing else.

THE GIT ADAPTER, and it forced a correction.

`gitLaneFor(tree, trunkBranch, run)` implements the `GitLane` the supervisor declared, with the runner injected so it is testable without a repository.

IT MERGES, IT DOES NOT REBASE. The interface method was called `rebase` when supervisor-level wrote it. SE-C-002 forbids a rebase outright — never rewrite, superseded content stays in history — and the git allowlist has no such verb, saying in as many words that a diverged branch reconciles by merge. THE NAME PROMISED THE ONE OPERATION THE LANE REFUSES.

So the method is now `reconcile`, in the interface, in `levelRecordTree`, and in the four tests that drive it. The interface says why, so nobody renames it back.

TWO THINGS THE ADAPTER GETS RIGHT that a first cut would not:

- A CONFLICT CARRIES GIT'S OWN WORDS. It keeps the `CONFLICT` and `Auto-merging` lines rather than summarising, because the file names are the only part anybody can act on.
- NOTHING TO COMMIT IS NOT A FAILURE. Git reports it with exit 1. A levelling that brought no change is still a levelled tree, and reading that exit code as failure would stop every clean record at entry.

Proof: `project/deliverable/tests/satellite.test.ts`, 8 of 8 green, test job `test-mst7n73b-6`.

Seven cases, and one of them asserts the NEGATIVE: the verbs the adapter actually ran include `merge` and do not include `rebase`.

## follow_up

The next chunk is `channel`, the last of the three processes. The local crossing between core and satellite, carrying the lease and the beat, naming the store on every answer.

THE SUPERVISOR'S WATCH MECHANISMS STILL HAVE NO CALLER. `callVerdict` needs a call boundary and `beatVerdict` needs a process to ask. Both arrive with the channel, which is what makes it the last one.

NO PROCESS IS STARTED HERE EITHER. `satellite.ts` spawns nothing. It is the satellite's LOGIC, tested against an injected git, and the process that hosts it is `se-mcp.ts`'s job when the channel lands.

No notes parked from this chunk.

## anything_else

The rename is the part worth a reviewer's attention, because of WHERE it was found.

`supervisor-level`'s form is signed. Its tests were green. Nothing about it was wrong except the NAME of one interface method, and the name happened to promise an operation the project forbids by clause.

IT WAS ONLY FOUND BY WRITING THE THING ON THE OTHER SIDE OF THE INTERFACE. A stub named `rebase` behaves exactly like a stub named `reconcile`, so no test could have caught it. The adapter had to be real before the contradiction had anywhere to show.

That is an argument for building the consumer sooner, and it belongs in this record's retro rather than in a note.
