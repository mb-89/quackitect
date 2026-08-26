---
form: run-spikes
amended: 2026-08-26T13:32:27.395Z by agent — the shell-reach figure was an overcount; a bare exec( matched RegExp.exec, and the real reach is 38 of 178
by: agent
signed_off: 2026-08-26T13:25:57.765Z
authors: agent
files: null
---

# Evidence form / run-spikes

## current_situation

Eight spikes were chosen at rank-unknowns. All eight are answered.

Four hold. One is false. One splits. Two could not be answered here, and say so rather than guessing.

Two of the holds corrected figures that were already standing in the corpus. One of them fired a trigger nobody had noticed.

### 1. The kill criterion HOLDS, by 8 modules

The disk door reaches 81 of 178 engine modules. That is 45.5 percent, against a bar of more than 50 percent.

The spread between the biggest door and the next is forty to one: 81 modules against 2. An earlier count said 81 against 6, because it folded `node:http` into the network door. That count was wrong, and this corrects it.

### 2. The usable-reason assumption is NOT SETTLED

The tree holds exactly one departure. Its reason is genuinely good. One case is not evidence either way.

### 3. The demanded-reason assumption is NOT PROBEABLE HERE

`deliverable/engine/widgets.ts:108` states that a bullet with no reason is IGNORED. Ignored is not refused, so no refusal exists to probe.

The machinery does exist elsewhere. `deliverable/engine/session.ts:1394` already carries `if (reason.trim() === "")` for a different field.

### 4. Every departure passing through the lane is FALSE

41 engine modules write to disk directly. 38 of 178 can reach a shell — 29 spawn a process themselves, and 9 more go through the lane's runner. 27 of those 38 also import `node:fs`.

A shell command carries no path a guard can read, so the guard cannot judge it. The hole is 38 modules wide, not one counterexample.

This figure was first recorded as 60. That count matched a bare `exec(`, which `RegExp.prototype.exec` collides with, so ordinary pattern matching read as spawning a process. The corrected count cross-checks exactly against an independent count of the subprocess conversation.

One caveat is recorded with it. Holding the shell channel is not the same as using it for a departure, and that was not measured.

### 5. The write shapes DO cluster, and two figures were wrong

151 write sites in 41 files across the whole engine. Eight shapes, led by mkdir-then-write at 38 and read-modify-write at 37.

The one-shape claim said 30 of 64 sites in the seven heaviest modules. Hand-reading every borderline site gives 25 of 64 — 20 read-modify-writes plus 4 preceding `mkdirSync` calls.

The engine-core total said 117 sites across 50 files. It measures 123 across 29. The verb list is not in dispute, and the seven modules agree exactly at 64 on both counts. No scope yielding 50 files could be reconstructed, and that gap is recorded as unexplained rather than dropped.

### 6. The seven-module sample SPLITS

The seven are genuinely the heaviest, verified rather than assumed. The next file down carries 4 sites against their 6 to 11.

On a like-for-like improve-against-lengthen proxy the sample CARRIES: 80 percent improve inside the seven, 76 percent outside. The proxy is marked as a proxy, because the original per-site judgment could not be reconstructed.

On the shape measure it does NOT carry. Read-modify-writes are 33 percent inside the seven and 19 percent outside, about 1.7 times denser in the sample.

### 7. The conformance checks stay affordable, and THE TRIGGER HAS FIRED

The node fires on a corpus above three thousand nodes. The corpus is 3118. Nobody noticed until this probe went looking.

The sweep runs at 1066 ms against a two-second line, so the other clause has not fired.

The split is 72 percent per-node work — walk, read and parse — against under 25 percent per-rule. Growth lands on the half no rule author controls. YAML parsing alone is 614 to 708 ms, the single largest cost.

One more rule costs about 1 ms over already-parsed frontmatter, 15 to 19 ms over already-read content, or 91 to 125 ms if it walks the tree itself.

### 8. The write budget HOLDS with about fifty times headroom

Reading all 1782 corpus files before a single write costs 18.2 ms, 18.1 ms and 19.7 ms across three rounds. The budget is 1000 ms.

This goes against the design that won. The winner was shaped to avoid a corpus-reading check at write time, and the budget would never have forced that shape.

## follow_up

### Into this record, before the build

- The departure hole is the sharpest finding. `el-door-rule` must say what it does with a module that reaches disk through a shell. Two honest options stand: the rule governs only the calls it can read and says so out loud, or the shell channel itself becomes a door.
- The write budget frees the design. A corpus-reading check at write time is affordable, so the exactness the winner traded away can be bought back if M7 wants it.
- The sample's split narrows one claim. The door's reach may be set from the seven. The claim that a claim-writing object is what pays may not, because that rests on the shape and the shape does not carry.
- A new rule must declare which of three cost classes it is in. A rule that walks the tree itself costs a hundred times one that reads parsed frontmatter, and nothing today makes an author say which they wrote.

### Parked, with a ready-when

- The usable-reason assumption stays open. Ready when the tree holds more than one departure, which the build itself will produce.
- The demanded-reason assumption stays open. Ready when a refusal exists to probe, which `el-door-rule` will create.
- The 50-file figure in the engine-core count is unexplained. Ready when somebody can name the scope it measured.

### Outside this record

- The sweep reports green on an empty corpus, and its widget guard flips on the working directory. Captured as `note-c545c46b8e56`.
- The sweep has no criterion watching its own runtime. Recorded as `raid-risk-the-sweep-s-own-runtime-has-no-criterion-watching-it`.
- `deliverable/engine/tools-run.ts:681` returns `ok: true` hardcoded, so a red sweep can never fail the battery. Every sibling in that file tracks its exit code. Already recorded at `spec/overhauls/2026-08-20/findings.md:587`, still unfixed.

## anything_else

### The sweep was red while these spikes ran, and it was this record's doing

The cost measurement found four `unparseable` findings, all duplicate YAML keys in `spec/trace/raid/`. All four were mine. The patch that recorded earlier probe results added a `probed:` line beside one that already existed, instead of replacing it.

Fixed, and the sweep is green again at 3118 nodes in 1161 ms. The prose that was sitting in a frontmatter value moved into the node body, where prose belongs.

### Two prior claims were measured and found wrong

Both were corrected on their own nodes rather than noted and walked past.

- `raid-asm-a-door-in-front-of-the-engine-s-own-disk-access-pays-for-itself` carried 30 of 64 and 117 across 50 files. Now 25 of 64 and 123 across 29.
- `raid-asm-the-seven-heaviest-modules-speak-for-the-other-fifty-three` carried "the other 53". It is 59, in 22 files. The node's name keeps the old figure, because the id is what other nodes cite.

### What was measured with a proxy, and is marked as one

The original improve-against-lengthen sorting was a per-site judgment by a person. It could not be faithfully reconstructed.

A mechanical proxy stood in. It reproduces two of the seven modules exactly and diverges hard on a third. Only its like-for-like comparison across both sides means anything, and that is the only way it is used.
