# AGENTS.md — how to drive Quackitect

> **READ FIRST — BINDING.** Your FIRST action, before anything else: open
> `product/quackitect/method/prompts/contract.md`, **read it in full, paraphrase
> its specifics back** to the human (name rule 3's `actor=agent` killer-bless
> exception, to prove you actually read it), and **confirm you will obey**. Do
> not act until you have. A passive skim is not enough — no paraphrase means the
> rules never loaded, and the human should stop you. It governs every move.

Quackitect is a **human-driven gate ledger**. You, the agent, FILL checks. The human ADJUDICATES the ones that are gates. **Never bless on the human's behalf.**

**Voice (always).** Every output follows `product/brand/voice.md`. This holds for chat and for artifacts.

## The loop (one iteration)
- `/engage start` — plan. Retro (field feedback), then triage, then migration, then bake the checklist.
- `/engage next` — walk the next check. Fill it, propose the adjudication, stop at gates.
- `/engage refine` — explore an idea in a spike. Capture the keeper backward. This is the DEFAULT once a build exists.
- `/engage ship` — output the deliverable once the gates are green.
- `/note` — capture an idea anytime. Frictionless.
- `/review` — `readout` (where am I), `retro` (look back), or `report` (render the HTML).

## Determinizer tools (deterministic — call directly)
> The engine is a single static **Go binary**, shipped as source and built locally. Build it **from
> inside the module dir** (`product\engine-go`, where `go.mod` lives — building from the repo root fails):
> `cd product\engine-go` then `go build -o ..\..\.quack\engine\quack.exe .` (deps: `method/prompts/dependencies.md`).
> Then run it with the **`quack.cmd` launcher** at the project root: `.\quack <cmd>` (it forwards to the
> binary). Or put `.quack\engine` on PATH and call `quack <cmd>`. No Python, no uv.
```
quack status [id]        # the text board to stdout; with an id, why it's suspect
quack next               # the next ready check to walk
quack start <id> [--plan]# activate a version (--plan registers a future one)
quack start stubs [path] # emit drive-from-inside stubs (launcher+AGENTS+gitignore) into a bare workspace
quack why <id>           # what input changed
quack bless [--all|<id>] # record a human adjudication — only when the human says yes
quack note "<text>"      # deterministic capture lane
quack gather <ver>       # collect all rigor+type source for an iteration
quack report [--watch]   # render+open the live HTML board (recomputed fresh; --watch auto-reloads on change; --out F renders only)
quack progress [--pager <gate>] # the readout: the progress bar, or the handover pager for a killer/milestone gate
quack ship               # package product/ -> .quack/out/
quack build              # compile the engine AND re-baseline golden-root in one step
quack lint               # coverage holes + the duplicate-id guard
quack selftest           # the engine's own dependency-free self-test (no toolchain)
```
**Workspaces.** The engine drives a selectable workspace (product+spec+state). Default is the cwd
walk-up (self); add `--base <path>` (or `-C <path>`) to ANY command to drive a different project's
workspace — the engine resources resolve from the engine install, all state writes under `<path>`.
After editing engine `.go`, run **`quack build`** (never hand-run `go build` + re-baseline separately).

## Rules
- **Designs live in code, not `spec/`.** When you implement a requirement, mark the code inline. Use `# design: <id>  implements: <req-id>` … `# enddesign` (or `//` in Go; see `method/prompts/engage.md` → next/FILL). The engine scans `product/` (`.go`/`.py`/`.md`) for these. `quack lint` flags a requirement with no design. ADRs — the *decisions* — stay as `.md` in `spec/`.
- A check goes **SUSPECT**, not open, when an input changes. A human `bless` returns it to DONE.
- **Killer checks** are always human-adjudicated gates. Never auto-pass them.
- The surface is **default-closed**. Triage, defer, retire, retro, and ship are sub-ops. Reach them through `engage` and `review`, not as new top-level commands.
- The methods live in `product/quackitect/method/prompts/`. Load the one named by the command.
