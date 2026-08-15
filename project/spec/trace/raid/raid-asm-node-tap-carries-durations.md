---
minted_in: i12
id: raid-asm-node-tap-carries-durations
type: "[[raid]]"
kind: assumption
statement: Node's TAP reporter keeps emitting a per-case duration, so the engine can read a scoped run's timings out of the stream it already parses.
owner: the driving agent
trigger: a Node upgrade, or a scoped run whose parsed timings come back empty
status: open
probe: "holds on the installed Node - a failing case in this record's own scoped run came back carrying duration_ms 454.6437. Not checked against any other Node version."
probed: "2026-08-15"
impact: The cheap fix for req-scoped-run-records-its-timings reads durations out of the TAP stream. If Node stops emitting them, that fix silently records nothing and the measurement it enables goes quiet without failing.
breaks_how_badly: abrasive
how_likely: conceivable
source_refs:
  - req-scoped-run-records-its-timings
  - i12
---

## Why it is an assumption rather than a fact

It was OBSERVED once, on the Node this machine runs. That makes it a fact
about today and an assumption about tomorrow.

`package.json` pins `node >= 22.6`, which is a floor rather than a
ceiling. Nothing holds the TAP reporter's field set still across versions,
and the field is not part of any contract this project owns.

## Why it matters more than it looks

The failure is SILENT. A reporter that stops emitting durations does not
error. It produces records with a field missing, or no records at all, and
the runs keep passing.

That is the same shape as the defect this record was opened to fix: the
measurement stops and nothing says so.

So whichever mechanism is chosen, it owes a check that the timings
actually arrived, rather than trusting that they did.

## Probe

MEASURED 2026-08-15. A failing case in a scoped run of
`trace-coverage.test.ts` came back with `duration_ms: 454.6437` in its
TAP yaml block.

STILL FAKED: every other Node version. The trigger watches for the next
upgrade, and the remedy is a check that fails when a scoped run records
no timings at all.
