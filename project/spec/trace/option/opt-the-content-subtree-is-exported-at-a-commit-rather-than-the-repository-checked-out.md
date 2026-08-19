---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-the-content-subtree-is-exported-at-a-commit-rather-than-the-repository-checked-out
type: "[[option]]"
found_by: probe
statement: "Only the content the work is made of is materialised at the past point, exported into an empty directory, so nothing about the machine itself moves."
source: "PROBE run 2026-08-19, timeboxed at minutes \u2014 git archive of project/spec at 5f85977f^ into an empty directory"
---

## What the probe showed

RUN 2026-08-19. `git archive 5f85977f^ project/spec | tar -x` into an empty
directory produced **1149 markdown files** in seconds.

- **0** of them mention i33 anywhere.
- The i33 record folder contains exactly one file, `record.md` — the seeded
  record, with no evidence folder and no machines folder.

So the fixture is exactly right by construction: the design input present, and
everything the walk must derive absent.

## Why it beats a checkout

The owner ruled the current engine runs. An export of the content subtree
cannot move the deliverable even by accident, where a checkout has to be told
not to.

## What it faked

Nothing was walked. The probe showed the tree can be MADE and is correct; it
did not show the engine can run against it.

## Mechanism

One export of the content path at the rewind commit into a fresh directory,
discarded when the run ends.
