---
form: package
by: agent
signed_off: 2026-08-15T20:48:32.098Z
authors: agent
files:
---

# Evidence form / package

## current_situation

The artifact is built and extracts correctly.

`dist/quackitect-4.0.0.zip`, 2,656,616 bytes, 520 entries. It carries `RUNME.ps1`, the README, the whole `project/` tree, the engine, the cage templates and the new `se-start.ts` and `cloud-runner.md`.

EXTRACTED FOR REAL rather than inspected. It unpacks to six top-level items with the tree intact and `project/deliverable/package.json` in place.

ONE THING IS UNVERIFIED AND NAMED BELOW: 515 of the 520 entries use backslash separators, which the ZIP format does not sanction. Windows normalises them. No Linux host has opened this archive.

## package

- dist/quackitect-4.0.0.zip

## works

yes — The archive assembles by script and extracts to a correct tree. Verified by using it: extracted to a temporary directory, which produced six top-level items with `project/deliverable/package.json` nested correctly rather than a flat pile of oddly-named files.

WHAT WAS NOT DONE, so the yes is not read as more than it is. RUNME.ps1 was not run from the extracted copy, and no second machine installed from it. The end-to-end install is the same observation raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make waits on.

WHAT WOULD CHANGE THIS TO NO: a Linux host failing to extract it. The entry separators are backslashes, and only a POSIX unzip can settle whether that produces a tree or a flat pile.

## emit_back

- meth-verification-discipline: the fresh-eyes rule earned its keep and the card should say so — a spawned tester found a FATAL defect the builder had named accurately in signed evidence and walked past, and retracted a measurement four artifacts rested on by re-running rather than re-reading.
- machines/demos.md and the M8 row: no iteration has ever authored a demo drawing, so no demonstration report has ever been minted. i27 and i28 both carry the identical placeholder. The method demands demonstrations at gate-validation and nothing has ever produced one.
- engine feedersUnsigned: an UNAUTHORED submachine placeholder must not count as an input. Counting it deadlocks any gate it feeds, because entering an unauthored scaffold is separately refused. An authored one must still count.
- tests/scaffold-entry.test.ts and reopen.test.ts: a test that anchors on a source phrase and slices forward breaks when a second copy of that phrase appears anywhere in the file. Anchor on a clause name, or reach the guard for real.
- engine/bin/package.ts: the archive is written with backslash entry separators, which the ZIP format does not sanction. Windows tolerates it and POSIX may not.
- guidance/refusals.md or the file lane: a glob inside a bound worktree answers empty for other records' work and reads as authoritative. It produced a confident false claim to the owner tonight.

## follow_up

WORK TO PULL IN.

- THE FIRST CLOUD RUN. The owner's shape is an already-running agent handed a branch, and `guidance/method/cloud-runner.md` now teaches it as Arrival A: install, place the cage from `project/deliverable/cage/`, then spawn a caged subagent and hand it the walk.
- raid-issue-the-lane-is-not-in-git-so-a-cloud-agent-starts-uncaged.
- THE DEMO MACHINE, which no iteration has ever authored.
- The zip's entry separators, before anyone extracts it on Linux.
- raid-debt-core-and-satellite-is-off-the-live-path, and i27's lost trace at be703899 and 6396c282.

NOTES PARKED. Eleven from this iteration. Three came from the owner tonight: whether worktrees should become two plain clones, the lane not answering from the right tree, and the source-anchored test.

## anything_else

THE VERSION READS 4.0.0 and the last release on record was 4.1.0. `package.json` on this branch says 4.0.0, so the packager is telling the truth about what it built. Left alone on the owner's instruction not to make further changes, and named here so nobody reads it as a downgrade.
