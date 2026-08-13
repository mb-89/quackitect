---
form: identify-assumptions
by: agent
signed_off: 2026-08-13T08:35:21.748Z
authors: agent
files:
---

# Evidence form / identify-assumptions

## current_situation

Three requirements stand from the previous state, and the sweep walked them rather than memory.

The register carried 46 entries before this state and carries 49 after. All three additions are assumptions with a written Probe, so none is a worry wearing an assumption's clothes.

Two of the three are load-bearing on the reading credit, which is the largest of this delta's three items. The third is load-bearing on the verb.

One thing this sweep did NOT find: an assumption behind req-red-objective-serves-its-fill. It leans on the route being drawn per pull, and that is ours to decide rather than something we rely on without control. It is recorded here as a nil answer rather than left blank.

## assumptions

- raid-asm-session-identity-survives-a-reload
- raid-asm-line-endings-do-not-move-under-us
- raid-asm-every-condition-can-say-what-it-wants

## sweep

- environment: none new. This delta reads documents the walk already reads and writes state only this engine reads. No claim is made about scale, load, or who else is on the machine, because nothing here is sensitive to any of them.
- toolchain: none new. Content hashing uses the engine's own contentHash, which already ships and is already relied on by the file lane. No version is newly depended on.
- host: ONE, and it is the load-bearing one. raid-asm-session-identity-survives-a-reload. The credit must outlive the process, so it is found again by some identity, and the intended identity is a token the HARNESS mints rather than we do. Nobody has established that the token survives se_reload.
- platform: ONE. raid-asm-line-endings-do-not-move-under-us. A content hash moves when bytes move, and this tree demonstrably holds mixed line endings — the lane corrects CRLF against LF on every patch, which is the evidence. Git checkout behaviour is configuration nobody here has pinned.
- neighbours: none. Nothing outside the engine reads or writes the reading credit, and the grey-state verb reads only the engine's own model. No datasheet is being trusted in place of a run.
- people: none for the credit, which is invisible to the person. ONE for the verb, and it is recorded as raid-asm-every-condition-can-say-what-it-wants — the verb's answer is only useful if every blocker can state its want in words, and a computed guard has no note to read.

## follow_up

- probe all three at probe-assumptions, which probes every standing assumption rather than only these
- run the session-identity probe BEFORE the credit's storage shape is chosen, since a different token changes the design rather than the code
- count the three shapes of grey before designing the verb's contract, so the honest branch is decided rather than discovered

## anything_else

