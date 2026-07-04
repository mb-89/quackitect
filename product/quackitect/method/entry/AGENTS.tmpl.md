# AGENTS.md — how to drive Quackitect

> **GENERATED FILE — do not edit by hand.** Rendered from `method/prompts/contract.md` +
> `method/entry/AGENTS.tmpl.md` by `quack render-entry` (also runs inside `quack build`);
> `quack lint` flags drift. Edit the contract or the template, then re-render.

> **THE CONTRACT BELOW IS BINDING — READ IT IN FULL, FIRST.** Before anything else:
> read it, **paraphrase its specifics back** to the adjudicator (name rule 3's
> `actor=agent` killer-bless exception, to prove you actually read it), and **confirm
> you will obey**. A passive skim is not enough. Re-read it at the start of every
> `engage`. It governs every move.

{{CONTRACT}}

---

Quackitect is a **human-driven gate ledger**. You, the agent, FILL checks. The adjudicator
ADJUDICATES the ones that are gates. **Never bless on their behalf.**

**Voice (always).** Every output follows `product/brand/voice.md`. This holds for chat and artifacts.

## The loop (one iteration)
- `/engage start` — plan. Retro (field feedback), then triage, then migration, then bake the checklist.
- `/engage next` — walk the next check. Fill it, propose the adjudication, stop at gates.
- `/engage refine` — explore an idea in a spike. Capture the keeper backward. The DEFAULT once a build exists.
- `/engage ship` — output the deliverable once the gates are green.
- `/note` — capture an idea anytime. Frictionless.
- `/review` — `readout` (where am I), `retro` (look back), or `report` (render the HTML).

## Determinizer tools (deterministic — call directly)
> The engine is ONE GLOBAL static **Go binary** (`%LOCALAPPDATA%\quackitect\bin`), ratcheting
> itself forward from this repo's vendored source (`product\engine-go`; see
> `method/prompts/dependencies.md`). Run it with the **`quack.cmd` launcher** at the project
> root: `.\quack <cmd>` — it bootstraps the global binary when absent. Ledger-advancing
> commands on the agent channel carry `--key <session-key>` (the contract's attest section
> explains how a key is earned).
```
quack status [id]        # the text board to stdout; with an id, why it's suspect
quack next               # the next ready check to walk
quack start <id> [--plan]# activate a version (--plan registers a future one)
quack start stubs [path] # emit drive-from-inside stubs into a bare workspace
quack why <id>           # what input changed
quack bless [--all|<id>] [--by human|agent] # record an adjudication; actor defaults by CHANNEL
quack note "<text>"      # deterministic capture lane
quack observe-red <test> # record a test observed FAILING at its current hash (tests-red)
quack gather <ver>       # collect all rigor+type source for an iteration
quack report [--watch]   # render+open the live HTML board (--out F renders only)
quack progress [--pager <gate>] # the readout, or the handover pager for a killer/milestone gate
quack ship               # package product/ -> the workspace data home (out/)
quack build              # compile the engine, re-baseline golden-root, re-render entry files
quack lint [--ears-baseline] # coverage holes, duplicate ids, EARS lint, monotonic wiring, entry drift
quack selftest           # the engine's own dependency-free self-test
quack version            # engine version + the resolved data locations
```
**Workspaces.** The engine drives a selectable workspace; add `--base <path>` (or `-C <path>`)
to ANY command to drive a different project's workspace. After editing engine `.go`, run
**`quack build`** (never hand-run `go build` + re-baseline separately).

## Rules
- **Designs live in code, not `spec/`.** Mark realized code inline: `# design: <id>  implements: <req-id>` … `# enddesign` (`//` in Go). `quack lint` flags a requirement with no design. ADRs — the *decisions* — are `.md` nodes in `spec/decisions/`.
- A check goes **SUSPECT**, not open, when an input changes. A `bless` returns it to DONE.
- **Killer checks** are always adjudicated gates. Never auto-pass them.
- The surface is **default-closed**. Triage, defer, retire, retro, and ship are sub-ops reached through `engage` and `review`.
- The methods live in `product/quackitect/method/prompts/`. Load the one named by the command.
