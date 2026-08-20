---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-asm-a-host-shows-the-output-of-a-command-that-exits-at-once
type: "[[raid]]"
kind: assumption
statement: "A host that runs the entrypoint hands back the output of a command that prints one line and exits immediately."
owner: the maintainer
trigger: the first release check run on a host other than the developing machine
status: open
impact: "The version check prints into nothing. The release step reports a pass because the process exited zero, and nobody sees that the line was never read."
breaks_how_badly: abrasive
how_likely: conceivable
probed: 2026-08-19
probe: "unprobed, 2026-08-19, and the reason is that no cheap real check exists here. Settling it needs a host with different output handling, which this container is not and cannot become. What was done instead is a shaping action rather than a probe: the requirement asserts the printed LINE and never the exit code alone, so a host that swallowed the output would fail the check rather than pass it."
source_refs:
  - req-the-entrypoint-answers-its-version-without-starting
  - uc-prove-an-install
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
---

## Probe

RUN THE FLAG AND ASSERT THE LINE, never the exit code alone.

- The release step captures stdout and compares it with the expected version.
- A pass requires the comparison, not the exit.

WHAT WOULD FALSIFY IT. A host that buffers a short-lived process's output and
discards it on exit. A wrapper that swallows stdout unless the process runs
long enough to be attached to.

WHY THIS IS WORTH A LINE. The trap is the shape, not the likelihood: a check
that reads the exit code and calls it proof passes on a host that showed
nothing at all. Asserting the LINE costs the same and cannot fail that way.

THE HONEST STATUS. Every host this project has run on is one family, and the
POSIX branches of the arrival have never been exercised. So this is
conceivable rather than plausible, and it is recorded because the fix is free
at authoring time and expensive afterwards.
