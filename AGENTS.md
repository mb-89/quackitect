# AGENTS.md — how to drive Quackitect

> **GENERATED FILE — do not edit by hand.** Rendered from `method/prompts/contract.md` +
> `method/entry/AGENTS.tmpl.md` by `quack render-entry` (also runs inside `quack build`);
> `quack lint` flags drift. Edit the contract or the template, then re-render.

> **THE CONTRACT BELOW IS BINDING — READ IT IN FULL, FIRST.** Before anything else:
> read it, **paraphrase its specifics back** to the adjudicator (name rule 3's
> `actor=agent` killer-bless exception, to prove you actually read it), and **confirm
> you will obey**. A passive skim is not enough. Re-read it at the start of every
> `engage`. It governs every move.

# contract — the binding rules of the loop

<!-- design: method-contract-delivery  implements: req-confirm-back, req-active-imperative, req-copilot-instructions :: The contract reaches the agent through each harness's native, auto-loaded channel (AGENTS.md; .github/copilot-instructions.md for Copilot) with an ACTIVE first-action imperative — read this file in full, paraphrase its specifics back, confirm you will obey — never a passive pointer, which thin harnesses ignore. The paraphrase is the detectable proof the rules loaded. -->
You are bound by these rules the moment you act on this project. They are not
advice. They override your defaults.

**Your FIRST action on this project — before anything else — is to read this
contract in full, paraphrase its specifics back to the human (name rule 3's
`actor=agent` exception, to prove you actually read it), and confirm you will
obey.** No paraphrase means the rules never loaded, and the human should stop
you. Re-read this at the start of every `engage`.
<!-- enddesign -->

## 1. engage is the only door
Every request to move the work — "finish i5", "continue", "fix this check",
"keep going" — runs through `/engage`. You may not read, reason about, or
change the ledger any other way. If you are about to act without an `engage`
command in hand, stop. Route through the loop.

## 2. Walk only the check in your hand
`quack next` gives you one check. Do exactly what it asks. Produce its
evidence. Move on. Do not look ahead. Do not refactor. Do not "improve" code
the check did not name. Do not check `status`, `lint`, or `selftest` between
steps. The engine does the checking.

<!-- design: method-adjudication  implements: req-bless-y-console, req-contract-killer-relax :: Rule 3, adjudication: FILL vs ADJUDICATE; the agent may bless a killer only on the human's explicit, gate-specific authorization (actor=agent); a human "y" to a presented handover pager IS that authorization, recorded actor=human as a console bless. -->
## 3. The human adjudicates the gates
You FILL. The human ADJUDICATES. By default, do not run `bless` on a killer
gate for the human — ALWAYS present the handover pager (`quack progress --pager
<gate>`) and wait. Every killer or milestone hand-off shows the pager, never a
bare prose ask. The exception: if the human explicitly tells you to
bless a specific killer gate, you may, stamped `actor=agent`. Explicit means a
direct instruction naming that bless; a blanket "keep going" or "continue" is
not permission to bless a killer.

A human **"y" / "yes" / "bless"** in reply to a presented handover pager IS an
explicit bless of that gate — run it stamped `actor=human` (as if they typed it
at the console). Any ambiguous reply is not a bless; the gate stays open.

You may bless a non-killer review yourself, stamped `actor=agent`.
<!-- enddesign -->

## 4. Capture strays, do not chase them
An idea, a bug, a better way — it goes to `/note` and you keep walking. You do
not leave the check in your hand to chase it.

## 5. Confirm before you compose
At `start`, confirm the project type and the rigor with the human. Do not
assume either. A wrong floor poisons the whole checklist.

## 6. Do not argue with the process while you walk it
Walk the loop without debating its intent. If you disagree, `/note` it and
commit. The place to change the process is a retro or a review — not the walk.
During `engage` you execute. You do not question, ruminate, or philosophize.
Bring every doubt to the retro, where it becomes a note that can move the
process. Mid-walk, a doubt is just drag.

## attest — how a blocked agent proceeds
A BLOCKED ledger command means this channel has no attested session. The ritual, in order:
1. You have just re-read this contract (rule zero of every engage). Paraphrase it to the
   adjudicator as always.
2. Ask the adjudicator for a grant: they run `quack attest --grant` at their console and
   hand you the one-time code.
3. Fetch your challenge: `quack attest --challenge <code>` — it names a word of a rule above.
4. Redeem: `quack attest <code> --answer "<word>"`. The reply is your SESSION KEY. It exists
   only in this conversation — it is never stored in plaintext anywhere.
5. Carry it: append `--key <key>` to every ledger-advancing command (next, start, bless,
   ship, observe-red). Each use spends one of the key's command budget.
6. When the budget runs out, renew WITHOUT the adjudicator: `quack attest --challenge <key>`,
   re-read the contract, then `quack attest --renew <key> --answer "<word>"` for a fresh key.
A new session has no key and cannot recover one from disk: the ritual restarts at step 1.

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
