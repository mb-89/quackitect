# M5 — Spike findings (i0003_engine_vehicle_go)

A timeboxed walking-skeleton spike to validate the two riskiest unknowns — the M1-override kill-criteria.

## Goal  → i3-m5-riskiest-validated *(killer)*

- **R1 — Go report determinism.** Go map iteration is randomized; the report integrity root must be stable.
- **R2 — behavior parity.** The Go engine must reproduce Python's hashing (`norm`, `stmt_hash`, `full_hash` merkle fold) exactly, or the method silently changes.

## Method

- Replicated `engine.norm` / `stmt_hash` / `full_hash` in Go — `.quack/spikes/i3-go-parity/main.go` (throwaway).
- Ran the **same synthetic mini-graph** (A; B refines A with messy `\n`+double-space whitespace; C depends on A+B) through the **real Python engine** (`ref.py`, importing `quackitect.engine`) and through Go.
- Compared every node hash, the `stmt_hash`, and a merkle root built by iterating the node map in **sorted key order**, twice.

## Result — both validated

| value | Go | Python |
|---|---|---|
| A / B / C full_hash | `418a01d6bab3` / `b40d9ac31ba6` / `1130a9350a1b` | identical |
| stmt_hash C | `334c630e24e5` | identical |
| root run1 / run2 | `16287b4afb34` / `16287b4afb34` | identical |

- **R2 parity:** byte-identical, including whitespace/newline normalization (Go `strings.Fields` matches Python `str.split()`) and the seed format `norm|verify|depHashes|regionHash`.
- **R1 determinism:** `run1 == run2`. Sorting keys before iteration removes the map-order nondeterminism. The technique works.

## Design is buildable  → i3-m5-design-buildable

The engine maps cleanly onto the Go standard library — `crypto/sha256`, `sort`, `strings`, `os`, `encoding/json`, `html/template`, `archive/zip`. No third-party dependency is needed, so `req-zero-dep-parse` and `req-go-engine` hold. Hand-rolled frontmatter/TOML parsing is trivial for the subset in use.

## Kill-criterion check

The M1 override's kill-criterion was: *if the spike shows parity/determinism shakier than expected, split the report/filter work into a follow-on version.* Parity is **solid**, so the criterion is **not triggered** — i0003 keeps its full scope.

## Residual risks → carry into M6

- Determinism must hold over the **full** trace + the **report HTML** (`html/template`), not just the synthetic primitive. → extend `test-parity-golden` to the real spec and the rendered report.
- Parser edge cases (quoting, list syntax, CRLF) — cover with fixtures in the parity suite.
- `os.startfile`/open-report and `git` stamp are platform shells — keep the graceful fallbacks.
