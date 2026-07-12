---
id: adr-install-not-zero-dep
type: adr
kind: architecture
decided_in: i0018_mcp_apply
adjudicated_by: user
statement: The distribution bar is a one-click install-and-demo package, cross-platform, NOT zero dependencies. The ship includes a runme.ps1 (Windows, assumes only Winget present) AND a runme.sh (Linux, for CI/CD pipelines, assumes the standard package manager); each checks and installs every dependency and runs a small demonstration on a fresh machine. Windows is the user-facing surface; Linux lets the same package run headless in a CI/CD pipeline. Dependencies are permitted but MINIMIZED - each is an install step and a corporate-firewall risk (the Go toolchain firewall failures are the lesson). This supersedes the boolean zero-dependency invariant that drove the Go rewrite and framed the i18 MCP-transport choice. It REINFORCES adr-mcp-transport - hand-rolling adds no dependency and no firewall risk, so the SDK module fetch is now less attractive, not more; the hand-roll stands, better-justified.
class: review
killer: false
---
## Rationale (not load-bearing)
The real constraint was never ideological purity - it is that a user (or a CI runner) with nothing but a package manager can click one script and get a working demo. Dependencies are friction and firewall risk, not sin; minimize them, do not forbid them.
