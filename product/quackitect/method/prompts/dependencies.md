<!-- design: dep-prompt  implements: req-dep-prompt :: A dependency-check prompt lists each build dependency with its winget install path; the agent consults it when a tool is missing and asks the user to install. -->
# dependencies — what to install, and how

The engine is shipped as **Go source** and built locally (see `adr-ship-source`). So the **Go
toolchain is required to build** the engine each vehicle runs. The built binary needs nothing at
runtime. When a tool is missing, ask the user to install it with the winget command below.

## Required (to build)

- **Go** — builds the engine binary from source. Every vehicle needs it.
  - `winget install GoLang.Go`
  - Verify: `go version`
  - Build + run: `cd product/engine-go && go build -o ..\..\.quack\engine\quack.exe .`

## Optional

- **git** — only the report's commit stamp uses it; the engine runs fine without it.
  - `winget install Git.Git`
  - Verify: `git --version`
<!-- enddesign -->
