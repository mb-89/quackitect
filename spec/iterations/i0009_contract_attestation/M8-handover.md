# M8 — Package & hand over (i0009_contract_attestation)

## Configuration baselined → i9-m8-config-baselined
- EARS baseline re-recorded at feature-land: 102 requirement statement hashes into `spec/ledger/ears-baseline.json` (the i9 statements now blessed history, forward-only from here).
- `spec/project.toml` is the committed configuration and root marker; the golden root is machine-local by design (data home) and re-baselines with every `quack build`.
- The attest ledger carries the full iteration record at `spec/ledger/attest.json` — including the actor-honest stamps of this walk (console grant, agent blesses, delegated human batches).

## Docs complete & match the actual surface → i9-m8-docs-complete
- **Entry files**: AGENTS.md and .github/copilot-instructions.md are RENDERED from contract.md (this iteration's own mechanism) and regenerate inside every `quack build`; drift is a lint failure. The contract itself carries the attest ritual as its final section.
- **dependencies.md**: rewritten for the global-binary world (bootstrap, ratchet, `product\tools` shim).
- **Method prompts**: engage/review/note/compose-reference de-.quacked (data-home paths, `spec/project.toml`, engine-lane note capture); engage.md carries the backward-cumulative V&V wording matching the shipped rule.
- **README**: the dead `.quack/out/report.png` reference dropped in favor of the `quack report` instruction (the "resolves or dropped" criterion, dropped side); no `.quack` mention remains.
- Deliberately quiet: `attest` stays out of `--help` — the unlock path is discoverable only through the contract, which is the design, and is documented THERE.

## Packaged & versioned → i9-m8-packaged-versioned
The deliverable is the engine source (vendored in every repo) + the global binary it ratchets into + the rendered entry files + the method layer. Engine version string stays `0.0.1-go` (pre-release line, unchanged since i0003 — version discipline for releases is future work, noted). `quack ship` packages `product/` from the data home at `engage ship`.

## Handover accepted → i9-m8-handover-accepted
Hand-back to the adjudicator: the workspace runs entirely on the new machinery (this very walk did), the board reads 347 gates / 0 suspect pre-gate, and the remaining field question (a real Copilot session against the rendered instructions) is queued as the opening retro question of the next `engage start`.

## Review rounds & verdict

**Round 1 — Verify.** Five observations:

- Baseline write observed (102 hashes, git-tracked change in spec/ledger).
- README grep for `.quack` returns nothing.
- Entry files byte-match a fresh render (lint clean).
- Full selftest sweep green.
- `decisions --parked` lists exactly the one defer.

**Round 2 — Validate.** The handover state IS the iteration's thesis: a clone of this repo + one launcher call reconstructs everything (bootstrap build + data home + entry files), and nothing adjudicated lives outside `spec/`. Docs describe the machine that exists, not the one that existed this morning.

**Round 3 — Red-team.** (i) "The version string is a lie of omission — big release, same 0.0.1." Held as accepted debt, recorded here. Release versioning is not an i9 requirement. (ii) "Quiet `attest` violates the cli-help guide's discoverability." Deliberate tension, decided at M3/M4 (unlock lives in the contract only). The guide's core (help flags safe and no side effects) holds — `quack attest` with no args prints usage once you know it exists. (iii) "Handover to the same person who walked it is thin." True in a one-person project; the ledger's actor stamps keep the record honest about exactly that.

**Verdict: PASS.** Packaged, documented and handed over.
