---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-asm-the-installed-runtime-is-one-the-engine-runs-on
type: "[[raid]]"
kind: assumption
statement: The runtime version an unattended entrypoint finds or installs on a machine nobody prepared is one this engine actually runs on.
owner: the driving agent
trigger: the first unattended run on a host whose package manager is not the one this was written against, and any change to the engine's language level
status: probed
impact: The entrypoint reports success, the lane starts, and the engine fails on a syntax or API it cannot use. The failure surfaces deep in the walk rather than at the step that caused it, which is the exact symptom the entrypoint exists to remove.
breaks_how_badly: crippling
how_likely: plausible
probe: "RESOLVED 2026-08-18 by dropping the floor to the runtime a bare host already has: the pin is now >=22.18.0, the version at which Node 22 runs TypeScript unflagged. Nothing in the engine needs 24, measured across both runtimes. False on arrival, i35 on 2026-08-17. This box's default runtime was v22.22.2 against a declared floor of >=24.0.0, so the engine would not start. Resolved by installing a satisfying runtime, never by editing the declaration. RE-PROBED 2026-08-19 on this machine and it HOLDS: the running interpreter is v24.16.0 against the manifest pin of >=22.18.0, read from deliverable/package.json where the arrival says it reads one."
probed: 2026-08-17
source_refs:
  - req-one-command-starts-an-unattended-machine
  - nbr-cloud-host
  - nbr-toolchain
weighs_with: <!-- a pool id, then why the two measure the same thing. Or none. -->
weighs_against: <!-- one line per pair — a pool id, then > or = -->
---

## Probe

READ WHAT THE ENGINE ACTUALLY NEEDS, then read what the entrypoint would get.

- The engine's own floor: whatever language level and APIs the source uses,
  which is a fact in the repository rather than a belief.
- What a bare host gives: the runtime its default package source installs
  today, on the two host families that matter.

COMPARE THE TWO. If the floor is above what a default install provides on any
target host, the assumption is false and the entrypoint must pin a version
rather than accept whatever it finds.

WHAT WOULD FALSIFY IT: one target host whose default install is below the
engine's floor.

## Where the smell came from

THE METHOD CARD NAMES IT: a capability named without a version. The entrypoint
requirement says "verifies the runtime it needs is present" and does not say
which version, and neither does anything under it.

That is the whole reason this entry exists. Nothing has gone wrong yet.

## Probe result, 2026-08-19 — HOLDS on this machine

THE REAL CHANNEL WAS ASKED, not a document. The running interpreter reports
v24.16.0 on win32 x64. The declaration it is checked against sits in the
engine's own manifest at `deliverable/package.json`, which pins node at
`>=22.18.0`. The running version satisfies the pin.

ONE MACHINE IS NOT EVERY MACHINE, and that is the honest limit of the result.
What was settled is that a pin EXISTS, is READABLE where the arrival says it
reads one, and is SATISFIED here. Whether a fresh machine lands above the pin
is what the arrival's own runtime check is for.

THE FIRST ATTEMPT LOOKED IN THREE WRONG PLACES and reported no pin at all. The
manifest is one level deeper than guessed. A negative result from a search that
never reached the file is not a finding, and it would have been recorded as one
had the glob not been run afterwards.

SOMETHING ELSE FELL OUT OF THE SAME PROBE, belonging to this iteration rather
than to this entry. The manifest's serve script starts the engine with
`--root ../..`, which is the wrapper level i9 is collapsing. It is a concrete
caller for the count the scope demands before the first edit.
