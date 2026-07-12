# slides material — "from nothing to Pong"

One line per milestone: what the newcomer sees and does, with the honest wall-clock.
Timestamps are elapsed since t0 (the empty folder). Source: [timings.tsv](timings.tsv).

## Timeline

| Step | Elapsed at end | Delta | What the newcomer sees / does |
|---|---|---|---|
| Scaffold | 0:00 | < 1 s | One command (`quack start stubs`) turns an empty folder into a project: launcher, README, spec skeleton. `quack status` shows the first board. |
| Attest | 3:02 | 3:02 | The ledger blocks until a session key is earned. The engine names the contract; the ritual answers a question only a contract-reader can. (Agent-channel friction — a console user never sees this.) |
| Compose | 5:38 | 2:36 | `quack start i0001_pong` opens the iteration. Baking the M1–M8 checklist makes `status` show 24 open checks — the whole road, visible before any work. |
| M1 — vision | 6:53 | 1:15 | Writes one paragraph: goal, actual, delta. Blesses "problem agreed". The board turns its first row green. |
| M2 — requirements | 7:17 | 0:24 | Three EARS requirements + three tests. The engine COMPUTES "every requirement has a test" — no one ticks that box by hand. |
| M3 — candidates | 7:40 | 0:23 | One real fork: canvas vs DOM rendering. Both written down before deciding. |
| M4 — decision | 7:40 | 0:00 | One-line ADR: canvas wins on frame cost. The engine computes "every ADR addresses a requirement". |
| M5 — spike | 7:40 | 0:00 | A skip note: the whole build IS the spike. The gate records the judgment instead of hiding it. |
| M6 — build | 9:39 | 1:59 | pong.html appears: ~110 lines, playable. Two headless screenshots prove it runs. The engine computes "every requirement has realized design". |
| M7 — validate | 10:06 | 0:27 | The code is read back against each requirement. "Meets the need" is a judged gate, not a vibe. |
| M8 — ship | 10:24 | 0:18 | `quack ship` packages book + report + game into one zip. 25/25 checks green. |

## Headline numbers

- Total, honest, everything included: **10 min 24 s** from empty folder to shipped zip.
- The walk itself (compose to ship): **4 min 46 s**.
- Friction (attest ritual + a scaffold edge-mode bug): about 4 min. A fixed scaffold makes "five minutes" honest.
- The game: 3.8 KB, one file, zero dependencies, plays to five points against the computer.

## Per-slide one-liners

- Scaffold: "One command. An empty folder becomes a project with a visible board."
- M1: "Say why. One paragraph. The board goes from grey to its first green."
- M2: "Three requirements, three tests. The engine checks the pairing, not you."
- M3: "Two candidates on the table before any code."
- M4: "One line decides: canvas. The decision is traced, not folklore."
- M5: "Nothing risky left? Say so, on the record."
- M6: "110 lines later: a playable game, and the trace lights up by itself."
- M7: "Read the code against the promises. Then judge."
- M8: "One zip: the game, the book, the board. Handover done."
