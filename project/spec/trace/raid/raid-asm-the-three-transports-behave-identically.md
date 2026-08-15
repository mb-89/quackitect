---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: raid-asm-the-three-transports-behave-identically
type: "[[raid]]"
kind: assumption
statement: A walk cannot tell which transport carries it, because every crossing marshals - so the mode is a cost dial and never a behaviour switch.
owner: the maintainer
trigger: the first real walk served through a spawned satellite
status: open
impact: The mode stops being one setting and becomes three products, which is what the owner ruled against on 2026-08-14.
breaks_how_badly: fatal
how_likely: conceivable
probe: run one identical walk in process, thread and inline, and diff the answers call for call
source_refs:
  - dsp-core-and-satellite
  - if-core-satellite
  - req-call-answers-in-one-second
---

The whole reason three transports are a SETTING rather than three products.

## What is actually shown

`transports.ts` marshals on every crossing, inline included, and says so in
its own words: inline is allowed to be faster, never laxer. `boundaries.test.ts`
drives a real child process and a real worker thread against a real
repository.

That is unit-level evidence with test payloads. No real walk has crossed the
boundary. The satellite is spawned by tests and by nothing else.

## Why the outside world says to doubt it

The nearest system people actually use is Vitest's `pool`, and its pools are
NOT interchangeable. Its own documentation
(https://vitest.dev/config/pool.md, read 2026-08-14) says:

- `process.chdir()` is available in `forks` and unavailable in `threads`.
- Native libraries such as Prisma, bcrypt and canvas "have problems when
  running in multiple threads and run into segfaults".
- Under the VM pools, an error thrown by a native module fails
  `err instanceof Error`, because the sandbox has different globals.

So the default assumption in this space is that a transport CHANGES what runs.
Ours claims the opposite. That claim is a design decision, not an observation,
and it is the one this entry holds open.

## Probe

Take one walk with a fixed sequence of pulls. Run it three times, once per
mode. Diff the answers call for call.

Identical answers settle it. Any difference names the leak, and the leak is
either closed or the mode stops being a dial.

## What would make it worse

A satellite that touches the working directory, spawns a child, or loads a
native module. None of those are in the engine today. The first one to arrive
is the moment this entry becomes urgent.
