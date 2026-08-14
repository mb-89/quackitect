---
minted_in: i2-parallel-iterations-across-machines-seed
id: raid-issue-windows-longpaths
type: "[[raid]]"
kind: issue
statement: Seeding fails on Windows in deep folders - git answers "Filename too long" because the record path carries the long iteration id twice and nothing sets core.longpaths.
owner: the driving agent
trigger: the first seed from any deeply nested product root, or the next installer touch
status: open
impact: A peer machine that clones into a deep folder cannot seed at all - the two-machine flow dies at its first act. The fresh-eyes observer hit it on the first claim-lane run in a ~140-character temp path.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - sty-work-on-two-machines
---

Observed 2026-08-12 in the fresh-eyes claim-lane demonstration
(note-7cc0f15e9bbf; the run before job-msq7b2bq-3). The retry in a
shorter path passed.

Candidate fixes, one act each:

- the installer sets core.longpaths true on Windows
- or itSeed caps the slug so the id does not ride the path twice at
  full length

Sweep 2026-08-12: the first fix landed - preflight sets core.longpaths
on every Windows clone, idempotent at every boot (engine/bin/preflight.ts).
The entry stays open until a peer's deep-root seed passes for real; the
trigger is that seed.
