# Bug: global binary cannot resolve its resource layer when driving an external workspace

## Summary
The global `quack` binary fails on every full-graph command when it drives an
**external** workspace (one created by `quack start stubs`, "drive-from-inside",
nothing vendored). It cannot find the engine resource layer (`product/quackitect`),
so the default project type never loads. The scaffolded example connection node
then fails strict validation and the graph is refused.

Driving the engine's own repo (dogfood) works. Only external workspaces break.
This makes the documented "drive-from-inside stubs" path unusable.

## Environment
- Engine: `quack 0.0.1-go` (global binary model, i13).
- Binary location: `%LOCALAPPDATA%\quackitect\bin\quack.exe`.
- OS: Windows.
- First surfaced: first time driving an external project since the global-binary
  reworks (i9-i13).

## Impact
- Every full-graph command against an external stub is refused: `status`, `next`,
  `engage`, `report`, `lint`.
- A freshly stubbed workspace cannot be driven at all.
- Severity: blocks the entire "drive-from-inside" onboarding flow described in
  `product/quackitect/method/prompts/integrate.md`.

## Steps to reproduce
1. Build the global binary (from the quackitect repo root):
   ```
   .\quack version
   ```
   Confirm it reports `quack 0.0.1-go` and a logs path under
   `%LOCALAPPDATA%\quackitect\`.
2. Scaffold an external, drive-from-inside stub workspace:
   ```
   .\quack start stubs c:\path\to\tracer
   ```
   This writes `tracer.cmd`, `AGENTS.md`, `CLAUDE.md`, `spec/project.toml`, and the
   spec template skeleton (including example nodes). Nothing is vendored.
3. Drive the new workspace from inside it:
   ```
   cd c:\path\to\tracer
   .\tracer status
   ```
   Or, equivalently, with the global binary directly:
   ```
   & "$env:LOCALAPPDATA\quackitect\bin\quack.exe" --base c:\path\to\tracer status
   ```

## Expected
`status` renders the workspace board (an empty-spec workspace opens the M1 vision
framing). The scaffolded example connection node validates, because the default
project type declares its connection kind.

## Actual
The command exits with code 1 and refuses the graph:
```
STRICT: 1 issue(s) — graph refused; a malformed node could silently shrink the suspect cone:
  - spec/connections/conflicts-with [conflicts-with] unknown connection kind (declare it in the type layer's connections map)
```

## Contrast (proves it is external-only)
The SAME global binary loads the graph fine when it drives the engine's own repo:
```
& "$env:LOCALAPPDATA\quackitect\bin\quack.exe" --base c:\path\to\quackitect status
```
This does not hit the strict error. It proceeds to verification. The difference is
only the workspace being driven.

## Diagnosis (root cause)
- `product/quackitect/project_types/default/type.md` DOES declare the
  `conflicts-with` connection kind in its `connections:` map. So the example node
  itself is valid — the type layer that would validate it is simply never found.
- `engineRoot()` in `product/engine-go/engine.go` resolves the engine's read-only
  resource layer by walking up from the executable path, looking for a `.quack`
  ancestor directory. That matches the OLD layout, where the binary lived at
  `<repo>/.quack/engine/quack.exe`.
- Under the i13 global-binary model the binary lives at
  `%LOCALAPPDATA%\quackitect\bin\quack.exe`. It has NO `.quack` ancestor. So
  `engineRoot()` always falls through to its fallback: `return ROOT`.
- `ROOT` is the workspace being driven (`findRoot()` honors `--base`). For an
  external stub, `ROOT` has no `product/quackitect`.
- `EngineDir()` in `product/engine-go/resolver.go` therefore resolves the engine
  layer to a nonexistent path (`<stub>/product/quackitect`). The default project
  type — and its connections map — never load. Strict validation then rejects the
  example connection node.
- Dogfooding works only by accident: there `ROOT` == the engine source repo, which
  happens to contain `product/quackitect`.

## Why existing tests did not catch it
- The i13 external-workspace test harness `i13Exec` in
  `product/engine-go/i13_red.go` drives stub workspaces via `--base`.
- It only ever runs `version` and `calls --summary`. Neither loads the full graph
  or the project-type layer.
- No test drives a full-graph command (for example `status`) against an external
  stub workspace, so this path is uncovered.
