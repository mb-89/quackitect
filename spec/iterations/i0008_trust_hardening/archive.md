<<<quackitect-archive v1>>>
<<<node: adr-actor-channel-stat.md>>>
---
id: adr-actor-channel-stat
type: adr
adjudicated_by: human
statement: The bless channel is detected by stdlib char-device stat on stdin and stdout. Console means human. Pipe or redirect means agent. An explicit --by flag overrides the detection. QUACK_ACTOR is retired. This was chosen over env heuristics, which are spoofable and nondeterministic, and over always-agent, which is the worst console UX. The known MSYS/mintty pipe quirk mis-stamps toward agent. That is the designed-harmless direction, since it under-claims human oversight.
depends_on: []
class: review
killer: true
---
## Rationale (not load-bearing)
Sensitivity: if the M5 terminal spike falsifies char-device detection on real Windows consoles, fallback is always-agent + --by human (C2c) — the record stays honest either way; only convenience is lost.
<<<node: adr-ears-baseline.md>>>
---
id: adr-ears-baseline
type: adr
adjudicated_by: human
statement: Forward-only EARS discrimination uses a committed baseline corpus: the stmtHash of every requirement existing at feature-land. Lint checks only requirements whose current stmtHash is absent from the baseline, meaning new or genuinely re-stated ones. So blessed history is structurally unflaggable. This was chosen over attest-lineage reconstruction, which is complex and indirect, and over iteration-order scoping, which misses edited old statements.
depends_on: []
class: review
killer: true
---
## Rationale (not load-bearing)
One diffable file, one deterministic set-membership test. Tamper-hardening the baseline itself belongs to the deferred evidence-into-merkle work.
<<<node: adr-kernel-corpus.md>>>
---
id: adr-kernel-corpus
type: adr
adjudicated_by: human
statement: Kernel corpora are baked as in-code Go literals: golden vectors, the linear, diamond, and shared-subtree DAGs, and tampered attest chains. The property battery uses a hand-rolled xorshift64* PRNG with a baked seed. This was chosen over go:embed files, which spread the kernel's truth for no gain, and over math/rand, whose stream stability across Go versions is not ours to guarantee.
depends_on: []
class: review
killer: false
---
<<<node: adr-logs-user-dir.md>>>
---
id: adr-logs-user-dir
type: adr
adjudicated_by: human
statement: The engine owns canonical log-dir resolution: %LOCALAPPDATA%\quackitect\logs\<slug> on Windows, $XDG_DATA_HOME (default ~/.local/share)/quackitect/logs/<slug> elsewhere. A config.toml override wins. The slug is the workspace dir name plus an h12(abs-path) prefix. This was chosen over os.UserCacheDir, which has droppable-cache semantics wrong for durable research data, and over os.UserConfigDir, which is roaming AppData and wrong for bulk. The 122 MB under .quack/logs migrates once, verified by count and size, foreign folders included.
depends_on: []
class: review
killer: false
---
<<<node: adr-region-hash-ws.md>>>
---
id: adr-region-hash-ws
type: adr
adjudicated_by: human
statement: Design regions fold ONE hash over whitespace-collapse-only normalization that PRESERVES case, a new normWS, not the statement norm. This was chosen over reusing norm() verbatim, whose lowercasing would let a case-only code rename escape reopening. Comments stay in the hash because in-region comments are design content.
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
Sensitivity: the directive's operative words are "whitespace-collapse only"; "same norm as statements" was shorthand. Cost of the second tiny function is one line; cost of a silent case-rename escape is a stale blessed design. One-time recompute ripple = R5, handled in this iteration's walk.
<<<node: adr-strict-load.md>>>
---
id: adr-strict-load
type: adr
adjudicated_by: human
statement: Strictness applies at EVERY graph load, with all findings batched (file, key, direction) and a nonzero exit. This was chosen over write-path-only or lint-only strictness, because a status rendered from a misparsed graph IS the silently-shrunk cone. A node file is recognized by a first-line frontmatter fence. iteration.md is its own strict key class. Evidence docs are excluded naturally.
depends_on: []
class: review
killer: true
---
## Rationale (not load-bearing)
Pugh vs C1b/C1c on record-fidelity(5): only C1a closes the read path. Brick risk is owned by the recognition rule + the M5 zero-false-rejection spike (kill-criterion), not by weakening the refusal. `quack note` loads no graph and stays available mid-repair.
<<<node: iteration.md>>>
---
iteration: i0008_trust_hardening
status: active
type: default
rigor: systematic
---

Harden the trust kernel: strict node parsing that fails loudly, per-channel actor honesty, normalized design-region hashes, kernel tests inside selftest, logs out of the repo, EARS-enforced new requirements.
<<<node: req-actor-channels.md>>>
---
id: req-actor-channels
type: requirement
statement: When a bless is recorded, the engine shall default the actor per channel: human for a bless entered at an interactive console, agent for a non-interactive harness-invoked bless. It shall accept an explicit --by flag overriding either. The QUACK_ACTOR environment variable shall be retired.
depends_on: []
class: review
killer: true
phase: [engineering]
discipline: [process]
quality: [security]
---
<<<node: req-design-hash-norm.md>>>
---
id: req-design-hash-norm
type: requirement
statement: When the engine hashes a design region, it shall compute one hash over the whitespace-collapsed region content, retaining comments. This is the same normalization statements use. Pure reformatting never changes the hash. Any content edit does.
depends_on: []
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [reliability]
---
<<<node: req-ears-authoring.md>>>
---
id: req-ears-authoring
type: requirement
statement: The engine and the method shall enforce EARS-shaped requirement statements at authoring and lint time. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When quack lint evaluates a requirement that is new, or SUSPECT for a real upstream reason, at systematic rigor, it shall verify the statement matches one of the five EARS shapes and contains shall, shall flag blocklisted weasel words, shall honor an ears exempt frontmatter carrying a required reason, shall count exemptions, and shall never flag an existing blessed statement. *(was req-ears-lint)*
2. The compose reference shall carry the five EARS pattern shapes and the authoring instruction, integrated with the i7 tests-red and roles content, so that new requirements are authored EARS-shaped at compose time. *(was req-ears-method)*
<<<node: req-kernel-selftest.md>>>
---
id: req-kernel-selftest
type: requirement
statement: The quack selftest shall verify the trust kernel from baked deterministic corpora with no unseeded randomness. It verifies golden hash vectors for norm, h12, statement hash, and the full fold. It verifies exact suspect-cone sets on linear, diamond, and shared-subtree fixture DAGs. It verifies the gate state-machine walk: open, bless, done, dependency change, suspect, re-bless. It verifies parser strictness rejections. It verifies attest prev_hash chain verification, including the migrated-null anchor and tamper detection.
depends_on: []
class: review
killer: true
phase: [maintenance]
discipline: [software]
quality: [maintainability]
---
<<<node: req-logs-out-of-repo.md>>>
---
id: req-logs-out-of-repo
type: requirement
statement: The engine shall write session logs to a stable user-scoped directory (LOCALAPPDATA quackitect logs project-slug on Windows; the XDG data dir elsewhere), overridable via config.toml, never to a repo or temp directory; the existing .quack/logs content shall be migrated out once, foreign files included.
depends_on: []
class: review
killer: false
phase: [delivery]
discipline: [software]
quality: [maintainability]
---
<<<node: req-structural-strictness.md>>>
---
id: req-structural-strictness
type: requirement
statement: The engine shall refuse structurally invalid input: malformed frontmatter, dangling references, mis-wired milestone chains. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When the engine parses a node file, it shall reject malformed frontmatter and any key outside the complete node-key allowlist (including the i7 additions roles, milestone, validates, parent, and verify coverage rules) with a nonzero exit naming the file and the offending key. *(was req-strict-frontmatter)*
2. When the engine loads the graph, it shall verify that every declared reference (depends_on, refines, implements, verifies, addresses, parent, validates) resolves in both directions to existing nodes, and shall exit nonzero naming any dangling reference. *(was req-ref-integrity)*
3. When quack lint evaluates an iteration's tasks, it shall flag any milestone subtask whose dependency chain does not pass through the prior milestone's gate, so that a mis-wired checklist cannot let next schedule a later milestone early. *(was req-monotonic-lint)*
<<<node: tasks/i8-m1-gate.md>>>
---
id: i8-m1-gate
statement: Milestone M1 (Frame the problem and vision) passed its review.
milestone: M1
class: review
killer: true
depends_on: [i8-m1-problem-agreed,i8-m1-vision-scope-stated,i8-m1-success-measurable,i8-m1-top-risks-logged]
---
<<<node: tasks/i8-m1-problem-agreed.md>>>
---
id: i8-m1-problem-agreed
statement: Problem agreed — the delta is real and worth solving; silent parse drops, mis-stamped actors, hash churn, an untested kernel, logs in the repo, and unverifiable requirement prose all erode the one thing the tool sells, trust.
milestone: M1
class: review
killer: true
depends_on: []
---
<<<node: tasks/i8-m1-success-measurable.md>>>
---
id: i8-m1-success-measurable
statement: Success is measurable — Ch1 criteria defined per directive item (nonzero exits observed, actor stamps by channel, hash stability under reformat, kernel selftests green, .quack/logs empty and migrated, EARS lint live forward-only).
milestone: M1
class: review
killer: false
depends_on: []
---
<<<node: tasks/i8-m1-top-risks-logged.md>>>
---
id: i8-m1-top-risks-logged
statement: Top risks logged (RAID) — incomplete key allowlist bricking the repo day one, channel detection mis-stamping the actor, EARS lint flagging blessed history, log migration touching foreign personal data.
milestone: M1
class: review
killer: false
depends_on: []
---
<<<node: tasks/i8-m1-vision-scope-stated.md>>>
---
id: i8-m1-vision-scope-stated
statement: Vision and scope stated — harden the trust kernel so the ledger cannot lie by accident; six directive items in, deferrals and rejections named.
milestone: M1
class: review
killer: false
depends_on: []
---
<<<node: tasks/i8-m2-gate.md>>>
---
id: i8-m2-gate
statement: Milestone M2 (Requirements) passed its review.
milestone: M2
class: review
killer: true
depends_on: [i8-m2-inputs-captured,i8-m2-stakeholder-coverage,i8-m2-requirements-verifiable,i8-m2-requirements-traced]
---
<<<node: tasks/i8-m2-inputs-captured.md>>>
---
id: i8-m2-inputs-captured
statement: Inputs captured — context, stakeholders, and use cases for the six directive items, sourced from the review notes and the red-teamed scope directive.
milestone: M2
class: review
killer: false
depends_on: [i8-m1-gate]
---
<<<node: tasks/i8-m2-requirements-traced.md>>>
---
id: i8-m2-requirements-traced
statement: Requirements traced — every requirement back to a need.
milestone: M2
class: executed
killer: false
verify: coverage:req-traced
depends_on: [i8-m1-gate]
---
<<<node: tasks/i8-m2-requirements-verifiable.md>>>
---
id: i8-m2-requirements-verifiable
statement: Requirements verifiable — every requirement has a test.
milestone: M2
class: executed
killer: false
verify: coverage:req-has-test
depends_on: [i8-m1-gate]
---
<<<node: tasks/i8-m2-stakeholder-coverage.md>>>
---
id: i8-m2-stakeholder-coverage
statement: Stakeholder coverage — no role left out (adjudicating human, driving agent, thin-harness agent, auditor reading the attest record, other-machine user, foreign-data owner in the logs).
milestone: M2
class: review
killer: false
depends_on: [i8-m1-gate]
---
<<<node: tasks/i8-m3-alternatives-elaborated.md>>>
---
id: i8-m3-alternatives-elaborated
statement: At least two viable alternatives elaborated for the load-bearing choices — channel detection for actor stamping, new-vs-blessed discrimination for the EARS lint, log-dir resolution, and kernel-corpus baking.
milestone: M3
class: review
killer: true
depends_on: [i8-m2-gate]
---
<<<node: tasks/i8-m3-criteria-weighted.md>>>
---
id: i8-m3-criteria-weighted
statement: Decision criteria derived from the requirements and weighted — trust-record honesty, determinism, zero-dependency, day-one non-brickage, forward-only churn containment.
milestone: M3
class: review
killer: false
depends_on: [i8-m2-gate]
---
<<<node: tasks/i8-m3-feasibility-checked.md>>>
---
id: i8-m3-feasibility-checked
statement: Feasibility rough-checked per candidate on the real code paths (parse.go, ops.go bless, engine.go hashing, selftest.go harness, resolver.go workspace).
milestone: M3
class: review
killer: false
depends_on: [i8-m2-gate]
---
<<<node: tasks/i8-m3-gate.md>>>
---
id: i8-m3-gate
statement: Milestone M3 (Candidate architectures) passed its review.
milestone: M3
class: review
killer: true
depends_on: [i8-m3-alternatives-elaborated,i8-m3-criteria-weighted,i8-m3-feasibility-checked]
---
<<<node: tasks/i8-m4-adr-recorded.md>>>
---
id: i8-m4-adr-recorded
statement: ADRs recorded and traced — every ADR addresses a requirement.
milestone: M4
class: executed
killer: false
verify: coverage:adr-traced
depends_on: [i8-m3-gate]
---
<<<node: tasks/i8-m4-architecture-stated.md>>>
---
id: i8-m4-architecture-stated
statement: Chosen architecture stated for each load-bearing choice, scored against the weighted criteria.
milestone: M4
class: review
killer: false
depends_on: [i8-m3-gate]
---
<<<node: tasks/i8-m4-choice-traced.md>>>
---
id: i8-m4-choice-traced
statement: Each choice traced to the weighted criteria with a sensitivity check on the closest calls.
milestone: M4
class: review
killer: false
depends_on: [i8-m3-gate]
---
<<<node: tasks/i8-m4-gate.md>>>
---
id: i8-m4-gate
statement: Milestone M4 (Decide the architecture) passed its review.
milestone: M4
class: review
killer: true
depends_on: [i8-m4-architecture-stated,i8-m4-choice-traced,i8-m4-adr-recorded]
---
<<<node: tasks/i8-m5-design-buildable.md>>>
---
id: i8-m5-design-buildable
statement: Design is buildable — spike findings folded back; no blocked path remains toward the build.
milestone: M5
class: review
killer: false
depends_on: [i8-m4-gate]
---
<<<node: tasks/i8-m5-gate.md>>>
---
id: i8-m5-gate
statement: Milestone M5 (Prove the riskiest unknowns) passed its review.
milestone: M5
class: review
killer: true
depends_on: [i8-m5-riskiest-validated,i8-m5-design-buildable,i8-m5-spike-recorded]
---
<<<node: tasks/i8-m5-riskiest-validated.md>>>
---
id: i8-m5-riskiest-validated
statement: Riskiest assumptions validated by spike evidence — interactive-console detection works on Windows terminals, and the strict allowlist parses every existing node in the repo without a single false rejection.
milestone: M5
class: review
killer: true
depends_on: [i8-m4-gate]
---
<<<node: tasks/i8-m5-spike-recorded.md>>>
---
id: i8-m5-spike-recorded
statement: Spike results recorded — findings persisted, design advanced where the evidence demanded it.
milestone: M5
class: review
killer: false
depends_on: [i8-m4-gate]
---
<<<node: tasks/i8-m6-bs-actor-by.md>>>
---
id: i8-m6-bs-actor-by
statement: Channel-stamped bless in ops.go/cli.go — both-chardev stat defaults (console=human, else agent), --by flag override, QUACK_ACTOR retired. Design marker implements req-actor-channels.
milestone: M6
class: review
killer: false
parent: i8-m6-build
depends_on: [i8-m6-bs-strict-parser]
---
<<<node: tasks/i8-m6-bs-cleanup.md>>>
---
id: i8-m6-bs-cleanup
statement: Legacy cleanup the strict parser demands — strip the Obsidian frontmatter from i0001 dashboard_draft.md (sketch, not a node) and delete the stray .quack/engine/quack.exe~; final quack build + full selftest green.
milestone: M6
class: review
killer: false
parent: i8-m6-build
depends_on: [i8-m6-bs-kernel]
---
<<<node: tasks/i8-m6-bs-ears.md>>>
---
id: i8-m6-bs-ears
statement: EARS enforcement — lint rule (five shapes + shall + weasel blocklist), committed stmtHash baseline corpus generated at land, ears:exempt with required reason counted; plus the five-pattern authoring block in compose-reference.md integrated with i7 content. Design markers implement req-ears-lint and req-ears-method.
milestone: M6
class: review
killer: false
parent: i8-m6-build
depends_on: [i8-m6-bs-normws]
---
<<<node: tasks/i8-m6-bs-kernel.md>>>
---
id: i8-m6-bs-kernel
statement: Kernel batteries to green — baked golden vectors (norm/h12/stmtHash/fold incl. normWS), exact-cone fixtures (linear, diamond, shared subtree), gate state-machine walk, attest prev_hash chain verification (migrated-null anchor, tamper detection), fixed-seed xorshift property DAGs. Design marker implements req-kernel-selftest.
milestone: M6
class: review
killer: false
parent: i8-m6-build
depends_on: [i8-m6-bs-logsdir]
---
<<<node: tasks/i8-m6-bs-logsdir.md>>>
---
id: i8-m6-bs-logsdir
statement: Engine-owned log-dir resolution (LOCALAPPDATA/XDG + name-hash slug, config.toml override), migrate the 122 MB under .quack/logs out (count+size verified, foreign folders included), and point the method prompts (review retro, AGENTS) at the new location so future sessions find the logs. Design marker implements req-logs-out-of-repo.
milestone: M6
class: review
killer: false
parent: i8-m6-build
depends_on: [i8-m6-bs-monotonic]
---
<<<node: tasks/i8-m6-bs-monotonic.md>>>
---
id: i8-m6-bs-monotonic
statement: Milestone-monotonic lint — flag any milestone subtask whose dependency chain does not pass through the prior milestone gate. Design marker implements req-monotonic-lint.
milestone: M6
class: review
killer: false
parent: i8-m6-build
depends_on: [i8-m6-bs-ears]
---
<<<node: tasks/i8-m6-bs-normws.md>>>
---
id: i8-m6-bs-normws
statement: Case-preserving whitespace-collapse normWS for design-region hashing in engine.go (one hash, comments retained); quack build re-baseline; walk the one-time R5 ripple honestly. Design marker implements req-design-hash-norm.
milestone: M6
class: review
killer: false
parent: i8-m6-build
depends_on: [i8-m6-bs-actor-by]
---
<<<node: tasks/i8-m6-bs-runners.md>>>
---
id: i8-m6-bs-runners
statement: Author ALL twelve new selftest runners (parser-strict, ref-integrity, actor-channels, design-hash-norm, kernel-vectors, kernel-cone, kernel-gatewalk, kernel-attest, logs-dir, ears-lint, ears-method, monotonic-lint) registered in the battery, with compile-only stubs for not-yet-existing functions; run the suite, watch every one FAIL, and record observe-red for each new test node.
milestone: M6
class: review
killer: false
parent: i8-m6-build
depends_on: [i8-m6-build-planned]
---
<<<node: tasks/i8-m6-bs-strict-parser.md>>>
---
id: i8-m6-bs-strict-parser
statement: Strict load in parse.go/engine.go — first-line-fence recognition, the final M5 allowlist (node + iteration.md classes), batched file+key+direction errors, duplicate-id and both-direction ref rejection, nonzero exit on every graph-consuming command. Design markers implement req-strict-frontmatter and req-ref-integrity.
milestone: M6
class: review
killer: false
parent: i8-m6-build
depends_on: [i8-m6-tests-red-observed]
---
<<<node: tasks/i8-m6-build-planned.md>>>
---
id: i8-m6-build-planned
statement: Build planned — decomposed into small, resumable steps seeded as children of the build task, in dependency order, test-runners-first so RED can be observed before implementation.
milestone: M6
class: review
killer: true
depends_on: [i8-m5-gate]
---
<<<node: tasks/i8-m6-build.md>>>
---
id: i8-m6-build
statement: Build — the planned steps nested beneath it are realized.
milestone: M6
class: review
killer: false
depends_on: [i8-m6-bs-cleanup]
---
<<<node: tasks/i8-m6-detailed-design-complete.md>>>
---
id: i8-m6-detailed-design-complete
statement: Detailed design complete — every requirement has a realized design.
milestone: M6
class: executed
killer: false
verify: coverage:designs-realized
depends_on: [i8-m6-build]
---
<<<node: tasks/i8-m6-gate.md>>>
---
id: i8-m6-gate
statement: Milestone M6 (Build and verify) passed its review.
milestone: M6
class: review
killer: true
depends_on: [i8-m6-build-planned,i8-m6-tests-red-observed,i8-m6-build,i8-m6-detailed-design-complete,i8-m6-internal-quality-ok,i8-m6-verification-green,i8-m6-impl-risks-acceptable]
---
<<<node: tasks/i8-m6-impl-risks-acceptable.md>>>
---
id: i8-m6-impl-risks-acceptable
statement: Implementation risks acceptable — day-one allowlist completeness re-verified on the live repo, log migration completed without data loss, EARS lint confirmed forward-only on the blessed history.
milestone: M6
class: review
killer: false
depends_on: [i8-m6-build]
---
<<<node: tasks/i8-m6-internal-quality-ok.md>>>
---
id: i8-m6-internal-quality-ok
statement: Internal quality ok — the new code reviewed against the engine's own idiom; no bolted-on quality.
milestone: M6
class: review
killer: false
depends_on: [i8-m6-build]
---
<<<node: tasks/i8-m6-tests-red-observed.md>>>
---
id: i8-m6-tests-red-observed
statement: Suite observed RED — every new test ran and failed before the build.
milestone: M6
class: executed
killer: false
verify: coverage:tests-red
depends_on: [i8-m6-bs-runners]
---
<<<node: tasks/i8-m6-verification-green.md>>>
---
id: i8-m6-verification-green
statement: Verification green — every test passes, across all iterations.
milestone: M6
class: executed
killer: false
verify: coverage:tests-pass
depends_on: [i8-m6-build]
---
<<<node: tasks/i8-m7-acceptance-obtained.md>>>
---
id: i8-m7-acceptance-obtained
statement: Acceptance obtained — sign-off evidence recorded.
milestone: M7
class: review
killer: false
depends_on: [i8-m6-gate]
---
<<<node: tasks/i8-m7-gate.md>>>
---
id: i8-m7-gate
statement: Milestone M7 (Validate and accept) passed its review.
milestone: M7
class: review
killer: true
depends_on: [i8-m7-meets-need,i8-m7-killer-ucs-demonstrated,i8-m7-acceptance-obtained,i8-m7-validation-gaps]
---
<<<node: tasks/i8-m7-killer-ucs-demonstrated.md>>>
---
id: i8-m7-killer-ucs-demonstrated
statement: Killer use-cases demonstrated end-to-end for real — a bad key rejected live, an agent bless stamped agent, a gofmt pass reopening nothing, selftest green from the shipped binary, logs written outside the repo, a weasel requirement flagged.
milestone: M7
class: review
killer: false
depends_on: [i8-m6-gate]
---
<<<node: tasks/i8-m7-meets-need.md>>>
---
id: i8-m7-meets-need
statement: Meets the need — validated against ALL needs across every iteration, demonstrated by the Ch1 success criteria.
milestone: M7
class: review
killer: true
depends_on: [i8-m6-gate]
---
<<<node: tasks/i8-m7-validation-gaps.md>>>
---
id: i8-m7-validation-gaps
statement: Validation gaps captured (RAID) — anything the walk surfaced but did not close, logged with owner and route.
milestone: M7
class: review
killer: false
depends_on: [i8-m6-gate]
---
<<<node: tasks/i8-m8-config-baselined.md>>>
---
id: i8-m8-config-baselined
statement: Configuration baselined — config.toml, .gitattributes holding, the log-dir override documented.
milestone: M8
class: review
killer: false
depends_on: [i8-m7-gate]
---
<<<node: tasks/i8-m8-docs-complete.md>>>
---
id: i8-m8-docs-complete
statement: Docs complete and matching the actual surface — AGENTS.md, dependencies, compose-reference, README (the missing docs/report.png fixed or dropped).
milestone: M8
class: review
killer: true
depends_on: [i8-m7-gate]
---
<<<node: tasks/i8-m8-gate.md>>>
---
id: i8-m8-gate
statement: Milestone M8 (Package and hand over) passed its review.
milestone: M8
class: review
killer: true
depends_on: [i8-m8-docs-complete,i8-m8-packaged-versioned,i8-m8-config-baselined,i8-m8-handover-accepted]
---
<<<node: tasks/i8-m8-handover-accepted.md>>>
---
id: i8-m8-handover-accepted
statement: Handover accepted — the iteration record is self-explaining for the next session; scope notes archived with their outcomes.
milestone: M8
class: review
killer: false
depends_on: [i8-m7-gate]
---
<<<node: tasks/i8-m8-packaged-versioned.md>>>
---
id: i8-m8-packaged-versioned
statement: Packaged and versioned — the engine rebuilt and re-baselined, stray artifacts (quack.exe~) gone.
milestone: M8
class: review
killer: false
depends_on: [i8-m7-gate]
---
<<<node: test-actor-channels.md>>>
---
id: test-actor-channels
type: test
statement: A non-interactive bless stamps actor=agent by default, --by human overrides it, the interactive-console path resolves human, and QUACK_ACTOR no longer influences the stamp.
class: executed
verify: selftest:actor-channels
killer: false
---
<<<node: test-design-hash-norm.md>>>
---
id: test-design-hash-norm
type: test
statement: Whitespace-only reformatting of a design region leaves its folded hash unchanged; editing a comment inside the region changes it.
class: executed
verify: selftest:design-hash-norm
killer: false
---
<<<node: test-ears-authoring.md>>>
---
id: test-ears-authoring
type: test
statement: EARS-shaped requirement statements are enforced at authoring and lint time.
class: executed
verify: selftest:ears-lint ears-method
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. A new non-EARS or weasel-worded requirement is flagged with nonzero exit; an ears-exempt node carrying a reason is counted, not flagged; a pre-existing blessed statement is never flagged. *(was test-ears-lint)*
2. compose-reference.md carries all five EARS shapes and the authoring instruction alongside the intact i7 tests-red and roles content (doc-test, mechanized). *(was test-ears-method)*
<<<node: test-kernel-selftest.md>>>
---
id: test-kernel-selftest
type: test
statement: The trust kernel verifies from baked deterministic corpora: hash vectors, suspect cones, the gate walk, and attest chains.
class: executed
verify: selftest:kernel-attest kernel-cone kernel-gatewalk kernel-vectors
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. The attest prev_hash chain verifies end-to-end from the migrated-null anchor, and a tampered middle event is detected. *(was test-kernel-attest)*
2. On baked linear, diamond, and shared-subtree fixture DAGs, changing one upstream reopens EXACTLY the expected set; fixed-seed property DAGs assert reopened equals blessed descendants of the change. *(was test-kernel-cone)*
3. The gate state machine walks open, bless, done, dependency-hash change, suspect, re-bless on a fixture; executed checks recompute live throughout. *(was test-kernel-gatewalk)*
4. Golden vectors — norm, h12, statement hash, and full-fold of baked inputs equal their known digests. *(was test-kernel-vectors)*
<<<node: test-logs-out.md>>>
---
id: test-logs-out
type: test
statement: The engine resolves its log directory to the stable user-scoped location, honors the config.toml override, and writes no log under the workspace.
class: executed
verify: selftest:logs-dir
killer: false
---
<<<node: test-structural-strictness.md>>>
---
id: test-structural-strictness
type: test
statement: Structurally invalid input is refused: malformed frontmatter, dangling references, mis-wired milestone chains.
class: executed
verify: selftest:monotonic-lint ref-integrity parser-strict
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. A fixture iteration whose M-n subtask skips the M-n-minus-1 gate is flagged by lint with nonzero exit; the correctly wired fixture passes. *(was test-monotonic-lint)*
2. A node referencing a missing id through any edge field makes the engine exit nonzero naming the dangling reference and its direction. *(was test-ref-integrity)*
3. A node file with malformed frontmatter or an unknown key (the depends-on typo) makes the engine exit nonzero naming the file and key, while every allowlisted key including the i7 additions still parses clean. *(was test-strict-frontmatter)*
<<<node: uc-ears-requirements.md>>>
---
id: uc-ears-requirements
type: usecase
statement: New requirements composed at systematic rigor arrive EARS-shaped and weasel-word-free, enforced by deterministic lint. This is forward-only and never retrofits blessed statements.
class: review
killer: false
---
## Rationale (not load-bearing)
Red-teamed and settled: retrofit + mass re-bless is a rubber-stamp factory and orphans ledger-wide hashes. Forward-only, with counted `ears: exempt` escapes.
<<<node: uc-fail-loud-parsing.md>>>
---
id: uc-fail-loud-parsing
type: usecase
statement: ISO/IEC 25010 Reliability/Integrity: malformed or unknown node input can never silently shrink the suspect cone. The engine refuses loudly and names the offender.
class: review
killer: false
---
## Rationale (not load-bearing)
A typo (`depends-on` for `depends_on`) silently dropping an edge is the one failure the tool exists to prevent. Scope: NODE frontmatter only; the gather lane stays format-promiscuous.
<<<node: uc-honest-adjudication.md>>>
---
id: uc-honest-adjudication
type: usecase
statement: The attest record names the true adjudicator. Channel defaults match reality: interactive console equals human, harness-invoked equals agent. An explicit flag overrides both, so omission errs toward under-claiming human oversight.
class: review
killer: false
---
## Rationale (not load-bearing)
The realistic failure is omission, not malice: forgetting the QUACK_ACTOR env dance stamps an agent bless as human and blinds the self-cert metric. Make the accurate record the path of least resistance.
<<<node: uc-kernel-selftested.md>>>
---
id: uc-kernel-selftested
type: usecase
statement: The trust kernel proves itself on any machine through the shipped dependency-free selftest: hash vectors, suspect-cone exactness, the gate state machine, parser strictness, and the attest chain. This needs no toolchain and no unseeded randomness.
class: review
killer: false
---
## Rationale (not load-bearing)
Never `go test`: Windows flags freshly built test binaries; selftest ships inside the signed-once binary.
<<<node: uc-monotonic-walk.md>>>
---
id: uc-monotonic-walk
type: usecase
statement: A composed checklist cannot let `quack next` jump a later milestone ahead of an unblessed gate. Milestone-monotonic wiring is verified mechanically, not by composer discipline.
class: review
killer: false
---
## Rationale (not load-bearing)
Caught live in i0002: M6 build-* checks were ready before the M5 spike. The compose rule exists in engage.md; this makes the engine enforce it. Pulled from backlog at the i8 M1 gate (the owner, 2026-07-02).
<<<node: uc-stable-design-hashes.md>>>
---
id: uc-stable-design-hashes
type: usecase
statement: Pure reformatting churn (gofmt, whitespace) never reopens a design. Any content change does, including comments inside the region, which are design content.
class: review
killer: false
---
<<<node: uc-workspace-hygiene.md>>>
---
id: uc-workspace-hygiene
type: usecase
statement: Engine session logs live in a stable user-scoped directory outside the repo. There is no repo bloat, no foreign personal data under version control. They are cross-project searchable and never OS-purged.
class: review
killer: false
---
## Rationale (not load-bearing)
~123 MB sits under .quack/logs today, including foreign trader/sebot session+memory files (personal data). A temp dir is wrong (OS-cleaned); a stable per-user data dir is right.
