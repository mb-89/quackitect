# M8 — Package & hand over (i0004_vendoring_out)

## Docs complete & match the surface  → i4-m8-docs-complete  *(killer)*
- `AGENTS.md` — adds `quack build` and the `--base/-C` workspace selector to the surface.
- `method/prompts/integrate.md` — "Drive a workspace (one engine, many projects)" + quack build.
- `method/prompts/engage.md` — the strong "TRUST THE PROCESS" guidance (don't over-check between steps).
- `dependencies.md` — build from inside the module dir (carried from i3).

## Configuration baselined  → i4-m8-config-baselined
- `.quack/engine/golden-root.txt` re-baselined by `quack build` (the determinizer now owns it).
- `attest.json` — the append-only adjudication ledger (i4 gates recorded).

## Packaged & versioned  → i4-m8-packaged-versioned
`quack ship` packaged `product/` into `.quack/out/` for i4. Ephemeral; not committed.

## Handover accepted  → i4-m8-handover-accepted
Delivered: workspace separation (one engine drives its own or another project's workspace via `--base`),
grandfathered vendoring-out (vendor model, `start init`, white-label, .claude vendoring), `quack build`,
the no-trace-gate invariant + tests-pass/gateState unification (guarded by selftests), and report
verdict-link + nesting — 23 green selftests, 0 suspect. The machinery test passes: a vehicle creates a
dummy workspace and is driven through a full systematic iteration on empty content, all milestones green.

Also delivered (the qualities NFR, `need-qualities`): a **design language** — each project's brand at
`product/brand/` (voice + logos + palette), the engine shipping a generic template (`design/`) that
`start init` seeds and `resolveBrand` falls back to. The report renders the resolved mark left of the
project name at 80% titlebar height (duck for quackitect, `[ LOGO GOES HERE ]` placeholder for a fresh
vehicle). Guarded by `selftest:brand-resolves`.

Late refinement (a mechanism that did not work as intended): **global validation is now structural.** A
gate with `validates: needs` folds the digest of EVERY need into its hash, so adding/changing/removing
any need reopens it (SUSPECT) — closing the gap where "validated against all needs" was prose, not a
wired input (the same class of miss the i3 retro caught). Applied to both `i*-m7-meets-need`; guarded by
`selftest:validation-global`. Validation now has the reach `coverage:tests-pass` already gave verification.

## Carried forward (RAID / backlog)
- Raw bless-attestation view in the verdict-link (who/when/hash), beyond the evidence doc.
- Signed-release binary (from i3).
- A `workspaces/` registry/switcher (deferred alternative B from M3).
