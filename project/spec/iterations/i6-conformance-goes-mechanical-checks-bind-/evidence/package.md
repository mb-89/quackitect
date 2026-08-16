---
form: package
by: agent
signed_off: 2026-08-16T19:50:27.061Z
authors: agent
files:
---

# Evidence form / package

## current_situation

The engine and the method both moved this iteration, so the package is a real release rather than a re-zip.

The version bumped 4.3.0 to 4.4.0 in `project/deliverable/package.json`, the one manifest `version.ts` reads.

The archive assembled by script in 14.8 seconds. Nothing was assembled by hand.

It was then extracted to a scratch folder outside the repository and used from there, which is the only way to catch what the exclusion filter got wrong.

## package

- dist/quackitect-4.4.0.zip

## works

yes

## emit_back

- machines/rigor.md — a state that completes on a fallback or error edge is marked red, never green; the outcome, not the condition, decides the colour
- engine/discipline.ts — the conformance sweep runs at three engine-chosen moments and has no verb, so the agent cannot spam it
- machines/forms — no state may demand what no state can supply; the supply check now stands and 29 gaps were closed before it was armed
- guidance/refusals.md — SE-C-130 and SE-C-131 retired, because the two scope guards closed on each other and no test call was legal for four milestones
- the verification loop — a fixable finding is fixed once, a tree-invalidating one becomes a debt note, and the gate weighs the debt; owner ruling 2026-08-16, note-0af46cbcd41f
- `.se/reading.md` — the file and the mechanism that writes it are to be deleted; paginated reads already do the job; note-de5bc82a2d75

## follow_up

Two notes are parked with their ready-when.

note-0af46cbcd41f asks the retro to redesign the verification loop. Ready when the retro opens.

note-de5bc82a2d75 asks for `.se/reading.md` and its writer to be deleted. Ready when a record touches the reading loop.

Nine notes stand in the inbox for the retro to drain.

The owner still owns one act outside the lane: deleting 26 stale `origin/it/*` remote branches and `origin/claude/cloud-deployment-handover-1g70sb`. Four refs are not safe to remove and were named.

## anything_else

The checks run against the extracted copy, not the repository:

- The packaged launcher read the packaged brand, found node, and printed the packaged engine's flag registry. One help, whole.
- The version stamp read 4.4.0 out of the archive. That is the exact defect `version.ts` records, where a 4.1.0 archive announced 3.0.0-bootstrap.
- 0 record files shipped under `project/spec`. The folder exists and is empty, which is what the receiver needs.
- README.md is the entry document at 1265 chars, opening `# Quackitect`, with 0 unrendered `$PRODUCT$` placeholders.
- The installer and the editor extension are both inside.
- `node_modules` and `.se` stayed home.

Size: 2,752,882 bytes, up 52,666 from 4.3.0's 2,700,216. That is 1.95 percent for a milestone that added four test scripts and five trace nodes.
