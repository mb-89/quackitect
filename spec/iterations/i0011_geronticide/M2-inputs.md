# M2 — Requirements (i0011_geronticide, lean L2)

## Requirements stated, each checkable  → i11-m2-reqs-stated

Nine EARS requirements. Minted at compose, lint-clean (0 exemptions). Constraints they honor:

- **Truth stays append-only where it is truth**: the stamp migration (req-stamp-user) is one audited pass with the metric spanning eras — never silent rewriting.
- **Honesty over convenience**: exemptions become explicit markers (req-testsred-exempt) or recorded decisions (req-grandfathers-decided) — nothing is quietly fixed by fabricating evidence.
- **Zero-dep, one binary, selftest seams** — unchanged standing constraints.

Traceability computes live: every requirement refines a use case under `need-review` (three new use cases plus i10's `uc-user-wording`), and every requirement carries a selftest-wired test. Both derived checks are green on this board.

## Milestone review  → i11-m2-gate

**Verify:** 9/9 statements EARS-shaped, each naming its checkable outcome. The two coverage checks compute green. **Validate:** the set covers M1's four success outcomes exactly:

- parity/suspect/pager under honest-board
- hashing/cap under verdict-integrity
- the stamp under user-wording
- markers/decisions/lanes under no-grandfathers

**Red-team:** weakest statement probed — req-grandfathers-decided could be satisfied by rubber-stamp ADRs. Bounded: the L3 gate reviews the decisions' substance, and the test fails on any exemption without one. **Verdict: PASS.**
