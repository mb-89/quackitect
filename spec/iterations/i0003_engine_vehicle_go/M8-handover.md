# M8 — Package & hand over (i0003_engine_vehicle_go)

## Docs complete & match the surface  -> i3-m8-docs-complete  (killer)
The docs reflect the shipped Go engine, no Python/uv:
- `AGENTS.md` — build (`go build -o .quack\engine\quack.exe .\product\engine-go`) + run via the `.\quack` launcher; the command surface.
- `README.md` — the engine + `quack` commands (no `uv run`).
- `method/prompts/dependencies.md` — build/dev deps (Go required, git optional) + the launcher.
- `method/prompts/integrate.md` — how an external vehicle runs on quackitect as an engine, with a worked example.
- `quack.cmd` — the launcher at the project root (`.\quack <cmd>`), shipped with the vehicle template.
- `quack selftest surface` / `method` assert the command surface and method markers are present.

## Configuration baselined  -> i3-m8-config-baselined
- `.quack/config.toml` — the iteration breadcrumb (type/rigor/version).
- `.quack/engine/golden-root.txt` — the determinism baseline (`selftest:parity` regresses against it).
- `.gitignore` — excludes build artifacts (`.quack/engine/`, `product/engine-go/*.exe`, `.gotmp`): ship source, not binaries.
- `attest.json` — the append-only adjudication ledger.

## Packaged & versioned  -> i3-m8-packaged-versioned
`quack ship` packages `product/` (the engine source + method + project_types + assets) into
`.quack/out/quackitect-i0003_engine_vehicle_go.zip`. The zip is ephemeral output; not committed.

## Handover accepted  -> i3-m8-handover-accepted
The human accepts: a single static Go binary, shipped as source, that runs from an unzipped folder,
self-verifies, and is vendored + overlaid by vehicles. quackitect dogfoods its own Go engine.

## Carried forward (RAID / backlog)
- `req-signed-release` — code-sign the release binary for non-builders on SAC/WDAC machines.
- `drive_as_engine` / a `quack init` scaffold command — smoother vehicle onboarding (a follow-on).
- The inbox backlog: milestone-monotonic lint, structural determinizers, spec-restructure, verdict-on-executed.
