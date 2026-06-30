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
> The engine is a single static **Go binary**, shipped as source and built locally. Build it with
> `go build -o .quack/engine/quack.exe ./product/engine-go` (deps: `method/prompts/dependencies.md`),
> then invoke `quack <cmd>` (the binary on PATH, or `.quack/engine/quack`). No Python, no uv.
```
quack status [id]        # the text board to stdout; with an id, why it's suspect
quack next               # the next ready check to walk
quack start <id> [--plan]# activate a version (--plan registers a future one)
quack why <id>           # what input changed
quack bless [--all|<id>] # record a human adjudication — only when the human says yes
quack note "<text>"      # deterministic capture lane
quack gather <ver>       # collect all rigor+type source for an iteration
quack report             # render the HTML snapshot AND open it (--out F renders only, no open)
quack ship               # package product/ -> .quack/out/
quack lint               # coverage holes + the duplicate-id guard
quack selftest           # the engine's own dependency-free self-test (no toolchain)
```

## Rules
- **Designs live in code, not `spec/`.** When you implement a requirement, mark the code inline. Use `# design: <id>  implements: <req-id>` … `# enddesign` (or `//` in Go; see `method/prompts/engage.md` → next/FILL). The engine scans `product/` (`.go`/`.py`/`.md`) for these. `quack lint` flags a requirement with no design. ADRs — the *decisions* — stay as `.md` in `spec/`.
- A check goes **SUSPECT**, not open, when an input changes. A human `bless` returns it to DONE.
- **Killer checks** are always human-adjudicated gates. Never auto-pass them.
- The surface is **default-closed**. Triage, defer, retire, retro, and ship are sub-ops. Reach them through `engage` and `review`, not as new top-level commands.
- The methods live in `product/quackitect/method/prompts/`. Load the one named by the command.
