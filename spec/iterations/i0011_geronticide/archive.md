<<<quackitect-archive v1>>>
<<<node: iteration.md>>>
---
iteration: i0011_geronticide
status: active
type: default
rigor: lean
---

Kill the grandfathers and the small lies: parity out of the verification suites, honest suspect roots, scoped pagers, hashed evidence, records that say user, and no legacy lanes left standing.
<<<node: req-evidence-ledger.md>>>
---
id: req-evidence-ledger
type: requirement
statement: The engine shall fold evidence docs into check hashes and cap each check's stored verdicts. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When a milestone evidence doc changes after its gate was blessed, the engine shall flip the affected checks suspect - evidence docs fold into the check hashes. *(was req-evidence-hashed)*
2. If a check holds more evidence verdict files than a fixed bound, then the engine shall delete the oldest files beyond that bound. *(was req-evidence-cache-cap)*
<<<node: req-legacy-decided.md>>>
---
id: req-legacy-decided
ears: exempt - historical pre-EARS statement, retire-or-retrofit recorded (adr-grandfathers-historical)
type: requirement
statement: No grandfathered legacy shall survive undecided. Exemptions carry recorded markers and decisions. Retired lanes stay retired. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The spec shall carry no grandfathered exemption without a recorded decision - every EARS baseline entry and every pre-i4 unrealized design region carries a retire-or-retrofit ADR. *(was req-grandfathers-decided)*
2. Where a test predates the red-observation mechanism, its exemption shall be an explicit recorded marker on the node, never a source-code date constant. *(was req-testsred-exempt)*
3. The engine shall resolve vendored assets from tools/vendor and the dogfood product tree only - the .quack vendor lanes and the engine.local pointer are retired. *(was req-legacy-lanes-retired)*
<<<node: req-parity-standalone.md>>>
---
id: req-parity-standalone
type: requirement
depends_on: []
statement: The tests-pass battery shall exclude the golden-root tamper check, which runs as its own standalone check with its own board entry.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [portability, reliability]
---
## Rationale (not load-bearing)
TODO
<<<node: req-stamp-user.md>>>
---
id: req-stamp-user
type: requirement
depends_on: []
statement: The ledger shall record adjudication actors as user in place of human, with existing records migrated in one audited pass and the self-cert metric spanning both eras.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [security]
---
## Rationale (not load-bearing)
TODO
<<<node: req-suspicion-attribution.md>>>
---
id: req-suspicion-attribution
type: requirement
statement: The readouts shall attribute suspicion precisely. A propagated check names its root, and the pager scopes to the check in hand. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When a check is suspect only through propagation, status, why, and the pager shall mark it as propagated and name the root check that drags the cone. *(was req-suspect-root)*
2. When quack progress --pager targets a killer subtask, the readiness section shall scope to that check itself - its own upstreams and evidence - never the whole milestone. *(was req-pager-scope)*
<<<node: tasks/i11-bs-cache-cap.md>>>
---
id: i11-bs-cache-cap
statement: Evidence verdict files bounded per check, oldest evicted. Realizes req-evidence-cache-cap.
milestone: M4
class: review
killer: false
parent: i11-m4-build
depends_on: [i11-m4-tests-red]
---
<<<node: tasks/i11-bs-evidence-hash.md>>>
---
id: i11-bs-evidence-hash
statement: Milestone evidence docs fold into check hashes; edits after bless flip suspect. Realizes req-evidence-hashed.
milestone: M4
class: review
killer: false
parent: i11-m4-build
depends_on: [i11-m4-tests-red]
---
<<<node: tasks/i11-bs-grandfather-adrs.md>>>
---
id: i11-bs-grandfather-adrs
statement: The retire-or-retrofit decisions executed: every EARS baseline entry and pre-i4 unrealized design carries its ADR. Realizes req-grandfathers-decided.
milestone: M4
class: review
killer: false
parent: i11-m4-build
depends_on: [i11-m4-tests-red]
---
<<<node: tasks/i11-bs-legacy-lanes.md>>>
---
id: i11-bs-legacy-lanes
statement: The .quack vendor lanes and the engine.local branch retire from resolver, launcher, and stubs. Realizes req-legacy-lanes-retired.
milestone: M4
class: review
killer: false
parent: i11-m4-build
depends_on: [i11-m4-tests-red]
---
<<<node: tasks/i11-bs-pager-scope.md>>>
---
id: i11-bs-pager-scope
statement: Killer-subtask pagers scope readiness to the check itself. Realizes req-pager-scope.
milestone: M4
class: review
killer: false
parent: i11-m4-build
depends_on: [i11-m4-tests-red]
---
<<<node: tasks/i11-bs-parity.md>>>
---
id: i11-bs-parity
statement: Parity out of the battery: standalone tamper check with its own board entry. Realizes req-parity-standalone.
milestone: M4
class: review
killer: false
parent: i11-m4-build
depends_on: [i11-m4-tests-red]
---
<<<node: tasks/i11-bs-stamp-user.md>>>
---
id: i11-bs-stamp-user
statement: Ledger migration: actor=user recorded and history migrated in one audited pass; self-cert metric spans both eras. Realizes req-stamp-user.
milestone: M4
class: review
killer: false
parent: i11-m4-build
depends_on: [i11-m4-tests-red]
---
<<<node: tasks/i11-bs-suspect-root.md>>>
---
id: i11-bs-suspect-root
statement: Propagated suspects marked and rooted in status, why, and the pager. Realizes req-suspect-root.
milestone: M4
class: review
killer: false
parent: i11-m4-build
depends_on: [i11-m4-tests-red]
---
<<<node: tasks/i11-bs-testsred-marker.md>>>
---
id: i11-bs-testsred-marker
statement: The testsRedSince date constant dies; pre-mechanism tests carry explicit exemption markers. Realizes req-testsred-exempt.
milestone: M4
class: review
killer: false
parent: i11-m4-build
depends_on: [i11-m4-tests-red]
---
<<<node: tasks/i11-m1-gate.md>>>
---
id: i11-m1-gate
statement: L1 frame gate.
milestone: M1
class: review
killer: true
depends_on: [i11-m1-problem-success]
---
<<<node: tasks/i11-m1-problem-success.md>>>
---
id: i11-m1-problem-success
statement: The problem and success are stated: grandfathered exemptions and display lies erode trust in the board; success = red means regression, every exemption is a decision, records say user.
milestone: M1
class: review
killer: true
depends_on: []
---
<<<node: tasks/i11-m2-gate.md>>>
---
id: i11-m2-gate
statement: L2 requirements gate.
milestone: M2
class: review
killer: true
depends_on: [i11-m2-reqs-stated, i11-m2-req-traced, i11-m2-req-has-test, i11-m1-gate]
---
<<<node: tasks/i11-m2-req-has-test.md>>>
---
id: i11-m2-req-has-test
statement: Every requirement has a test.
milestone: M2
class: executed
killer: false
verify: coverage:req-has-test
depends_on: [i11-m1-gate]
---
<<<node: tasks/i11-m2-req-traced.md>>>
---
id: i11-m2-req-traced
statement: Every requirement traces back to a need.
milestone: M2
class: executed
killer: false
verify: coverage:req-traced
depends_on: [i11-m1-gate]
---
<<<node: tasks/i11-m2-reqs-stated.md>>>
---
id: i11-m2-reqs-stated
statement: Nine requirements stated, each checkable (EARS, lint-clean).
milestone: M2
class: review
killer: true
depends_on: [i11-m1-gate]
---
<<<node: tasks/i11-m3-adr-traced.md>>>
---
id: i11-m3-adr-traced
statement: Every ADR addresses a requirement.
milestone: M3
class: executed
killer: false
verify: coverage:adr-traced
depends_on: [i11-m2-gate]
---
<<<node: tasks/i11-m3-approach-chosen.md>>>
---
id: i11-m3-approach-chosen
statement: Approach recorded per item with the deciding reason; the stamp migration and the retire-or-retrofit calls (EARS baseline, pre-i4 designs) carry ADRs.
milestone: M3
class: review
killer: false
depends_on: [i11-m2-gate]
---
<<<node: tasks/i11-m3-gate.md>>>
---
id: i11-m3-gate
statement: L3 design gate.
milestone: M3
class: review
killer: true
depends_on: [i11-m3-approach-chosen, i11-m3-adr-traced, i11-m2-gate]
---
<<<node: tasks/i11-m4-build.md>>>
---
id: i11-m4-build
statement: The planned steps nested beneath are realized.
milestone: M4
class: review
killer: false
depends_on: [i11-bs-parity, i11-bs-pager-scope, i11-bs-suspect-root, i11-bs-evidence-hash, i11-bs-cache-cap, i11-bs-stamp-user, i11-bs-testsred-marker, i11-bs-legacy-lanes, i11-bs-grandfather-adrs]
---
<<<node: tasks/i11-m4-designs-realized.md>>>
---
id: i11-m4-designs-realized
statement: Every requirement has a realized design.
milestone: M4
class: executed
killer: false
verify: coverage:designs-realized
depends_on: [i11-m3-gate]
---
<<<node: tasks/i11-m4-gate.md>>>
---
id: i11-m4-gate
statement: L4 build-and-test gate.
milestone: M4
class: review
killer: true
depends_on: [i11-m4-tests-red, i11-m4-build, i11-m4-designs-realized, i11-m4-tests-pass, i11-m4-internal-quality, i11-m3-gate]
---
<<<node: tasks/i11-m4-internal-quality.md>>>
---
id: i11-m4-internal-quality
statement: Internal quality reviewed: zero-dep, selftest seams, voice.
milestone: M4
class: review
killer: false
depends_on: [i11-m4-build]
---
<<<node: tasks/i11-m4-tests-pass.md>>>
---
id: i11-m4-tests-pass
statement: Every test passes, across all iterations.
milestone: M4
class: executed
killer: true
verify: coverage:tests-pass
depends_on: [i11-m3-gate]
---
<<<node: tasks/i11-m4-tests-red.md>>>
---
id: i11-m4-tests-red
statement: Every new test ran and failed before the build.
milestone: M4
class: executed
killer: false
verify: coverage:tests-red
depends_on: [i11-m3-gate]
---
<<<node: tasks/i11-m5-docs-match.md>>>
---
id: i11-m5-docs-match
statement: Docs match the surface after the removals: README, AGENTS, method prompts, CLI help, migration note.
milestone: M5
class: review
killer: true
depends_on: [i11-m4-gate]
---
<<<node: tasks/i11-m5-gate.md>>>
---
id: i11-m5-gate
statement: L5 docs-and-ship gate, then engage ship.
milestone: M5
class: review
killer: true
depends_on: [i11-m5-docs-match, i11-m5-packaged, i11-m4-gate]
---
<<<node: tasks/i11-m5-packaged.md>>>
---
id: i11-m5-packaged
statement: Packaged: binary + stamp + migrated ledger; ship-ready.
milestone: M5
class: review
killer: false
depends_on: [i11-m4-gate]
---
<<<node: test-evidence-ledger.md>>>
---
id: test-evidence-ledger
type: test
statement: Evidence docs fold into check hashes and stored verdicts stay capped.
class: executed
verify: selftest:evidence-cache-cap evidence-hashed
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. Writing more verdict files than the bound leaves exactly the bound, oldest evicted. *(was test-evidence-cache-cap)*
2. Editing a blessed milestone evidence doc flips its gate suspect; an untouched doc flips nothing. *(was test-evidence-hashed)*
<<<node: test-legacy-decided.md>>>
---
id: test-legacy-decided
type: test
statement: No grandfathered legacy survives undecided. Exemptions carry recorded markers, and retired lanes stay retired.
class: executed
verify: selftest:grandfathers-decided legacy-lanes-retired testsred-exempt
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. Every EARS exemption and pre-i4 unrealized design maps to a retire-or-retrofit ADR; one without fails the check. *(was test-grandfathers-decided)*
2. The resolver finds tools/vendor and product only; a .quack vendor tree is ignored; the stub launcher carries no engine.local branch. *(was test-legacy-lanes-retired)*
3. A pre-mechanism test carries its exemption marker; the date constant is gone from the engine source. *(was test-testsred-exempt)*
<<<node: test-parity-standalone.md>>>
---
id: test-parity-standalone
type: test
statement: No tests-pass evaluation runs the tamper check; the standalone check exists and computes; a moved golden root reddens only it.
class: executed
verify: selftest:parity-standalone
killer: false
---
## Rationale (not load-bearing)
TODO
<<<node: test-stamp-user.md>>>
---
id: test-stamp-user
type: test
statement: New blesses record actor=user; migrated history reads user; the self-cert metric counts both eras as one.
class: executed
verify: selftest:stamp-user
killer: false
---
## Rationale (not load-bearing)
TODO
<<<node: test-suspicion-attribution.md>>>
---
id: test-suspicion-attribution
type: test
statement: Suspicion is attributed precisely. A propagated check names its root, and the pager scopes to the check in hand.
class: executed
verify: selftest:pager-scope suspect-root
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. A killer-subtask pager on a fresh milestone reports its own readiness, not subtasks 0/N. *(was test-pager-scope)*
2. A cone dragged by one OPEN root reads propagated with the root named; a direct suspect stays direct. *(was test-suspect-root)*
<<<node: uc-honest-board.md>>>
---
id: uc-honest-board
type: usecase
statement: The user reads a board where red means a real regression and every suspect names its root. No ceremony alarms, no flashing history.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
<<<node: uc-no-grandfathers.md>>>
---
id: uc-no-grandfathers
type: usecase
statement: No grandfathered exemption survives without an explicit recorded decision.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
<<<node: uc-verdict-integrity.md>>>
---
id: uc-verdict-integrity
type: usecase
statement: A blessed verdict cannot silently change under its link. Evidence is hashed; test-first exemptions are explicit records.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
