---
minted_in: i2-parallel-iterations-across-machines-seed
id: cand-preassign
type: "[[candidate]]"
name: "Preassign"
statement: "the null option: a person partitions at seeding, no lock exists"
picks:
  - "[[opt-preassign-at-seeding]]"
  - "[[opt-seeds-ride-their-stub-branch]]"
  - "[[opt-graph-with-cycles]]"
  - "[[opt-derive-every-view-on-every-look]]"
  - "[[opt-the-branch-is-the-record]]"
  - "[[opt-no-installer-clone-the-template]]"
  - "[[opt-the-stray-is-a-log-entry]]"
---

## Why this one

The null option, drawn as a full line so the evaluation must beat it
rather than ignore it. It needs no lock, no force, no reconcile - the
simplest thing that could possibly coordinate.

## How it works

The seed stub carries its assigned machine id from birth; a machine
works only stubs bearing its id. Reassignment is a person editing the
stub and pushing. No lock exists because no race exists: two machines
never contend for one stub by construction, so there is no claim, no
force release, and no reconcile - the whole claim mechanism is trimmed
away. A stub with a mistyped or retired id strands silently; nothing
watches for it, and only a person's read of the pool notices.

## What it costs

Elasticity: a fast machine finishing early idles while a slow machine's
queue stands; every rebalance needs the person online and deciding. The
owner's own vision - agents claim work themselves - is the demand this
line fails, and it fails it by design rather than by accident.

## What it leans on

- the person's availability at every rebalance, which the two-machine
  demonstration deliberately removes
