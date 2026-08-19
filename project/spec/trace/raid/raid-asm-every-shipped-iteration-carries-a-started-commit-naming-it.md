---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-asm-every-shipped-iteration-carries-a-started-commit-naming-it
type: "[[raid]]"
kind: assumption
statement: "Every shipped iteration has exactly one commit whose message names it as started, so a rewind point can be found for any of them mechanically."
owner: the maintainer of the machine
trigger: the first benchmark run that names an iteration other than i33
status: open
impact: "A benchmark cannot be pointed at part of the archive, and which part fails is discovered one run at a time rather than known."
breaks_how_badly: crippling
how_likely: plausible
probe: "unprobed \u2014 checked on i33 only, where 5f85977f is its started commit. The other ten pinned records are unchecked."
source_refs:
  - req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point
  - fn-the-benchmark-run.locate-the-rewind-point
weighs_with: none
weighs_against: none
---

## Probe

HOW TO CHECK IT, and it is one call. Ask the log for every commit whose
subject matches `iteration <id>: started` and compare that list against the
eleven pinned records.

WHY IT IS PLAUSIBLE RATHER THAN CONCEIVABLE. The stamping code exists today
and `markStarted` writes it. But it is guarded by a check on whether `started:`
is already in the record, and records predating that guard may never have been
stamped. i27 is a folder without the modern id shape, which is one visible sign
that the archive is not uniform.

WHAT FALSIFIES IT. Any pinned record with no started commit, or with two.