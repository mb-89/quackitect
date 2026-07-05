# AGENTS.md — how to drive Quackitect

> Hand-authored entry hub. Every harness pointer file routes here
> (`CLAUDE.md`, `.github/copilot-instructions.md`). The binding contract lives
> in ONE place: `product/quackitect/method/prompts/contract.md`.
> `quack selftest` checks this chain stays unbroken.

## FIRST — the ritual, in this exact order

The contract is NOT in this file. Its only copy is
`product/quackitect/method/prompts/contract.md`.

Do this before anything else on this project:

1. **READ** `product/quackitect/method/prompts/contract.md`. The whole file, with your file-reading tool. No skimming. No summaries. No memory of a past session.
2. **UNDERSTAND** it. It is binding. It overrides your defaults. It governs every move you make here.
3. **RECITE** it. Paraphrase its specifics back to the adjudicator. Use a standalone visible message. Name rule 3's `actor=agent` killer-bless exception. That proves you read it. Confirm you will obey.
4. **HONOR** every instruction in it. No exceptions. To the letter of each statement.
5. **READ** `product/brand/voice.md` next. Every output follows it. Chat and artifacts alike.

Re-read the contract at the start of every `engage`.
No recital means the rules never loaded. The adjudicator should stop you.

Quackitect is a **user-driven gate ledger**. You, the agent, FILL checks. The adjudicator
ADJUDICATES the ones that are gates. **Never bless on their behalf.**

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
quack bless [--all|<id>] [--by user|agent] # record an adjudication; actor defaults by CHANNEL
quack migrate-actors     # one-shot: rewrite pre-i11 actor stamps to user (audited; no-op when done)
quack note "<text>"      # deterministic capture lane
quack notes [--all]      # list open inbox notes (--all adds backlog + archive)
quack observe-red <test> # run a test and record it FAILING at its current hash (a pass is refused)
quack gather <ver>       # collect all rigor+type source for an iteration
quack report [--watch]   # render+open the live HTML board (--out F renders only)
quack progress [--pager <gate>] # the readout, or the handover pager for a killer/milestone gate
quack ship               # package product/ -> the workspace data home (out/)
quack build              # compile the engine, write the build stamp, re-baseline golden-root
quack lint               # coverage holes, duplicate ids, EARS lint, monotonic wiring
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
