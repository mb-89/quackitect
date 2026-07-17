# M7 - Validate & accept (i0018_mcp_apply)

## Meets the need  -> i18-m7-meets-need  (KILLER - owner adjudicates)
Validated against the Ch1 success criteria AND every need across all iterations (verification runs the full 318-line battery, exit 0 — no earlier need silently broke). The i18 success bar (M1) was behavioral, not structural — "the engine refuses" — and both halves are demonstrated for real, not asserted:
- A real client drives the hand-rolled MCP server through a full **status-to-bless walk** over stdio (transcript in killer-ucs below) — the discoverability need (sebot atom 0052: tools behind a CLI incantation get skipped) is answered by tools an agent discovers and calls directly.
- A field value that violates its schema is caught by the engine (the field-schemas selftest plants a node whose class/killer/kind all break the schema and asserts the catch, while a valid node passes) — the "a reviewer vouches → the engine refuses" shift reaches the last unchecked surface.
All prior-iteration needs still validate: full battery green across every iteration.

## Killer use-cases demonstrated end-to-end  -> i18-m7-killer-ucs
Each killer use case exercised FOR REAL, not "tests green":

**uc-mcp-drive** — the compiled `quack mcp` binary driven over real stdin/stdout. Two live drives:

- Discovery + read + attest-gate: `initialize` → serverInfo `quack-mcp`, protocol `2025-06-18`; `notifications/initialized` → no reply; `tools/list` → 8 tools with JSON inputSchemas (status, why, notes, note, next, start, bless, attest); `why` (read-only) → live result `isError:false`; `next` (ledger, unattested) → REFUSED with the contract challenge returned AS A RESULT (`"word 16 of rule 1 (nonce …)"`, `isError:false`) — the attest choke point holds and never flips the flag. stderr carried only `[mcp] server up` / `[mcp] stdin closed; exiting clean` — stdout purity + clean EOF confirmed.
- Full write path: `initialize` → `attest` (earned key) → `"session attested: ledger tools are now live"` → `bless i18-m5-spike-recorded by=agent` → `"blessed i18-m5-spike-recorded"`. A REAL ledger write through the server — the status-to-bless walk the M1 bar named. (This same drive cleared the M5 propagated-suspect cone.)

**uc-field-schemas** — the schema mechanism exercised on a real graph fixture:

- a planted node with a bad enum/type is flagged by name+field+broken-rule
- a valid node passes
- the schema-set tester rejects a malformed schema (unknown type, bad tier, default outside enum)

The live graph stays clean — zero field findings on blessed nodes. The fixes behind it:

- enums scoped to live values
- the composed-verify pattern widened
- embedded-region id-guard

**uc-architecture-review** — the onion diagram IS the reviewable deliverable. `quack render` produces the self-contained onion:

- concentric-circles-always (no ellipses)
- per-element placement rationale
- informed-by links from architecture ADRs
- change-marks that propagate element→cluster→ring
- single-click inspects + highlights connections
- double-click drills

Screenshot-verified without owner input at overview / L1-band / kernel / cluster levels. The services band renders as a clean concentric circle. Every I/O bar is labeled. No targetless bar and no arrow-to-ambient (ambient is off-flow infra pills). The morning review render is `onion-review.html`.

**uc-derive-structure** — `quack cluster` run on our OWN design-flow DSM (not a toy):

- 141 coupled design regions
- 330 directed couplings
- degree-of-connectivity 0.0167 (sparse → clustering meaningful)
- TotalCost 28254
- deterministic (id-sorted passes + 3 fixed restarts, no RNG)

It produced 41 coupling-grouped clusters layered by Tarjan+Kahn with tearing. The i18 work self-clusters coherently — `C7 = {go-mcp-server, go-mcp-session}` and `C4 = {go-field-schemas, go-schema-tester}` — evidence the grouping tracks real coupling. The feature-module lens vs the abstraction-onion lens agree partially (complementary views, judged NOT a defect — recorded rather than auto-restructured).

**uc-run-dep-free** (reframed by adr-install-not-zero-dep) — the one-click install-and-demo package (tools/RUNME.ps1 Windows/Winget, tools/RUNME.sh Linux/CI) each check+install deps and run a small demo on a fresh machine. Built as M8-prep (see M8-handover.md). The ship packaging itself is M8, owner-gated.

**uc-vehicle-extends** (killer, composed at this validation walk) — the M7 all-needs sweep found the vehicle chain short of the owner's field case (IP-restricted norms in a vehicle driving stubs). The sweep drove the fix back into M6 (req-vehicle-drives-stub, test-first). Demonstrated LIVE, the owner's exact flow:

- `start init` scaffolded a vehicle.
- An IEC-norm method file was committed into its declared overlay (`product/iec-vehicle/method/norms/`).
- The vehicle created a stub.
- The stub resolved the vehicle's norm AND the vendored engine prompt (the merged surface) and drove `status` cleanly — while the machine-global engine pointer survived untouched (the hijack the walk had demonstrated live is closed).

The hermetic e2e (selftest:vehicle-chain) repeats the chain in the battery. This validation also verified the OLD bug report (bugreport-external-stub-engineroot.md, commit 1ee99ca): its exact repro now passes.

## Acceptance obtained  -> i18-m7-acceptance
Owner sign-off is the adjudicated act — left for the owner, not agent-stamped. Agent-side acceptance evidence: every killer use case has a REAL demonstration recorded above (live MCP transcript, planted-violation catch, screenshot-verified diagram, cluster run on our own objects), not merely a green test. Owner adjudicates at review.

## Validation gaps captured (RAID)  -> i18-m7-gaps
- **Gap:** the MCP drive was exercised by the agent's own driver + an earlier real client (M5), not yet by the owner's day-to-day harness under normal use — ergonomics/lifecycle surprises only a live workflow surfaces. Logged, not blocking.
- **Gap:** field schemas ship a STARTER set (requirement/test/decision); full field coverage + mint-time defaults + register UX are fenced to i0020. Expected.
- **Decision pending (owner):** the i18 architecture ADRs (adr-mcp-transport / schema-format / mcp-attest) were deliberately NOT rewired with informed-by edges to their elements, to avoid reopening the blessed M4 gate to SUSPECT. The capability exists; wiring them is a one-command owner choice.
- **Decision pending (owner):** report-refresh was implemented as a 3s DEBOUNCE (a lone bless still renders; a wave collapses to one), matching the test — not full render-on-bless removal. Confirm debounce-vs-removal.
- **Decision pending (owner):** `start stubs`/`start init` were carved out of the attest gate (workspace creation writes no ledger, and a fresh vehicle has no session to attest) — confirm the carve-out.
- **Resolved (owner ruling, no new command):** cross-machine stub relink — a stub cloned to a second machine has an empty per-machine record and falls back to the global pointer; the pattern is to re-run the vehicle's `start stubs <cloned-stub>` once there — stubs creation is idempotent (keeps every existing file, tested) and re-records the engine home as a side effect. A dedicated `link` command was considered and dropped: auto-discovery is ambiguous with two engines on one machine, and the explicit re-run already picks the driver deliberately.
- **Watch:** lint-exit-honest changes exit semantics CI may key on; the 3-code contract is documented so a consumer can adapt.

## Milestone review  -> i18-m7-gate  (KILLER - owner adjudicates)
**Verify:** each killer use case has a real end-to-end demonstration (MCP transcript, planted-violation catch, rendered+screenshot-verified diagram, cluster run on our own design objects), not just a passing test. **Validate:** the built surface meets the original need (discoverability + engine-refuses) and every prior need still validates (full battery). **Red-team:** the sharpest attack — "tests green ≠ capability" — is exactly why each uc is exercised for real; the honest residual is that the owner's live harness has not yet driven the MCP surface (logged). **Verdict: PASS from the agent side — killer gate left READY; owner adjudicates M7 at review.**
