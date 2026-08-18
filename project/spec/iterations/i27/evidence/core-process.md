---
form: core-process
by: agent
signed_off: 2026-08-14T17:09:14.145Z
authors: agent
files: null
---

# Evidence form / core-process

## current_situation

The supervisor stands. START levels a record's tree, WATCH times a call and beats a process, REPLACE keeps the working composition until the replacement loads.

All three are machinery with no owner. Nothing calls them, because there is no process to call them from.

That is what the last three chunks build, and this is the first of them.

THE PROBLEM A CORE SOLVES. Some state on a machine is single and cannot be copied: trunk, the claim ledger, the note inbox, the call log. Several engine processes must either share those or hand them to one owner.

`cand-os-rooted` pays that price and does not price it. The core-and-satellite shape gives the shared state an owner by design, and that is the one thing it buys over the alternative.

## built

`project/deliverable/engine/core.ts`, holding exactly the three things the chunk names plus trunk itself.

TRUNK. The `Core` holds it. Every satellite reads shared method from it rather than keeping a copy, which is what makes a record's tree thin.

THE ROUTING TABLE. `attach`, `detach`, `attached` and `route`.

- `route(rel, caller?)` answers `{to, satellite?, why}`. The decision is the PATH's, never the caller's ambient root — the same rule `resolve.ts` states in `storeFor`.
- EVERY ANSWER CARRIES ITS WHY. A routing that cannot say why it went where it went is one nobody can check, and a wrong one shows up at a merge instead of at the call.
- A BOUND PATH ROUTES BY THE CALLER, never by the path alone. A path owned by "whatever is bound" names no record of its own, so guessing would send one agent's work into another agent's tree.
- AN UNATTACHED RECORD FALLS BACK TO THE CORE and the answer names the record it could not route.
- ATTACHING TWICE REPLACES. A record has exactly one owner, and a stale entry routing to a dead process is worse than no entry.

THE LEDGERS. `CORE_LEDGERS` names them in one place — claims, notes, the call log — so who-owns-what is read rather than inferred from call sites. `ownsLedger` answers for a path, and it normalises a backslash because Windows hands one over.

`APPENDED_DIRECTLY` marks the exception. `if-satellite-to-account` says a satellite appends to the call log itself rather than routing, because a log that depends on the core being reachable loses exactly the entries written when something is wrong. `exp-channel-cost` measured the floor at 124.7 microseconds for a direct append against 144 for an acknowledged crossing, so the crossing is not what makes it slow.

THE HEAVY-SLOT LEASE. `takeSlot`, `giveSlot`, `freeSlots`, `slotHolders`.

- IT IS A LEASE, NOT A WORKER POOL. A satellite takes a token before spawning a heavy child and hands it back after. The child stays the satellite's, so it inherits the working directory and runs that record's own composition.
- WHY NOT A POOL. A shared worker is nobody's child. It inherits no working directory, runs no record's engine, and would outlive the satellite that asked — which `if-satellite-supervisor-to-test-runner` forbids outright.
- A REFUSAL NAMES THE NUMBER, so the caller can act on it.
- A DOUBLE RETURN CANNOT INVENT CAPACITY. `giveSlot` answers false for a token nobody holds.
- THE HOLDERS ARE NAMED, not counted. A count says how stuck a machine is; the names say who by.

THE SLOT COUNT HAS NO DEFAULT AND THE CALLER STATES IT. Nothing in this record measured how many heavy children a machine should run at once, and a number invented here would read as one that had been measured.

Proof: `project/deliverable/tests/core.test.ts`, 13 of 13 green, test job `test-mst7bc95-1`. `npx tsc --noEmit` exits 0.

Thirteen cases across three groups, one per possession.

## follow_up

The next chunk is `satellite-process`, which depends on this one. One satellite per agent, rooted in its record's tree and running its composed machine.

THE SATELLITE IS WHERE THE SUPERVISOR GETS ITS CALLER. `levelRecordTree` needs a real `GitLane` adapter, and a repository is what a process has and a unit test does not. `callVerdict` needs a call boundary. `beatVerdict` needs a process to ask. All three wait here.

THEN `channel` CARRIES THE CROSSING, with the lease and the beat on it, naming the store on every answer.

NO PROCESS IS STARTED BY THIS CHUNK. `core.ts` touches no filesystem and spawns nothing. That is deliberate and it matches how the seam, the delta and the supervisor were each built: the decision logic first, tested against injected state, then the process that drives it.

No notes parked from this chunk.

## anything_else

One thing the design lists that this chunk does NOT claim.

`dsp-core-and-satellite` says the core owns the MIRROR as well as the ledgers. The chunk statement does not name it, and `core.ts` does not touch it.

That is not an oversight to fix here. The mirror already has an owner in the running engine, and moving it under the core is a change to a live surface with its own tests. It belongs with the process chunks that actually stand a core up.

Saying so explicitly, because a reviewer reading the design against this file would otherwise find the gap and have to guess whether it was noticed.
