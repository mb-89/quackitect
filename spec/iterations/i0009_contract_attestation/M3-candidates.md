# M3 — Candidate architectures (i0009_contract_attestation)

## Criteria weighted → i9-m3-criteria-weighted

Derived from the requirements. Weight 1–5.

| # | Criterion | Weight | Derived from |
|---|---|---|---|
| C1 | Structural enforceability — no reliance on agent discipline | 5 | req-attest-block, req-attest-grant, req-contract-render |
| C2 | Zero-stall autonomy — unattended runs never park on a person | 4 | req-attest-renewal, req-attest-expiry |
| C3 | Portability — every harness, every OS, plain CLI | 4 | req-contract-render, req-logs-canonical, req-global-binary |
| C4 | Determinism & auditability | 4 | req-decision-classes, req-attest-key-hygiene, req-render-drift |
| C5 | Simplicity, zero-dep, hand-rolled Go | 3 | engine tradition (i0003 decision) |
| C6 | Migration safety — nothing adjudicated ever lost | 3 | req-no-quack-state, req-notes-out, req-truth-in-spec |
| C7 | Adjudicator friction — at most one interaction per session | 3 | req-attest-grant, req-console-exempt |

## Alternatives per axis → i9-m3-alternatives-elaborated

**A1 — Grant mechanics** *(what proves a person opened the session)*

- **(a) Console-minted code**: `quack attest --grant` at the interactive console prints a one-time code; the person hands it to the agent in chat; the agent redeems it (`quack attest <code> --answer …`). Structural proof: the code exists only where a person sat (C1 ✓, C7 one interaction).
- (b) Console-side flag file the engine polls after an agent `--request`: stateful, racy, breaks piped/CI flows (C3 ✗).
- (c) Chat-only "y" relayed by the agent with a flag: no structural proof — this is today's failure restated (C1 ✗). Recorded to the graveyard at M4.

**A2 — Challenge derivation** *(what proves the contract text is in context)*

- **(a) Positional word challenge**: engine picks word N of rule K (position seeded from the grant/renewal nonce), verifies against the live file. Varies per attest, deterministic, forces the text into context (C1, C4 ✓).
- (b) Contract file hash: computable by hashing without reading a line (C1 ✗).
- (c) Static pass-phrase inside contract.md: single fixed answer, grep-once-reuse-forever (C1 weak). Viable fallback if (a)'s parsing proves brittle.

**A3 — Key transport** *(how the key rides along)*

- **(a) `--key <K>` flag** on ledger-advancing commands: explicit, visible in the conversation, nothing persists shell-to-shell (C4 ✓; harness shells don't share env anyway).
- (b) `QUACK_KEY` env var: equivalent per-command prefix in practice; accept as a second read path for scripting comfort, never required.
- (c) Key file on disk: plaintext at rest defeats req-attest-key-hygiene (C4 ✗). Graveyard.

**A4 — Render pipeline** *(entry files from contract.md)*

- **(a) Engine render step** (inside `quack build` + standalone command): per-harness template wraps the verbatim contract body; `quack lint` re-renders and byte-compares (req-render-drift). Maintainer runs it. Agents only read static files (C1, C3 ✓).
- (b) Pointer/include from entry file to contract: thin harnesses don't follow pointers — field-proven failure (C1 ✗). Graveyard (this iteration's origin).
- (c) Git hook auto-render: hooks don't fire in every harness/clone. Acceptable convenience later, never the guarantee.

**A5 — Data-dir layout**
- **(a) Workspace-first**: `%LOCALAPPDATA%\quackitect\<slug>\{logs, notes, evidence, gather, overlay, spikes, out, engine}` — one deletable home per workspace; the amnesia test is one `rm -rf` (C6 ✓). Migration folds today's kind-first logs plus the two split log homes.
- (b) Kind-first (today's `logs\<slug>`): scatters one workspace across kinds; the amnesia test needs a sweep (C6 weaker).

**A6 — Root-marker mechanics**
- **(a) `spec/project.toml` walk-up**: committed truth, present in every quackitect repo; also absorbs `.quack/config.toml`'s iteration settings (owner-decided direction).
- (b) Keep `.quack` as marker: contradicts no-.quack (owner-superseded, recorded).
- (c) `.git` walk-up: ship-a-zip vehicles may have no git (C3 ✗).

**A7 — Ratchet check location**

- **(a) Engine self-check at startup**: the binary compares its own source stamp against the workspace's vendored source; older → rebuild to the global home and re-exec. Launcher stays dumb (existence check + bootstrap build only — cmd can test existence, not hashes) (C3, C5 ✓).
- (b) Launcher-side version compare in cmd/sh: batch parsing of versions, duplicated per platform, brittle (C5 ✗).
- Feasibility flag (→ M5): Windows locks a running exe against overwrite but allows RENAME — the standard self-update dance (rename old aside, move new in, clean up next run) needs a spike.

**A8 — Decision-node schema**

- **(a) Decision-model v2 as settled** (2026-07-03, researched + red-teamed with the owner): `type: adr` in `spec/decisions/`, born-made/never-edited, built-in `scrap` sink, `ready_when` write-once, exits by supersession, all classification derived from graph facts; killer stamp stays a person's judgment.
- (b) Industry 4-state lifecycle (proposed/accepted/deprecated/superseded status field): duplicates the gate ledger's state machine — rejected in the source note with reasons (DRY). Graveyard.
- Sub-choice: i9's own ADRs become the FIRST citizens of `spec/decisions/` (dogfood at birth) vs. last iteration-folder batch. Decide at M4.

**A9 — Mint UX**

- **(a) Typed op**: `quack mint <type> [--id <slug>]` emits the schema-valid skeleton; sugar forms `mint veto --of <id>`, `mint defer --of <id> --ready-when "<cond>"`, `mint supersede <old>` stamp the edges so derived classes can't be misspelled (C4 ✓).
- (b) Graduation-only (notes promote to nodes): conflates the private note lane with trace minting; no path for tests/reqs (C4 ✗).

## Feasibility rough-check → i9-m3-feasibility-checked

All preferred candidates are pure Go stdlib on top of shipped i8 machinery (channel stat + normalized hashing + strict parser). No new dependencies anywhere.

- Riskiest #1 — **grant/key round-trip through a real harness** (does the code/key survive chat → shell faithfully): M5 spike.
- Riskiest #2 — **Windows self-replace for the ratchet** (rename-dance on a running exe): M5 spike.
- Cheap: render (template + byte-compare), data-dir move (i8 migration pattern, count+size verified), root-marker walk-up (findRoot touch), mint (template emit through the strict parser), decisions lint (path check), parked list (graph filter), report-why (cause already computable at render), vv-time-scope (filter by iteration id — nodes carry `iter` already).
- Prior art: no open research question — the axes reuse the 2026-07-03 researched decisions (decision model, notes/data restructure), the sebot determinizer precedent (minting), and the widely-used Go self-update rename pattern. No deep-research run needed; sources cited in the baked notes.

## Review rounds & verdict

**Round 1 — Verify.**

- Every axis carries at least two elaborated alternatives (nine axes, 20 candidates total).
- Each rejected option names its reason.
- The criteria table derives every weight from named requirements.
- Feasibility names its two spike targets instead of hand-waving them.

**Round 2 — Validate.** The axes cover all 26 requirements' open design space — no requirement depends on an undecided mechanism outside these nine. The preferred candidates are consistent with the owner's recorded calls (ratchet, no-.quack, decision-model v2) and with the engine's zero-dep tradition. Gap noted honestly: A2's positional challenge has a plausible-brittleness fallback (static phrase) pre-agreed rather than resolved — acceptable at M3, resolved by the M5 spike.

**Round 3 — Red-team.** Strongest case: "the preferred set is predetermined — M3 as theater for decisions already made." Held partially: A6/A8 arrive owner-decided (recorded 2026-07-03/04) and M3 correctly re-frames rather than re-litigates them (rule-of-cool discipline); but A1/A2/A3/A5/A7/A9 were genuinely open and got real trade-off analysis here. Second case: "self-updating binaries are a known foot-gun on Windows" — acknowledged as the #2 spike with a known-pattern mitigation. Kill-criterion: if the rename dance fails on a real console, the ratchet falls back to build-next-launch (stale-by-one-command yet still forward-only). Process note captured to the inbox: this doc's shape was hard to read — evidence-doc templates go to the retro (owner note, 2026-07-04).

**Verdict: PASS.** Nine axes ready for the M4 Pugh matrix and ADRs.
