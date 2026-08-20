---
minted_in: i5-engine-hygiene-one-version-source-every-
id: tsp-a-configuration-path-lives-in-one-place
type: "[[test-spec]]"
statement: A check that a configuration file is present takes its path from the reader that consumes the file.
method: test
verifies:
  - req-a-preflight-check-asks-the-reader-where-it-looked
files:
  - project/deliverable/tests/one-config-path.test.ts
---

## Scope

The two configuration files a product is configured BY — the palette and the
brand file — and the two places that name them: the live reader and the boot
check.

WHY A TEST AND NOT AN INSPECTION, since what is examined is static source. In
this house an inspection is a checklist a person or an agent READS, with no
file behind it. This one is automated: the cases run in the battery on every
change, and a second place growing back turns the suite red without anybody
looking. That is a test by the only definition that matters here — something
runs and decides.

WHY THIS LEVEL. The defect is the DUPLICATION, which is visible in the source
and nowhere else. Moving a file to prove it dynamically would prove the same
thing at ten times the cost.

## Approach

A RATCHET, NOT A BAN. The count may fall and must not rise. A second place is
allowed to exist only where somebody decided it should, and this file is where
that decision would have to be made.

THREE CASES ARE RED at authoring time: preflight joins its own path for each of
the two files, and it names no reader function. ONE IS GREEN and guards what
must NOT change.

## Steps

Each case in the named file is one step, and each carries its own pass line.

1. `palette.css is named in one place, and preflight is not that place` — RED.
   Passes when no non-comment line of preflight names the file.
2. `brand.json is named in one place, and preflight is not that place` — RED.
   The same, for the other configuration file.
3. `preflight asks the reader, so the check cannot go stale on its own` — RED.
   Passes when preflight names the reader's own path function rather than
   joining a path itself.
4. `the reader still falls back silently` — GREEN, and it is the guard on the
   fix. The silent fallback at render time is correct and settled: a missing
   palette must not take every surface down over a colour. A fix that removed
   it would trade a quiet boot for a dead panel.
