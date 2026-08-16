---
form: package
by: agent
signed_off: 2026-08-16T13:59:01.175Z
authors: agent
files:
---

# Evidence form / package

## current_situation

THE ARTIFACT IS BUILT AND IT WAS OPENED. `dist/quackitect-4.3.0.zip`, 2,700,216 bytes, assembled by `engine/bin/package.ts` in 17.6 seconds and expanded to `dist/check-4.3.0` to be looked at.

### What is in it, seen rather than assumed

- `README.md` — the ENTRY document, rendered from `brand/README.entry.md`, which is the same template the export renders so the two front doors cannot drift.
- `RUNME.ps1` — the one-time installer, 30,267 bytes.
- `RELEASES.md`, and `project/` carrying `deliverable`, `guidance` and `spec`.
- `project/deliverable/package.json` reading `"version": "4.3.0"`, so the bump travelled with the artifact rather than only living in the repository.

ONE THING THE LISTING ANSWERED THAT THE SWEEP HAD FLAGGED. `AGENTS.md` and `CLAUDE.md` are both 37,813 bytes inside the package. They are the same contract served to two hosts and kept identical BY HAND, and this record edited four passages in both. Equal sizes are not a proof of equality, but they are the check that was available and it passes.

### The version

4.2.0 to 4.3.0, MINOR, and the bump lands in one place because everything reads it from the manifest. `version.ts` exists because the version was once hardcoded in four places, none of them followed a release, and every call for a whole major version logged a version the product had left behind.

MINOR IS THE RIGHT SIZE. The bundle ADDS behaviour — a control, a refusal, an argument on se_amend, two states firing their own checks — and removes nothing a caller could depend on. Every file verb kept its name, and se_amend's `fills` still works beside its new `ops`.

### The size is the sanity check

2,700,216 bytes against 4.2.0's 2,657,691: 43KB larger, the shape of an iteration that added two scripts and edited a dozen files. A packaging fault that dropped a tree would show as a collapse, and 3.0.0's 7.2MB shows what a bundle that swept in its dependencies looks like.

## package

- dist/quackitect-4.3.0.zip

## works

yes — expanded and inspected: the front door, the installer, the versioned engine and method are all in it, and the manifest inside reads 4.3.0

## emit_back

- machines/stopat.md: a new method file, the four stop-at notches, read live by the engine
- machines/panels/controls.md: the stop-at row, and why its label sits on the row rather than on each button
- M7_30_observe-red: declares an exit_script, so the engine fires the record's new checks instead of the agent
- M7_50_verification: declares an exit_script, so the engine fires the battery — what filled_by:engine claimed and never did
- guidance/refusals.md: SE-C-137 added whole, SE-C-101 and SE-C-120 and SE-C-133 rewritten as their behaviour moved
- guidance/method/lane.md: the truncating pipe is a refusal now, not a hazard to avoid
- AGENTS.md and CLAUDE.md and walking.md: tests, the pipe, the person's controls, the chained brief and the stall
- the packaging script itself needed no change, and its exclusions held

## follow_up

NOTHING BLOCKS. gate-release is next, and after it the close.

THE HONEST LIMIT ON THIS CHECK, named rather than dressed up. The package was expanded and read; it was NOT installed on a fresh machine and started. That is the same gap `tsp-first-run` and `sty-ramp-up` carry, both owed against raid-issue-must-demos-owed, and running the installer beside the live repository would exercise this tree's state rather than the package's — answering a different question while looking like an answer to this one.

THE CLOSE WILL REFUSE, and that is this record's own mechanism working. `req-close-refuses-loose-ends` was built here, and verification left NINE owed items against two OPEN register entries. The close names each one instead of letting the record ship quietly, and clearing them needs the owner's decision on whether a record carries the whole product's standing claims at all.

## anything_else

