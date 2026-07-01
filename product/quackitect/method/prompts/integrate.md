<!-- design: integrate-prompt  implements: req-integrate :: The integrate prompt: a documented path (vendor + build + configure + overlay + run) with a worked example for an external vehicle to run on the quackitect engine. The engine is vendored under .quack/vendor/; one `start init` scaffolds it. -->
# integrate — run a vehicle on the quackitect engine

You are a **vehicle**: a project that uses quackitect as its engine to build *your own* tool. Your
`product/` and `spec/` are **yours** (the tool you ship). quackitect is vendored in; you override what
you need and inherit the rest. Your users see your brand, never "quackitect".

## The shape
```
myproj/
  product/                       # YOUR tool — what you ship
  spec/                          # YOUR trace + gates
  .quack/
    config.toml                  # type / rigor / version
    vendor/                      # quackitect, vendored (mirrors quackitect's product/)
      engine-go/                 #   the engine source (rebuild here)
      quackitect/method/         #   engine method prompts + rigor
      quackitect/project_types/  #   engine project types
      quackitect/assets/         #   cytoscape + dagre (for the report)
    engine/quack.exe             # the built binary (gitignored; rebuild from vendor)
    overlay/                     # YOUR overrides of engine resources
  quack.cmd                      # launcher -> .quack/engine/quack.exe
```
Everything vendored lives under `.quack/vendor/`. The resolver looks there first and falls back to a
dogfood `product/quackitect` only when quackitect runs on itself — so a vehicle never inherits a
hardcoded dogfood path. The word "product" is the engine's own; in a vehicle, `product/` is your tool.

## One-time setup — the easy way
From a **quackitect checkout**, scaffold the vehicle in one command:
```
quack start init <path-to-new-vehicle>
```
It vendors the engine (`product/` -> the vehicle's `.quack/vendor/`), copies the built binary, and
writes `config.toml`, `quack.cmd`, an `AGENTS.md` pointer, and your empty `product/` + `spec/`. It does
**not** mint an iteration or write your spec — that's yours to drive. Then in the new vehicle:
```
cd <path-to-new-vehicle>
cd .quack\vendor\engine-go  &&  go build -o ..\..\engine\quack.exe .   # rebuild for this machine
```
Set `[iteration].version` in `.quack/config.toml`, then `quack start <version>` and compose your spec.

## One-time setup — by hand (if you can't run `start init`)
1. **Vendor** quackitect's `product/` into the vehicle's `.quack/vendor/` (engine-go + quackitect/).
   `quack ship` produces a zip of `product/`; unzip it into `.quack/vendor/`.
2. **Build** from inside the module dir: `cd .quack/vendor/engine-go` then
   `go build -o ../../engine/quack.exe .` (needs Go — see `dependencies.md`). The `go.mod` is in that
   dir; building from the repo root fails with "cannot find main module".
3. **Configure** `.quack/config.toml`:
   ```toml
   [iteration]
   type    = "default"
   rigor   = "systematic"
   version = "<your first version>"
   ```

## Override, don't fork
Drop a file at `.quack/overlay/<same path>` to override an engine resource. The resolver walks
**vehicle overlay → engine (vendor)**; the most-specific layer wins, the rest inherit.
- Brand voice: `.quack/overlay/design/voice.md`
- A prompt: `.quack/overlay/method/prompts/engage.md`
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

## Run
`quack status | next | start | bless | note | gather | report | lint | ship | build | selftest` — all
resolve vehicle → engine. Point your `AGENTS.md` here.

## Drive a workspace (one engine, many projects)
Your vehicle's engine drives a selectable WORKSPACE (product+spec+all state). Default is the local one;
add `--base <path>` / `-C <path>` to any command to drive a DIFFERENT project's workspace — engine
resources resolve from your vehicle, all state writes under `<path>`. So one vendored engine can drive
many workspaces (its own and others') without vendoring a second engine. Rebuild with `quack build`
(compile + re-baseline golden in one step).

## Drive a BARE workspace from INSIDE (no engine copied in)
A bare workspace (product+spec+`.quack/`, no engine) can be made drivable from *inside* its own folder,
without vendoring an engine and without committing the engine's location:
```
quack start stubs [target]     # default target: the current workspace
```
This emits three committed stubs: a launcher (`<proj>.cmd`), an `AGENTS.md` entry surface, and a
`.gitignore`. The launcher resolves an engine at runtime, in order: **internal** `.quack\engine\quack.exe`
→ **gitignored pointer** `.quack\engine.local` (a line = path to a `quack.exe`) → **env** `QUACK_ENGINE`;
if none resolve it exits with a clear message. Point it once per machine (`echo <path>\quack.exe >
.quack\engine.local`, gitignored), then `.\<proj> status` drives the workspace from inside. The engine
location never enters version control. Use this instead of `--base` when you want the workspace to be
self-driving on its own.

## Worked example
```
cd myproj
quack status                                        # renders YOUR board (your spec)
quack gather <v>                                    # collects engine rigor+type source, resolved vehicle->engine
quack resolve design/voice.md # -> your override if present, else the vendored engine
quack report                                        # your report (assets resolve from .quack/vendor)
```
Nestable: a vehicle can itself be an engine for another (the chain just grows).
<!-- enddesign -->

## Start a new project (conversational bootstrap)
<!-- design: method-bootstrap  implements: req-bootstrap-flow, req-empty-spec-autostart, req-readme-onboarding :: On "start a new project" the agent runs a fixed onboarding — confirm intent to start an iteration, ask the target folder, ask vendor-engine vs drive-from-inside stubs — then scaffolds (start init / start stubs), lands in the workspace, and immediately opens the first iteration's M1 vision interview. A workspace with zero iterations auto-triggers this framing instead of dead-ending on a status board. The README leads with this flow; the raw clone/build CLI is a slim "get the engine" step beneath it. -->
When a user says **"start a new project"**, do NOT dump CLI steps. Run this flow:

1. **Confirm** they want to start a new project iteration now.
2. **Ask the target folder** — where the new workspace lives.
3. **Ask how to link the engine:** *vendor* it (`quack start init <folder>` — a self-contained copy under `.quack/vendor/`) or *drive-from-inside stubs* (`quack start stubs <folder>` — a runtime-linked engine, nothing vendored).
4. **Scaffold** with that command, then land in the new workspace.
5. **Immediately open the first iteration** — run `engage start` and begin the **M1 vision interview** (problem, who has it, what "done well" means, top risks). Do not stop at a status board.

**Empty-spec rule:** a workspace with **zero iterations**, when driven, opens this M1 vision interview immediately — a fresh vehicle drops straight into framing.
<!-- enddesign -->
