---
form: delta-compose
by: agent
signed_off: 2026-08-14T16:28:52.894Z
authors: agent
files:
---

# Evidence form / delta-compose

## current_situation

The seam is in place. `resolve()` answers with the store beside the path, so a caller can tell which tree replied.

A record's tree is thin. It holds no copy of shared method and no copy of the engine.

That leaves a hole. A record must still be able to change the machine it runs. A whole engine copy per record contradicts the thin tree, and it priced twenty-seven engines on disk.

This chunk closes the hole with a delta. The record holds only the files it changed. Everything else comes from trunk.

## built

Two functions and a guard, all in `project/deliverable/engine/delta.ts`.

- `composeForRecord(root, recordRel, rel)` — the composition. It looks in the record's `delta/` folder first. Not found there, it serves trunk. It answers `{abs, from}`, where `from` is `record` or `trunk`.
- `overridesIn(root, recordRel)` — the override list. It walks the record's `delta/` folder and returns every file in it, sorted, root-relative.
- `isOverridable(rel)` — the guard. Only method and engine paths may be overridden, tested against `METHOD_PREFIXES` in `paths.ts`.
- `deltaDirOf(recordRel)` — one place names the folder, so nothing else hardcodes `delta`.

RECORD FIRST, TRUNK SECOND, NEVER BOTH. Nothing merges. A file is served whole from one store or the other.

That is deliberate. A file assembled from both stores is exactly the mixture `req-entry-levels-the-record-tree` exists to prevent.

THE OVERRIDE LIST IS THE RECORD'S CHANGE TO THE MACHINE, readable without diffing anything. It is short by construction. A list that has grown long is a record that has quietly become a fork, and that is worth seeing.

The consumer already stands. `supervisor.ts` imports `overridesIn` and uses it in `levelRecordTree`.

Proof: `project/deliverable/tests/bound-engine.test.ts`, 15 of 15 green, test job `test-mst5vivp-1`.

Four of those cases are this chunk's:

- a record with no override runs trunk's engine
- a record's own folder may override an engine file, record first and trunk second
- the override list is what the record has done to the machine
- only method and engine are overridable, because a record's evidence is not a delta

The second one is the authored red this chunk owed. The build plan names it: "delta-compose: a record's own folder may override an engine file."

## follow_up

The next chunk is `supervisor-level`, which depends on this one. It levels the tree at entry, rebases the delta and commits what it brought, or stops the record with the conflict named. Its code stands in `supervisor.ts` and its form is owed.

NOTHING CALLS `composeForRecord` IN THE LIVE LANE YET, and that is by design rather than an omission. The build plan puts the wiring in `satellite-process`, which roots a satellite in its record's tree and runs its composed machine. Judging this chunk on that would be judging it against another chunk's scope.

No notes parked from this chunk.

## anything_else

One thing worth saying about what this chunk does NOT settle.

The delta serves a path. It cannot serve a shell.

`SE-C-134` guards five path-carrying tools and, in the words of `project/guidance/refusals.md`, "does not and cannot watch se_run's shell commands". A seam judges paths. A shell is handed none.

That gap is filed as `raid-iss-the-shell-writes-method-with-no-path-to-judge`. It is not this chunk's to close.
