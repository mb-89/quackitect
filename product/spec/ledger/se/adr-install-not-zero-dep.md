---
id: se.adr-install-not-zero-dep
kind: decision
statement: "The distribution bar is a one-click install-and-demo package, cross-platform, NOT zero dependencies. The ship includes a runme.ps1 for Windows, which assumes only Winget present, AND a runme.sh for Linux, for CI/CD pipelines, which assumes the standard package manager. Each checks and installs every dependency and runs a small demonstration on a fresh machine. Windows is the user-facing surface. Linux lets the same package run headless in a CI/CD pipeline. Dependencies are permitted but MINIMIZED, since each is an install step and a corporate-firewall risk; the Go toolchain firewall failures are the lesson. This supersedes the boolean zero-dependency invariant that drove the Go rewrite and framed the i18 MCP-transport choice. It REINFORCES adr-mcp-transport: hand-rolling adds no dependency and no firewall risk, so the SDK module fetch is now less attractive, not more. The hand-roll stands, better-justified."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_kind: architecture
v1_decided_in: i0018_mcp_apply
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
p3_note: reaffirmed by TS ruling
---

## Rationale (not load-bearing)
The real constraint was never ideological purity - it is that a user (or a CI runner) with nothing but a package manager can click one script and get a working demo. Dependencies are friction and firewall risk, not sin; minimize them, do not forbid them.
