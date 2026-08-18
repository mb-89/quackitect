---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: exp-what-runtime-the-engine-actually-needs
type: "[[experiment]]"
statement: Is the declared runtime floor the one the engine actually needs, measured as the node version required to run its entry scripts unflagged?
probes:
  - raid-asm-the-installed-runtime-is-one-the-engine-runs-on
timebox: 20 minutes
form: calculation
chunk: none — three declarations were read and nothing was written
faked: the host. No machine with a default install was available, so what a package manager gives a bare host is read from the declaration rather than observed.
fallback: if the declared floor is below what the engine needs, the entrypoint pins an exact version rather than accepting whatever it finds, and the verify step compares against that pin instead of against a floor.
verdict: falls
measured: "2026-08-15. Declared floor: package.json line 8, node >=22.6. This machine: v24.16.0. The engine spawns its scripts as `node <file>.ts` with NO flag (session.ts spawnScript, tools.ts spawnNode). Unflagged TypeScript execution is not what >=22.6 buys."
folds_to: el-entrypoint's verify step compares against a PINNED version rather than a floor, and package.json line 8 is corrected. The assumption is answered for the local half and stays owed for what a default install gives a bare host.
promote: none
source_refs:
  - rank-unknowns, the seeded pick
  - req-one-command-starts-an-unattended-machine
---

## Setup

THREE FACTS, EACH READ FROM THE THING ITSELF rather than from memory.

- The declared floor, from `project/deliverable/package.json` line 8: `"node": ">=22.6"`.
- This machine's runtime: `node --version` answers v24.16.0.
- How the engine starts a script: `spawn("node", [abs, ...])`, with no flag of any kind.

## Result

THE ENGINE RUNS TYPESCRIPT DIRECTLY AND PASSES NO FLAG. Every condition
script, the preflight, the smoketest and the selftest are `.ts` files invoked
as plain arguments to `node`.

SO THE FLOOR IS NOT A FLOOR FOR THIS. `>=22.6` is the version where stripping
types became possible behind an explicit flag. The engine never passes one, so
what it needs is the version where the behaviour is on by default.

THE DECLARATION AND THE INVOCATION DISAGREE, and nothing has ever caught it
because every machine that has run this engine happened to be new enough.

## Why this is urgent rather than tidy

A HOST INSTALLING TODAY'S LTS CAN LAND ON 22.x. That satisfies `>=22.6`
exactly, and the entrypoint's verify step would call it good.

THE FIRST THING TO FAIL WOULD BE THE PREFLIGHT, and it would fail as a syntax
error deep in a spawned script rather than as "your runtime is too old". That
is the exact symptom
[[req-one-command-starts-an-unattended-machine]] exists to remove: every
failure of the first cloud run presented as something other than its cause.

## What is still owed

WHAT A DEFAULT INSTALL ACTUALLY GIVES on the target host families. That needs
the machine this one cannot make, and it stays owed under
[[raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make]].

BUT THE OWED HALF NO LONGER BLOCKS THE FIX. Pinning an exact version removes
the question rather than answering it, and the fallback written before this
run says exactly that.
