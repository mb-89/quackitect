---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-asm-the-call-log-attributes-every-call-to-the-state-it-was-made-in
type: "[[raid]]"
kind: assumption
statement: "The call log can be partitioned by walk state, so cost per state is derivable from what is already recorded."
owner: the maintainer of the machine
trigger: the first attempt to derive cost per state from a run's log
status: open
impact: "Only a total is derivable. The ranked per-state view that makes a benchmark actionable is lost, and the whole thing degrades to one number per run."
breaks_how_badly: corrosive
how_likely: plausible
probe: "unprobed \u2014 engine/calllog.ts records ref, ts, tool, args, ok, outcome, duration_ms, actor and se_version. No state field was seen in the CallRecord shape."
probed: 2026-08-19
source_refs:
  - fn-the-benchmark-run.derive-what-the-walk-cost
  - req-a-benchmark-report-carries-the-conditions-of-its-run
weighs_with: none
weighs_against: none
---

## Probe

WHAT WAS READ, 2026-08-19. `CallRecord` in `engine/calllog.ts` carries ref, ts,
tool, args, ok, outcome, duration_ms, actor and se_version. There is no state
field on it.

SO THE PARTITION IS BY TIME, not by label. Every `se_pull` that moves the walk
is in the log with its timestamp, so the boundaries between states are
recoverable — but by inference rather than by record.

WHY THAT MATTERS. An inferred boundary is wrong wherever a pull did not move,
and a `do` that does not move is common enough to have its own guidance line.

HOW TO CHECK IT. Take this session's own log and try to attribute its calls to
the M0 through M3 states. If the attribution is ambiguous by hand it will be
ambiguous mechanically.
## Probed 2026-08-19 — half false, and it holds anyway

`exp-can-cost-per-state-be-derived-from-the-call-log`, over this walk's own log
of 1282 calls.

THE ASSUMPTION AS WORDED IS FALSE. **0 of 1282** call records carry a state
field. Only 219 — the update calls — carry a `visit` in their args.

WHAT MAKES IT HOLD ANYWAY. `se_pull` logs its whole response, and the response
opens with `where`. **338 of 359** pull records still name their position, and
carrying the last one forward attributes **1281 of 1282 calls (99%)**.

THE ONE MISS IS A BOUNDARY: the call before the session's first pull, which no
rule can attribute.

SO NOTHING NEW HAS TO BE CAPTURED, and the derivation gains one rule: walk the
log forward and carry each pull's `where` until the next.

A STATE FIELD ON EVERY RECORD WOULD STILL BE BETTER — it removes the
carry-forward, survives a log that starts mid-session, and costs one field the
session already knows at dispatch. That is an improvement to ask for, not a
prerequisite.
