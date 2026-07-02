# M8 — Package & hand over (i0007_tdd_implementation)

## Docs complete & match the surface  → i7-m8-docs-complete  *(killer)*
- **AGENTS.md** — added `quack observe-red <test>` to the determinizer tool reference (the one new command).
- **Method (self-documenting via design markers):** `method/rigor/_shared/implementation.md` (the test-first sequence), `method/roles/README.md` (the pluggable seam + doc-tests), `compose-reference.md` (the `tests-red` rule + the `roles:` block).
- New engine surface (`observe-red`, `coverage:tests-red`, the report `verdict` field) is documented where it lives.

## Packaged & versioned  → i7-m8-packaged-versioned
`i0007_tdd_implementation` active; golden root baselined. `engage ship` packages `product/` → `.quack/out/`.

## Configuration baselined  → i7-m8-config-baselined
`golden-root.txt` re-baselined via `quack build` after every engine change; `config.toml` points at i0007; attest log clean (demo `red-observed` events removed).

## Handover accepted  → i7-m8-handover-accepted
Handed to the human for acceptance at the M8 gate.
