<!-- design: dep-prompt  implements: req-go-port.5 :: A dependency-check prompt lists each build dependency with its winget install path. The agent consults it when a tool is missing and asks the user to install. dependencies: what to install, and how. -->
# dependencies: what to install, and how

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

<!-- design: method-runme-orientation  implements: req-runme-orientation.1, req-runme-orientation.2, req-runme-orientation.3 :: RUNME.ps1 and RUNME.sh follow one contract: check, install, verify, orient. They never build a project. Check looks for each dependency before touching anything. Install runs Winget on Windows, or the package manager with the go.dev tarball as a fallback on Linux. Verify runs `quack version`, which bootstraps the global binary from this repo's vendored source. Orient prints the next steps once verification succeeds: starting a project through the agent, or through `quack start stubs`, and where the book's onboarding chapter lives. Neither script creates a workspace or a project. A deterministic installer carries no LLM and cannot meaningfully author one. Windows only opens the book with the explicit `-OpenBook` flag; without it, the script just prints the path. Linux stays headless and only prints paths, so a CI log shows them and the exit code stays honest. RUNME scripts: install, verify, orient. -->
## RUNME scripts: install, verify, orient

`tools/RUNME.ps1` (Windows) and `tools/RUNME.sh` (Linux) share one contract, in order:

- **Check** — look for each dependency before touching anything.
- **Install** — Winget on Windows; the package manager on Linux, with the official
  go.dev tarball as a fallback when the package is missing or too old.
- **Verify** — run `quack version` and confirm it succeeds.
- **Orient** — print the next steps: start a project through the agent, or through
  `quack start stubs`, and where the book's onboarding chapter lives.

Neither script creates a workspace or a project. Starting a project takes judgment; a
deterministic installer carries no LLM and cannot meaningfully author one.
<!-- enddesign -->

<!-- design: method-onboarding-surface  implements: req-onboarding-chapter.1, req-onboarding-chapter.2, req-pong-deck.1, req-pong-deck.2, req-pong-deck.4, req-pong-deck.5, req-deck-discoverable.1, req-deck-discoverable.2 :: The onboarding surface is authored CONTENT with one contract. The fundamentals chapter carries an Onboarding section as its second unit. That is the newcomer arc: what this is, the prerequisites, where to go next. It only ROUTES. It links the walkthrough deck by its anchor and the guides table through the audience-preset fragment. The deck stays the one artifact. The deck (spec/man-deck-pong.md) walks the whole arc in order: clone, prerequisites, install, each systematic milestone as the newcomer experiences it. Then comes the delivered Pong game pictured in a figure, then the honest discussion. Its prerequisites slide names exactly what the RUNME scripts check, so slides and installer never disagree. Its Minutes lines are the real timed walk, recorded per milestone, spike timings, 624 s, so the pace stays reconstructable. Discoverability is a triangle around that one deck: the onboarding section, the guides-table deck row, typed honestly as a deck, and the README's further-reading Pages link. All three point by the same anchor. selftest:onboarding-surface and selftest:pong-deck hold this contract against the rendered book. The onboarding surface is the stranger's route in. -->
## The onboarding surface: the stranger's route in

The RUNME epilogue above points at the book's onboarding chapter. That surface has one shape:

- **One artifact** — the five-minutes walkthrough deck
  ([spec/man-deck-pong.md](../../../../spec/man-deck-pong.md)), from an empty folder to a
  shipped Pong game.
- **One landing** — the Onboarding section, second unit of the fundamentals chapter. It
  routes; it never copies the deck or the guides.
- **A triangle of pointers** — the onboarding section, the guides-table deck row, and the
  README's further-reading link. All three carry the deck's own anchor.

The deck stays self-contained:

- The get-it slide carries the clone line and the starter prompt verbatim.
- The prerequisites match what the RUNME scripts actually check.
- The minutes across the bottom are a real timed walk, recorded per milestone.
- The last slide plays the shipped game, inert until the reader starts it.
<!-- enddesign -->
