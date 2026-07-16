<<<quackitect-archive v1>>>
<<<node: iteration.md>>>
---
iteration: i0009_contract_attestation
status: active
type: default
rigor: systematic
---

Make the contract undodgeable AND land the data leg: engine-enforced attestation (read+recite, one console grant per session, chained context keys), build-time contract rendering into harness entry files, and the repo-holds-only-truth restructure — no .quack anywhere, global ratcheting engine binary, raw notes out of repo, decisions in spec/decisions/ (model v2), deterministic minting; folds the logs-dir casing fix.
<<<node: req-attest-ritual.md>>>
---
id: req-attest-ritual
type: requirement
statement: The engine shall gate agent-channel ledger commands behind contract attestation: grant, challenge, budgeted keys, renewal, and console exemption. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. If a ledger-advancing command arrives on the agent channel without a valid attestation key, then the engine shall refuse it, naming method/prompts/contract.md as the only unlock path. *(was req-attest-block)*
2. When an attestation or renewal is requested, the engine shall verify a challenge answer against the current contract text before issuing a key. *(was req-attest-challenge)*
3. When an attestation key has authorized its configured budget of ledger-advancing commands, the engine shall expire it. *(was req-attest-expiry)*
4. When an attestation is requested without a prior valid key, the engine shall require a one-time grant minted on the interactive console channel. *(was req-attest-grant)*
5. The engine shall persist attestation keys only as hashes, printing each plaintext key exactly once in the issuing command's output. *(was req-attest-key-hygiene)*
6. When a renewal presents the most recently issued session key together with a correct challenge answer, the engine shall issue a successor key without a console grant. *(was req-attest-renewal)*
7. While a command arrives on the interactive console channel, the engine shall require no attestation. *(was req-console-exempt)*
<<<node: req-contract-chain.md>>>
---
id: req-contract-chain
type: requirement
statement: The repository shall deliver the contract through one unbroken pointer chain whose breakage turns the selftest red. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The repository shall deliver the contract through an unbroken pointer chain with contract.md as its single copy — each harness's natively-loaded file (CLAUDE.md for Claude Code, .github/copilot-instructions.md for Copilot) commands following AGENTS.md without exception and to the letter, and AGENTS.md commands the enumerated read-understand-recite-honor ritual on contract.md. *(was req-contract-render)*
2. If the entry chain breaks — a pointer file stops naming its next link, AGENTS.md loses the contract ritual or path, or a contract copy is embedded outside contract.md — then quack selftest shall go red. *(was req-render-drift)*
<<<node: req-decision-model.md>>>
---
id: req-decision-model
type: requirement
statement: The engine shall classify, list, and police decision nodes from graph facts alone. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When classifying a decision node, the engine shall derive its class from graph facts alone — veto (scrap-sink edge without ready_when), defer (scrap-sink edge with ready_when), superseded (incoming supersedes edge) — resolving scrap as one built-in sink node. *(was req-decision-classes)*
2. If a blessed adoption decision has no implementing design, then quack lint shall flag it, skipping vetoes and defers. *(was req-decision-realized-lint)*
3. If a decision node minted from this iteration onward lives outside spec/decisions/, then quack lint shall flag it. *(was req-decisions-folder)*
4. When quack decisions --parked runs, the engine shall list exactly the defer nodes without an incoming supersedes edge. *(was req-parked-list)*
<<<node: req-engine-distribution.md>>>
---
id: req-engine-distribution
type: requirement
statement: The launcher shall run one global engine binary, ratcheting it forward from the workspace's vendored source. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When a command runs against a workspace whose vendored engine source is newer than the global binary, quackitect shall rebuild the global binary from that source before executing the command. *(was req-engine-ratchet)*
2. When the launcher runs, it shall invoke the global quack binary from the user-local bin directory, building it from the workspace's vendored engine source when absent. *(was req-global-binary)*
<<<node: req-mint.md>>>
---
id: req-mint
type: requirement
statement: When quack mint runs for a node type, the engine shall emit a schema-valid skeleton with engine-stamped id, timestamp, and typed frontmatter.
depends_on: []
class: review
killer: false
phase: [engineering]
discipline: [process]
quality: [functionality]
---
## Rationale (not load-bearing)
Veto/defer/supersede minting especially becomes an op (correct sink edge, ready_when field, supersedes edge) so derived classification can never be misspelled.
<<<node: req-note-capture-lane.md>>>
---
id: req-note-capture-lane
type: requirement
statement: The engine shall own note capture. Every note routes through its lane into the workspace notes home outside the repository. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. Where a harness skill captures a note, the capture shall route through the engine's note lane, never a hand-written file. *(was req-note-lane)*
2. When a note is captured, the engine shall write it beneath the workspace's notes home in the user data directory, outside the repository. *(was req-notes-out)*
<<<node: req-report-filter-gestures.md>>>
---
id: req-report-filter-gestures
type: requirement
statement: The report filter shall support the descendants gesture set: double-click, clear, and on-focus help. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When the report filter's clear control is activated, the report shall empty the filter and restore the full graph. *(was req-filter-clear)*
2. When a graph node is double-clicked, the report shall apply the descendants filter for that node. *(was req-filter-dblclick)*
3. Where a descendants filter names a node, the report shall show only that node and its descendants — every node reaching it through refines, implements, verifies, or addresses edges, transitively. *(was req-filter-descendants)*
4. The report filter's on-focus help shall explain every available filter form and control, including the descendants filter, the double-click gesture, and the clear control. *(was req-filter-help)*
<<<node: req-report-why.md>>>
---
id: req-report-why
type: requirement
statement: When the report's detail panel opens a SUSPECT check, the report shall name the cause of suspicion: the changed input nodes, or the derived-coverage rule whose flip reopened the check.
depends_on: []
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [usability]
---
## Rationale (not load-bearing)
The owner, 2026-07-04, while adjudicating the M1 gate: 74 global-V&V suspects with no in-report explanation. Pairs with the noted quack-why gap (NOTE-20260704-094230): `why` explains content-hash changes only; the cause computation built here should serve both surfaces. The report stays a pure display — the cause is baked at render, never computed client-side.
<<<node: req-state-layout.md>>>
---
id: req-state-layout
type: requirement
statement: The engine shall keep committed truth under spec and every regenerable artifact in the canonical user data home, leaving the tree clean. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The engine shall leave the repository tree unmodified on every command except a deliberate truth mutation (bless, baseline re-record). *(was req-clean-status)*
2. The engine shall write every regenerable artifact — evidence, gather, overlay, spike scratch, report output, golden baselines — to the workspace's user data directory, keeping the repository free of cache state. *(was req-no-quack-state)*
3. When resolving the workspace data directory, the engine shall canonicalize the workspace path — casing, separators, symlinks — before hashing and slugging. *(was req-logs-canonical)*
4. When a bless or a baseline re-record is written, the engine shall persist it under spec/ as committed truth. *(was req-truth-in-spec)*
5. When locating the workspace root, the engine shall walk up to the nearest directory containing spec/project.toml. *(was req-root-marker)*
6. When resolving machine-local overrides, the engine shall read the single global config file in the user data directory. *(was req-global-config)*
<<<node: req-vv-time-scope.md>>>
---
id: req-vv-time-scope
type: requirement
statement: When a derived coverage check is computed, the engine shall include only trace nodes from the check's own iteration and earlier.
depends_on: []
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [functionality]
---
## Rationale (not load-bearing)
Cheap by construction: nodes already carry their iteration; iteration ids are ordered; a check's home directory names its iteration. Applies uniformly to tests-pass, meets-need cones, req-traced, and friends — for the latest iteration the result is identical to today's all-iterations rule, so the regression net is unchanged. The method text (engage.md "V&V is global") gets the matching refinement in the build.
<<<node: tasks/i9-m1-gate.md>>>
---
id: i9-m1-gate
statement: Milestone M1 (Frame the problem and vision) passed its review.
milestone: M1
class: review
killer: true
depends_on: [i9-m1-problem-agreed,i9-m1-vision-scope-stated,i9-m1-success-measurable,i9-m1-top-risks-logged]
---
<<<node: tasks/i9-m1-problem-agreed.md>>>
---
id: i9-m1-problem-agreed
statement: Problem agreed — the advisory floor is empirically insufficient; the contract ritual was skipped in the field on Copilot (i6) and on Claude Code (2026-07-04, mid-engage), so prompt-level delivery cannot carry the loop alone.
milestone: M1
class: review
killer: true
depends_on: []
---
<<<node: tasks/i9-m1-success-measurable.md>>>
---
id: i9-m1-success-measurable
statement: Success is measurable — a keyless agent-channel ledger command is refused; a granted session self-renews without further grants; entry files regenerate byte-identically; git status stays clean after any non-truth command; deleting the data dir loses nothing adjudicated; minted nodes always parse strict; one log home per workspace across shells.
milestone: M1
class: review
killer: false
depends_on: []
---
<<<node: tasks/i9-m1-top-risks-logged.md>>>
---
id: i9-m1-top-risks-logged
statement: Top risks logged (RAID) — console-grant friction on unattended starts, grep-gameable challenge, key lost to compaction mid-session, MSYS channel-detection quirk, findRoot migration breaking vendored vehicles, ship-a-zip bootstrap without a global install, state/notes migration churn, combined-iteration scope.
milestone: M1
class: review
killer: false
depends_on: []
---
<<<node: tasks/i9-m1-vision-scope-stated.md>>>
---
id: i9-m1-vision-scope-stated
statement: Vision and scope stated — the contract becomes structurally undodgeable (attestation gate, single-source entry-file rendering) and the repo holds only truth (no .quack anywhere, global ratcheting engine, notes out of repo, decisions in spec/decisions/, deterministic minting, one canonical data home).
milestone: M1
class: review
killer: false
depends_on: []
---
<<<node: tasks/i9-m2-gate.md>>>
---
id: i9-m2-gate
statement: Milestone M2 (Requirements) passed its review.
milestone: M2
class: review
killer: true
depends_on: [i9-m2-inputs-captured,i9-m2-stakeholder-coverage,i9-m2-requirements-verifiable,i9-m2-requirements-traced]
---
<<<node: tasks/i9-m2-inputs-captured.md>>>
---
id: i9-m2-inputs-captured
statement: Inputs captured — context, stakeholders, use cases.
milestone: M2
class: review
killer: false
depends_on: [i9-m1-gate]
---
<<<node: tasks/i9-m2-requirements-traced.md>>>
---
id: i9-m2-requirements-traced
statement: Requirements traced — every requirement back to a need.
milestone: M2
class: executed
killer: false
verify: coverage:req-traced
depends_on: [i9-m1-gate]
---
<<<node: tasks/i9-m2-requirements-verifiable.md>>>
---
id: i9-m2-requirements-verifiable
statement: Requirements verifiable — every requirement has a test.
milestone: M2
class: executed
killer: false
verify: coverage:req-has-test
depends_on: [i9-m1-gate]
---
<<<node: tasks/i9-m2-stakeholder-coverage.md>>>
---
id: i9-m2-stakeholder-coverage
statement: Stakeholder coverage — no role left out (owner/adjudicator, driving agents, thin-harness agents, vehicle users).
milestone: M2
class: review
killer: false
depends_on: [i9-m1-gate]
---
<<<node: tasks/i9-m3-alternatives-elaborated.md>>>
---
id: i9-m3-alternatives-elaborated
statement: At least two viable alternatives elaborated per open axis (grant mechanics, challenge derivation, key transport, render pipeline, data-dir layout, root-marker mechanics, ratchet check location, decision-node schema, mint UX).
milestone: M3
class: review
killer: true
depends_on: [i9-m2-gate]
---
<<<node: tasks/i9-m3-criteria-weighted.md>>>
---
id: i9-m3-criteria-weighted
statement: Decision criteria weighted — derived from the requirements.
milestone: M3
class: review
killer: false
depends_on: [i9-m2-gate]
---
<<<node: tasks/i9-m3-feasibility-checked.md>>>
---
id: i9-m3-feasibility-checked
statement: Feasibility rough-checked per candidate.
milestone: M3
class: review
killer: false
depends_on: [i9-m2-gate]
---
<<<node: tasks/i9-m3-gate.md>>>
---
id: i9-m3-gate
statement: Milestone M3 (Candidate architectures) passed its review.
milestone: M3
class: review
killer: true
depends_on: [i9-m3-alternatives-elaborated,i9-m3-criteria-weighted,i9-m3-feasibility-checked]
---
<<<node: tasks/i9-m4-adr-recorded.md>>>
---
id: i9-m4-adr-recorded
statement: ADRs recorded and traced — every ADR addresses a requirement.
milestone: M4
class: executed
killer: false
verify: coverage:adr-traced
depends_on: [i9-m3-gate]
---
<<<node: tasks/i9-m4-architecture-stated.md>>>
---
id: i9-m4-architecture-stated
statement: Chosen architecture stated.
milestone: M4
class: review
killer: false
depends_on: [i9-m3-gate]
---
<<<node: tasks/i9-m4-choice-traced.md>>>
---
id: i9-m4-choice-traced
statement: Choice traced to the weighted criteria (Pugh + sensitivity check).
milestone: M4
class: review
killer: false
depends_on: [i9-m3-gate]
---
<<<node: tasks/i9-m4-gate.md>>>
---
id: i9-m4-gate
statement: Milestone M4 (Decide the architecture) passed its review.
milestone: M4
class: review
killer: true
depends_on: [i9-m4-architecture-stated,i9-m4-choice-traced,i9-m4-adr-recorded]
---
<<<node: tasks/i9-m5-design-buildable.md>>>
---
id: i9-m5-design-buildable
statement: Design is buildable.
milestone: M5
class: review
killer: false
depends_on: [i9-m4-gate]
---
<<<node: tasks/i9-m5-gate.md>>>
---
id: i9-m5-gate
statement: Milestone M5 (Prove the riskiest unknowns) passed its review.
milestone: M5
class: review
killer: true
depends_on: [i9-m5-riskiest-validated,i9-m5-design-buildable,i9-m5-spike-recorded]
---
<<<node: tasks/i9-m5-riskiest-validated.md>>>
---
id: i9-m5-riskiest-validated
statement: Riskiest assumptions validated by evidence — key-in-context survives real harness round-trips; challenge verification is deterministic against the live contract file.
milestone: M5
class: review
killer: true
depends_on: [i9-m4-gate]
---
<<<node: tasks/i9-m5-spike-recorded.md>>>
---
id: i9-m5-spike-recorded
statement: Spike results recorded — design advanced as needed.
milestone: M5
class: review
killer: false
depends_on: [i9-m4-gate]
---
<<<node: tasks/i9-m6-bs-attest-gate.md>>>
---
id: i9-m6-bs-attest-gate
statement: The gate itself: ledger-advancing commands on the agent channel refuse without a valid --key (env accepted as second path), refusal names contract.md only, console channel exempt. Realizes req-attest-block, req-console-exempt.
milestone: M6
class: review
parent: i9-m6-build
killer: false
depends_on: [i9-m6-bs-attest-ritual]
---
<<<node: tasks/i9-m6-bs-attest-ritual.md>>>
---
id: i9-m6-bs-attest-ritual
statement: Grant and challenge ops: console-minted one-time code, letter-bearing-word challenge (nonce-seeded, verified against the live contract), redeem and renew issuing successor keys. Realizes req-attest-grant, req-attest-challenge, req-attest-renewal.
milestone: M6
class: review
parent: i9-m6-build
killer: false
depends_on: [i9-m6-bs-attest-state]
---
<<<node: tasks/i9-m6-bs-attest-state.md>>>
---
id: i9-m6-bs-attest-state
statement: Attestation state store in the data home: hash-only key chain, command budget counter, nonce record. Realizes req-attest-key-hygiene, req-attest-expiry.
milestone: M6
class: review
parent: i9-m6-build
killer: false
depends_on: [i9-m6-bs-data-dir]
---
<<<node: tasks/i9-m6-bs-cleanup.md>>>
---
id: i9-m6-bs-cleanup
statement: Tidy: stale config.toml comment resolved by its removal, method prompts pointing at new locations, entry files regenerated, dependencies.md updated, full selftest sweep green.
milestone: M6
class: review
parent: i9-m6-build
killer: false
depends_on: [i9-m6-bs-migrate]
---
<<<node: tasks/i9-m6-bs-data-dir.md>>>
---
id: i9-m6-bs-data-dir
statement: Workspace-first data home: generalized resolution (one dir per workspace, kind subfolders), path canonicalized (casing, separators, symlinks) before hashing and slugging, global user config read. Realizes req-logs-canonical, req-global-config.
milestone: M6
class: review
parent: i9-m6-build
killer: false
depends_on: [i9-m6-tests-red-observed]
---
<<<node: tasks/i9-m6-bs-decisions.md>>>
---
id: i9-m6-bs-decisions
statement: Decision machinery: built-in scrap sink, derived classes (veto, defer, superseded), spec/decisions/ path lint (forward-only from i0009), unrealized-adoption lint skipping vetoes and defers, quack decisions --parked. Realizes req-decision-classes, req-decisions-folder, req-decision-realized-lint, req-parked-list.
milestone: M6
class: review
parent: i9-m6-build
killer: false
depends_on: [i9-m6-bs-report-ux]
---
<<<node: tasks/i9-m6-bs-entry-render.md>>>
---
id: i9-m6-bs-entry-render
statement: Entry-file render: per-harness templates wrapping the verbatim contract body (AGENTS.md, .github/copilot-instructions.md), run in quack build and standalone; lint re-renders and byte-compares. Realizes req-contract-render, req-render-drift.
milestone: M6
class: review
parent: i9-m6-build
killer: false
depends_on: [i9-m6-bs-attest-gate]
---
<<<node: tasks/i9-m6-bs-global-bin.md>>>
---
id: i9-m6-bs-global-bin
statement: Global binary: quack build installs to the user-local bin, launcher rewritten (fixed global path + bootstrap build when absent), engine startup ratchet (older than vendored source: rename dance, rebuild, re-exec; leftover sweep). Realizes req-global-binary, req-engine-ratchet.
milestone: M6
class: review
parent: i9-m6-build
killer: false
depends_on: [i9-m6-bs-notes]
---
<<<node: tasks/i9-m6-bs-migrate.md>>>
---
id: i9-m6-bs-migrate
statement: One-time migrations, count+size verified: caches (evidence, gather, overlay, out, golden) to the data home, notes moved out, split log homes merged, .quack removed. Completes req-no-quack-state.
milestone: M6
class: review
parent: i9-m6-build
killer: false
depends_on: [i9-m6-bs-truth]
---
<<<node: tasks/i9-m6-bs-mint.md>>>
---
id: i9-m6-bs-mint
statement: quack mint <type> emitting strict-parser-valid skeletons, sugar forms mint veto / defer --ready-when / supersede stamping the edges; M3 graveyard entries minted as the first veto nodes. Realizes req-mint.
milestone: M6
class: review
parent: i9-m6-build
killer: false
depends_on: [i9-m6-bs-decisions]
---
<<<node: tasks/i9-m6-bs-notes.md>>>
---
id: i9-m6-bs-notes
statement: Note lane to the data-home notes dir with --file/stdin multi-line body; note.md prompt rewired to call the engine, never hand-write. Realizes req-notes-out, req-note-lane.
milestone: M6
class: review
parent: i9-m6-build
killer: false
depends_on: [i9-m6-bs-mint]
---
<<<node: tasks/i9-m6-bs-report-ux.md>>>
---
id: i9-m6-bs-report-ux
statement: Report UX: suspect-cause baked into the detail panel (changed inputs or flipped coverage rule), filter clear control, descendants filter, double-click gesture, on-focus help covering all forms. Realizes req-report-why, req-filter-clear, req-filter-descendants, req-filter-dblclick, req-filter-help.
milestone: M6
class: review
parent: i9-m6-build
killer: false
depends_on: [i9-m6-bs-vv-scope]
---
<<<node: tasks/i9-m6-bs-runners.md>>>
---
id: i9-m6-bs-runners
statement: Selftest runners registered for every new i9 test node (attest family, render, data-dir, decisions, mint, notes, report, vv-scope) — each exercising the not-yet-built surface so it fails RED honestly.
milestone: M6
class: review
parent: i9-m6-build
killer: false
depends_on: [i9-m6-build-planned]
---
<<<node: tasks/i9-m6-bs-truth.md>>>
---
id: i9-m6-bs-truth
statement: Truth into spec/: attest ledger and ears baseline under spec/ledger/, iteration settings as spec/project.toml, findRoot flipped to the spec/project.toml walk-up, repository untouched by non-truth commands. Realizes req-truth-in-spec, req-root-marker, req-clean-status.
milestone: M6
class: review
parent: i9-m6-build
killer: false
depends_on: [i9-m6-bs-global-bin]
---
<<<node: tasks/i9-m6-bs-vv-scope.md>>>
---
id: i9-m6-bs-vv-scope
statement: Time-scoped coverage: every derived rule computes over nodes from the check's own iteration and earlier; method text (engage.md V&V wording) updated to match. Realizes req-vv-time-scope.
milestone: M6
class: review
parent: i9-m6-build
killer: false
depends_on: [i9-m6-bs-entry-render]
---
<<<node: tasks/i9-m6-build-planned.md>>>
---
id: i9-m6-build-planned
statement: Build planned — decomposed into small, resumable steps seeded as children of the build task.
milestone: M6
class: review
killer: true
depends_on: [i9-m5-gate]
---
<<<node: tasks/i9-m6-build.md>>>
---
id: i9-m6-build
statement: Build — the planned steps nested beneath it are realized.
milestone: M6
class: review
killer: false
depends_on: [i9-m6-bs-cleanup]
---
<<<node: tasks/i9-m6-detailed-design-complete.md>>>
---
id: i9-m6-detailed-design-complete
statement: Detailed design complete — every requirement has a realized design.
milestone: M6
class: executed
killer: false
verify: coverage:designs-realized
depends_on: [i9-m6-build]
---
<<<node: tasks/i9-m6-gate.md>>>
---
id: i9-m6-gate
statement: Milestone M6 (Build and verify) passed its review.
milestone: M6
class: review
killer: true
depends_on: [i9-m6-build-planned,i9-m6-tests-red-observed,i9-m6-build,i9-m6-detailed-design-complete,i9-m6-internal-quality-ok,i9-m6-verification-green,i9-m6-impl-risks-acceptable]
---
<<<node: tasks/i9-m6-impl-risks-acceptable.md>>>
---
id: i9-m6-impl-risks-acceptable
statement: Implementation risks acceptable.
milestone: M6
class: review
killer: false
depends_on: [i9-m6-build]
---
<<<node: tasks/i9-m6-internal-quality-ok.md>>>
---
id: i9-m6-internal-quality-ok
statement: Internal quality ok (review).
milestone: M6
class: review
killer: false
depends_on: [i9-m6-build]
---
<<<node: tasks/i9-m6-tests-red-observed.md>>>
---
id: i9-m6-tests-red-observed
statement: Suite observed RED — every new test ran and failed before the build.
milestone: M6
class: executed
killer: false
verify: coverage:tests-red
depends_on: [i9-m6-bs-runners]
---
<<<node: tasks/i9-m6-verification-green.md>>>
---
id: i9-m6-verification-green
statement: Verification green — every test passes, across all iterations.
milestone: M6
class: executed
killer: false
verify: coverage:tests-pass
depends_on: [i9-m6-build]
---
<<<node: tasks/i9-m7-acceptance-obtained.md>>>
---
id: i9-m7-acceptance-obtained
statement: Acceptance obtained — sign-off evidence recorded.
milestone: M7
class: review
killer: false
depends_on: [i9-m6-gate]
---
<<<node: tasks/i9-m7-gate.md>>>
---
id: i9-m7-gate
statement: Milestone M7 (Validate and accept) passed its review.
milestone: M7
class: review
killer: true
depends_on: [i9-m7-meets-need,i9-m7-killer-ucs-demonstrated,i9-m7-acceptance-obtained,i9-m7-validation-gaps]
---
<<<node: tasks/i9-m7-killer-ucs-demonstrated.md>>>
---
id: i9-m7-killer-ucs-demonstrated
statement: Killer use-cases demonstrated end-to-end — a real fresh context bounces, attests, renews, and a real Copilot-style entry file carries the contract.
milestone: M7
class: review
killer: false
depends_on: [i9-m6-gate]
---
<<<node: tasks/i9-m7-meets-need.md>>>
---
id: i9-m7-meets-need
statement: Meets the need — validated against all needs (every iteration), demonstrated by Ch1 criteria.
milestone: M7
class: review
killer: true
depends_on: [i9-m6-gate]
---
<<<node: tasks/i9-m7-validation-gaps.md>>>
---
id: i9-m7-validation-gaps
statement: Validation gaps captured (RAID).
milestone: M7
class: review
killer: false
depends_on: [i9-m6-gate]
---
<<<node: tasks/i9-m8-config-baselined.md>>>
---
id: i9-m8-config-baselined
statement: Configuration baselined.
milestone: M8
class: review
killer: false
depends_on: [i9-m7-gate]
---
<<<node: tasks/i9-m8-docs-complete.md>>>
---
id: i9-m8-docs-complete
statement: Docs complete and match the actual surface — attest flow in AGENTS.md/contract, CLI help, dependencies.
milestone: M8
class: review
killer: true
depends_on: [i9-m7-gate]
---
<<<node: tasks/i9-m8-gate.md>>>
---
id: i9-m8-gate
statement: Milestone M8 (Package and hand over) passed its review.
milestone: M8
class: review
killer: true
depends_on: [i9-m8-docs-complete,i9-m8-packaged-versioned,i9-m8-config-baselined,i9-m8-handover-accepted]
---
<<<node: tasks/i9-m8-handover-accepted.md>>>
---
id: i9-m8-handover-accepted
statement: Handover accepted.
milestone: M8
class: review
killer: false
depends_on: [i9-m7-gate]
---
<<<node: tasks/i9-m8-packaged-versioned.md>>>
---
id: i9-m8-packaged-versioned
statement: Packaged and versioned.
milestone: M8
class: review
killer: false
depends_on: [i9-m7-gate]
---
<<<node: test-attest-ritual.md>>>
---
id: test-attest-ritual
type: test
statement: Agent-channel ledger commands are gated behind attestation: grant, challenge, budgeted keys, renewal, expiry, and console exemption.
class: executed
verify: selftest:attest-block attest-challenge attest-expiry attest-grant attest-keys attest-renewal attest-console
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. An agent-channel ledger-advancing command without a valid key exits nonzero naming contract.md; with a valid key it proceeds; read-only commands run keyless. *(was test-attest-block)*
2. A challenge answer matching the current contract text is accepted; a wrong answer, and a right answer against an edited contract, are rejected. *(was test-attest-challenge)*
3. The command exceeding a key's configured budget is refused until a renewal issues a successor key. *(was test-attest-expiry)*
4. A first attestation (no prior key) is refused without a console-minted grant and succeeds with one; a grant is single-use. *(was test-attest-grant)*
5. Attestation state on disk contains no plaintext key; the plaintext appears exactly once, in the issuing command's stdout. *(was test-attest-key-hygiene)*
6. Presenting the most recent key plus a correct challenge answer yields a successor key with no grant involved; a stale (superseded) key is refused. *(was test-attest-renewal)*
7. A console-channel command runs with no attestation state present and never prompts for a key. *(was test-console-exempt)*
<<<node: test-contract-chain.md>>>
---
id: test-contract-chain
type: test
statement: The contract reaches the agent through one unbroken pointer chain whose breakage turns the selftest red.
class: executed
verify: selftest:contract-render render-drift
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. AGENTS.md names contract.md's path and carries the enumerated READ/UNDERSTAND/RECITE/HONOR ritual, and does not embed the contract body; contract.md exists and is non-empty. *(was test-contract-render)*
2. Every harness pointer file (CLAUDE.md, .github/copilot-instructions.md) exists and names AGENTS.md; a severed link turns the selftest red. *(was test-render-drift)*
<<<node: test-decision-model.md>>>
---
id: test-decision-model
type: test
statement: Decision nodes are classified, listed, and policed from graph facts alone.
class: executed
verify: selftest:decision-classes decision-realized decisions-folder parked-list
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. Veto, defer, and superseded derive correctly from scrap-sink and supersedes edges; scrap resolves without a file on disk. *(was test-decision-classes)*
2. An adoption decision with no implementing design is flagged; vetoes and defers are skipped. *(was test-decision-realized)*
3. A post-baseline decision node outside spec/decisions/ is flagged by lint; a grandfathered pre-baseline ADR is not. *(was test-decisions-folder)*
4. decisions --parked lists a live defer, excludes a superseded one, and is empty when no defers exist. *(was test-parked-list)*
<<<node: test-engine-distribution.md>>>
---
id: test-engine-distribution
type: test
statement: The launcher runs one global engine binary, ratcheting it forward from the vendored source.
class: executed
verify: selftest:engine-ratchet global-binary
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. Newer vendored source than the global binary triggers a rebuild before execution; a newer global binary runs as-is. *(was test-engine-ratchet)*
2. The launcher path resolves the global binary; with it absent, the build-from-vendored-source path is taken before the command runs. *(was test-global-binary)*
<<<node: test-filter-ux.md>>>
---
id: test-filter-ux
type: test
statement: The rendered report contains the clear control wired to reset, the descendants predicate over refines/implements/verifies/addresses edges, the double-click handler applying it, and on-focus help naming all three. The descendants predicate computed for a sample node matches the engine-side cone.
class: executed
verify: selftest:report-filter-ux
killer: false
---
<<<node: test-mint.md>>>
---
id: test-mint
type: test
statement: A minted skeleton of every node type passes the strict parser; two mints never collide on id.
class: executed
verify: selftest:mint
killer: false
---
<<<node: test-note-lane.md>>>
---
id: test-note-lane
type: test
statement: The note skill prompt (method/prompts/note.md) instructs calling quack note for capture. No instruction to hand-write a note file remains. The engine's note lane accepts a multi-line body.
class: review
killer: false
---
## Rationale (not load-bearing)
Grounded review, not selftest: half the claim is prompt content (referent: note.md), half is the engine flag (covered by exercising quack note --file in the walk).
<<<node: test-notes-out.md>>>
---
id: test-notes-out
type: test
statement: quack note writes beneath the data-dir notes home; nothing lands in the repository.
class: executed
verify: selftest:notes-out
killer: false
---
<<<node: test-report-why.md>>>
---
id: test-report-why
type: test
statement: A rendered report embeds, for every SUSPECT check, a non-empty cause. A hash-changed input is named as such, and a coverage-driven suspect names the flipped rule.
class: executed
verify: selftest:report-why
killer: false
---
<<<node: test-state-layout.md>>>
---
id: test-state-layout
type: test
statement: Committed truth stays under spec and every regenerable artifact lands in the canonical data home, leaving the tree clean.
class: executed
verify: selftest:clean-status global-config logs-canonical data-dir-caches root-marker truth-in-spec
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. Every non-mutating command leaves git status clean; bless and baseline change only their spec/ truth files. *(was test-clean-status)*
2. Machine-local overrides resolve from the global user config; a per-repo override file is ignored and reported. *(was test-global-config)*
3. Two data-dir resolutions differing only in path casing or separator style yield the identical workspace slug. *(was test-logs-canonical)*
4. Evidence, gather, overlay, spike, report, and golden-root operations write only under the user data directory; the repository tree stays untouched. *(was test-no-quack-state)*
5. The walk-up resolves the nearest directory containing spec/project.toml as root; without one the engine refuses with a clear error. *(was test-root-marker)*
6. A bless and a baseline re-record land under spec/ and nowhere else. *(was test-truth-in-spec)*
<<<node: test-vv-time-scope.md>>>
---
id: test-vv-time-scope
type: test
statement: A test node from a later iteration is excluded from an earlier iteration's coverage computation; the latest iteration's computation includes every earlier test node.
class: executed
verify: selftest:vv-time-scope
killer: false
---
<<<node: uc-attested-session.md>>>
---
id: uc-attested-session
type: usecase
statement: A fresh agent context cannot advance the ledger until the contract has entered its context and the adjudicator has granted once. Within the session, key renewals are autonomous, so unattended runs never stall on a person.
class: review
killer: false
---
## Rationale (not load-bearing)
The advisory floor failed in the field twice (Copilot i6; Claude Code 2026-07-04, the contract re-read skipped mid-engage). The session boundary is defined by possession of the key — the only storage born and dying with the context window — not by TTLs or PIDs.
<<<node: uc-backward-vv.md>>>
---
id: uc-backward-vv
type: usecase
statement: An iteration's verification and validation look backward only. They re-check everything up to and including their own iteration. Later iterations never reopen an earlier iteration's verdicts by mere addition.
class: review
killer: false
---
## Rationale (not load-bearing)
Owner directive 2026-07-04, after two rounds of explaining the 74-suspect wave: the current iteration must re-check all old tests (regression net), but old iterations must not look into the future. Additions stop rippling backward; a genuinely failing old test still flips its own iteration red — that flip is a true regression signal and stays.
<<<node: uc-contract-delivery.md>>>
---
id: uc-contract-delivery
type: usecase
statement: Every harness receives the full contract through its natively auto-loaded entry file, generated from the single contract source. No pointer-following is required of the agent.
class: review
killer: false
---
## Rationale (not load-bearing)
A thin harness never follows a pointer; the contract CONTENT must already sit in the entry file. A generated file is an output, not a duplicate (like quack.exe from .go) — DRY holds.
<<<node: uc-decisions-never-relitigated.md>>>
---
id: uc-decisions-never-relitigated
type: usecase
statement: Every decision, adopt, veto, or defer, is an immutable node in spec/decisions/ classified purely from graph facts. The graveyard and parked panels are the read path that prevents re-raising a settled idea.
class: review
killer: false
---
## Rationale (not load-bearing)
Decision model v2: born made, never edited, exits by supersession only; no status fields (the gate ledger IS the state machine, DRY). OPEN decisions are never a record state — in-iteration pending = unblessed gate, cross-iteration = defer node, musings = raw notes.
<<<node: uc-deterministic-minting.md>>>
---
id: uc-deterministic-minting
type: usecase
statement: Every note and trace node is born engine-stamped with schema-valid frontmatter. The agent fills content and never authors shape. No invalid node ever exists.
class: review
killer: false
---
## Rationale (not load-bearing)
The strict parser (i8) refuses malformed graphs at READ time; minting moves the guarantee to BIRTH time. The hand-written notes of 2026-07-03/04 are the format drift this removes. Sebot precedent: determinizer-stamped atoms from templates.
<<<node: uc-global-engine.md>>>
---
id: uc-global-engine
type: usecase
statement: One global quack binary serves every repo. A repo carries vendored engine source and can rebuild the global binary, ratcheting it forward. A newer global binary is used as-is; an older one is rebuilt.
class: review
killer: false
---
## Rationale (not load-bearing)
The owner's informal call 2026-07-04 (formal killer ADR at M4): no versioned slots, forward-only ratchet; incompatibility trouble is handled ad hoc by the LLM proposing a fix. Ship-a-zip stays viable: the launcher builds the global binary from vendored source when absent.
<<<node: uc-notes-private.md>>>
---
id: uc-notes-private
type: usecase
statement: Raw notes live outside the repository next to the logs; content crosses private to published only by minting a decision node, where it is distilled and sanitized.
class: review
killer: false
---
## Rationale (not load-bearing)
Raw notes can carry personal data; the owner wants them far from the published repo. The out-of-repo tree is working material, disposable like logs; durable outcomes become decision nodes in spec/decisions/.
<<<node: uc-repo-holds-only-truth.md>>>
---
id: uc-repo-holds-only-truth
type: usecase
statement: A checkout contains only recorded truth (spec/) and product. Every cache is regenerable in the user data directory. Deleting the data dir loses nothing adjudicated, and a fresh clone renders the same board on any machine.
class: review
killer: false
---
## Rationale (not load-bearing)
The amnesia test. Sort criterion: recorded adjudication truth vs regenerable. Truth mutations (bless, baseline) writing into spec/ is CORRECT under this model — in-repo writes are exactly the truth mutations.
<<<node: uc-stable-data-dir.md>>>
---
id: uc-stable-data-dir
type: usecase
statement: The engine resolves one data and log home per workspace regardless of invoking shell, path casing, or separator style.
class: review
killer: false
---
## Rationale (not load-bearing)
Found in the i9 retro: PowerShell (C:\) and git-bash (c:\) hash the same workspace to different log homes, scattering sessions and blinding retro log-mining.
