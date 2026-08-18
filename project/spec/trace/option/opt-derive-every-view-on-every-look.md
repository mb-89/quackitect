---
minted_in: i1
id: opt-derive-every-view-on-every-look
type: "[[option]]"
statement: store nothing derived and recompute every view from the corpus on every look, because the corpus is small enough to afford it
cluster: cluster-the-account
found_by: probe
source: probe run 2026-08-09 — loadTrace over the live corpus, timed
---

## Mechanism

THE QUESTION, written before the probe ran. Is the trace corpus small enough
to load and derive on every look, or does a derived view have to be stored?

It matters because this project already rules against stored derived values —
`recordDone` recomputes green every time, after a written verdict went stale
— and opt-one-store-for-what-happened depends on the same affordability.

WHAT WAS RUN. `loadTrace` over the live corpus, timed cold and warm.

WHAT CAME BACK.

- 322 nodes.
- 465 ms on the first load.
- 119 ms on the second.

WHAT IT SETTLES. Warm, deriving on every look costs 119 ms against a
one-second budget (`req-call-answers-in-one-second`). The option is viable
today, and that is measured rather than assumed.

WHAT IT DOES NOT SETTLE, and the cold number is the warning. 465 ms is
already half the budget on a fresh process, and every reload pays it. The
corpus is 322 nodes at the end of the first iteration of the first product.

WHAT THE PROBE FAKED. It timed the LOAD, not the derivation on top of it. A
view that walks the graph to a fixed point — which `recordDone` does — costs
more than the read, and that cost was not measured.
