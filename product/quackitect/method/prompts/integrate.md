<!-- design: integrate-prompt  implements: req-engine-vehicle-overlay.3 :: The integrate prompt: a documented path (vendor + build + configure + overlay + run) with a worked example for an external vehicle to run on the quackitect engine. The engine is vendored under tools/vendor/; one `start init` scaffolds it; the launcher bootstraps the global binary (adr-retire-legacy-lanes: no sidecar data lanes, no repo-local engine copy). -->
# integrate — run a vehicle on the quackitect engine

You are a **vehicle**: a project that uses quackitect as its engine to build *your own* tool. Your
`product/` and `spec/` are **yours** (the tool you ship). quackitect is vendored in; you override what
you need and inherit the rest. Your users see your brand, never "quackitect".

## The shape
```
myproj/
  product/                       # YOUR tool — what you ship
  spec/
    project.toml                 # root marker + type / rigor / version
    ...                          # YOUR trace + gates
  tools/
    vendor/                      # quackitect, vendored (mirrors quackitect's product/)
      engine-go/                 #   the engine source (the ratchet builds from here)
      quackitect/method/         #   engine method prompts + rigor
      quackitect/project_types/  #   engine project types
      quackitect/assets/         #   cytoscape + dagre (for the report)
  myproj.cmd                     # launcher -> the global engine binary (bootstraps it when absent)
  AGENTS.md                      # entry surface; CLAUDE.md imports it
```
Everything vendored lives under `tools/vendor/`. The resolver looks there first and falls back to a
dogfood `product/quackitect` only when quackitect runs on itself — so a vehicle never inherits a
hardcoded dogfood path. The word "product" is the engine's own; in a vehicle, `product/` is your tool.
The engine binary is GLOBAL (`%LOCALAPPDATA%\quackitect\bin`), ratcheting itself forward from the
vendored source. No engine path is ever committed.

## One-time setup — the easy way
From a **quackitect checkout**, scaffold the vehicle in one command:
```
quack start init <path-to-new-vehicle>
```
It vendors the engine (`product/` -> the vehicle's `tools/vendor/`), and writes `spec/project.toml`,
the `<proj>.cmd` launcher, the entry chain (`CLAUDE.md` -> `AGENTS.md` -> the vendored contract),
the `.claude/` commands, and your empty `product/`. It does **not** mint an iteration or write your
spec — that's yours to drive. Then in the new vehicle:
```
cd <path-to-new-vehicle>
.\<proj> status                  # the launcher bootstraps the global binary when absent
```
Set `[iteration].version` in `spec/project.toml`, then `.\<proj> start <version>` and compose your spec.

## One-time setup — by hand (if you can't run `start init`)
1. **Vendor** quackitect's `product/` into the vehicle's `tools/vendor/` (engine-go + quackitect/).
   `quack ship` produces a zip of `product/`; unzip it into `tools/vendor/`.
2. **Build** the global binary from the vendored source: `cd tools/vendor/engine-go` then
   `go build -o %LOCALAPPDATA%\quackitect\bin\quack.exe .` (needs Go — see `dependencies.md`). The
   `go.mod` is in that dir; building from the repo root fails with "cannot find main module".
3. **Configure** `spec/project.toml` (it is also the workspace root marker):
   ```toml
   [iteration]
   type    = "default"
   rigor   = "systematic"
   version = "<your first version>"
   ```

## Override, don't fork
Drop a file into the workspace data home's `overlay/` under the same relative path to override an
engine resource (`quack version` prints the data home). The resolver walks **data-home overlay →
engine (vendor)**; the most-specific layer wins, the rest inherit.
- Brand voice: `<data-home>/overlay/design/voice.md`
- A prompt: `<data-home>/overlay/method/prompts/engage.md`
- `quack resolve <path>` shows which layer wins; `quack guides` lists the resolved guide set.

## Your brand (the design language)
Your brand lives at **`product/brand/`** — voice, logo set, palette. `start init` SEEDS it with the
engine's **generic** design language: a neutral voice and `[ LOGO GOES HERE ]` placeholder logos. Make
it yours by replacing those files in place (keep the names):
- `product/brand/logo-hero.svg` · `logo-mark.svg` · `logo-wordmark.svg` · `logo-dark.svg`
- `product/brand/voice.md` · `palette.md`

The engine reads `product/brand/<asset>` first and **falls back** to its generic template
(`design/<asset>` in the vendored engine) if you delete one. The report renders your resolved
`logo-mark` left of the project name. The vendored `design/design-language.md` documents the full set.

**Your NAME (the white-label identity, i19):** the book's title, wordmark, and self-referential
voice come from your workspace — in order: `product/brand/name.txt` (one line, your product's
name), else the `overlay` key's `product/<name>` in spec/project.toml, else the workspace folder
name. The engine appears only as CREDIT (the colophon: "engine: quackitect <version>") — your
book presents YOU. Mentions of quackitect in method prose stay legal; only identity is yours.

## Run
`quack status | next | start | bless | note | gather | report | lint | ship | build | selftest` — all
resolve vehicle → engine. Point your `AGENTS.md` here.

## Drive a workspace (one engine, many projects)
The engine drives a selectable WORKSPACE (product+spec+all state). Default is the local one;
add `--base <path>` / `-C <path>` to any command to drive a DIFFERENT project's workspace — engine
resources resolve from your vehicle, all state writes under `<path>`. So one engine can drive
many workspaces (its own and others'). Rebuild with `quack build` (compile + re-baseline golden in
one step).

## Drive a BARE workspace from INSIDE (no engine copied in)
A bare workspace (product+spec, no engine) can be made drivable from *inside* its own folder,
without vendoring an engine and without committing the engine's location:
```
quack start stubs [target]     # default target: the current workspace
```
This emits the committed stubs: a launcher (`<proj>.cmd`), the `AGENTS.md`/`CLAUDE.md` entry chain,
and `spec/project.toml`. The launcher resolves an engine at runtime, in order: the **global binary**
(`%LOCALAPPDATA%\quackitect\bin\quack.exe`) → **env** `QUACK_ENGINE`; with neither present it exits
with a clear message. Nothing machine-local is committed. Use this instead of `--base` when you want
the workspace to be self-driving on its own.

## Worked example
```
cd myproj
quack status                                        # renders YOUR board (your spec)
quack gather <v>                                    # collects engine rigor+type source, resolved vehicle->engine
quack resolve design/voice.md # -> your override if present, else the vendored engine
quack report                                        # your report (assets resolve from tools/vendor)
```
Nestable: a vehicle can itself be an engine for another (the chain just grows).
<!-- enddesign -->

## Start a new project (conversational bootstrap)
<!-- design: method-bootstrap  implements: req-project-onboarding.1, req-project-onboarding.3, req-project-onboarding.2 :: On "start a new project" the agent runs a fixed onboarding — confirm intent to start an iteration, ask the target folder, ask vendor-engine vs drive-from-inside stubs — then scaffolds (start init / start stubs), lands in the workspace, and immediately opens the first iteration's M1 vision interview. A workspace with zero iterations auto-triggers this framing instead of dead-ending on a status board. The README leads with this flow; the raw clone/build CLI is a slim "get the engine" step beneath it. -->
When a user says **"start a new project"**, do NOT dump CLI steps. Run this flow:

1. **Confirm** they want to start a new project iteration now.
2. **Ask the target folder** — where the new workspace lives.
3. **Ask how to link the engine:** *vendor* it (`quack start init <folder>` — a self-contained copy under `tools/vendor/`) or *drive-from-inside stubs* (`quack start stubs <folder>` — a runtime-linked engine, nothing vendored).
4. **Scaffold** with that command, then land in the new workspace.
5. **Immediately open the first iteration** — run `engage start` and begin the **M1 vision interview** (problem, who has it, what "done well" means, top risks). Do not stop at a status board.

**Empty-spec rule:** a workspace with **zero iterations**, when driven, opens this M1 vision interview immediately — a fresh vehicle drops straight into framing.
<!-- enddesign -->
