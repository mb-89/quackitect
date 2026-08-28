---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-asm-the-test-runner-gives-each-file-its-own-process
type: "[[raid]]"
kind: assumption
statement: The test runner gives each test file its own process, so splitting one file into several reaches more cores.
owner: the maintainer
trigger: any decision to split a test file for speed
status: open
impact: A file is divided for parallelism the runner does not provide, the wall clock does not move, and the split looks like a failed optimisation rather than a wrong premise.
breaks_how_badly: abrasive
how_likely: conceivable
probed: 2026-08-19
probe: scheduled, 2026-08-19. The only real check is a battery run compared against the summed cost of its files, and no state before verification may fire one. The container carries no previous run to read either. So the measurement lands at verification, and the split item is written to allow measure-and-strike as an outcome rather than assuming the premise.
source_refs:
  - raid-risk-splitting-the-heaviest-test-file-buys-no-wall-clock
  - raid-iss-a-fresh-container-has-no-battery-timings-to-design-against
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
---

## Probe

TWO CHECKS, AND THE SECOND IS THE ONE THAT DECIDES.

- READ THE RUNNER'S OWN CONTRACT. The house rule in guidance/craft/software.md
  states it plainly: across files is real parallelism, within a file is
  cooperative. That is the belief. It is written down, which is not the same
  as measured here.
- MEASURE THE BATTERY. Compare the summed cost of every file against the run's
  wall clock. If the wall clock is close to the sum, the files are not running
  in parallel at all and the whole premise is wrong. If the wall clock is close
  to the SLOWEST FILE, the premise holds and the only question left is which
  file that is.

WHAT WOULD FALSIFY IT. A wall clock that tracks the sum rather than the
maximum. A runner configuration that pins concurrency to one. A machine with
fewer usable cores than files.

WHY IT IS SEPARATE FROM THE RISK IT SITS UNDER. The risk says the split may
buy nothing because another file sets the critical path. This assumption is
one level below: it says file-level parallelism exists at all. If this is
false, the risk is not merely likely, it is certain.
