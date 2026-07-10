# M1 - Frame (i0017_pruning, lean)

TL;DR: Sixteen iterations accumulated ~1000 requirements, sixteen task graphs, session logs, and prose written for mechanisms that have since evolved. Done well means a materially smaller working set - fewer, denser trace nodes; compacted shipped iterations; code hardened by standard Go analysis; rules-as-data where rules are data - with ZERO lost ledger truth. The docs round is owner-led at M5.

## Problem and success stated  -> i17-m1-problem
**The problem, per the six field items:** the design input blew up (~1000 requirements - too many to review, weigh, or love); three metrics nobody consults (owner testimony + agent testimony recorded); prose that names dead mechanisms; shipped iterations and logs that weigh on every load and every read; code that grew sixteen iterations of seams without a linter's eye; rules hardcoded that are really data.

**Success, checkable:** requirement count materially below the 2026-07-10 baseline with trace and verification intact; the three metrics gone from every surface; the retired-vocabulary lint clean; a compaction mechanism that preserves ledger hashes and evidence on a fixture; the build failing on planted vet/format findings; at least the first rule-sets loading from config; the owner's docs verdict recorded.

**State of the art, scanned online 2026-07-10:**
- **Requirement granularity**: ISO/IEC/IEEE 29148 demands singular, stand-alone requirements; INCOSE's 2023 guide conforms. The owner's clustering ruling KNOWINGLY diverges - the M3 decision must reconcile (candidate synthesis: cluster NODES whose bodies carry several singular shall-statements, keeping statement-level singularity while collapsing node count; the EARS lint is statement-level and survives).
- **Go analysis**: golangci-lint is the de-facto meta-standard (Kubernetes, Prometheus); staticcheck the curated core; vet+gofmt ride the stdlib toolchain we already require. The zero-dep law binds the RUNTIME, not the dev lane - the M3 decision picks the set and its acquisition pattern (stdlib-only vs grab-if-present external binary).
- **Prompt linting**: young field, mostly security/injection scanners (PromptLint, promptsage) - none fits method-prompt hygiene. The honest fit is our OWN Vale-class prose lane (go-register-vale, already in-engine): the retired-vocabulary lint as a DATA-DRIVEN rule set - which makes field items 3 and 6 one mechanism (rules-as-config, self-referentially proven).
- **Compaction**: the event-sourcing snapshot pattern and Kafka-style log compaction are the prior art - keep the truth (events/hashes), snapshot the state, archive the working files. The merkle constraint is ours alone: whatever compacts must not move a single recorded hash.

**Red team - the case AGAINST pruning, steelmanned:**
- Atomic-requirements orthodoxy exists for reasons: precise verification targets, clean change isolation, unambiguous tracing. Clustering trades all three for reviewability. The mitigation must be structural (singular statements INSIDE cluster bodies; per-statement verification stays possible), not just taste.
- Compaction risks the archaeology: today every past decision is greppable in place. Mitigation: archives stay text, stay in-repo or in a named archive home, and the ledger NEVER compacts - only working-set files do.
- Deleting the three metrics burns optionality - they were cheap to keep. Counter: they cost render surface, reader attention, and maintenance; nothing that was never consulted in ten iterations earns those. Removal is reversible from git history.
- "Cleanup iterations" famously sprawl. Guard: lean rigor, the owner's light-on-features ruling, and the M3 scope card naming what does NOT happen (no new model kinds, no new surfaces).

**Kill-criterion:** if the compaction spike cannot preserve every ledger hash on a fixture iteration, item 4 ships as archive-by-convention (a documented manual move) instead of a mechanism - and says so.

## Milestone review  -> i17-m1-gate
**Verify:** the six field notes are captured and traced here; the sota scan carries live sources; both testimonies on the metrics are recorded. **Validate:** the frame covers all six items plus the owner's working-mode ruling (solo until M5's docs round). **Red-team:** argued above, per item. **Verdict: PASS** - hand-off for the combined killer + gate.
