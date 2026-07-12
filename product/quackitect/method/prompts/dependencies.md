<!-- design: dep-prompt  implements: req-go-port.5 :: A dependency-check prompt lists each build dependency with its winget install path; the agent consults it when a tool is missing and asks the user to install. -->
# dependencies — what to install, and how

The engine is shipped as **Go source** and built locally (see `adr-ship-source`) into ONE global
binary at `%LOCALAPPDATA%\quackitect\bin\quack.exe` (XDG data dir elsewhere; `adr-global-ratchet`).
So the **Go toolchain is required to build**. The built binary needs nothing at runtime. When a
tool is missing, ask the user to install it with the winget command below.

## Required (to build)

- **Go** — builds the engine binary from source. Every workspace needs it available.
  - `winget install GoLang.Go`
  - Verify: `go version`
  - Normal path: just run `.\quack <cmd>` — the launcher bootstraps the global binary from the
    vendored source when it is absent, and the engine RATCHETS itself forward at startup when
    this workspace's vendored source is newer. Deliberate rebuild: `quack build` (compiles,
    installs globally, writes the build stamp into the source, re-baselines the golden root).
  - Hand-build (rarely needed): from the vendored source dir (dogfood: `product\engine-go`),
    run `go build -o "%LOCALAPPDATA%\quackitect\bin\quack.exe" .` — build **inside** the module
    dir; `go build` from the repo root fails with "cannot find main module".

### Fallback when Go can't be installed (blocked download / no admin)

Some environments block the Go SDK download (go.dev/dl, dl.google.com) or forbid installs. If
`uv` is available, fetch the **real Go toolchain from PyPI** via the `go-bin` package — no native
Go install, no proxy fight (it comes from PyPI, which is typically reachable):

- Verify: `uvx --from go-bin go version`  (e.g. `go version go1.26.4 windows/amd64`)
- The repo ships a shim at `product\tools\go.cmd` that forwards to `uvx --from go-bin go`.
  `quack.cmd` appends `product\tools\` to PATH (last), so the launcher's bootstrap and the
  engine's internal `go build` resolve the shim as a **fallback** while a real Go install still
  takes precedence. For a plain `go build` in your own shell, either call `product\tools\go
  build ...` or add `product\tools\` to PATH.
- Same trick for other toolchains: `ziglang` on PyPI provides `zig` / `zig cc`.

## Optional

- **git** — only the report's commit stamp uses it; the engine runs fine without it.
  - `winget install Git.Git`
  - Verify: `git --version`

## Runtime dependencies: none — by decision

The engine stays a single static binary with zero runtime dependencies. Even the MCP surface
(`quack mcp`) is hand-rolled stdio JSON-RPC on the stdlib (adr-mcp-transport) — adopting the SDK
would have been the engine's first runtime dependency. The distribution bar is one-click
install-and-demo, dependencies minimized not forbidden (adr-install-not-zero-dep): the shipped
RUNME scripts install the build toolchain above; the running engine needs nothing.
<!-- enddesign -->
