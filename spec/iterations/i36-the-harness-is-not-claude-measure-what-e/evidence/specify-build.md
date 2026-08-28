---
form: specify-build
by: agent
signed_off: 2026-08-19T16:12:29.349Z
authors: agent
files: null
---

# Evidence form / specify-build

## current_situation

Ten elements stand, and every one of them already has at least one design spec that names real files. Nothing new had to be minted here.

WHAT WAS CHECKED. All 30 design specs were read for their realizes edges and their file lists. Every element in this iteration's cone resolves to at least one spec, every spec's edges resolve, and zero specs name no files.

WHERE THE WORK ACTUALLY IS. The design below the architectural line is not what this iteration moves. What moves is the harness seam: which host the lane is talking to, what that host's measured limits are, and what happens when a call ends without a normal result.

SO THE CHUNK MACHINE CARRIES THE NEW WORK, and the design specs carry the standing shape it lands in. The chunks touch el-walk-engine, el-bootstrap, el-account and el-entrypoint, all of which already have their specs.

## design_specs

| design-spec | realizes | files |
| --- | --- | --- |
| [[dsp-boot-and-power]] | el-bootstrap | project/deliverable/engine/bin/se-pty.ts · project/deliverable/engine/bin/se-hook-stop.ts · project/deliverable/engine/version.ts |
| [[dsp-call-log]] | el-account · if-walk-engine-to-account · if-holding-pen-to-account · if-method-compiler-to-account · if-record-store-to-account | project/deliverable/engine/calllog.ts · project/deliverable/engine/survey.ts |
| [[dsp-coupling-disposer]] | el-coupling-disposer | project/deliverable/engine/disposition.ts |
| [[dsp-decision-mathematics]] | el-method-compiler | project/deliverable/engine/dsm.ts · project/deliverable/engine/pugh.ts · project/deliverable/engine/pareto.ts · project/deliverable/engine/elematrix.ts |
| [[dsp-engine-delta]] | el-engine-delta · if-engine-delta-to-account · if-engine-delta-to-mirror · if-engine-delta-to-walk-engine | project/deliverable/engine/paths.ts · project/deliverable/engine/machines/compile.ts |
| [[dsp-evidence-forms]] | el-walk-engine | project/deliverable/engine/stateform.ts · project/deliverable/engine/forms.ts · project/deliverable/engine/stateform-problems.ts |
| [[dsp-file-lane]] | el-walk-engine | project/deliverable/engine/files.ts · project/deliverable/engine/search.ts · project/deliverable/engine/run.ts · project/deliverable/engine/gitlane.ts |
| [[dsp-form-editors]] | el-mirror | project/deliverable/engine/editors/index.ts · project/deliverable/engine/editors/node-table.ts · project/deliverable/engine/editors/table.ts |
| [[dsp-front-desk]] | el-front-desk | project/deliverable/machines/main.canvas |
| [[dsp-help-search]] | el-walk-engine | project/deliverable/engine/help.ts · project/deliverable/engine/tools.ts |
| [[dsp-lane-door]] | el-walk-engine | project/deliverable/engine/tools.ts · project/deliverable/engine/mcp.ts · project/deliverable/engine/errors.ts · project/deliverable/engine/bound.ts |
| [[dsp-legible-controls]] | el-mirror | project/deliverable/engine/params.ts · project/deliverable/engine/mirror.ts |
| [[dsp-live-register]] | el-mirror | project/deliverable/engine/bases.ts · project/deliverable/engine/tables.ts · project/deliverable/engine/expr.ts |
| [[dsp-method-compilation]] | el-method-compiler | project/deliverable/engine/rigor-matrix.ts · project/deliverable/engine/canvas.ts · project/deliverable/engine/machines/compile.ts |
| [[dsp-mirror-render]] | el-mirror · if-account-to-mirror · if-front-desk-to-mirror · if-holding-pen-to-mirror · if-method-compiler-to-mirror · if-record-store-to-mirror · if-walk-engine-to-mirror | project/deliverable/engine/render.ts · project/deliverable/engine/mirror.ts · project/deliverable/engine/panel.ts |
| [[dsp-narration]] | el-walk-engine | project/deliverable/engine/decisions.ts |
| [[dsp-note-pen]] | el-holding-pen · if-holding-pen-to-front-desk | project/deliverable/engine/notes.ts · project/deliverable/engine/inbox.ts |
| [[dsp-quality-toolchain]] | el-test-runner · if-record-store-to-test-runner · if-test-runner-to-record-store · if-test-runner-to-walk-engine | project/deliverable/engine/lint.ts · project/deliverable/engine/bin/selftest.ts · project/deliverable/engine/bin/preflight.ts |
| [[dsp-query-evaluator]] | el-query-evaluator | project/deliverable/engine/query.ts |
| [[dsp-radial-layout]] | el-mirror | project/deliverable/engine/trace.ts |
| [[dsp-record-lifecycle]] | el-record-store · if-front-desk-to-record-store | project/deliverable/engine/iterations.ts · project/deliverable/engine/records.ts · project/deliverable/engine/seed.ts |
| [[dsp-resolution-seam]] | el-resolution-seam · if-walk-engine-to-resolution-seam · if-resolution-seam-to-engine-delta · if-resolution-seam-to-method-compiler · if-record-store-to-resolution-seam · if-resolution-seam-to-account | project/deliverable/engine/paths.ts · project/deliverable/engine/resolve.ts · project/deliverable/engine/tools.ts |
| [[dsp-the-arrival]] | el-arrival · if-arrival-to-walk-engine | project/deliverable/engine/bin/se-arrive.ts · project/deliverable/engine/bin/se-hook-arrive.ts |
| [[dsp-the-goal-binds-the-walk]] | el-walk-engine | project/deliverable/engine/machine.ts · project/deliverable/engine/session.ts |
| [[dsp-the-options-pool]] | el-holding-pen · el-front-desk | project/deliverable/engine/pool.ts · project/deliverable/engine/inbox.ts · project/deliverable/engine/survey.ts |
| [[dsp-the-outside-boundaries-and-their-bounds]] | if-agent-harness-to-entrypoint · if-engineer-to-mirror · if-vscode-to-mirror · if-test-runner-to-toolchain · if-bootstrap-to-toolchain · if-account-to-git · if-record-store-to-git · if-record-store-to-origin-remote · if-account-to-obsidian · if-walk-engine-to-web · if-mirror-to-output-tools | project/deliverable/machines/items/interface.md · project/deliverable/engine/trace.ts |
| [[dsp-trace-corpus]] | el-account | project/deliverable/engine/trace.ts · project/deliverable/engine/traceschema.ts · project/deliverable/engine/frontmatter.ts |
| [[dsp-unattended-entrypoint]] | el-entrypoint | project/deliverable/engine/bin/se-start.ts · project/deliverable/package.json |
| [[dsp-walk-machine]] | el-walk-engine · if-method-compiler-to-walk-engine · if-record-store-to-walk-engine | project/deliverable/engine/session.ts · project/deliverable/engine/pull.ts · project/deliverable/engine/route.ts |
| [[dsp-write-guard]] | el-walk-engine · if-satellite-to-walk-engine | project/deliverable/engine/guard.ts · project/deliverable/engine/rules.ts · project/deliverable/engine/sweep.ts |

## promotions

| experiment | promote | chunk |
| --- | --- | --- |
| [[exp-copilot-connection-reset-keeps-server-alive]] | persistent server lifecycle logging and explicit HTTP keep-alive policy entered the build; the live stop contract remains owed | server-lifecycle-logging |

## follow_up

THE LIVE STOP CONTRACT IS STILL OWED. The spike measured a transport reset and proved the server survived it. What it could not do is observe a real Copilot stop event during active work, so raid-asm-an-engineer-can-tell-stop-hook-from-cancellation-today stays open.

THE RECURRENCE THRESHOLD IS UNDECIDED. req-repeated-failure-shape-becomes-durable-work carries an empty measure. The chunk builds against the cheapest reading, that twice is recurrence, and the number moves when the measure lands.

THE MEASURED LIMITS ARE DATA, NOT CONSTANTS. Four chunks read the harness registry rather than carrying their own copy of the numbers, so a remeasurement fails everywhere at once instead of quietly passing against a stale figure.

## anything_else

