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
3. **RECITE** it. STOP whatever you were asked to do. Paraphrase its specifics back to the adjudicator in a message that ENDS your turn — no tool call after the recital, or the harness may swallow it. Name rule 3's `actor=agent` killer-bless exception. That proves you read it. Confirm you will obey. Resume only after the recital is out.
4. **HONOR** every instruction in it. No exceptions. To the letter of each statement.
5. **READ** `product/brand/voice.md` next. Every output follows it. Chat and artifacts alike.

Re-read the contract at the start of every `engage`. One VISIBLE recital
carries over the whole session; a new session always recites anew.
No visible recital means the rules never loaded. The adjudicator should stop you.

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
quack start stubs [path] # emit drive-from-inside stubs into a bare workspace (ungated: creation, not ledger)
quack start init <path>  # scaffold a full VEHICLE: vendored engine + committed method overlay (product/<name>/method, declared in spec/project.toml)
quack mcp                # serve the command surface as MCP tools over stdio (agent-discoverable; per-session attest)
quack render <model> --out <F> [--mark ids] # standalone architecture-review onion with change marks
quack cluster <model>    # DSM structuring proposal: coupling clusters, layering, tears
quack apply <manifest.json> [--dry] # judged bulk edits: byte-exact {file, old, new}, all-or-nothing
quack why <id>           # what input changed
quack bless [--all|<id>] [--by user|agent] # record an adjudication; actor defaults by CHANNEL
quack migrate-actors     # one-shot: rewrite legacy actor stamps to user (audited; no-op when done)
quack migrate-layout     # one-shot: move a legacy-layout spec to the template-mirroring layout (no-op when done)
quack note "<text>"      # deterministic capture lane
quack note --file2list <copy.html> # list a commented book copy as note candidates (roles, never names)
quack notes [--all]      # list open inbox notes (--all adds backlog + archive)
quack observe-red <test> [--refresh] # run a test and record it FAILING at its current hash (a pass is refused; --refresh re-attests an amended, still-failing test)
quack gather <ver>       # collect all rigor+type source for an iteration
quack report [--watch]   # render+open the live HTML board (--out F renders only)
quack progress [--pager <gate>] # the readout, or the handover pager for a killer/milestone gate
quack calls --summary    # print the call-log aggregate, then delete the log (the retro's log step)
quack pair [ntfy]        # one-time device pairing: mints the topic credential, renders the deep-link QR, prints the disclaimer + lockscreen instruction
quack pair --show        # re-print the current pairing (QR + link) without re-minting - a second device subscribes with a scan
quack ask <gate> [--timeout s] # send the gate's question to the paired phone (one-tap answer buttons)
quack await [--timeout s]      # block until a pending ask is answered and APPLY it - a phone bless resumes the walk; every run also drains answers as the fallback
quack ship               # package product/ -> the workspace data home (out/)
quack build              # compile the engine, write the build stamp, re-baseline golden-root (skips the compile when no engine source changed)
quack lint               # coverage holes, duplicate ids, EARS lint, monotonic wiring
quack selftest           # the engine's own dependency-free self-test
quack version            # engine version + the resolved data locations
```
**Workspaces.** The engine drives a selectable workspace; add `--base <path>` (or `-C <path>`)
to ANY command to drive a different project's workspace. After editing engine `.go`, run
**`quack build`** (never hand-run `go build` + re-baseline separately).

## Rules
- **The repo is self-sufficient.** Everything an agent needs to work well here lives IN THIS
  REPO — contract, method prompts, templates, guides. Harness memory is a convenience layer
  only: personal data stays there (never in the repo), but no working rule may exist ONLY in
  a harness's memory. When you learn a durable rule, bake it here.
- **Learning escalates: instance → prompt → determinizer.** A lesson fixed only in the instance
  is half-done; bake the pattern into the prompts/methods/templates. A baked rule that CAN be
  enforced mechanically climbs further: it becomes ENGINE behavior (test-first), and the prompt
  keeps only what genuinely needs judgment. Ask at every baked rule: "could `quack` enforce this?"
- **After ANY content change, `quack build` before `status`/`report`.** Engine `.go`, mints,
  evidence docs, method prose — every content edit moves hashes and the build re-baselines the
  golden root; skipping it flashes every verification green as red.
- **Method operations are determinizers.** Anything the PROCESS depends on — or that will ever
  run again (migrations, captures, checks) — is a `quack <cmd>` in the Go engine, test-first,
  never a loose script the method quietly depends on. Throwaway scripts for one-time mechanical
  work are FINE and often the efficient choice; they just never become a dependency, never live
  in the repo, and must honor the byte-safe edit rule below.
- **Static outputs may be stale; the consumer regenerates.** A generated artifact (the report, the book, any rendered output) is a snapshot. Expect its reader to know it can be stale and to re-render when they want it current — every render recomputes live. Do NOT add machinery to keep a static output eagerly fresh (no render-on-every-change); freshness comes from on-demand and `--watch` rendering, and from the ship refresh.
- **Designs live in code, not `spec/`.** Mark realized code inline: `# design: <id>  implements: <req-id>` … `# enddesign` (`//` in Go). `quack lint` flags a requirement with no design. ADRs — the *decisions* — are `.md` nodes in `spec/decisions/`.
- A check goes **SUSPECT**, not open, when an input changes. A `bless` returns it to DONE.
- **Killer checks** are always adjudicated gates. Never auto-pass them.
- The surface is **default-closed**. Triage, defer, retire, retro, and ship are sub-ops reached through `engage` and `review`.
- The methods live in `product/quackitect/method/prompts/`. Load the one named by the command.
- **A delegated subagent is a ROLE, not a free thinker.** Its brief stays short — the step, the
  statements, the files — plus a pointer to the role charter (`method/roles/README.md`): the walk
  discipline (execute, don't ruminate; only the step in hand; targeted verify; strays to notes)
  binds delegated roles exactly as it binds the driving agent.
- **Edits must be byte-safe.** Editor tooling by default. For a mechanical bulk edit, `quack apply <manifest.json>` is the sanctioned lane: byte-exact old→new replacements, dry-run first, all-or-nothing. A scripted bulk edit is allowed when it uses explicit BOM-less UTF-8 IO (Go, or .NET `[IO.File]` calls) and touches only the intended bytes. What stays banned is the careless lane: PowerShell 5.1 default `Get-Content|Set-Content` round-trips and `-Encoding utf8` (BOM in 5.1) re-encode every line they pass — that exact reach corrupted UTF-8 twice (mojibake, a clobbered file). Verify a scripted edit's diff before moving on.
