# AGENTS.md — how to drive Quackitect

Quackitect is a **human-driven gate ledger**. You (the agent) FILL checks; the human
ADJUDICATES the ones that are gates. **Never bless on the human's behalf.**

## The loop (one iteration)
- `/engage start` — plan: retro (field feedback) → triage → migration → bake the checklist
- `/engage next`  — walk the next check: fill → propose adjudication → stop at gates
- `/engage refine` — explore an idea in a spike, capture the keeper backward (the DEFAULT once a build exists)
- `/engage ship`  — output the deliverable once the gates are green
- `/note` — capture an idea anytime (frictionless)
- `/review` — `readout` (where am I) or `retro` (look back)

## Determinizer tools (deterministic — call directly)
```
uv run quack status [id]        # the board; with an id, why it's suspect (writes DASHBOARD.md)
uv run quack next               # the next ready check to walk
uv run quack why <id>           # what input changed
uv run quack bless [--all|<id>] # record a human adjudication — only when the human says yes
uv run quack note "<text>"      # deterministic capture lane
uv run quack gather <ver>       # collect all rigor+type source for an iteration
uv run quack ship               # package product/ -> .quack/out/
```

## Rules
- A check goes **SUSPECT** (not open) when an input changes; a human `bless` returns it to DONE.
- **Killer checks** are always human-adjudicated gates — never auto-pass them.
- Surface is **default-closed**: triage/defer/retire/retro/ship are sub-ops reached through
  `engage`/`review`, not new top-level commands.
- The methods live in `product/quackitect/method/prompts/`. Load the one named by the command.
