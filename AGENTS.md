# AGENTS.md — how to drive Quackitect

Quackitect is a **human-driven gate ledger**. You, the agent, FILL checks. The human ADJUDICATES the ones that are gates. **Never bless on the human's behalf.**

**Voice (always).** Every output follows `product/quackitect/project_types/default/guides/voice.md`. This holds for chat and for artifacts.

## The loop (one iteration)
- `/engage start` — plan. Retro (field feedback), then triage, then migration, then bake the checklist.
- `/engage next` — walk the next check. Fill it, propose the adjudication, stop at gates.
- `/engage refine` — explore an idea in a spike. Capture the keeper backward. This is the DEFAULT once a build exists.
- `/engage ship` — output the deliverable once the gates are green.
- `/note` — capture an idea anytime. Frictionless.
- `/review` — `readout` (where am I), `retro` (look back), or `report` (render the HTML).

## Determinizer tools (deterministic — call directly)
> Invoke them as `uv run python -m quackitect <cmd>`. The generated `uv run quack` exe is blocked by Windows Smart App Control on this box (os error 4551). The module entry point routes around it. A `quack` PowerShell profile function can alias the short form.
```
uv run quack status [id]        # the text board to stdout; with an id, why it's suspect
uv run quack next               # the next ready check to walk
uv run quack start <id> [--plan]# activate a version (--plan registers a future one); replaces hand-written iteration.md
uv run quack why <id>           # what input changed
uv run quack bless [--all|<id>] # record a human adjudication — only when the human says yes
uv run quack note "<text>"      # deterministic capture lane
uv run quack gather <ver>       # collect all rigor+type source for an iteration
uv run quack report             # render the HTML snapshot AND open it (--out F renders only, no open)
uv run quack ship               # package product/ -> .quack/out/
```

## Rules
- **Designs live in code, not `spec/`.** When you implement a requirement, mark the code inline. Use `# design: <id>  implements: <req-id>` … `# enddesign` (see `method/prompts/engage.md` → next/FILL). The engine scans `product/` for these. `quack lint` flags a requirement with no design. ADRs — the *decisions* — stay as `.md` in `spec/`.
- A check goes **SUSPECT**, not open, when an input changes. A human `bless` returns it to DONE.
- **Killer checks** are always human-adjudicated gates. Never auto-pass them.
- The surface is **default-closed**. Triage, defer, retire, retro, and ship are sub-ops. Reach them through `engage` and `review`, not as new top-level commands.
- The methods live in `product/quackitect/method/prompts/`. Load the one named by the command.
