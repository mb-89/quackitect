# engage — advance the iteration:  start | next | refine | ship

## start  (plan + begin an iteration)
1. **retro** — run `/review retro`; it opens with the field-feedback question and emits notes.
2. **triage** — process `.quack/notes/inbox/` (see triage.md).
3. **migration** — walk the ready backlog: keep / drop / pull-into-this-iteration.
4. **plan & bake**:
   a. Confirm the project TYPE and RIGOR (`.quack/config.toml`). If the vision mismatches the
      type/rigor in either direction, run the plausibility check → re-confirm with the human.
   b. `uv run quack gather <version>` — collects ALL of the rigor + type source (checklists,
      prose, prompts, spreadsheets, links) into `.quack/gather/<version>/source.md`.
   c. Read the WHOLE bundle — open any flagged non-text files, follow any links — then COMPOSE the
      concrete checklist as check nodes (id · statement · depends_on · class · killer · verify) in
      `spec/iterations/<version>/`, tailored to THIS idea. Add checks above the rigor floor; never
      remove a killer check.
   d. On the human's approval, `uv run quack bless --all` to lock the plan.

## next  (walk the next forward check)
1. `uv run quack next` — the determinizer hands you the next ready check (upstreams satisfied).
2. **FILL** it: do the work / produce the evidence (executed checks: make `verify` pass).
3. **ADJUDICATE**: a GATE → present the evidence and ask the human to `uv run quack bless <id>`
   (NEVER bless on their behalf); executed → it passes on re-run. Then `uv run quack next` again.
Repeat until `next` reports "done".

## refine  (explore an idea, capture the keeper backward)  ← default in late phases
**Once a build exists (post-M6) and you are NOT starting a new iteration, refine is the default
working mode** (refine-default). It is M5's spike, turned into a cycle.
1. Take the human's **idea + their motivation**. Run a **light coherence check** — does it fit the
   frame / vision? (a quick judgment, not a gate). If it clearly doesn't, capture it as a note and stop.
2. **SPIKE** it in `.quack/spikes/<id>/` — a throwaway, gitignored scratch space. Do NOT touch
   `product/` or any gated check yet. Iterate fast; keep or discard.
3. On a **KEEPER**, **capture backward**: write what you learned into the right design-input check
   (M1/M2/M3 — the requirement or design it really was). That edit reopens the affected checks SUSPECT.
4. `uv run quack next` then walks **exactly the reopened cone** — a contained change reopens little;
   an architecture-break steps back to M3. Re-walk, then keep refining or `ship`.
Discard the spike when done. A **rejected** idea → archive a note WITH its reason (durable rejection).

## ship  (output the iteration)
`uv run quack ship` packages `product/` into `.quack/out/`. Ship is the END of a forward iteration;
the zip is ephemeral output, not committed.

Reaches: `defer` (push a check to a later iteration), `retire` (drop one).
