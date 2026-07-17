# M8 — Package & hand over (i0018_mcp_apply)

> M8-PREP note: this pass authored the two install-and-demo scripts and this evidence doc only.
> It did not run `quack build` or `quack ship` or any bless — those stay the owner's morning
> step, mid-M6/M7 on the live ledger. Nothing here claims a check is done that was not checked
> directly.
>
> M8-UPDATE note: a later pass moved both scripts off the repo root into `tools/`. It renamed
> them to capitals (`tools/RUNME.ps1` and `tools/RUNME.sh`) and fixed their path resolution to
> treat their own directory's parent as the repo root. The install/demo logic is unchanged.
> Every `runme.ps1`/`runme.sh` reference below is updated to the new location; the ship-wiring
> gap in "Packaged & versioned" is still open and now also needs to source from `tools/`.

## Docs complete & match the surface  -> i18-m8-docs  (KILLER - owner adjudicates)
Checked each named surface against the real code, not against memory:
- **The method prompts already name `quack apply` the default lane** — `method/rigor/_shared/implementation.md` carries the design-marked line since the M6 build (req-apply-default-lane, test-apply-default-lane). Done, confirmed by direct read.
- **AGENTS.md does NOT carry the MCP serve command.** `product/engine-go/cli.go` registers `case "mcp", "serve":` — a real, working command — but AGENTS.md's determinizer table has no `quack mcp` / `quack serve` line. A driving agent reading AGENTS.md today cannot discover it.
- **dependencies.md does not reflect the transport decision.** The file documents Go and git as build dependencies; it has zero mention of MCP or `adr-mcp-transport`. The hand-rolled, zero-new-dependency choice that M5/M6 proved out is invisible here.
- **The pairing/await prose is not written down.** The pair -> ask -> await lifecycle and the console-handback rule (`go-ask-loop`, req-await-console-exit) live only in code comments (`ask.go`, `ask_ops.go`) and in the M7 evidence transcript. No method prompt narrates it for a reader or a driving agent.

**Verdict: three concrete gaps, one item already done.** This killer stays READY, not blessed. Closing it is a short owner-directed docs pass — three small additions, not a redesign — left for the owner rather than guessed at here.

## Packaged & versioned  -> i18-m8-packaged
`quack ship` (`cmdShip`, `product/engine-go/ops.go`) zips `product/` into `<data-home>/out/<brand>-<version>.zip`, writing `book.html` and `report.html` at the zip root. Read directly from source, not assumed.

It does **not** currently include `tools/RUNME.ps1` or `tools/RUNME.sh`. Both were originally authored at the **repo root** — the same level as the launcher — because that is where `one script, one click, from an unzipped folder` (uc-run-dep-free) needs them to sit, alongside the tree they drive. A later pass moved them into `tools/` (root entry-count discipline) and repointed their internal paths to resolve the repo root as their own directory's parent. So `.\tools\RUNME.ps1` / `tools/RUNME.sh` still find `quack.cmd`, `product/engine-go` and `spec/book.html` correctly. `quack ship`'s walk only covers `product/`, so it does not pick the two scripts up on its own from either location.

**Wiring step left for the owner:** decide whether and how `quack ship` copies `tools/RUNME.ps1` + `tools/RUNME.sh` into the zip (most likely alongside `book.html`/`report.html` at the zip root, mirroring `writeBookCopies`). This is a small `ops.go` change, deliberately **not** made in this pass. The constraint on this task explicitly excludes engine `.go` edits. And the exact zip layout is a call worth the owner's eye, not a mechanical one. `cmdShip` must now read the scripts from `tools/`, not the repo root.

Until that wiring lands, both scripts are reachable exactly the way `uc-run-dep-free` states the bar: "run the engine on a fresh machine from an unzipped folder." A git clone satisfies that identically to a ship zip; only the shipped-zip path is still open.

## Configuration baselined  -> i18-m8-config
Nothing in this pass added new configuration surface — the two scripts run existing commands (`start stubs`, `status`, `report --out`, `version`) and touch no schema, no debounce interval, no engine source. Those were already baselined at M6 (`M6-build.md`: golden root re-baselined, `be07c5872bcf`). The golden root at the start of this pass read green (`3c02f146556a`, battery 318/0) and was left untouched — this task ran no `quack build`.

## Handover accepted  -> i18-m8-handover
Owner act, left for the owner — not agent-stamped. One thing this pass could not self-verify: neither script was run end-to-end on an actually fresh machine (no Winget-only Windows box or bare apt/dnf/apk container was available in this session). The owner running `tools\RUNME.ps1` (or `tools/RUNME.sh` in CI) at least once before accepting is the real proof the install-and-demo bar is met, not just authored.

## Milestone review  -> i18-m8-gate  (KILLER - owner adjudicates)
**Verify:** both scripts were written against the real design, not invented — `adr-install-not-zero-dep` and `uc-run-dep-free` were read first, `quack.cmd`'s bootstrap and `cmdStartStubs`/`cmdShip` in `ops.go` were read to ground every command the scripts call, and the Winget id (`GoLang.Go`) reuses the one `dependencies.md` already documents rather than guessing a new one. Both files were checked byte-safe after writing: BOM-less UTF-8, zero stray `\r` bytes.

**Validate:** this pass does not claim the four M8 checks are closed. Docs has three named gaps. Packaged has an explicit, undone wiring step. Config had nothing new to baseline. Handover is unexercised on a real fresh machine. Each is stated above as found, not assumed clean.

**Red-team:** the sharpest gap is that authoring is not proving — neither script has run on a genuinely fresh machine in this session. So "it should work" rests on reading the engine source correctly, not on a live demo. That mirrors M7's own honest residual (the owner's live harness had not yet driven the MCP surface either). What COULD be checked without a fresh machine was checked directly:

- every command the scripts call exists in `cli.go`/`ops.go` as read
- the Winget id and the `go.dev/VERSION` dynamic-fetch fallback (chosen over a hardcoded Go version, which would stale) are both named as assumptions for the owner to confirm on first run
- the Linux global-binary path intentionally reuses the engine's real (if odd) `.exe`-suffixed convention from `globalBinPath()` rather than inventing a cleaner one, so a later `quack build` on the same machine finds the same binary

**Verdict: PASS from the agent side on the authoring task — the docs killer and this gate both stay READY, not blessed. Owner adjudicates M8 at review, after actually running the scripts once.**
