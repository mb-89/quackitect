---
unreachable_refs:
  - raid-asm-remote-serializes-claims
minted_in: i12
id: raid-risk-git-fake-drifts-from-git
type: "[[raid]]"
kind: risk
statement: A fake of the git seam drifts from real git, so the logic tests keep passing against behaviour git no longer has.
owner: the driving agent
trigger: a case passes against the fake and fails against the one real-git seam test, or git changes behaviour on a command the fake answers
status: open
impact: claims.test.ts holds the claim lane's only proof. A drifted fake turns seventeen green cases into statements about a git that does not exist. That lane is what stops two machines holding one record.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - i12
  - raid-asm-remote-serializes-claims
---

## Why it is open

The designed fix for the battery's tallest pole replaces 176 real git
invocations with a map from arguments to canned results. The record names
the risk itself rather than discovering it later.

The mitigation is one real-git test at the seam, proving the real thing
does what the fake pretends. That test is the whole guard, so it carries
the weight the 176 invocations used to carry.

## What keeps it honest

The fake must be a fake of the GIT SURFACE only. Faking the module's own
functions would fake the subject under test, and the cases would then
prove that the code agrees with itself.

The seam is narrow enough for this to work. The module reaches git
through one function plus a few one-line helpers, and everything else is
logic over strings.

## What would make it bite

Two things, and they look the same from the test output.

- Git changes behaviour on a command the fake answers, and the fake keeps
  answering the old way.
- Somebody widens the fake to cover a new command without widening the
  seam test with it.
