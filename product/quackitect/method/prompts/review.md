# review — assess & look back:  readout | retro | report

## readout
Summarize the board (`uv run quack status`): DONE / SUSPECT / OPEN, and the next gate.
For a SUSPECT check, run `quack why <id>` and report what input changed.

## retro
Run at `engage start`, or on demand. Emit improvement notes only — adopt nothing.
1. **Field feedback (open here):** ask the human "what came back from the field on the last
   shipped version?" Capture answers as notes (`origin: field`).
2. Mine the record recency-weighted; tally the previous retro's improvements (promote wins;
   dismiss duds WITH their reason so they are never re-proposed).
3. Weigh at least one quality signal, never cost alone. Route emitted notes to the inbox.

## report
Render the deterministic HTML snapshot: `uv run quack report [--out F]` (determinizer-owned, no
judgment — writes `.quack/out/report.html` by default). You MAY add a short human-facing narrative
("where we are / notable risks") as a clearly-separate, OPTIONAL layer on top; it is not part of
the deterministic core and must not be mistaken for it.
